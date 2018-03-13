/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class FlashURLHandler {
    xdr() {
        let xdr;
        if (window.XDomainRequest) { xdr = new XDomainRequest(); }
        return xdr;
    }

    supported() {
        return !!this.xdr();
    }

    get(url, options, cb) {

        let xmlDocument;
        if (xmlDocument = typeof window.ActiveXObject === 'function' ? new window.ActiveXObject("Microsoft.XMLDOM") : undefined) {
          xmlDocument.async = false;
        } else {
          return cb(new Error('FlashURLHandler: Microsoft.XMLDOM format not supported'));
      }

        const xdr = this.xdr();
        xdr.open('GET', url);
        xdr.timeout = options.timeout || 0;
        xdr.withCredentials = options.withCredentials || false;
        xdr.send();
        xdr.onprogress = function() {};

        return xdr.onload = function() {
             xmlDocument.loadXML(xdr.responseText);
             return cb(null, xmlDocument);
         };
    }
}

module.exports = FlashURLHandler;
