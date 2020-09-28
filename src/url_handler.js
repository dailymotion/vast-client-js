import { nodeURLHandler } from './urlhandlers/mock_node_url_handler';
import { XHRURLHandler } from './urlhandlers/xhr_url_handler';

function get(url, options, cb) {
  // Allow skip of the options param
  if (!cb) {
    if (typeof options === 'function') {
      cb = options;
    }
    options = {};
  }

  if (typeof window === 'undefined' || window === null) {
    return nodeURLHandler.get(url, options, cb);
  } else if (XHRURLHandler.supported()) {
    return XHRURLHandler.get(url, options, cb);
  }
  return cb(
    new Error(
      'Current context is not supported by any of the default URLHandlers. Please provide a custom URLHandler'
    )
  );
}

export const urlHandler = {
  get
};
