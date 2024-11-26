# VAST Parser
The VAST Parser is accessed through *DMVAST.parser* object.

Whenever an error occurs during the VAST parsing, the parser will call on his own all related tracking error URLs. Reported errors are:

* `no_ad`: The VAST document is empty

* VAST error `101`: VAST schema validation error.

* VAST error `301`: Timeout of VAST URI provided in Wrapper element.

* VAST error `302`: Wrapper limit reached.

* VAST error `303`: No VAST response after one or more Wrappers.

Once the VAST document parsed, a callback method is called with an array [`VASTAd`](https://github.com/dailymotion/vast-client-js/tree/master/src/ad.coffee) instances.

## Methods

### addURLTemplateFilter( replace )
Add the *replace* function at the end of the `URLTemplateFilters` array. All functions in `URLTemplateFilters`  will be called with the VAST URL as parameter before fetching the VAST URL document.

``` javascript
DMVAST.parser.addURLTemplateFilter(function(vastUrl) {
    return url.replace('[DOMAIN]', 'mywebsite.com')
});
// For a VASTAdTagURI defined as :
// <VASTAdTagURI>http://example.dailymotion.com/vast.php?domain=[DOMAIN]</VASTAdTagURI>
// HTTP request will be:
// http://example.dailymotion.com/vast.php?domain=mywebsite.com
```

### clearUrlTemplateFilters()
Reset `URLTemplateFilters` to empty, previous *replace* function set with `addURLTemplateFilter()` are no longer called.

``` javascript
DMVAST.parser.addURLTemplateFilter(function(vastUrl) {
    return url.replace('[DOMAIN]', 'mywebsite.com')
});

DMVAST.parser.clearUrlTemplateFilters();
// [DOMAIN] placeholder is no longer replaced
```

### countURLTemplateFilters()
Returns how many *replace* function are set (ie: `URLTemplateFilters` length)

``` javascript
DMVAST.parser.addURLTemplateFilter(function(vastUrl) {
    return url.replace('[DOMAIN]', 'mywebsite.com')
});

DMVAST.parser.clearUrlTemplateFilters();
// return 1
```

### load( xml [, options ], done )
Parse an VAST xml, resolve any wrappers and execute callback function `done`

* `String` *XMLDocument* – A VAST XML document.

* `Object` *options* – An optional set of key/value to configure the Ajax request:
  * `Object` *urlhandler* – A URL handler module, used to fetch `VASTAdTagURI` URL. If defined, will be used instead of the [default ones](https://github.com/dailymotion/vast-client-js/tree/master/src/urlhandlers).
  * `Boolean` *withCredentials* – A boolean to enable the *withCredentials* options for the XHR and FLASH URLHandlers.
  * `Number` *wrapperLimit* – A number of available *Wrapper* responses that can be received with no InLine response.

* `Function` *done* – Callback function to be called once the VAST document is parsed. When at least 1 valid `<inline>` has been found, the 2nd parameter will be an array of [`VASTAd`](https://github.com/dailymotion/vast-client-js/tree/master/src/ad.coffee) instances. Otherwise, in case of no ads, it will be `null`, and an error as a 1st parameter is provided.
  * `Error` *error*
  * `[VASTAd]` *response*

``` javascript
var xml = (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
var options = {
    withCredentials : true,
    wrapperLimit : 5
};

DMVAST.parser.load(xml, options, function(error, response) {
  // process the VAST response
});
```

### on( eventName, listener)
Add the *listener* function for the event named *eventName*. *eventName* value can be :
* `String` *VAST-error* – emitted when the parser encountered a VAST error (ie: no ads, warapper timeout...). The VAST error code is passed to the *listener* function as a parameter.
``` javascript
DMVAST.parser.on(`VAST-error`, function(error) {
    console.log('error:', error)
});

// Parsing a no ad VAST xml document
DMVAST.parser.load(xmlNoAds, options, function(error, response) {});
// Will log => "error: {ERRORCODE: 303}""
```

### once( eventName, listener)
Add a **one time** *listener* function for the event named *eventName*.

### parse( url [, options ], done )
Fetch a URL and parse the response into a valid VAST object.

* `String` *url* – The VAST XML document URL to fetch.

* `Object` *options* – An optional set of key/value to configure the Ajax request:
  * `Object` *urlhandler* – A URL handler module, used to fetch the VAST document instead of the [default ones](https://github.com/dailymotion/vast-client-js/tree/master/src/urlhandlers).
  * `Boolean` *withCredentials* – A boolean to enable the *withCredentials* options for the XHR and FLASH URLHandlers.
  * `Number` *wrapperLimit* – A number of available *Wrapper* responses that can be received with no InLine response.

* `Function` *done* – Callback function to be called once the VAST document is parsed. When at least 1 valid `<inline>` has been found, the 1st parameter will be an array of [`VASTAd`](https://github.com/dailymotion/vast-client-js/tree/master/src/ad.coffee) instances. Hoverwise, in case of no ads, it will be `null`, and an error as a 2nd parameter is provided.

``` javascript
var url = 'http://example.dailymotion.com/vast.xml';
var options = {
    withCredentials : true,
    wrapperLimit : 5
};

DMVAST.parser.parse(url, options, function(response, error) {
  // process the VAST response
});
```

### off( eventName, listener )
Remove the specified *listener* for the event named *eventName*.

### removeURLTemplateFilter( replace )
Remove *replace* function from  `URLTemplateFilters` array. *replace* function won't be called on the next VAST URL encountred by the parser.

``` javascript
var replaceDomain = function() {
    return url.replace('[DOMAIN]', 'mywebsite.com')
};

DMVAST.parser.addURLTemplateFilter(replaceDomain);
// ...
DMVAST.parser.removeURLTemplateFilter(replaceDomain);
// [DOMAIN] placeholder is no longer replaced
```
