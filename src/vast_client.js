import { Storage } from './util/storage';
import { VASTParser } from './parser/vast_parser';

/**
 * This class provides methods to fetch and parse a VAST document using VASTParser.
 * In addition it provides options to skip consecutive calls based on constraints.
 * @export
 * @class VASTClient
 */
export class VASTClient {
  /**
   * Creates an instance of VASTClient.
   * @param  {Number} cappingFreeLunch - The number of first calls to skip.
   * @param  {Number} cappingMinimumTimeInterval - The minimum time interval between two consecutive calls.
   * @param  {Storage} customStorage - A custom storage to use instead of the default one.
   * @constructor
   */
  constructor(cappingFreeLunch, cappingMinimumTimeInterval, customStorage) {
    this.cappingFreeLunch = cappingFreeLunch || 0;
    this.cappingMinimumTimeInterval = cappingMinimumTimeInterval || 0;
    this.defaultOptions = {
      withCredentials: false,
      timeout: 0
    };
    this.vastParser = new VASTParser();
    this.storage = customStorage || new Storage();

    // Init values if not already set
    if (this.lastSuccessfulAd === undefined) {
      this.lastSuccessfulAd = 0;
    }

    if (this.totalCalls === undefined) {
      this.totalCalls = 0;
    }
    if (this.totalCallsTimeout === undefined) {
      this.totalCallsTimeout = 0;
    }
  }

  getParser() {
    return this.vastParser;
  }

  get lastSuccessfulAd() {
    return this.storage.getItem('vast-client-last-successful-ad');
  }

  set lastSuccessfulAd(value) {
    this.storage.setItem('vast-client-last-successful-ad', value);
  }

  get totalCalls() {
    return this.storage.getItem('vast-client-total-calls');
  }

  set totalCalls(value) {
    this.storage.setItem('vast-client-total-calls', value);
  }

  get totalCallsTimeout() {
    return this.storage.getItem('vast-client-total-calls-timeout');
  }

  set totalCallsTimeout(value) {
    this.storage.setItem('vast-client-total-calls-timeout', value);
  }

  /**
   * Returns a boolean indicating if there are more ads to resolve for the current parsing.
   * @return {Boolean}
   */
  hasRemainingAds() {
    return this.vastParser.remainingAds.length > 0;
  }

  /**
   * Resolves the next group of ads. If all is true resolves all the remaining ads.
   * @param  {Boolean} all - If true all the remaining ads are resolved
   * @return {Promise}
   */
  getNextAds(all) {
    return this.vastParser.getRemainingAds(all);
  }

  /**
   * Gets a parsed VAST document for the given url, applying the skipping rules defined.
   * Returns a Promise which resolves with a fully parsed VASTResponse or rejects with an Error.
   * @param  {String} url - The url to use to fecth the VAST document.
   * @param  {Object} options - An optional Object of parameters to be applied in the process.
   * @return {Promise}
   */
  get(url, options = {}) {
    const now = Date.now();
    options = Object.assign({}, this.defaultOptions, options);

    // By default the client resolves only the first Ad or AdPod
    if (!options.hasOwnProperty('resolveAll')) {
      options.resolveAll = false;
    }

    // Check totalCallsTimeout (first call + 1 hour), if older than now,
    // reset totalCalls number, by this way the client will be eligible again
    // for freelunch capping
    if (this.totalCallsTimeout < now) {
      this.totalCalls = 1;
      this.totalCallsTimeout = now + 60 * 60 * 1000;
    } else {
      this.totalCalls++;
    }

    return new Promise((resolve, reject) => {
      if (this.cappingFreeLunch >= this.totalCalls) {
        return reject(
          new Error(
            `VAST call canceled – FreeLunch capping not reached yet ${
              this.totalCalls
            }/${this.cappingFreeLunch}`
          )
        );
      }

      const timeSinceLastCall = now - this.lastSuccessfulAd;

      // Check timeSinceLastCall to be a positive number. If not, this mean the
      // previous was made in the future. We reset lastSuccessfulAd value
      if (timeSinceLastCall < 0) {
        this.lastSuccessfulAd = 0;
      } else if (timeSinceLastCall < this.cappingMinimumTimeInterval) {
        return reject(
          new Error(
            `VAST call canceled – (${
              this.cappingMinimumTimeInterval
            })ms minimum interval reached`
          )
        );
      }

      this.vastParser
        .getAndParseVAST(url, options)
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }
}
