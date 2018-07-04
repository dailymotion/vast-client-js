# VASTClient

The `VASTClient` class provides a client to manage the fetching and parsing of VAST documents.

* [Constructor](#constructor)
* [Properties](#properties)
* [Methods](#methods)

## Constructor<a name="constructor"></a>

The constructor signature is:
```Javascript
constructor(cappingFreeLunch, cappingMinimumTimeInterval, customStorage)
```
All the parameters are optional.
#### Parameters
 * **`cappingFreeLunch: Number`** - Used to set the `cappingFreeLunch` property of the class, if not provided a default value of `0` is used for the property
 * **`cappingMinimumTimeInterval: Number`** - Used to set the `cappingMinimumTimeInterval` property of the class, if not provided a default value of `0` is used for the property
 * **`customStorage: Storage`** - Optional custom storage to be used instead of the default one [`utils/storage.js`](../../src/util/storage.js)

#### Example
To get an instance of `VASTClient`, simply import it and create one using the constructor:
```Javascript
import { VASTClient } from 'vast-client'

// With default values
const vastClient = new VASTClient();

// With cappingFreeLunch
const vastClient = new VASTClient(2);

// With cappingMinimumTimeInterval
const vastClient = new VASTClient(0, 2000);

// With customStorage
const vastClient = new VASTClient(0, 0, customStorage);
```

## Properties<a name="properties"></a>

#### cappingFreeLunch: Number
The number of calls to skip.

Example: if set to `3`, the first 3 VAST requests will not be executed.

```Javascript
// Ignore the first 2 calls
vastClient.cappingFreeLunch = 2;

// Those following vastClient.get calls won't be done
vastClient.get(VASTUrl);
vastClient.get(VASTUrl);

// VASTUrl will be called
vastClient.get(VASTUrl);
```

#### cappingMinimumTimeInterval: Number
The minimum time interval (in milliseconds) which has to pass between two consecutive calls.

Example: if set to `2000`, any call which will be requested less than 2 seconds after the last successful one will be ignored.

```Javascript
// Ignores any call made 5 minutes or less after one.
vastClient.cappingMinimumTimeInterval = 5 * 60 * 1000;

// The call is made
vastClient.get(VASTUrl);

// 2 minutes later: The call is ignored
vastClient.get(VASTUrl);

// d minutes later: The call is made
vastClient.get(VASTUrl);
```

#### storage: Storage
Instance of a class which implements the `Storage` interface. Should be set up only once through the constructor.

## Public Methods 💚 <a name="methods"></a>

### get(url, options): Promise
Gets a parsed VAST document for the given url, applying the skipping rules defined (`cappingFreeLunch` and `cappingMinimumTimeInterval`).

Returns a `Promise` which either resolves with the fully parsed [`VASTResponse`](../../src/vast_response.js) or rejects with an `Error`.

#### Parameters
 * **`url: String`** - The url to use to fecth the VAST document
 * **`options: Object`** - An optional Object to configure the request:
    * `timeout: Number` - A custom timeout for the requests (default `0`)
    * `withCredentials: Boolean` - A boolean to enable the withCredentials options for the XHR and FLASH URLHandlers (default `false`)
    * `wrapperLimit: Number` - A number of Wrapper responses that can be received with no InLine response (default `0`)
    * `urlHandler: URLHandler` - Custom urlhandler to be used instead of the default ones [`urlhandlers`](../../src/urlhandlers)

#### Example
```Javascript
const vastClient = new VASTClient();

vastClient.get('http://example.dailymotion.com/vast.xml')
  .then(res => {
    // Do something with the parsed VAST response
  })
  .catch(err => {
    // Deal with the error
  })

// With the options optional parameter
const options = {
  withCredentials: true,
  wrapperLimit: 7
};

vastClient.get('http://example.dailymotion.com/vast.xml', options)
  .then(res => {
    // Do something with the parsed VAST response
  })
  .catch(err => {
    // Deal with the error
  })
```

#### getParser()
Returns the instance of `VASTParser` used by the client to parse the VAST. Use it to directly call a method provided by the `VASTParser` class.

```Javascript
const vastClient = new VASTClient();
const vastParser = vastClient.getParser();

// Clear the url template filters used
vastParser.clearUrlTemplateFilters();
```
