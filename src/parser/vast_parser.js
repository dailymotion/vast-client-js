import { AdParser } from './ad_parser';
import { EventEmitter } from 'events';
import { ParserUtils } from './parser_utils';
import { URLHandler } from '../url_handler';
import { Util } from '../util/util';
import { VASTResponse } from '../vast_response';

const DEFAULT_MAX_WRAPPER_DEPTH = 10;
const DEFAULT_EVENT_DATA = {
  ERRORCODE: 900,
  extensions: []
};

/**
 * This class provides methods to fetch and parse a VAST document.
 * @export
 * @class VASTParser
 * @extends EventEmitter
 */
export class VASTParser extends EventEmitter {
  /**
   * Creates an instance of VASTParser.
   * @constructor
   */
  constructor() {
    super();

    this.maxWrapperDepth = null;
    this.URLTemplateFilters = [];
    this.parentURLs = [];
    this.parentURLs = [];
    this.errorURLTemplates = [];
    this.fetchingOptions = {};

    this.parserUtils = new ParserUtils();
    this.adParser = new AdParser();
    this.util = new Util();
    this.urlHandler = new URLHandler();
  }

  /**
   * Adds a filter function to the array of filters which are called before fetching a VAST document.
   * @param  {function} filter - The filter function to be added at the end of the array.
   * @return {void}
   */
  addURLTemplateFilter(filter) {
    if (typeof filter === 'function') {
      this.URLTemplateFilters.push(filter);
    }
  }

  /**
   * Removes the last element of the url templates filters array.
   * @return {void}
   */
  removeURLTemplateFilter() {
    this.URLTemplateFilters.pop();
  }

  /**
   * Returns the number of filters of the url templates filters array.
   * @return {Number}
   */
  countURLTemplateFilters() {
    return this.URLTemplateFilters.length;
  }

  /**
   * Removes all the filter functions from the url templates filters array.
   * @return {void}
   */
  clearURLTemplateFilters() {
    this.URLTemplateFilters = [];
  }

  /**
   * Tracks the error provided in the errorCode parameter and emits a VAST-error event for the given error.
   * @param  {Array} urlTemplates - An Array of url templates to use to make the tracking call.
   * @param  {Object} errorCode - An Object containing the error data.
   * @param  {Object} data - One (or more) Object containing additional data.
   * @emits  VASTParserr#VAST-error
   * @return {void}
   */
  trackVastError(urlTemplates, errorCode, ...data) {
    this.emit(
      'VAST-error',
      Object.assign(DEFAULT_EVENT_DATA, errorCode, ...data)
    );
    this.util.track(urlTemplates, errorCode);
  }

  /**
   * Fetches a VAST document for the given url.
   * Returns a Promise which resolves,rejects according to the result of the request.
   * @param  {String} url - The url to request the VAST document.
   * @emits  VASTParserr#VAST-resolving
   * @emits  VASTParserr#VAST-resolved
   * @return {Promise}
   */
  fetchVAST(url) {
    return new Promise((resolve, reject) => {
      // Process url with defined filter
      this.URLTemplateFilters.forEach(filter => {
        url = filter(url);
      });

      this.parentURLs.push(url);
      this.emit('VAST-resolving', { url });

      this.urlHandler.get(url, this.fetchingOptions, (err, xml) => {
        this.emit('VAST-resolved', { url });

        if (err) {
          reject(err);
        } else {
          resolve(xml);
        }
      });
    });
  }

  /**
   * Inits the parsing properties of the class with the custom values provided as options.
   * @param {Object} options - The options to initialize a parsing sequence
   */
  initParsingStatus(options = {}) {
    this.parentURLs = [];
    this.errorURLTemplates = [];
    this.maxWrapperDepth = options.wrapperLimit || DEFAULT_MAX_WRAPPER_DEPTH;
    this.fetchingOptions = {
      timeout: options.timeout,
      withCredentials: options.withCredentials
    };
  }

  /**
   * Fetches and parses a VAST for the given url.
   * Executes the callback with either an error or the fully parsed VASTResponse.
   * @param    {String} url - The url to request the VAST document.
   * @param    {Object} options - An optional Object of parameters to be used in the request.
   * @emits    VASTParserr#VAST-resolving
   * @emits    VASTParserr#VAST-resolved
   * @callback cb
   */
  getAndParseVAST(url, options, cb) {
    if (!cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      } else {
        throw new Error('Method called without valid callback function');
      }
    }

    this.initParsingStatus(options);

