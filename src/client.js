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

        // Init values if not already set
        if (this.lastSuccessfullAd == null) { this.lastSuccessfullAd = 0; }
        if (this.totalCalls == null) { this.totalCalls = 0; }
        if (this.totalCallsTimeout == null) { this.totalCallsTimeout = 0; }
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

    get(url, opts, cb) {
        let options;
        const now = +new Date();

        if (!cb) {
            if (typeof opts === 'function') { cb = opts; }
            options = {};
        }

        options = Object.assign(this.options, opts);

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
            return cb(null, new Error(`VAST call canceled – FreeLunch capping not reached yet ${this.totalCalls}/${this.cappingFreeLunch}`));
        }

        const timeSinceLastCall = now - this.lastSuccessfullAd;
        // Check timeSinceLastCall to be a positive number. If not, this mean the
        // previous was made in the future. We reset lastSuccessfullAd value
        if (timeSinceLastCall < 0) {
            this.lastSuccessfullAd = 0;
        } else if (timeSinceLastCall < this.cappingMinimumTimeInterval) {
            return cb(null, new Error(`VAST call canceled – (${this.cappingMinimumTimeInterval})ms minimum interval reached`));
        }

        return this.vastParser.parse(url, options, (response, err) => {
            return cb(response, err);
        });
    }
}

module.exports = VASTClient;
