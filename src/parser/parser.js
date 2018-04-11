import { AdParser } from './ad_parser';
import { EventEmitter } from 'events';
import { ParserUtils } from './parser_utils';
import { URLHandler } from '../url_handler';
import { Util } from '../util/util';
import { VASTResponse } from '../vast_response';

const DEFAULT_MAX_WRAPPER_WIDTH = 10;

const DEFAULT_EVENT_DATA = {
  ERRORCODE: 900,
  extensions: []
};

export class VASTParser {
  constructor() {
    this.parseXmlDocument = this.parseXmlDocument.bind(this);
    this.maxWrapperDepth = null;
    this.URLTemplateFilters = [];
    this.parserUtils = new ParserUtils();
    this.adParser = new AdParser();
    this.util = new Util();
    this.urlHandler = new URLHandler();
    this.vent = new EventEmitter();
  }

  addURLTemplateFilter(func) {
    if (typeof func === 'function') {
      this.URLTemplateFilters.push(func);
    }
  }

  removeURLTemplateFilter() {
    this.URLTemplateFilters.pop();
  }
  countURLTemplateFilters() {
    return this.URLTemplateFilters.length;
  }
  clearUrlTemplateFilters() {
    this.URLTemplateFilters = [];
  }

  parse(url, options, cb) {
    if (!cb) {
      if (typeof options === 'function') {
        cb = options;
      }
      options = {};
    }

    this.maxWrapperDepth = options.wrapperLimit || DEFAULT_MAX_WRAPPER_WIDTH;
    options.wrapperDepth = 0;

    this._parse(url, null, options, (err, response) => cb(response, err));
  }

  load(xml, options, cb) {
    if (!cb) {
      if (typeof options === 'function') {
        cb = options;
      }
      options = {};
    }

    this.parseXmlDocument(null, [], options, xml, cb);
  }

  track(templates, errorCode, ...data) {
    this.vent.emit(
      'VAST-error',
      this.util.merge(DEFAULT_EVENT_DATA, errorCode, ...data)
    );
    this.util.track(templates, errorCode);
  }

  on(eventName, cb) {
    this.vent.on(eventName, cb);
  }

  once(eventName, cb) {
    this.vent.once(eventName, cb);
  }

  off(eventName, cb) {
    this.vent.removeListener(eventName, cb);
  }

  _parse(url, parentURLs, options, cb) {
    // Process url with defined filter
    for (let filter of this.URLTemplateFilters) {
      url = filter(url);
    }

    if (parentURLs == null) {
      parentURLs = [];
    }
    parentURLs.push(url);

    this.vent.emit('resolving', { url });

    this.urlHandler.get(url, options, (err, xml) => {
      this.vent.emit('resolved', { url });

      if (err != null) {
        return cb(err);
      }
      this.parseXmlDocument(url, parentURLs, options, xml, cb);
    });
  }