    this.fetchVAST(url)
      .then(xml => {
        options.originalUrl = url;
        this.parse(xml, options)
          .then(ads => {
            const response = new VASTResponse();
            response.ads = ads;
            response.errorURLTemplates = this.errorURLTemplates;
            this.completeWrapperResolving(response);

            cb(null, response);
          })
          .catch(err => cb(err));
      })
      .catch(err => cb(err));
  }

  /**
   * Parses the given xml Object into a VASTResponse.
   * Executes the callback with either an error or the fully parsed VASTResponse.
   * @param    {Object} vastXml - An object representing a vast xml document.
   * @param    {Object} options - An optional Object of parameters to be used in the parsing process.
   * @emits    VASTParserr#VAST-resolving
   * @emits    VASTParserr#VAST-resolved
   * @callback cb
   */
  parseVAST(vastXml, options, cb) {
    if (!cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      } else {
        throw new Error('Method called without valid callback function');
      }
    }

    this.initParsingStatus(options);

    this.parse(vastXml, options)
      .then(ads => {
        const response = new VASTResponse();
        response.ads = ads;
        response.errorURLTemplates = this.errorURLTemplates;
        this.completeWrapperResolving(response);

        cb(null, response);
      })
      .catch(err => cb(err));
  }

  /**
   * Parses the given xml Object into an array of ads
   * Returns a Promise which resolves with the array or rejects with an error according to the result of the parsing.
   * @param  {Object} vastXml - An object representing an xml document.
   * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
   * @emits  VASTParserr#VAST-resolving
   * @emits  VASTParserr#VAST-resolved
   * @return {Promise}
   */
  parse(
    vastXml,
    { wrapperSequence = null, originalUrl = null, wrapperDepth = 0 }
  ) {
    return new Promise((resolve, reject) => {
      // check if is a valid VAST document
      if (
        !vastXml ||
        !vastXml.documentElement ||
        vastXml.documentElement.nodeName !== 'VAST'
      ) {
        reject(new Error('Invalid VAST XMLDocument'));
      }

      const ads = [];
      const childNodes = vastXml.documentElement.childNodes;

      // Fill the VASTResponse object with ads and errorURLTemplates
      for (let nodeKey in childNodes) {
        const node = childNodes[nodeKey];

        if (node.nodeName === 'Error') {
          const errorURLTemplate = this.parserUtils.parseNodeText(node);

          this.errorURLTemplates.push(errorURLTemplate);
        }

        if (node.nodeName === 'Ad') {
          const ad = this.adParser.parse(node);

          if (ad) {
            ads.push(ad);
          } else {
            // VAST version of response not supported.
            this.trackVastError(this.errorURLTemplates, {
              ERRORCODE: 101
            });
          }
        }
      }

      const adsCount = ads.length;
      const lastAddedAd = ads[adsCount - 1];
      // if in child nodes we have only one ads
      // and wrapperSequence is defined
      // and this ads doesn't already have sequence
      if (
        adsCount === 1 &&
        wrapperSequence !== undefined &&
        wrapperSequence !== null &&
        lastAddedAd &&
        !lastAddedAd.sequence
      ) {
        lastAddedAd.sequence = wrapperSequence;
      }

      const resolveWrappersPromises = [];

      ads.forEach(ad => {
        const resolveWrappersPromise = this.resolveWrappers(
          ad,
          wrapperDepth,
          originalUrl
        );

        resolveWrappersPromises.push(resolveWrappersPromise);
      });

      Promise.all(resolveWrappersPromises)
        .then(unwrappedAds => {
          const res = this.util.flatten(unwrappedAds);
          resolve(res);
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });
    });
  }

  /**
   * Resolves the wrappers for the given ad in a recursive way.
   * Returns a Promise which resolves with the unwrapped ad or rejects with an error.
   * @param  {Ad} ad - An ad to be unwrapped.
   * @param  {Number} wrapperDepth - The reached depth in the wrapper resolving chain.
   * @param  {String} originalUrl - The original vast url.
   * @return {Promise}
   */
  resolveWrappers(ad, wrapperDepth, originalUrl) {
    return new Promise((resolve, reject) => {
      // Going one level deeper in the wrapper chain
      wrapperDepth++;

      // We already have a resolved VAST ad, no need to resolve wrapper
      if (!ad.nextWrapperURL) {
        resolve(ad);
      }

      if (
        wrapperDepth >= this.maxWrapperDepth ||
        this.parentURLs.includes(ad.nextWrapperURL)
      ) {
        // Wrapper limit reached, as defined by the video player.
        // Too many Wrapper responses have been received with no InLine response.
        ad.errorCode = 302;
        delete ad.nextWrapperURL;
        resolve(ad);
      }

      // Get full URL
      ad.nextWrapperURL = this.parserUtils.resolveVastAdTagURI(
        ad.nextWrapperURL,
        originalUrl
      );

      // sequence doesn't carry over in wrapper element
      const wrapperSequence = ad.sequence;
      originalUrl = ad.nextWrapperURL;

      this.fetchVAST(ad.nextWrapperURL)
        .then(xml => {
          this.parse(xml, { originalUrl, wrapperSequence, wrapperDepth })
            .then(unwrappedAds => {
              delete ad.nextWrapperURL;
              if (unwrappedAds.length === 0) {
                // No ads returned by the wrappedResponse, discard current <Ad><Wrapper> creatives
                ad.creatives = [];
                resolve(ad);
              }

              unwrappedAds.forEach(unwrappedAd => {
                // console.log('here', unwrappedAd.id);
                // console.log(unwrappedAd);
                this.mergeWrapperAdData(unwrappedAd, ad);
              });

              resolve(unwrappedAds);
            })
            .catch(err => {
              // Timeout of VAST URI provided in Wrapper element, or of VAST URI provided in a subsequent Wrapper element.
              // (URI was either unavailable or reached a timeout as defined by the video player.)
              ad.errorCode = 301;
              ad.errorMessage = err.message;

              resolve(ad);
            });
        })
        .catch(err => reject(err));
    });
  }

  /**
   * Takes care of handling errors when the wrappers are resolved.
   * @param {VASTResponse} vastResponse - A resolved VASTResponse.
   */
  completeWrapperResolving(vastResponse) {
    // We've to wait for all <Ad> elements to be parsed before handling error so we can:
    // - Send computed extensions data
    // - Ping all <Error> URIs defined across VAST files

    // No Ad case - The parser never bump into an <Ad> element
    if (vastResponse.ads.length === 0) {
      this.trackVastError(vastResponse.errorURLTemplates, { ERRORCODE: 303 });
    } else {
      for (let index = vastResponse.ads.length - 1; index >= 0; index--) {
        // - Error encountred while parsing
        // - No Creative case - The parser has dealt with soma <Ad><Wrapper> or/and an <Ad><Inline> elements
        // but no creative was found
        let ad = vastResponse.ads[index];
        if (ad.errorCode || ad.creatives.length === 0) {
          this.trackVastError(
            ad.errorURLTemplates.concat(vastResponse.errorURLTemplates),
            { ERRORCODE: ad.errorCode || 303 },
            { ERRORMESSAGE: ad.errorMessage || '' },
            { extensions: ad.extensions },
            { system: ad.system }
          );
          vastResponse.ads.splice(index, 1);
        }
      }
    }
  }

  /**
   * Merges the data between an unwrapped ad and his wrapper.
   * @param  {Ad} unwrappedAd - The 'unwrapped' Ad.
   * @param  {Ad} wrapper - The wrapper Ad.
   * @return {void}
   */
  mergeWrapperAdData(unwrappedAd, wrapper) {
    unwrappedAd.errorURLTemplates = wrapper.errorURLTemplates.concat(
      unwrappedAd.errorURLTemplates
    );
    unwrappedAd.impressionURLTemplates = wrapper.impressionURLTemplates.concat(
      unwrappedAd.impressionURLTemplates
    );
    unwrappedAd.extensions = wrapper.extensions.concat(unwrappedAd.extensions);

    unwrappedAd.creatives.forEach(creative => {
      if (wrapper.trackingEvents && wrapper.trackingEvents[creative.type]) {
        for (let eventName in wrapper.trackingEvents[creative.type]) {
          const urls = wrapper.trackingEvents[creative.type][eventName];
          if (!creative.trackingEvents[eventName]) {
            creative.trackingEvents[eventName] = [];
          }
          creative.trackingEvents[eventName] = creative.trackingEvents[
            eventName
          ].concat(urls);
        }
      }
    });

    if (
      wrapper.videoClickTrackingURLTemplates &&
      wrapper.videoClickTrackingURLTemplates.length
    ) {
      unwrappedAd.creatives.forEach(creative => {
        if (creative.type === 'linear') {
          creative.videoClickTrackingURLTemplates = creative.videoClickTrackingURLTemplates.concat(
            wrapper.videoClickTrackingURLTemplates
          );
        }
      });
    }

    if (
      wrapper.videoCustomClickURLTemplates &&
      wrapper.videoCustomClickURLTemplates.length
    ) {
      unwrappedAd.creatives.forEach(creative => {
        if (creative.type === 'linear') {
          creative.videoCustomClickURLTemplates = creative.videoCustomClickURLTemplates.concat(
            wrapper.videoCustomClickURLTemplates
          );
        }
      });
    }

    // VAST 2.0 support - Use Wrapper/linear/clickThrough when Inline/Linear/clickThrough is null
    if (wrapper.videoClickThroughURLTemplate) {
      unwrappedAd.creatives.forEach(creative => {
        if (
          creative.type === 'linear' &&
          creative.videoClickThroughURLTemplate == null
        ) {
          creative.videoClickThroughURLTemplate =
            wrapper.videoClickThroughURLTemplate;
        }
      });
    }
  }
}
