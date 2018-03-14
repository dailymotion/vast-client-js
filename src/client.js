/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const VASTParser = require('./parser/parser.js');
const VASTUtil = require('./util.js');

class VASTClient {
    constructor() {
        this.cappingFreeLunch = 0;
        this.cappingMinimumTimeInterval = 0;
        this.options = {
            withCredentials : false,
            timeout : 0
        };
        this.vastParser = new VASTParser();
        this.vastUtil = new VASTUtil();
        this.storage = this.vastUtil.getStorage();
        const { defineProperty } = Object;

        // Create new properties for VASTClient, using ECMAScript 5
        // we can define custom getters and setters logic.
        // By this way, we implement the use of storage inside these methods,
        // while it will be fully transparent for the user
        ['lastSuccessfullAd', 'totalCalls', 'totalCallsTimeout'].forEach(function(property) {
            defineProperty(VASTClient, property,
            {
                get() { return this.storage.getItem(property); },
                set(value) { return this.storage.setItem(property, value); },
                configurable: false,
                enumerable: true
            });
        });

        // Init values if not already set
        if (this.lastSuccessfullAd == null) { this.lastSuccessfullAd = 0; }
        if (this.totalCalls == null) { this.totalCalls = 0; }
        if (this.totalCallsTimeout == null) { this.totalCallsTimeout = 0; }
    }

    get(url, opts, cb) {
        let options;
        const now = +new Date();

        const extend = (exports.extend = function(object, properties) {
            for (let key in properties) {
                const val = properties[key];
                object[key] = val;
            }
            return object;
        });

        if (!cb) {
            if (typeof opts === 'function') { cb = opts; }
            options = {};
        }

        options = extend(this.options, opts);

        // Check totalCallsTimeout (first call + 1 hour), if older than now,
        // reset totalCalls number, by this way the client will be eligible again
        // for freelunch capping
        if (this.totalCallsTimeout < now) {
            this.totalCalls = 1;
            this.totalCallsTimeout = now + (60 * 60 * 1000);
        } else {
            this.totalCalls++;
        }

        if (this.cappingFreeLunch >= this.totalCalls) {
            cb(null, new Error(`VAST call canceled – FreeLunch capping not reached yet ${this.totalCalls}/${this.cappingFreeLunch}`));
            return;
        }

        const timeSinceLastCall = now - this.lastSuccessfullAd;
        // Check timeSinceLastCall to be a positive number. If not, this mean the
        // previous was made in the future. We reset lastSuccessfullAd value
        if (timeSinceLastCall < 0) {
            this.lastSuccessfullAd = 0;
        } else if (timeSinceLastCall < this.cappingMinimumTimeInterval) {
            cb(null, new Error(`VAST call canceled – (${this.cappingMinimumTimeInterval})ms minimum interval reached`));
            return;
        }

        return this.vastParser.parse(url, options, (response, err) => {
            return cb(response, err);
        });
    }
}

module.exports = VASTClient;