  parseXmlDocument(url, parentURLs, options, xml, cb) {
    // Current VAST depth
    let ad;
    const wrapperDepth = options.wrapperDepth++;
    const response = new VASTResponse();

    if (
      (xml != null ? xml.documentElement : undefined) == null ||
      xml.documentElement.nodeName !== 'VAST'
    ) {
      return cb(new Error('Invalid VAST XMLDocument'));
    }

    const childNodes = xml.documentElement.childNodes;

    for (let nodeKey in childNodes) {
      const node = childNodes[nodeKey];

      if (node.nodeName === 'Error') {
        response.errorURLTemplates.push(this.parserUtils.parseNodeText(node));
      }

      if (node.nodeName === 'Ad') {
        ad = this.parseAdElement(node);
        if (ad != null) {
          response.ads.push(ad);
        } else {
          // VAST version of response not supported.
          this.track(response.errorURLTemplates, { ERRORCODE: 101 });
        }
      }
    }

    const complete = () => {
      let index;
      for (index = response.ads.length - 1; index >= 0; index--) {
        // Still some Wrappers URL to be resolved -> continue
        ad = response.ads[index];
        if (ad.nextWrapperURL != null) {
          return;
        }
      }

      // We've to wait for all <Ad> elements to be parsed before handling error so we can:
      // - Send computed extensions data
      // - Ping all <Error> URIs defined across VAST files
      if (wrapperDepth === 0) {
        // No Ad case - The parser never bump into an <Ad> element
        if (response.ads.length === 0) {
          this.track(response.errorURLTemplates, { ERRORCODE: 303 });
        } else {
          for (index = response.ads.length - 1; index >= 0; index--) {
            // - Error encountred while parsing
            // - No Creative case - The parser has dealt with soma <Ad><Wrapper> or/and an <Ad><Inline> elements
            // but no creative was found
            ad = response.ads[index];
            if (ad.errorCode || ad.creatives.length === 0) {
              this.track(
                ad.errorURLTemplates.concat(response.errorURLTemplates),
                { ERRORCODE: ad.errorCode || 303 },
                { ERRORMESSAGE: ad.errorMessage || '' },
                { extensions: ad.extensions },
                { system: ad.system }
              );
              response.ads.splice(index, 1);
            }
          }
        }
      }

      cb(null, response);
    };

    let loopIndex = response.ads.length;
    // To refactor
    while (loopIndex--) {
      ad = response.ads[loopIndex];
      if (ad.nextWrapperURL == null) {
        continue;
      }
      (ad => {
        if (
          parentURLs.length >= this.maxWrapperDepth ||
          parentURLs.includes(ad.nextWrapperURL)
        ) {
          // Wrapper limit reached, as defined by the video player.
          // Too many Wrapper responses have been received with no InLine response.
          ad.errorCode = 302;
          delete ad.nextWrapperURL;
          return;
        }

        // Get full URL
        ad.nextWrapperURL = this.resolveVastAdTagURI(ad.nextWrapperURL, url);

        this._parse(
          ad.nextWrapperURL,
          parentURLs,
          options,
          (err, wrappedResponse) => {
            delete ad.nextWrapperURL;

            if (err != null) {
              // Timeout of VAST URI provided in Wrapper element, or of VAST URI provided in a subsequent Wrapper element.
              // (URI was either unavailable or reached a timeout as defined by the video player.)
              ad.errorCode = 301;
              ad.errorMessage = err.message;
              complete();
              return;
            }

            if (
              (wrappedResponse != null
                ? wrappedResponse.errorURLTemplates
                : undefined) != null
            ) {
              response.errorURLTemplates = response.errorURLTemplates.concat(
                wrappedResponse.errorURLTemplates
              );
            }

            if (wrappedResponse.ads.length === 0) {
              // No ads returned by the wrappedResponse, discard current <Ad><Wrapper> creatives
              ad.creatives = [];
            } else {
              let index = response.ads.indexOf(ad);
              response.ads.splice(index, 1);

              for (let wrappedAd of wrappedResponse.ads) {
                this.mergeWrapperAdData(wrappedAd, ad);
                response.ads.splice(++index, 0, wrappedAd);
              }
            }

            complete();
          }
        );
      })(ad);
    }

    complete();
  }

  // Convert relative vastAdTagUri
  resolveVastAdTagURI(vastAdTagUrl, originalUrl) {
    if (vastAdTagUrl.indexOf('//') === 0) {
      const { protocol } = location;
      return `${protocol}${vastAdTagUrl}`;
    }

    if (vastAdTagUrl.indexOf('://') === -1) {
      // Resolve relative URLs (mainly for unit testing)
      const baseURL = originalUrl.slice(0, originalUrl.lastIndexOf('/'));
      return `${baseURL}/${vastAdTagUrl}`;
    }

    return vastAdTagUrl;
  }

  // Merge ad tracking URLs / extensions data into wrappedAd
  mergeWrapperAdData(wrappedAd, ad) {
    wrappedAd.errorURLTemplates = ad.errorURLTemplates.concat(
      wrappedAd.errorURLTemplates
    );
    wrappedAd.impressionURLTemplates = ad.impressionURLTemplates.concat(
      wrappedAd.impressionURLTemplates
    );
    wrappedAd.extensions = ad.extensions.concat(wrappedAd.extensions);

    for (let creative of wrappedAd.creatives) {
      if (
        (ad.trackingEvents != null
          ? ad.trackingEvents[creative.type]
          : undefined) != null
      ) {
        for (let eventName in ad.trackingEvents[creative.type]) {
          const urls = ad.trackingEvents[creative.type][eventName];
          if (!creative.trackingEvents[eventName]) {
            creative.trackingEvents[eventName] = [];
          }
          creative.trackingEvents[eventName] = creative.trackingEvents[
            eventName
          ].concat(urls);
        }
      }
    }

    if (
      ad.videoClickTrackingURLTemplates != null
        ? ad.videoClickTrackingURLTemplates.length
        : undefined
    ) {
      for (let creative of wrappedAd.creatives) {
        if (creative.type === 'linear') {
          creative.videoClickTrackingURLTemplates = creative.videoClickTrackingURLTemplates.concat(
            ad.videoClickTrackingURLTemplates
          );
        }
      }
    }

    if (
      ad.videoCustomClickURLTemplates != null
        ? ad.videoCustomClickURLTemplates.length
        : undefined
    ) {
      for (let creative of wrappedAd.creatives) {
        if (creative.type === 'linear') {
          creative.videoCustomClickURLTemplates = creative.videoCustomClickURLTemplates.concat(
            ad.videoCustomClickURLTemplates
          );
        }
      }
    }

    // VAST 2.0 support - Use Wrapper/linear/clickThrough when Inline/Linear/clickThrough is null
    if (ad.videoClickThroughURLTemplate != null) {
      for (let creative of wrappedAd.creatives) {
        if (
          creative.type === 'linear' &&
          creative.videoClickThroughURLTemplate == null
        ) {
          creative.videoClickThroughURLTemplate =
            ad.videoClickThroughURLTemplate;
        }
      }
    }
  }

