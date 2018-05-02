[![Build Status](https://travis-ci.org/dailymotion/vast-client-js.png)](https://travis-ci.org/dailymotion/vast-client-js)
[![npm version](https://img.shields.io/npm/v/vast-client.svg)](https://www.npmjs.com/package/vast-client)
[![Dependency Status](https://david-dm.org/dailymotion/vast-client-js.svg)](https://david-dm.org/dailymotion/vast-client-js)
[![devDependency Status](https://david-dm.org/dailymotion/vast-client-js/dev-status.svg)](https://david-dm.org/dailymotion/vast-client-js#info=devDependencies)

# VAST Javascript Client
Vast Client JS is a Javascript library for parsing Digital Video Ad Serving Template (VAST) documents as close as possible to the Interactive Advertising Bureau (IAB) specification.

This library provides:

 * A VAST parser, which validates the XML and translates it into a JS object.
 * A VAST tracker, which batches the tracking urls and provides methods for calling them.


Complies with [VAST 3.0 spec](https://www.iab.com/wp-content/uploads/2015/06/VASTv3_0.pdf).

## Documentation
The [client](docs/client.md) documentation contains the basic information to parse a VAST URL/Document. For more advanced use of the parser, see the [parser](docs/parser.md) documentation.

All information about the tracking part can be found in the [tracker](docs/tracker.md) documentation.

## Support
If you need to support legacy browsers (e.g. IE8+), don't forget to include [es5.js](https://github.com/inexorabletash/polyfill/blob/master/es5.js)

## Build / Contribute

See [CONTRIBUTING](CONTRIBUTING.md)
