# Fetcher

The `Fetcher` class provides a method to manage the fetching.

Fetcher is not intended to be use directly.

This documentation is provided in order to make the fecthing internal logic clearer. It should not be considered as part of the class public API.

- [Constructor](#constructor)
- [Events](#events)
- [Properties](#properties)
- [Methods](#private-methods)

## Contructor <a name ="constructor"></a>

The constructor signature is:

```Javascript
constructor()
```

## Events <a name="events"></a>

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
## Private Methods :warning:<a name="private-methods"></a>

These methods documentation is provided in order to make the parser internal logic clearer. It should not be considered as part of the class public API.

### fetchVAST(url, {wrapperDepth = 0, previousUrl = null, wrapperAd = null} = {}, maxWrapperDepth, emitter)

Fetches a VAST document for the given url. Returns a `Promise` which resolves with the fetched xml or rejects with an error, according to the result of the request.

#### Parameters

- **`url: String`** - The url to request the VAST document
- **`wrapperDepth: Number`** - Number of wrappers that have occurred
- **`previousUrl: String`** - The url of the previous VAST
- **`wrapperAd: Ad`** - Previously parsed ad node (Wrapper) related to this fetching.
- **`maxWrapperDepth`** - The maximum number of Wrapper that can be fetch;
- **`emitter`** - The function used to Emit event

#### Events emitted

- **`VAST-resolved`**
- **`VAST-resolving`**


### addURLTemplateFilter(filter)

Adds a filter function to the array of filters which are called before fetching a VAST document.

#### Parameters

- **`filter: function`** - The filter function to be added at the end of the array

#### Example

```Javascript
fetcher.addURLTemplateFilter( vastUrl => {
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

fetcher.addURLTemplateFilter(replaceDomain);
// ...
fetcher.removeURLTemplateFilter(replaceDomain);
// [DOMAIN] placeholder is no longer replaced
```
### countURLTemplateFilters()

Returns the number of filters of the url templates filters array.

#### Example

```Javascript
fetcher.addURLTemplateFilter( vastUrl => {
    return url.replace('[DOMAIN]', 'mywebsite.com')
});

fetcher.countUrlTemplateFilters();
// returns 1
```

### clearURLTemplateFilters()

Removes all the filter functions from the url templates filters array.

#### Example

```Javascript
fetcher.addURLTemplateFilter( vastUrl => {
    return url.replace('[DOMAIN]', 'mywebsite.com')
});

fetcher.clearUrlTemplateFilters();
// [DOMAIN] placeholder is no longer replaced
```







