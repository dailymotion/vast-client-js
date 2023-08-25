import { updateEstimatedBitrate } from './parser/bitrate';
import { urlHandler } from './url_handler';
import { DEFAULT_TIMEOUT } from './urlhandlers/consts';

/**
 * This class provides a method to fetch a VAST document
 * @exports
 * @class Fetcher
 */

export class Fetcher {
  constructor() {
    this.URLTemplateFilters = [];
  }

  setOptions(options = {}) {
    this.urlHandler = options.urlHandler || options.urlhandler || urlHandler;
    this.fetchingOptions = {
      timeout: options.timeout || DEFAULT_TIMEOUT,
      withCredentials: options.withCredentials || false,
    };
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
   * Fetches a VAST document for the given url.
   * Returns a Promise which resolves,rejects according to the result of the request.
   * @param  {String} url - The url to request the VAST document.
   * @param {Number} wrapperDepth - How many times the current url has been wrapped.
   * @param {String} previousUrl - Url of the previous VAST.
   * @param {Object} wrapperAd - Previously parsed ad node (Wrapper) related to this fetching.
   * @param {Number} maxWrapperDepth - The maximum number of Wrapper that can be fetch
   * @param {emitter} emitter - The function used to Emit event
   * @emits  VASTParser#VAST-resolving
   * @emits  VASTParser#VAST-resolved
   * @return {Promise}
   */

  fetchVAST(
    url,
    { wrapperDepth = 0, previousUrl = null, wrapperAd = null } = {},
    maxWrapperDepth,
    emitter
  ) {
    return new Promise((resolve, reject) => {
      const timeBeforeGet = Date.now();

      // Process url with defined filter
      this.URLTemplateFilters.forEach((filter) => {
        url = filter(url);
      });

      emitter('VAST-resolving', {
        url,
        previousUrl,
        wrapperDepth,
        maxWrapperDepth: maxWrapperDepth,
        timeout: this.fetchingOptions.timeout,
        wrapperAd,
      });

      this.urlHandler.get(
        url,
        this.fetchingOptions,
        (error, xml, details = {}) => {
          const deltaTime = Math.round(Date.now() - timeBeforeGet);
          const info = {
            url,
            previousUrl,
            wrapperDepth,
            error,
            duration: deltaTime,
            ...details,
          };

          emitter('VAST-resolved', info);
          updateEstimatedBitrate(details.byteLength, deltaTime);

          if (error) {
            reject(error);
          } else {
            resolve(xml);
          }
        }
      );
    });
  }
}
