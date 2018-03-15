# VAST Client
Get an instance of the `VASTClient` by importing and using the class constructor:
``` javascript
import { VASTClient } from 'vast-client'

const client = new VASTClient();
```

## Properties

### `Number` cappingFreeLunch (default: `0`)
Used for ignoring the first `n` calls. Automatically reset 1 hour after the 1st ignored call. Free Lunch capping is disable if sets to `0`.

``` javascript
// Ignore the first 2 calls
client.cappingFreeLunch = 2;

// Those following client.get calls won't be done
client.get(VASTUrl, cb);
client.get(VASTUrl, cb);

// VASTUrl will be called
client.get(VASTUrl, cb);
```

### `Number` cappingMinimumTimeInterval (default: `0`)
Used for ignoring calls that happen `n` ms after the previous call. Minimum time interval is disabled if sets to `0`.

``` javascript
// Ignore any call made 5 minutes or less after one.
client.cappingMinimumTimeInterval = 5 * 60 * 1000;

// Work
client.get(VASTUrl, cb);

// ...
// 2 minutes later

// Ignored
client.get(VASTUrl, cb);

// ...
// 4 minutes later

// Work
client.get(VASTUrl, cb);
```

## Method

### get( url [, options ], done )
Fetch a URL and parse the response into a valid VAST object.

* `String` *url* – Contains the URL for fetching the VAST XML document.

* `Object` *options* – An optional set of key/value to configure the Ajax request:
  * `String` *response* – A VAST XML document. When *response* is provided, no Ajax request is made and thus the *url* parameter is ignored.
  * `Object` *urlhandler* – A URL handler module, used to fetch the VAST document instead of the [default ones](https://github.com/dailymotion/vast-client-js/tree/master/src/urlhandlers).
  * `Boolean` *withCredentials* – A boolean to enable the *withCredentials* options for the XHR and FLASH URLHandlers.
  * `Number` *wrapperLimit* – A number of available *Wrapper* responses that can be received with no InLine response.

* `Function` *done* – Method to be called once the VAST document is parsed. The VAST JS object is passed as the 1st parameter. If null, an error is provided as a 2nd parameter.

``` javascript
client.get('http://example.dailymotion.com/vast.xml', function(response, error)
{
  // process the VAST response
});
```
