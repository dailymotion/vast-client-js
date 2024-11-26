# VASTParser

The `VASTParser` class provides a parser to manage the parsing ([`parseVAST`](#parse) method) of VAST documents.

`VASTClient` has to be intended as the preferred way to manage a sequence of VAST requests on a higher level, while `VASTParser` offers a set of method to follow in more detail the parsing process.

Use an instance of this class directly only if you don't need any control on multiple calls, otherwise access it through an instance of `VASTClient`.

- [Constructor](#constructor)
- [Events](#events)
- [Properties](#properties)
- [Methods](#methods)

## Error tracking

Whenever an error occurs during the VAST parsing, the parser will call automatically all related tracking error URLs. Reported errors are:

- `no_ad`: The VAST document is empty
- VAST error `101`: VAST schema validation error.
- VAST error `102`: VAST version of response not supported.
- VAST error `301`: Timeout of VAST URI provided in Wrapper element.
- VAST error `302`: Wrapper limit reached.
- VAST error `303`: No VAST response after one or more Wrappers.

## Constructor<a name="constructor"></a>

The constructor signature is:

```Javascript
constructor()
```

### Example

To get an instance of `VASTParser`, simply import it and create one using the constructor:

```Javascript
import { VASTParser } from 'vast-client'

// With default values
const vastParser = new VASTParser();
```

## Events<a name="events"></a>

`VASTParser` extends a custom [`EventEmitter`](https://github.com/dailymotion/vast-client-js/blob/master/docs/api/event-emitter.md), therefore is possible to add event listeners.
Here is the list of event emitted by the class:

### VAST-error

Event is triggered whenever there is an unsupported, empty VAST or a parsing error. It carries the following data:

- `ERRORCODE: Number`
- `ERRORMESSAGE: String [optional]`
- `extensions: Array [optional]`
- `system: Object [optional]`

```Javascript
vastParser.on('VAST-error', ({ ERRORCODE, ERRORMESSAGE, extensions, system }) => {
  // Deal with the error
});
```

### VAST-warning

Event is triggered when the VAST required values are missing according to IAB specifications. It carries the following data:

- `message: String`
- `parentElement: String`
- `specVersion: Number`

```Javascript
vastParser.on('VAST-warning', ({ message, parentElement, specVersion }) => {
  // Deal with the warning
});
```

### VAST-resolving

Event is triggered when `fetchVAST` function is called, before the fetching started. It carries the following data:

- `url: String`
- `previousUrl: String|Null`
- `wrapperDepth: Number`
- `maxWrapperDepth: Number`
- `timeout: Number`
- `wrapperAd: Ad`

```Javascript
vastParser.on('VAST-resolving', ({ url, wrapperDepth, previousUrl }) => {
  // Access to the info
});
```

### VAST-resolved

Event is triggered when `fetchVAST` function is called, after the fetching was done. It carries the following data:

- `url: String`
- `previousUrl: String|Null`
- `wrapperDepth: Number`
- `error: Error|Null`
- `duration: Number`
- `byteLength: Number|undefined`
- `statusCode: Number|undefined`

```Javascript
vastParser.on('VAST-resolved', ({ url, error }) => {
  // Access to the info
});
```

### VAST-ad-parsed

Event is triggered when `parseVastXml` function is called, when an Ad tag has been parsed. It carries the following data:
- `url: String`
- `wrapperDepth: Number`
- `type: 'ERROR'|'WRAPPER'|'INLINE'`
- `adIndex: Number|undefined`

```Javascript
vastParser.on('VAST-ad-parsed', ({ url, wrapperDepth, type,adIndex }) => {
  // Access to the info
});
```

## Public Methods 💚 <a name="methods"></a>


### trackVastError(urlTemplates, errorCode, ...data)

Tracks the error provided in the errorCode parameter and emits a `VAST-error` event for the given error.

#### Parameters

- **`urlTemplates: Array`** - An Array of url templates to use to make the tracking call
- **`errorCode: Object`** - An Object containing the error data
- **`data: Object`** - One (or more) Object containing additional data

### fetchVAST(url, wrapperDepth = 0, previousUrl = null, wrapperAd = null)

Fetches a VAST document for the given url. Returns a `Promise` which resolves with the fetched xml or rejects with an error, according to the result of the request.

#### Parameters

- **`url: String`** - The url to request the VAST document
- **`wrapperDepth: Number`** - Number of wrappers that have occurred
- **`previousUrl: String`** - The url of the previous VAST
- **`wrapperAd: Ad`** - Previously parsed ad node (Wrapper) related to this fetching.

#### Events emitted

- **`VAST-resolved`**
- **`VAST-resolving`**

### parseVAST(vastXml, options)<a name="parse"></a>

Parses the given xml Object into a [VASTResponse](https://github.com/dailymotion/vast-client-js/blob/master/docs/api/class-reference.md#vastresponse).
Returns a `Promise` which either resolves with the fully parsed `VASTResponse` or rejects with an `Error`.

This method will not proceed to any fetching, the final response will only contain the first VAST encountered.
If you need to parse and follow a wrappers chain, you should use the **parseVAST** method from the **VASTClient**.

#### Parameters

- **`vastXml: Object`** - An object representing an xml document
- **`options: Object`** - An optional Object of parameters to be used in the parsing process
  - `allowMultipleAds: Boolean` - A boolean value that identifies whether multiple ads are allowed in the requested VAST response. This will override any value of allowMultipleAds attribute set in the VAST
  - `byteLength: Number`- The size of the request in bytes. Provide it with requestDuration to have a more accurate estimated bitrate.
  - `resolveAll: Boolean` - Allows you to parse all the ads contained in the VAST or to parse them ad by ad or adPod by adPod (default `true`)


#### Events emitted

- **`VAST-resolved`**
- **`VAST-resolving`**
- **`VAST-warning`**

#### Example

```Javascript
const vastXml = (new window.DOMParser()).parseFromString(xmlStr, "text/xml");

vastParser.parseVAST(vastXml)
  .then(res => {
    // Do something with the parsed VAST response
  })
  .catch(err => {
    // Deal with the error
  });

// Or with some options
const options = {
  timeout: 5000,
  withCredentials: true,
  wrapperLimit: 7
}
vastParser.parseVAST(vastXml, options)
  .then(res => {
    // Do something with the parsed VAST response
  })
  .catch(err => {
    // Deal with the error
  });
```

### getEstimatedBitrate()

Returns the average of the estimated bitrates in kilo bit per secondes.

#### Example

```Javascript
const options = {
  requestDuration: 200,
  byteLength: 1000,
}
vastParser.parseVAST(vastXml, options)
  .then(res => {
    vastParser.getEstimatedBitrate()
    // returns 40
  })
  .catch(err => {
    // Deal with the error
  });
```

## Parser Utils

### parseDuration(duration)
 
Parses a duration in the format `HH:MM:SS`, `HH:MM:SS.mmm`  or `SS` and returns a duration in seconds.

```javascript

const a = parseDuration('00:01:30.000');
console.log(a); // output: 90

const b = parseDuration('30');
console.log(b); // output: 30

const c = parseDuration(30);
console.log(c); // output: 30

const d = parseDuration('thirty');
console.log(d); // output -1

```

#### Parameter

- **`duration: String`** - The duration represented as a string.

## Private Methods :warning:<a name="private-methods"></a>

These methods documentation is provided in order to make the parser internal logic clearer. It should not be considered as part of the class public API

### parse(vastXml, options)

Parses the given xml Object into an array of unwrapped ads. Returns a `Promise` which resolves with the array or rejects with an error according to the result of the parsing.

#### Parameters

- **`vastXml: Object`** - An object representing an xml document.
- **`options: Object`** - An optional Object of parameters to be used in the parsing process.

### parseVastXml(vastXml, options)

Parses the given xml Object into an array of ads. Returns the array or throws an `Error` if an invalid VAST XML is provided.

#### Parameters

- **`vastXml: Object`** - An object representing an xml document.
- **`options: Object`** - An optional Object of parameters to be used in the parsing process.

#### Events emitted

- **`VAST-ad-parsed`**

### resolveAds(ads = [], options)

Resolves each ad in a VAST (by calling resolveWrappers). If no ads are returned and there are remaining ads from a previous VAST (like an ad buffet), it will resolve the remaining ads.

#### Parameters

- **`ads: Array<Ad>`** - An array of ads to be unwrapped in parallel.
- **`options: Object`** - An Object of parameters to be used in the unwrapping process.

### resolveWrappers(ad, wrapperDepth, previousUrl)

Resolves the wrappers for the given ad in a recursive way. Returns a `Promise` which resolves with the unwrapped ad or rejects with an error.

#### Parameters

- **`ad: Ad`** - An ad to be unwrapped.
- **`wrapperDepth: Number`** - The reached depth in the wrapper resolving chain.
- **`previousUrl: String`** - The url of the previous VAST

### completeWrapperResolving(vastResponse)

Takes care of handling errors when the wrappers are resolved.

#### Parameters

- **`vastResponse: VASTResponse`** - A resolved VASTResponse

### mergeWrapperAdData(unwrappedAd, wrapper)

Merges the data between an unwrapped ad and his wrapper.

#### Parameters

- **`unwrappedAd: Ad`** - The 'unwrapped' Ad.
- **`wrapper: Ad`** - The wrapper Ad.
