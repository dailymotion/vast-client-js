[![Build Status](https://travis-ci.org/dailymotion/vast-client-js.png)](https://travis-ci.org/dailymotion/vast-client-js)
[![npm version](https://badge.fury.io/js/vast-client.svg)](https://badge.fury.io/js/vast-client)

# VAST Client JS
Vast Client JS is a JavaScript library to fetch and parse Digital Video Ad Serving Template (VAST) documents.

This library provides three components:

 * A **VAST Client** to fetch and parse VAST XML resources into JavaScript Objects.
 * A **VAST Parser** to directly parse a VAST XML.
 * A **VAST Tracker** to batch and call tracking URLs.

For the full API documentation go [here](#api).

Complies with the [VAST 3.0 specification](https://www.iab.com/wp-content/uploads/2015/06/VASTv3_0.pdf) provided by the [Interactive Advertising Bureau (IAB)](https://www.iab.com/).

## Get Started
VAST Client JS is available as an NPM package and can be easily installed with:
```Bash
npm i vast-client
```
Then import the components you need.

### VASTClient
If you need to fetch and parse VAST documents, you can use the **VASTClient**:
```javascript
import { VASTClient } from 'vast-client'

const vastClient = new VASTClient();

vastClient.get('https://www.examplevast.com/vast.xml')
  .then(res => {
    // Do something with the parsed VAST response
  })
  .catch(err => {
    // Deal with the error
  })
});
```
In addition to fetching and parsing a VAST resource, **VASTClient** provides options to filter a sequence of calls based on count and time of execution, together with the possibility to track URLs using **VASTTracker**.

### VASTParser
To directly parse a VAST XML you can use the **VASTParser**:
```Javascript
import { VASTParser } from 'vast-client'

const vastParser = new VASTParser();

vastParser.parseVAST(vastXml, (err, res) => {
  .then(res => {
    // Do something with the parsed VAST response
  })
  .catch(err => {
    // Deal with the error
  })
});
```

### VASTTracker
To track the execution of an ad use the **VASTTracker**:
```Javascript
import { VASTTracker } from 'vast-client'

const vastTracker = new VASTTracker(vastClient, ad, creative);

// Track an impression for the given ad
vastTracker.trackImpression();
```

## API Documentation<a name="api"></a>
The API documentation is organized by components:

 * [VASTClient](docs/api/vast-client.md)
 * [VASTParser](docs/api/vast-parser.md)
 * [VASTTracker](docs/api/vast-tracker.md)

**:warning: IMPORTANT :warning:** : the release of the `2.0` version of the library introduced many breaking changes in the API.

Read the [**2.0 migration guide**](docs/api/2.0-migration.md) to update your project or follow the [**1.x API documentation**](docs/api/1.x) if you're still using the old version.

## Support and compatibility
The library is 100% written in JavaScript and the source code uses modern features like `modules`, `classes`, ecc... . Make sure your environment supports these features, or transpile the library when bundling your project.

### Browser
A pre-bundled version of VAST Client JS is available: [`vast-client.js`](vast-client.js). You can add the script directly to your page and access the library's components through the `VAST` object.

### Node
A pre-bundled version for node is available too: [`vast-client-node.js`](vast-client-node.js)

## Build / Contribute

See [CONTRIBUTING](docs/CONTRIBUTING.md)
