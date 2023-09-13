import { DEFAULT_TIMEOUT } from './consts';

// function supported() {
//   return !!xhr();
// }

// // si succes
// function handleLoad(request, cb) {
//   if (request.status === 200) {
//     cb(null, request.responseXML, {
//       byteLength: request.response.length,
//       statusCode: request.status,
//     });
//   } else {
//     handleFail(request, cb, false);
//   }
// }

// // si foireux
// function handleFail(request, cb, isTimeout) {
//   const statusCode = !isTimeout ? request.status : 408; // Request timeout
//   const msg = isTimeout
//     ? `XHRURLHandler: Request timed out after ${request.timeout} ms (${statusCode})`
//     : `XHRURLHandler: ${request.statusText} (${statusCode})`;

//   cb(new Error(msg), null, { statusCode });
// }

// function get(url, options, cb) {
//   if (window.location.protocol === 'https:' && url.indexOf('http://') === 0) {
//     return cb(new Error('XHRURLHandler: Cannot go from HTTPS to HTTP.'));
//   }

//   try {
//     const request = xhr();

//     request.open('GET', url);
//     request.timeout = options.timeout || DEFAULT_TIMEOUT;
//     request.withCredentials = options.withCredentials || false;
//     request.overrideMimeType && request.overrideMimeType('text/xml');
//     request.onload = () => handleLoad(request, cb);
//     request.onerror = () => handleFail(request, cb, false);
//     request.onabort = () => handleFail(request, cb, false);
//     request.ontimeout = () => handleFail(request, cb, true);

//     request.send();
//   } catch (error) {
//     cb(new Error('XHRURLHandler: Unexpected error'));
//   }
// }

function isBrowserEnvironment() {
  return typeof window !== 'undefined';
}

/**
 * handlingResponse
 * @param {*} request
 * @returns
 */
async function handleResponse(request) {
  let details = {};
  const textXml = await request.text();

  details.byteLength = textXml.length;
  details.statusCode = request.status;

  const parser = isBrowserEnvironment() ? new DOMParser() : new nodeDOMParser();
  const xml = parser.parseFromString(textXml, 'text/xml');
  return { xml, details };
}
/**
 * Error Handling
 * @param {*} request
 * @returns
 */
function handleError(request) {
  if (isBrowserEnvironment()) {
    if (
      window.location.protocol === 'http:' &&
      request.url.indexOf('https://') === 0
    ) {
      return 'XHRURLHandler: Cannot go from HTTPS to HTTP.';
    }
  }
  if (request.status !== 200 || !request.ok) {
    return `XHRURLHandler: ${request.statusText} (${request.status})`;
  }
  return null;
}

async function get(url, options) {
  try {
    ///// timeout
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      throw new Error(
        `XHRURLHandler: Request timed out after ${options.timeout} ms (408)`
      );
    }, options.timeout);
    /////

    const request = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: options.withCredentials ? 'include' : 'omit',
    });
    clearTimeout(timer);

    const error = handleError(request);
    if (error) {
      return { error: new Error(error), statusCode: request.status };
    }
    return handleResponse(request);
  } catch (error) {
    return {
      error,
      statusCode: error.name === 'AbortError' ? 408 : null,
    };
  }
}

export const urlHandler = {
  get,
};
