import { DEFAULT_TIMEOUT } from './consts';

const uri = require('url');
const fs = require('fs');
const http = require('http');
const https = require('https');
const DOMParser = require('xmldom').DOMParser;

function get(url, options, cb) {
  url = uri.parse(url);
  const httpModule = url.protocol === 'https:' ? https : http;
  if (url.protocol === 'file:') {
    fs.readFile(uri.fileURLToPath(url.href), 'utf8', function(err, data) {
      if (err) {
        return cb(err);
      }
      const xml = new DOMParser().parseFromString(data);
      cb(null, xml, { byteLength: Buffer.from(data).byteLength });
    });
  } else {
    let timeoutId;
    let data = '';
    const timeout = options.timeout || DEFAULT_TIMEOUT;

    const req = httpModule.get(url.href, function(res) {
      res.on('data', function(chunk) {
        data += chunk;
        clearTimeout(timeoutId);
        timeoutId = startTimeout();
      });
      res.on('end', function() {
        clearTimeout(timeoutId);
        const xml = new DOMParser().parseFromString(data);
        cb(null, xml, {
          byteLength: Buffer.from(data).byteLength,
          statusCode: res.statusCode
        });
      });
    });

    req.on('error', function(err) {
      clearTimeout(timeoutId);

      if (req.aborted) {
        cb(
          new Error(`NodeURLHandler: Request timed out after ${timeout} ms.`),
          null,
          {
            statusCode: 408 // Request timeout
          }
        );
      } else {
        cb(err);
      }
    });

    const startTimeout = () => {
      return setTimeout(() => req.abort(), timeout);
    };
    timeoutId = startTimeout();
  }
}

export const nodeURLHandler = {
  get
};
