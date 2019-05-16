function xhr() {
  try {
    const request = new window.XMLHttpRequest();
    if ('withCredentials' in request) {
      // check CORS support
      return request;
    }
    return null;
  } catch (err) {
    return null;
  }
}

function supported() {
  return !!xhr();
}

function get(url, options, cb) {
  if (window.location.protocol === 'https:' && url.indexOf('http://') === 0) {
    return cb(new Error('XHRURLHandler: Cannot go from HTTPS to HTTP.'));
  }

  try {
    const request = xhr();

    request.open('GET', url);
    request.timeout = options.timeout || 0;
    request.withCredentials = options.withCredentials || false;
    request.overrideMimeType && request.overrideMimeType('text/xml');
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        if (request.status === 200) {
          cb(null, request.responseXML);
        } else {
          cb(new Error(`XHRURLHandler: ${request.statusText}`));
        }
      }
    };
    request.send();
  } catch (error) {
    cb(new Error('XHRURLHandler: Unexpected error'));
  }
}

export const XHRURLHandler = {
  get,
  supported
};
