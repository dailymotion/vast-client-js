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

    this.remainingAds = [];
    this.parentURLs = [];
    this.errorURLTemplates = [];
    this.rootErrorURLTemplates = [];
    this.maxWrapperDepth = null;
    this.URLTemplateFilters = [];
    this.fetchingOptions = {};

    this.parserUtils = new ParserUtils();
    this.adParser = new AdParser();
    this.util = new Util();
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
   * @emits  VASTParser#VAST-error
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
   * Returns an array of errorURLTemplates for the VAST being parsed.
   * @return {Array}
   */
  getErrorURLTemplates() {
    return this.rootErrorURLTemplates.concat(this.errorURLTemplates);
  }

  /**
   * Fetches a VAST document for the given url.
   * Returns a Promise which resolves,rejects according to the result of the request.
   * @param  {String} url - The url to request the VAST document.
   * @param {Number} wrapperDepth - how many times the current url has been wrapped
   * @param {String} originalUrl - url of original wrapper
   * @emits  VASTParser#VAST-resolving
   * @emits  VASTParser#VAST-resolved
   * @return {Promise}
   */
  fetchVAST(url, wrapperDepth, originalUrl) {
    return new Promise((resolve, reject) => {
      // Process url with defined filter
      this.URLTemplateFilters.forEach(filter => {
        url = filter(url);
      });

      this.parentURLs.push(url);
      this.emit('VAST-resolving', { url, wrapperDepth, originalUrl });

      this.urlHandler.get(url, this.fetchingOptions, (err, xml) => {
        this.emit('VAST-resolved', { url, error: err });

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
    this.rootURL = '';
    this.remainingAds = [];
    this.parentURLs = [];
    this.errorURLTemplates = [];
    this.rootErrorURLTemplates = [];
    this.maxWrapperDepth = options.wrapperLimit || DEFAULT_MAX_WRAPPER_DEPTH;
    this.fetchingOptions = {
      timeout: options.timeout,
      withCredentials: options.withCredentials
    };

    this.urlHandler = options.urlhandler || new URLHandler();
  }

  /**
   * Resolves the next group of ads. If all is true resolves all the remaining ads.
   * @param  {Boolean} all - If true all the remaining ads are resolved
   * @return {Promise}
   */
  getRemainingAds(all) {
    if (this.remainingAds.length === 0) {
      return Promise.reject(
        new Error('No more ads are available for the given VAST')
      );
    }

    const ads = all
      ? this.util.flatten(this.remainingAds)
      : this.remainingAds.shift();
    this.errorURLTemplates = [];
    this.parentURLs = [];

    return this.resolveAds(ads, {
      wrapperDepth: 0,
      originalUrl: this.rootURL
    }).then(resolvedAds => {
      return this.buildVASTResponse(resolvedAds);
    });
  }

  /**
   * Fetches and parses a VAST for the given url.
   * Returns a Promise which resolves with a fully parsed VASTResponse or rejects with an Error.
   * @param  {String} url - The url to request the VAST document.
   * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
   * @emits  VASTParser#VAST-resolving
   * @emits  VASTParser#VAST-resolved
   * @return {Promise}
   */
  getAndParseVAST(url, options = {}) {
    this.initParsingStatus(options);
    this.rootURL = url;

    return this.fetchVAST(url).then(xml => {
      options.originalUrl = url;
      options.isRootVAST = true;

      return this.parse(xml, options).then(ads => {
        return this.buildVASTResponse(ads);
      });
    });
  }

  /**
   * Parses the given xml Object into a VASTResponse.
   * Returns a Promise which resolves with a fully parsed VASTResponse or rejects with an Error.
   * @param  {Object} vastXml - An object representing a vast xml document.
   * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
   * @emits  VASTParser#VAST-resolving
   * @emits  VASTParser#VAST-resolved
   * @return {Promise}
   */
  parseVAST(vastXml, options = {}) {
    this.initParsingStatus(options);

    options.isRootVAST = true;

    return this.parse(vastXml, options).then(ads => {
      return this.buildVASTResponse(ads);
    });
  }

  /**
   * Builds a VASTResponse which can be returned.
   * @param  {Array} ads - An Array of unwrapped ads
   * @return {VASTResponse}
   */
  buildVASTResponse(ads) {
    const response = new VASTResponse();
    response.ads = ads;
    response.errorURLTemplates = this.getErrorURLTemplates();
    this.completeWrapperResolving(response);

    return response;
  }

  /**
   * Parses the given xml Object into an array of ads
   * Returns a Promise which resolves with the array or rejects with an error according to the result of the parsing.
   * @param  {Object} vastXml - An object representing an xml document.
   * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
   * @emits  VASTParser#VAST-resolving
   * @emits  VASTParser#VAST-resolved
   * @return {Promise}
   */
  parse(
    vastXml,
    {
      resolveAll = true,
      wrapperSequence = null,
      originalUrl = null,
      wrapperDepth = 0,
      isRootVAST = false
    }
  ) {
    // check if is a valid VAST document
    if (
      !vastXml ||
      !vastXml.documentElement ||
      vastXml.documentElement.nodeName !== 'VAST'
    ) {
      return Promise.reject(new Error('Invalid VAST XMLDocument'));
    }

    let ads = [];
    const childNodes = vastXml.documentElement.childNodes;

    // Fill the VASTResponse object with ads and errorURLTemplates
    for (let nodeKey in childNodes) {
      const node = childNodes[nodeKey];

      if (node.nodeName === 'Error') {
        const errorURLTemplate = this.parserUtils.parseNodeText(node);

        // Distinguish root VAST url templates from ad specific ones
        isRootVAST
          ? this.rootErrorURLTemplates.push(errorURLTemplate)
          : this.errorURLTemplates.push(errorURLTemplate);
      }

      if (node.nodeName === 'Ad') {
        const ad = this.adParser.parse(node);

        if (ad) {
          ads.push(ad);
        } else {
          // VAST version of response not supported.
          this.trackVastError(this.getErrorURLTemplates(), {
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

    // Split the VAST in case we don't want to resolve everything at the first time
    if (resolveAll === false) {
      this.remainingAds = this.parserUtils.splitVAST(ads);
      // Remove the first element from the remaining ads array, since we're going to resolve that element
      ads = this.remainingAds.shift();
    }

    return this.resolveAds(ads, { resolveAll, wrapperDepth, originalUrl });
  }

  /**
   * Resolves an Array of ads, recursively calling itself with the remaining ads if a no ad
   * response is returned for the given array.
   * @param {Array} ads - An array of ads to resolve
   * @param {Object} options - An options Object containing resolving parameters
   * @return {Promise}
   */
  resolveAds(ads = [], { wrapperDepth, originalUrl }) {
    const resolveWrappersPromises = [];

    ads.forEach(ad => {
      const resolveWrappersPromise = this.resolveWrappers(
        ad,
        wrapperDepth,
        originalUrl
      );

      resolveWrappersPromises.push(resolveWrappersPromise);
    });

    return Promise.all(resolveWrappersPromises).then(unwrappedAds => {
      const resolvedAds = this.util.flatten(unwrappedAds);
      if (!resolvedAds && this.remainingAds.length > 0) {
        const ads = this.remainingAds.shift();

        return this.resolveAds(ads, {
          wrapperDepth,
          originalUrl
        });
      }
      return resolvedAds;
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
        delete ad.nextWrapperURL;
        return resolve(ad);
      }

      if (
        wrapperDepth >= this.maxWrapperDepth ||
        this.parentURLs.indexOf(ad.nextWrapperURL) !== -1
      ) {
        // Wrapper limit reached, as defined by the video player.
        // Too many Wrapper responses have been received with no InLine response.
        ad.errorCode = 302;
        delete ad.nextWrapperURL;
        return resolve(ad);
      }

      // Get full URL
      ad.nextWrapperURL = this.parserUtils.resolveVastAdTagURI(
        ad.nextWrapperURL,
        originalUrl
      );

      // sequence doesn't carry over in wrapper element
      const wrapperSequence = ad.sequence;
      originalUrl = ad.nextWrapperURL;

      this.fetchVAST(ad.nextWrapperURL, wrapperDepth, originalUrl)
        .then(xml => {
          return this.parse(xml, {
            originalUrl,
            wrapperSequence,
            wrapperDepth
          }).then(unwrappedAds => {
            delete ad.nextWrapperURL;
            if (unwrappedAds.length === 0) {
              // No ads returned by the wrappedResponse, discard current <Ad><Wrapper> creatives
              ad.creatives = [];
              return resolve(ad);
            }

            unwrappedAds.forEach(unwrappedAd => {
              if (unwrappedAd) {
                this.parserUtils.mergeWrapperAdData(unwrappedAd, ad);
              }
            });

            resolve(unwrappedAds);
          });
        })
        .catch(err => {
          // Timeout of VAST URI provided in Wrapper element, or of VAST URI provided in a subsequent Wrapper element.
          // (URI was either unavailable or reached a timeout as defined by the video player.)
          ad.errorCode = 301;
          ad.errorMessage = err.message;

          resolve(ad);
        });
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
}
