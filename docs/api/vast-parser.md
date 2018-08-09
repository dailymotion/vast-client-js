# VASTParser

The `VASTParser` class provides a parser to manage the fetching ([`getAndParseVAST`](#getandparse) method) and direct parsing ([`parseVAST`](#parse) method) of VAST documents.

The behavior of this component may be confused with the one of `VASTClient`, since they both provide a way to fetch and parse a VAST document.

`VASTClient` has to be intended as the preferred way to manage a sequence of VAST requests on a higher level, while `VASTParser` offers a set of method to follow in more detail the parsing process.

`VASTParser` provides methods to fetch a VAST resource because of his ability to resolving the wrapper chain (recursive fetch and parse).

Use an instance of this class directly only if you don't need any control on multiple calls, otherwise access it through an instance of `VASTClient`.

* [Constructor](#constructor)
* [Events](#events)
* [Properties](#properties)
* [Methods](#methods)

### Error tracking
Whenever an error occurs during the VAST parsing, the parser will call automatically all related tracking error URLs. Reported errors are:

* `no_ad`: The VAST document is empty

* VAST error `101`: VAST schema validation error.

* VAST error `301`: Timeout of VAST URI provided in Wrapper element.

* VAST error `302`: Wrapper limit reached.

* VAST error `303`: No VAST response after one or more Wrappers.

## Constructor<a name="constructor"></a>

The constructor signature is:
```Javascript
constructor()
```

#### Example
To get an instance of `VASTParser`, simply import it and create one using the constructor:
```Javascript
import { VASTParser } from 'vast-client'

// With default values
const vastParser = new VASTParser();
```

## Events<a name="events"></a>
`VASTParser` extends [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter), therefore is possible to add event listeners like this:
```Javascript
vastParser.on('VAST-error', () => {
  // Deal with the error
});
```

Here is the list of event emitted by the class:
 * **`VAST-error`**
 * **`VAST-resolved`**
 * **`VAST-resolving`**

## Properties<a name="properties"></a>

#### urlHandler: URLHandler
Instance of the support class `URLHandler`, is used to make the requests.


## Public Methods 💚 <a name="methods"></a>

### addURLTemplateFilter(filter)
Adds a filter function to the array of filters which are called before fetching a VAST document.

#### Parameters
 * **`filter: function`** - The filter function to be added at the end of the array

#### Example
```Javascript
vastParser.addURLTemplateFilter( vastUrl => {
    return url.replace('[DOMAIN]', 'mywebsite.com')
});

/*
For a VASTAdTagURI defined as :
<VASTAdTagURI>http://example.dailymotion.com/vast.php?domain=[DOMAIN]</VASTAdTagURI>
HTTP request will be:
http://example.dailymotion.com/vast.php?domain=mywebsite.com
*/
```

### removeURLTemplateFilter()
Removes the last element of the url templates filters array.

#### Example
```Javascript
const replaceDomain = () => {
    return url.replace('[DOMAIN]', 'mywebsite.com')
};

vastParser.addURLTemplateFilter(replaceDomain);
// ...
vastParser.removeURLTemplateFilter(replaceDomain);
// [DOMAIN] placeholder is no longer replaced
```

### countURLTemplateFilters()
Returns the number of filters of the url templates filters array.

#### Example
```Javascript
vastParser.addURLTemplateFilter( vastUrl => {
    return url.replace('[DOMAIN]', 'mywebsite.com')
});

vastParser.countUrlTemplateFilters();
// returns 1
```

### clearURLTemplateFilters()
Removes all the filter functions from the url templates filters array.

#### Example
```Javascript
vastParser.addURLTemplateFilter( vastUrl => {
    return url.replace('[DOMAIN]', 'mywebsite.com')
});

vastParser.clearUrlTemplateFilters();
// [DOMAIN] placeholder is no longer replaced
```

### trackVastError(urlTemplates, errorCode, ...data)
Tracks the error provided in the errorCode parameter and emits a `VAST-error` event for the given error.

#### Parameters
 * **`urlTemplates: Array`** - An Array of url templates to use to make the tracking call
 * **`errorCode: Object`** - An Object containing the error data
 * **`data: Object`** - One (or more) Object containing additional data

### fetchVAST(url)
Fetches a VAST document for the given url. Returns a `Promise` which resolves with the fetched xml or rejects with an error, according to the result of the request.

#### Parameters
 * **`url: String`** - The url to request the VAST document

#### Events emitted
 * **`VAST-resolved`**
 * **`VAST-resolving`**

### getAndParseVAST(url, options)<a name="getandparse"></a>
Fetches and parses a VAST for the given url.
Returns a `Promise` which either resolves with the fully parsed [`VASTResponse`](../../src/vast_response.js) or rejects with an `Error`.

#### Parameters
 * **`url: String`** - The url to request the VAST document
 * **`options: Object`** - An optional Object of parameters to be used in the request
    * `timeout: Number` - A custom timeout for the requests (default `0`)
    * `withCredentials: Boolean` - A boolean to enable the withCredentials options for the XHR and FLASH URLHandlers (default `false`)
    * `wrapperLimit: Number` - A number of Wrapper responses that can be received with no InLine response (default `0`)
    * `urlHandler: URLHandler` - Custom urlhandler to be used instead of the default ones [`urlhandlers`](../../src/urlhandlers)

#### Events emitted
 * **`VAST-resolved`**
 * **`VAST-resolving`**

#### Example
```Javascript
vastParser.getAndParseVAST('http://example.dailymotion.com/vast.xml')
  .then(res => {
    // Do something with the parsed VAST response
  })
  .catch(err => {
    // Deal with the error
  });

// With some options
const options = {
  timoeut: 5000,
  withCredentials: true,
  wrapperLimit: 7
}
vastParser.getAndParseVAST('http://example.dailymotion.com/vast.xml', options)
  .then(res => {
    // Do something with the parsed VAST response
  })
  .catch(err => {
    // Deal with the error
  });
```

### parseVAST(vastXml, options)<a name="parse"></a>
Parses the given xml Object into a `VASTResponse`.
Returns a `Promise` which either resolves with the fully parsed [`VASTResponse`](../../src/vast_response.js) or rejects with an `Error`.

#### Parameters
 * **`vastXml: Object`** - An object representing an xml document
 * **`options: Object`** - An optional Object of parameters to be used in the parsing process
    * `timeout: Number` - A custom timeout for the possible wrapper resolving requests (default `0`)
    * `withCredentials: Boolean` - A boolean to enable the withCredentials options for the XHR and FLASH URLHandlers (default `false`)
    * `wrapperLimit: Number` - A number of Wrapper responses that can be received with no InLine response (default `0`)
    * `urlHandler: URLHandler` - Custom urlhandler to be used instead of the default ones [`urlhandlers`](../../src/urlhandlers)

#### Events emitted
 * **`VAST-resolved`**
 * **`VAST-resolving`**

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
  timoeut: 5000,
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

## Private Methods :warning:<a name="private-methods"></a>
These methods documentation is provided in order to make the parser internal logic clearer. It should not be considered as part of the class public API

### parse(vastXml, options)
Parses the given xml Object into an array of ads. Returns a `Promise` which resolves with the array or rejects with an error according to the result of the parsing.

#### Parameters
 * **`vastXml: Object`** - An object representing an xml document.
 * **`options: Object`** - An optional Object of parameters to be used in the parsing process.

### resolveWrappers(ad, wrapperDepth, originalUrl)
Resolves the wrappers for the given ad in a recursive way. Returns a `Promise` which resolves with the unwrapped ad or rejects with an error.

#### Parameters
 * **`ad: Ad`** - An ad to be unwrapped.
 * **`wrapperDepth: Number`** - The reached depth in the wrapper resolving chain.
 * **`originalUrl: String`** - The original vast url.

### completeWrapperResolving(vastResponse)
Takes care of handling errors when the wrappers are resolved.

#### Parameters
 * **`vastResponse: VASTResponse`** - A resolved VASTResponse

### mergeWrapperAdData(unwrappedAd, wrapper)
Merges the data between an unwrapped ad and his wrapper.

#### Parameters
 * **`unwrappedAd: Ad`** - The 'unwrapped' Ad.
 * **`wrapper: Ad`** - The wrapper Ad.
