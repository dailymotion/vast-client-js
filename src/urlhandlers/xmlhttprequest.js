/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class XHRURLHandler {
    xhr() {
        const xhr = new window.XMLHttpRequest();
        if ('withCredentials' in xhr) { // check CORS support
            return xhr;
        }
    }

    supported() {
        return !!this.xhr();
    }

    get(url, options, cb) {
        if ((window.location.protocol === 'https:') && (url.indexOf('http://') === 0)) {
            return cb(new Error('XHRURLHandler: Cannot go from HTTPS to HTTP.'));
        }

        try {
            const xhr = this.xhr();
            xhr.open('GET', url);
            xhr.timeout = options.timeout || 0;
            xhr.withCredentials = options.withCredentials || false;
            xhr.overrideMimeType && xhr.overrideMimeType('text/xml');
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        return cb(null, xhr.responseXML);
                    } else {
                        return cb(new Error(`XHRURLHandler: ${xhr.statusText}`));
                    }
                }
            };
            return xhr.send();
        } catch (error) {
            return cb(new Error('XHRURLHandler: Unexpected error'));
        }
    }
}

module.exports = XHRURLHandler;
