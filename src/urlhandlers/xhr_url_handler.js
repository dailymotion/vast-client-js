import { DEFAULT_TIMEOUT } from './consts';

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

function handleLoad(request, cb) {
  if (request.status === 200) {
    cb(null, request.responseXML, {
      byteLength: request.response.length,
      statusCode: request.status
    });
  } else {
    handleFail(request, cb, false);
  }
}

function handleFail(request, cb, isTimeout) {
  const statusCode = !isTimeout ? request.status : 408; // Request timeout
  const msg = isTimeout
    ? `XHRURLHandler: Request timed out after ${
        request.timeout
      } ms (${statusCode})`
    : `XHRURLHandler: ${request.statusText} (${statusCode})`;

  cb(new Error(msg), null, { statusCode });
}

function get(url, options, cb) {
  if (window.location.protocol === 'https:' && url.indexOf('http://') === 0) {
    return cb(new Error('XHRURLHandler: Cannot go from HTTPS to HTTP.'));
  }

  try {
    const request = xhr();

    request.open('GET', url);
    request.timeout = options.timeout || DEFAULT_TIMEOUT;
    request.withCredentials = options.withCredentials || false;
    request.overrideMimeType && request.overrideMimeType('text/xml');

    request.onload = () => handleLoad(request, cb);
    request.onerror = () => handleFail(request, cb, false);
    request.onabort = () => handleFail(request, cb, false);
    request.ontimeout = () => handleFail(request, cb, true);

    request.send();
  } catch (error) {
    cb(new Error('XHRURLHandler: Unexpected error'));
  }
}

export const XHRURLHandler = {
  get,
  supported
};
