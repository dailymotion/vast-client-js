import { Storage } from './util/storage';
import { Util } from './util/util';
import { VASTParser } from './parser/parser';

export class VASTClient {
  constructor(cappingFreeLunch, cappingMinimumTimeInterval, customStorage) {
    this.cappingFreeLunch = cappingFreeLunch || 0;
    this.cappingMinimumTimeInterval = cappingMinimumTimeInterval || 0;
    this.defaultOptions = {
      withCredentials: false,
      timeout: 0
    };
    this.vastParser = new VASTParser();
    this.util = new Util();
    this.storage = customStorage || new Storage();

    // Init values if not already set
    if (this.lastSuccessfullAd == null) {
      this.lastSuccessfullAd = 0;
    }
    if (this.totalCalls == null) {
      this.totalCalls = 0;
    }
    if (this.totalCallsTimeout == null) {
      this.totalCallsTimeout = 0;
    }
  }

  get lastSuccessfullAd() {
    return this.storage.getItem('lastSuccessfullAd');
  }

  set lastSuccessfullAd(value) {
    this.storage.setItem('lastSuccessfullAd', value);
  }

  get totalCalls() {
    return this.storage.getItem('totalCalls');
  }

  set totalCalls(value) {
    this.storage.setItem('totalCalls', value);
  }

  get totalCallsTimeout() {
    return this.storage.getItem('totalCallsTimeout');
  }

  set totalCallsTimeout(value) {
    this.storage.setItem('totalCallsTimeout', value);
  }

  get(url, options, cb) {
    // options parameter is optional
    if (!cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      } else {
        throw new Error(
          'VASTClient get method called without valid callback function'
        );
      }
    }

    const now = +new Date();
    options = Object.assign(this.defaultOptions, options);

    // Check totalCallsTimeout (first call + 1 hour), if older than now,
    // reset totalCalls number, by this way the client will be eligible again
    // for freelunch capping
    if (this.totalCallsTimeout < now) {
      this.totalCalls = 1;
      this.totalCallsTimeout = now + 60 * 60 * 1000;
    } else {
      this.totalCalls++;
    }

    if (this.cappingFreeLunch >= this.totalCalls) {
      return cb(
        new Error(
          `VAST call canceled – FreeLunch capping not reached yet ${
            this.totalCalls
          }/${this.cappingFreeLunch}`
        )
      );
    }

    const timeSinceLastCall = now - this.lastSuccessfullAd;

    // Check timeSinceLastCall to be a positive number. If not, this mean the
    // previous was made in the future. We reset lastSuccessfullAd value
    if (timeSinceLastCall < 0) {
      this.lastSuccessfullAd = 0;
    } else if (timeSinceLastCall < this.cappingMinimumTimeInterval) {
      return cb(
        new Error(
          `VAST call canceled – (${
            this.cappingMinimumTimeInterval
          })ms minimum interval reached`
        )
      );
    }

    return this.vastParser.parse(url, options, (response, err) => {
      return cb(err, response);
    });
  }
}
