import { DEFAULT_TIMEOUT } from './consts';

function supported() {
  return true;
}

function handleLoad(xml, cb, responseLength) {
  cb(null, xml, {
    byteLength: responseLength,
    statusCode: 200,
  });
}

/**
 *  Timeout promise create
 */
class Timeout {
  constructor(config = {}) {
    this.timeout = config.seconds || DEFAULT_TIMEOUT;
    this.timeoutID = undefined;
  }

  get start() {
    return new Promise((_, reject) => {
      this.timeoutID = setTimeout(() => {
        const message = `XHRURLHandler: Request timed out after ${this.timeout} ms (408)`;
        reject(new Error(message));
      }, this.timeout);
    });
  }

  clear() {
    this.timeoutID && clearTimeout(this.timeoutID);
  }
}

function get(url, options, cb) {
  if (window.location.protocol === 'https:' && url.indexOf('http://') === 0) {
    return cb(new Error('XHRURLHandler: Cannot go from HTTPS to HTTP.'));
  }
  const optCredentialValue = options.withCredentials ? 'include' : 'omit';
  const corsMode = options.withCredentials ? 'cors' : 'no-cors';
  const timeOutPromise = new Timeout({ seconds: options.timeout });

  let responseLength;
  try {
    Promise.race([
      fetch(url, {
        mode: corsMode,
        credentials: optCredentialValue,
      }),
      timeOutPromise.start,
    ])
      .then((response) => {
        if (response.status === 200) {
          responseLength = Number(response.headers.get('content-length'));
          return response.text();
        } else {
          const errorMessage = `XHRURLHandler: ${response.statusText} (${response.status})`;
          reject(new Error(errorMessage));
        }
      })
      .then((str) => new window.DOMParser().parseFromString(str, 'text/xml'))
      .then((xml) => {
        handleLoad(xml, cb, responseLength);
        resolve();
      })
      .catch((error) => cb(new Error(error.message)));
  } catch (error) {
    cb(new Error('XHRURLHandler: Unexpected error'));
  }
}

export const XHRURLHandler = {
  get,
  supported,
};