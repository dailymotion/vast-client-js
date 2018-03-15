let storage = null;

export class Util {
    constructor() {
        this.storage = this.initStorage();
    }

    initStorage() {
        if (storage != null) {
            return storage;
        }

        try {
            storage = (typeof window !== 'undefined' && window !== null) ? window.localStorage || window.sessionStorage : null;
        } catch (storageError) {
            storage = null;
        }

        // In Safari (Mac + iOS) when private browsing is ON,
        // localStorage is read only
        // http://spin.atomicobject.com/2013/01/23/ios-private-browsing-localstorage/
        const isDisabled = function(store) {
            try {
                const testValue = '__VASTUtil__';
                store.setItem(testValue, testValue);
                if (store.getItem(testValue) !== testValue) { return true; }
            } catch (e) {
                return true;
            }
            return false;
        };


        if ((storage == null) || isDisabled(storage)) {
            let data = {};
            storage = {
                length: 0,
                getItem(key) {
                    return data[key];
                },
                setItem(key, value) {
                    data[key] = value;
                    this.length = Object.keys(data).length;
                },
                removeItem(key) {
                    delete data[key];
                    this.length = Object.keys(data).length;
                },
                clear() {
                    data = {};
                    this.length = 0;
                }
            };
        }

        return storage;
    }

    getStorage() {
        return this.storage;
    }

    track(URLTemplates, variables) {
        const URLs = this.resolveURLTemplates(URLTemplates, variables);

        for (let URL of URLs) {
            if (typeof window !== 'undefined' && window !== null) {
                const i = new Image();
                result.push(i.src = URL);
            }
        }
    }

    resolveURLTemplates(URLTemplates, variables) {
        if (variables == null) { variables = {}; }
        const URLs = [];

        // Encode String variables, when given
        if (variables["ASSETURI"] != null) { variables["ASSETURI"] = this.encodeURIComponentRFC3986(variables["ASSETURI"]); }
        if (variables["CONTENTPLAYHEAD"] != null) { variables["CONTENTPLAYHEAD"] = this.encodeURIComponentRFC3986(variables["CONTENTPLAYHEAD"]); }

        // Set default value for invalid ERRORCODE
        if ((variables["ERRORCODE"] != null) && !/^[0-9]{3}$/.test(variables["ERRORCODE"])) { variables["ERRORCODE"] = 900; }

        // Calc random/time based macros
        variables["CACHEBUSTING"] = this.leftpad(Math.round(Math.random() * 1.0e+8).toString());
        variables["TIMESTAMP"] = this.encodeURIComponentRFC3986((new Date).toISOString());

        // RANDOM/random is not defined in VAST 3/4 as a valid macro tho it's used by some adServer (Auditude)
        variables["RANDOM"] = (variables["random"] = variables["CACHEBUSTING"]);

        for (let URLTemplate of URLTemplates) {
            let resolveURL = URLTemplate;
            if (!resolveURL) { continue; }
            for (let key in variables) {
                const value = variables[key];
                const macro1 = `[${key}]`;
                const macro2 = `%%${key}%%`;
                resolveURL = resolveURL.replace(macro1, value);
                resolveURL = resolveURL.replace(macro2, value);
            }
            URLs.push(resolveURL);
        }

        return URLs;
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
    encodeURIComponentRFC3986(str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16)}`);
    }

    leftpad(str) {
        if (str.length < 8) {
            return (this.range(0, 8-str.length, false).map((i) => '0')).join('') + str;
        } else {
            return str;
        }
    }

    range(left, right, inclusive) {
        let range = [];
        let ascending = left < right;
        let end = !inclusive ? right : ascending ? right + 1 : right - 1;

        for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
          range.push(i);
        }
        return range;
    }

    merge(...xs) {
        return Object.assign(...xs);
    }

    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
}
