function xdr() {
  let request;
  if (window.XDomainRequest) {
    // eslint-disable-next-line no-undef
    request = new XDomainRequest();
  }
  return request;
}

function supported() {
  return !!xdr();
}

function get(url, options, cb) {
  const xmlDocument =
    typeof window.ActiveXObject === 'function'
      ? new window.ActiveXObject('Microsoft.XMLDOM')
      : undefined;

  if (xmlDocument) {
    xmlDocument.async = false;
  } else {
    return cb(
      new Error('FlashURLHandler: Microsoft.XMLDOM format not supported')
    );
  }

  const request = xdr();
  request.open('GET', url);
  request.timeout = options.timeout || 0;
  request.withCredentials = options.withCredentials || false;
  request.send();
  request.onprogress = function() {};

  request.onload = function() {
    xmlDocument.loadXML(request.responseText);
    cb(null, xmlDocument);
  };
}

export const flashURLHandler = {
  get,
  supported
};
