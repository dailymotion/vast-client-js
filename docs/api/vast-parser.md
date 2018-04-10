# VASTParser

The `VASTParser` class provides a parser to manage the fetching ([`getandparse`](#getandparse) method) and direct parsing ([`parse`](#parse) method) of VAST documents.

The behavior of this component may be confused with the one of `VASTClient`, since they both provide a way to fetch and parse a VAST document.

`VASTClient` has to be intended as the preferred way to manage a sequence of VAST requests on a higher level, while `VASTParser` offers a set of method to follow in more detail the parsing process.

`VASTParser` provides methods to fetch a VAST resource because of his ability to resolving the wrapper chain (recursive fetch and parse).

Use directly an instance of this class only if you don't need any control on multiple calls, otherwise access it through an instance of `VASTClient`.

* [Constructor](#constructor)
* [Events](#events)
* [Properties](#properties)
* [Methods](#methods)

### Error tracking
Whenever an error occurs during the VAST parsing, the parser will call on his own all related tracking error URLs. Reported errors are:

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

#### maxWrapperDepth: Number
The max reachable depth in the wrapper chain.

#### parentURLs: Array
Array of parent urls in the wrapper chain.

#### URLTemplateFilters: Array
Array of url filter functions to be applied in before a request.

#### urlHandler: URLHandler
Instance of the support class `URLHandler`, is used to make the requests.


## Methods<a name="methods"></a>

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

### fetchVAST(url, options)
Fetches a VAST document for the given url. Returns a `Promise` which resolves or rejects according to the result of the request.

#### Parameters
 * **`url: String`** - The url to request the VAST document
 * **`options: Object`** - An optional Object of parameters to be used in the request
    * `timeout: Number` - A custom timeout for the requests (default `0`)
    * `withCredentials: Boolean` - A boolean to enable the withCredentials options for the XHR and FLASH URLHandlers (default `false`)

#### Events emitted
 * **`VAST-resolved`**
 * **`VAST-resolving`**

### getAndParse(url, options, cb)<a name="getandparse"></a>
Fetches and parses a VAST for the given url. Executes the callback with either an error or the fully parsed `VASTResponse`.

#### Parameters
 * **`url: String`** - The url to request the VAST document
 * **`options: Object`** - An optional Object of parameters to be used in the request
    * `timeout: Number` - A custom timeout for the requests (default `0`)
    * `withCredentials: Boolean` - A boolean to enable the withCredentials options for the XHR and FLASH URLHandlers (default `false`)
    * `wrapperLimit: Number` - A number of Wrapper responses that can be received with no InLine response (default `0`)
 * **`cb: function`** - Error first callback which will be called once the parsing is done

#### Events emitted
 * **`VAST-resolved`**
 * **`VAST-resolving`**

#### Example
```Javascript
vastParser.getAndParse('http://example.dailymotion.com/vast.xml', (err, res) => {
  // Do something with the parsed VASTResponse
});

// With some options
const options = {
  timoeut: 5000,
  withCredentials: true,
  wrapperLimit: 7
}
vastParser.getAndParse('http://example.dailymotion.com/vast.xml', options, (err, res) => {
  // Do something with the parsed VASTResponse
});
```

### parse(vastXml, options, cb)<a name="parse"></a>
Parses the given xml Object into a `VASTResponse`. Executes the callback with either an error or the fully parsed `VASTResponse`.

#### Parameters
 * **`vastXml: Object`** - An object representing an xml document
 * **`options: Object`** - An optional Object of parameters to be used in the parsing process
    * `timeout: Number` - A custom timeout for the possible wrapper resolving requests (default `0`)
    * `withCredentials: Boolean` - A boolean to enable the withCredentials options for the XHR and FLASH URLHandlers (default `false`)
    * `wrapperLimit: Number` - A number of Wrapper responses that can be received with no InLine response (default `0`)
 * **`cb: function`** - Error first callback which will be called once the parsing is done

#### Events emitted
 * **`VAST-resolved`**
 * **`VAST-resolving`**

#### Example
```Javascript
const vastXml = (new window.DOMParser()).parseFromString(xmlStr, "text/xml");

vastParser.parse(vastXml, (err, res) => {
  // Do something with the parsed VASTResponse
});
```
### resolveWrappers(vastResponse, options, cb)
Resolves the wrappers contained in the given `VASTResponse` in a recursive way. Executes the callback with either an error or the fully resolved `VASTResponse`.

#### Parameters
 * **`vastResponse: VASTResponse`** - An already parsed `VASTResponse` that may contain some unresolved wrappers
 * **`options: Object`** - An optional Object of parameters to be used in the resolving process (same structure as the one accepted by `getAndPArse` and `parse`)
 * **`cb: function`** - Error first callback which will be called once the parsing is done

### completeWrapperResolving(vastResponse, wrapperDepth, cb)
Helper function for `resolveWrappers`. Has to be called for every resolved wrapper and takes care of handling errors and calling the callback with the resolved `VASTResponse`.

#### Parameters
 * **`vastResponse: VASTResponse`** - A resolved VASTResponse
 * **`wrapperDepth: Number`** - The wrapper chain depth (used to check if every wrapper has been resolved)
 * **`cb: function`** - Error first callback which will be called once the parsing is done

### mergeWrapperAdData(wrappedAd, ad)
Merges the wrapper data with the given ad data.

#### Parameters
 * **`wrappedAd: Ad`** - The wrapper Ad
 * **`ad: Ad`** - The 'unwrapped' Ad