  parseAdElement(adElement) {
    const childNodes = adElement.childNodes;

    for (let adTypeElementKey in childNodes) {
      const adTypeElement = childNodes[adTypeElementKey];

      if (!['Wrapper', 'InLine'].includes(adTypeElement.nodeName)) {
        continue;
      }

      this.parserUtils.copyNodeAttribute('id', adElement, adTypeElement);
      this.parserUtils.copyNodeAttribute('sequence', adElement, adTypeElement);

      if (adTypeElement.nodeName === 'Wrapper') {
        return this.parseWrapperElement(adTypeElement);
      } else if (adTypeElement.nodeName === 'InLine') {
        return this.adParser.parse(adTypeElement);
      }
    }
  }

  parseWrapperElement(wrapperElement) {
    const ad = this.adParser.parse(wrapperElement);
    let wrapperURLElement = this.parserUtils.childByName(
      wrapperElement,
      'VASTAdTagURI'
    );
    if (wrapperURLElement != null) {
      ad.nextWrapperURL = this.parserUtils.parseNodeText(wrapperURLElement);
    } else {
      wrapperURLElement = this.parserUtils.childByName(
        wrapperElement,
        'VASTAdTagURL'
      );
      if (wrapperURLElement != null) {
        ad.nextWrapperURL = this.parserUtils.parseNodeText(
          this.parserUtils.childByName(wrapperURLElement, 'URL')
        );
      }
    }

    for (let wrapperCreativeElement of ad.creatives) {
      if (['linear', 'nonlinear'].includes(wrapperCreativeElement.type)) {
        // TrackingEvents Linear / NonLinear
        if (wrapperCreativeElement.trackingEvents != null) {
          if (!ad.trackingEvents) {
            ad.trackingEvents = {};
          }
          if (!ad.trackingEvents[wrapperCreativeElement.type]) {
            ad.trackingEvents[wrapperCreativeElement.type] = {};
          }
          for (let eventName in wrapperCreativeElement.trackingEvents) {
            const urls = wrapperCreativeElement.trackingEvents[eventName];
            if (!ad.trackingEvents[wrapperCreativeElement.type][eventName]) {
              ad.trackingEvents[wrapperCreativeElement.type][eventName] = [];
            }
            for (let url of urls) {
              ad.trackingEvents[wrapperCreativeElement.type][eventName].push(
                url
              );
            }
          }
        }
        // ClickTracking
        if (wrapperCreativeElement.videoClickTrackingURLTemplates != null) {
          if (!ad.videoClickTrackingURLTemplates) {
            ad.videoClickTrackingURLTemplates = [];
          } // tmp property to save wrapper tracking URLs until they are merged
          for (let item of wrapperCreativeElement.videoClickTrackingURLTemplates) {
            ad.videoClickTrackingURLTemplates.push(item);
          }
        }
        // ClickThrough
        if (wrapperCreativeElement.videoClickThroughURLTemplate != null) {
          ad.videoClickThroughURLTemplate =
            wrapperCreativeElement.videoClickThroughURLTemplate;
        }
        // CustomClick
        if (wrapperCreativeElement.videoCustomClickURLTemplates != null) {
          if (!ad.videoCustomClickURLTemplates) {
            ad.videoCustomClickURLTemplates = [];
          } // tmp property to save wrapper tracking URLs until they are merged
          for (let item of wrapperCreativeElement.videoCustomClickURLTemplates) {
            ad.videoCustomClickURLTemplates.push(item);
          }
        }
      }
    }

    if (ad.nextWrapperURL != null) {
      return ad;
    }
  }
}
