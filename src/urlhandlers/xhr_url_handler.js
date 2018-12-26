function xhr() {
  try {
    const xhr = new window.XMLHttpRequest();
    if ('withCredentials' in xhr) {
      // check CORS support
      return xhr;
    }
    return null;
  } catch (err) {
    console.log('Error in XHRURLHandler support check:', err);
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
    const xhr = xhr();
    xhr.open('GET', url);
    xhr.timeout = options.timeout || 0;
    xhr.withCredentials = options.withCredentials || false;
    xhr.overrideMimeType && xhr.overrideMimeType('text/xml');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          cb(null, xhr.responseXML);
        } else {
          cb(new Error(`XHRURLHandler: ${xhr.statusText}`));
        }
      }
    };
    xhr.send();
  } catch (error) {
    cb(new Error('XHRURLHandler: Unexpected error'));
  }
}

export const XHRURLHandler = {
  get,
  supported
};
