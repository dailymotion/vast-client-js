# DMVAST Client

The DMVAST Client library provide utilies to fetch/parse a VAST file/url.

## Method

### get( url [, options ], done )
Fetch a URL or an XML document and parse the response into a valid VAST object.

* `String` *url* – Contains the URL for fetching the VAST XML document.

* `Object` *options* – An optional set of key/value to configure the Ajax request:
  * `String` *response* – A VAST XML document. When *response* is provided, no Ajax request is made and thus the *url* parameter is ignored.
  * `Object` *urlhandler* – A URL handler module, used to fetch the VAST document instead of the [default ones](https://github.com/dailymotion/vast-client-js/tree/master/src/urlhandlers).
  * `Boolean` *withCredentials* – A boolean to enable the *withCredentials* options for the XHR and FLASH URLHandlers.

* `Function` *done* – Method to be called once the VAST document is parsed. The VAST JS object is passed as the 1st parameter. If null, an error is provided as a 2nd parameter.

``` javascript
DMVAST.client.get('http://example.dailymotion.com/vast.xml', { withCredentials: true }, function(response, error)
{
  // process the VAST response
});
```

#### response
* `Array` *ads* – A collection of `ad` object
* `Array` *errorURLTemplates* – An array of URL

##### ads
* `String` *id* – VAST/Ad[id]
* `String` *sequence* – VAST/Ad[sequence]
* `String` *system* – VAST/Ad/InLine/AdSystem
* `String` *title* – VAST/Ad/InLine/AdTitle
* `String` *description* – VAST/Ad/InLine/Description
* `String` *advertiser* – VAST/Ad/InLine/Advertiser
* `Object` *pricing*
  * `String` *value* – VAST/Ad/InLine/Pricing
  * `String` *model* – VAST/Ad/InLine/Pricing[model]
  * `String` *currency* – VAST/Ad/InLine/Pricing[currency]
* `String` *survey* – VAST/Ad/InLine/Survey
* `Array` *errorURLTemplates* – VAST/Ad/Wrapper/Error & VAST/Ad/InLine/Error
* `Array` *impressionURLTemplates* – VAST/Ad/Wrapper/Impression & VAST/Ad/InLine/Impression
* `Array` *creatives* – An array of *creative* object from VAST/Ad/Wrapper/Creatives & VAST/Ad/InLine/Creatives
* `Array` *extensions* – An array of *extension* object from VAST/Ad/Wrapper/Extensions & VAST/Ad/InLine/Extensions

#### creative

type |

#### error