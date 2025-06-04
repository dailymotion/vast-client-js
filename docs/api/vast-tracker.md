# VASTTracker

The `VASTTracker` class provides methods to track the execution of an Ad.
At key points during ad playback you will need to call thoses methods to fire corresponding [tracking elements](https://iabtechlab.com/wp-content/uploads/2019/06/VAST_4.2_final_june26.pdf#page=28).

- [Constructor](#constructor)
- [Events](#events)
- [Fire trackers URI](#trackers)
- [Macros](#macros)
- [Methods](#methods)

## Constructor<a name="constructor"></a>

The constructor signature is:

```Javascript
constructor(client, ad, creative, variation = null, muted = false)
```

#### Parameters

- **`client: VASTClient`** - An optional instance of VASTClient that can be updated by the tracker.
- **`ad: Ad`** - The ad to track
- **`creative: Creative`** - The creative to track
- **`variation: CompanionAd|NonLinearAd`** - An optional variation of the creative, for Companion and NonLinear Ads
- **`muted: Boolean`** - The initial muted state of the video. (optional, `false` by default)

#### Example

To get an instance of `VASTTracker`, simply import it and create one using the constructor:

```Javascript
import {
  VASTClient,
  VASTTracker
} from 'vast-client'

// With a client instance
const vastClient = new VASTClient();
const vastTracker = new VASTTracker(vastClient, ad, creative);
// For a companion ad
const vastTracker = new VASTTracker(vastClient, ad, creative, companion);
// With the initial muted state
const vastTracker = new VASTTracker(vastClient, ad, creative, null, muted);

// Without a client instance
const vastTracker = new VASTTracker(null, ad, creative);
```

## Events<a name="events"></a>


`VASTTracker` extends a custom [`EventEmitter`](https://github.com/dailymotion/vast-client-js/blob/master/docs/api/event-emitter.md), therefore is possible to add event listeners like this:


```Javascript
vastTracker.on('exitFullscreen', () => {
  // Deal with the event
});
```

In addition, you can add a specific event listener to listen to any errors.

##### TRACKER-error

- `message: String`
```Javascript
vastTracker.on('TRACKER-error', ({message}) => {
  console.log(message)
});
```

### Events list

| **Event**                 | **Description**                                                                                                                       | **Payload**                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------| ----------------------------------------- |
| `acceptInvitation`        | Emitted when calling `acceptInvitation()`                                                                                             | `{ trackingURLTemplates: Array<String> }` |
| `adCollapse`              | Emitted when calling `adCollapse()`                                                                                                   | `{ trackingURLTemplates: Array<String> }` |
| `adExpand`                | Emitted when calling `adExpand()`                                                                                                     | `{ trackingURLTemplates: Array<String> }` |
| `clickthrough`            | Emitted when calling `click()` if there is at least one `<clickThroughURLTemplate>` element. A URL will be passed as a data           | `String`                                  |
| `close`                   | Only for non-linear ads, emitted when `close()` is called                                                                             | `{ trackingURLTemplates: Array<String> }` |
| `closeLinear`             | Only for linear ads, emitted when `close()` is called                                                                                 | `{ trackingURLTemplates: Array<String> }` |
| `collapse`                | Emitted when calling `setExpand(expanded)` and changing the expand state from true to false                                           | `{ trackingURLTemplates: Array<String> }` |
| `complete`                | Only for linear ads with a duration. Emitted after `complete()` has been called.                                                      | `{ trackingURLTemplates: Array<String> }` |
| `creativeView`            | Emitted when `trackImpression()` is called.                                                                                           | `{ trackingURLTemplates: Array<String> }` |
| `exitFullscreen`          | Emitted when calling `setFullscreen(fullscreen)` and changing the fullscreen state from true to false                                 | `{ trackingURLTemplates: Array<String> }` |
| `expand`                  | Emitted when calling `setExpand(expanded)` and changing the expand state from false to true                                           | `{ trackingURLTemplates: Array<String> }` |
| `firstQuartile`           | Only for linear ads with a duration. Emitted when the adunit has reached 25% of its duration                                          | `{ trackingURLTemplates: Array<String> }` |
| `fullscreen`              | Emitted when calling `setFullscreen(fullscreen)` and changing the fullscreen state from false to true                                 | `{ trackingURLTemplates: Array<String> }` |
| `loaded`                  | Only for linear ad. Emitted when calling `load()`                                                                                     | `{ trackingURLTemplates: Array<String> }` |
| `midpoint`                | Only for linear ads with a duration. Emitted when the adunit has reached 50% of its duration                                          | `{ trackingURLTemplates: Array<String> }` |
| `minimize`                | Emitted when calling `minimize()`                                                                                                     | `{ trackingURLTemplates: Array<String> }` |
| `mute`                    | Emitted when calling `setMuted(muted)` and changing the mute state from false to true                                                 | `{ trackingURLTemplates: Array<String> }` |
| `notUsed`                 | Emitted when calling `notUsed()`.This is a terminal event; no other tracking events are sent when this is used                        | `{ trackingURLTemplates: Array<String> }` |
| `otherAdInteraction`      | Emitted when calling `otherAdInteraction()`                                                                                           | `{ trackingURLTemplates: Array<String> }` |
| `overlayViewDuration`     | Emitted when calling `overlayViewDuration()`                                                                                          | `{ trackingURLTemplates: Array<String> }` |
| `pause`                   | Emitted when calling `setPaused(paused)` and changing the pause state from false to true                                              | `{ trackingURLTemplates: Array<String> }` |
| `playerCollapse`          | Emitted when calling `setExpand(false)` is called. This event replaces the exitFullscreen event in VAST 4.1                           | `{ trackingURLTemplates: Array<String> }` |
| `playerExpand`            | Emitted when calling `setExpand(true)` is called. This event replaces the fullscreen event in VAST 4.1                                | `{ trackingURLTemplates: Array<String> }` |
| `progress-[0-100]%`       | Only for linear ads with a duration. Emitted on every `setProgress(duration)` calls, where [0-100] is the adunit percentage completion| `{ trackingURLTemplates: Array<String> }` |
| `progress-[currentTime]`  | Only for linear ads with a duration. Emitted on every `setProgress(duration)` calls, where [currentTime] is the adunit current time   | `{ trackingURLTemplates: Array<String> }` |
| `resume`                  | Emitted when calling `setPaused(paused)` and changing the pause state from true to false                                              | `{ trackingURLTemplates: Array<String> }` |
| `rewind`                  | Emitted when `setProgress(duration)` is called with a smaller duration than the previous one                                          | `{ trackingURLTemplates: Array<String> }` |
| `skip`                    | Emitted when calling `skip()`                                                                                                         | `{ trackingURLTemplates: Array<String> }` |
| `skip-countdown`          | Only for linear ads with a duration. Emitted on every `setProgress(duration)` calls, the updated countdown will be passed as a data   | `Number`                                  |
| `start`                   | Only for linear ads with a duration. Emitted on the 1st non-null `setProgress(duration)` call                                         | `{ trackingURLTemplates: Array<String> }` |
| `thirdQuartile`           | Only for linear ads with a duration. Emitted when the adunit has reached 75% of its duration                                          | `{ trackingURLTemplates: Array<String> }` |
| `unmute`                  | Emitted when calling `setMuted(muted)` and changing the mute state from true to false                                                 | `{ trackingURLTemplates: Array<String> }` |
| `verificationNotExecuted` | Emitted when calling `verificationNotExecuted()`                                                                                      | `{ trackingURLTemplates: Array<String> }` |

## Fire trackers URI <a name="trackers"></a>

VAST tracking is implemented using a number of [individual tracking elements](https://iabtechlab.com/wp-content/uploads/2019/06/VAST_4.2_final_june26.pdf#page=28) that map to
video events. To trigger a tracker you will need to call the corresponding `VASTTracker` [public method](#methods) please refer to below table to see the mapping and method definitions for more details.

| **Method name**                                             | **VAST element(s)**                                                                                                                                                                           |
|-------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [error](#error)                                             | `<Error>`                                                                                                                                                                                     |
| [load](#load)                                               | `<Tracking event="loaded">`                                                                                                                                                                   |
| [complete](#complete)                                       | `<Tracking event="complete">`                                                                                                                                                                 |
| [click](#click)                                             | `<ClickTracking>`                                                                                                                                                                             |
| [close](#close)                                             | `<Tracking event="close">`,  `<Tracking event="closeLinear">`                                                                                                                                 |
| [skip](#skip)                                               | `<Tracking event="skip">`                                                                                                                                                                     |
| [setExpand](#setExpand)                                     | `<Tracking event="playerExpand">`,`<Tracking event="playerCollapse">`                                                                                                                         |
| [setFullscreen](#setFullscreen)                             | `<Tracking event="fullscreen">`, `<Tracking event="exitFullscreen">`                                                                                                                          |
| [setMuted](#setMuted)                                       | `<Tracking event="mute">`, `<Tracking event="mute">`                                                                                                                                          |
| [setPaused](#setPaused)                                     | `<Tracking event="pause">`                                                                                                                                                                    |
| [setProgress](#setProgress)                                 | `<Tracking event="start">`, `<Tracking event="firstQuartile">`, `<Tracking event="midpoint">`, `<Tracking event="thirdQuartile">`, `<Tracking event="progress">`, `<Tracking event="rewind">` |
| [trackImpression](#trackImpression)                         | `<Impression>`, `<Tracking event="creativeView">`                                                                                                                                             |
| [notUsed](#notUsed)                                         | `<Tracking event="notUsed">`                                                                                                                                                                  |
| [otherAdInteraction](#otherAdInteraction)                   | `<Tracking event="otherAdInteraction">`                                                                                                                                                       |
| [acceptInvitation](#acceptInvitation)                       | `<Tracking event="acceptInvitation">`                                                                                                                                                         |
| [adExpand](#adExpand)                                       | `<Tracking event="adExpand">`                                                                                                                                                                 |
| [adCollapse](#adCollapse)                                   | `<Tracking event="adCollapse">`                                                                                                                                                               |
| [minimize](#minimize)                                       | `<Tracking event="minimize">`                                                                                                                                                                 |
| [overlayViewDuration](#overlayViewDuration)                 | `<Tracking event="overlayViewDuration">`                                                                                                                                                      |
| [verificationNotExecuted](#verificationNotExecuted)         | `<Tracking event="verificationNotExecuted">`                                                                                                                                                  |
| [trackViewableImpression](#trackviewableimpression)         | `<Viewable>`                                                                                                                                                                                  |
| [trackNotViewableImpression](#tracknotviewableimpression)   | `<NotViewable>`                                                                                                                                                                               |
| [trackUndeterminedImpression](#trackundeterminedimpression) | `<ViewUndetermined>`                                                                                                                                                                          |

## Macros <a name="macros"></a>

Ad servers and other entities need access to additional data from the publisher to meet client needs for a clearer view into the details of how and where their video is being shown. This is done through the use of macros.

The list of supported macros is in the file [macros.js](/src/util/macros.js).
The following macro value will be set automatically by vast-client if it exists in the tracking url:

- CACHEBUSTING
- TIMESTAMP
- ADPLAYHEAD
- ASSETURI
- PODSEQUENCE
- UNIVERSALADID
- ADTYPE
- ADSERVINGID
- ADCATEGORIES

For any others supported macros, they need to be passed as a parameter when calling tracking methods and must exists in tracking url to be replaced.

If a macro is not passed as param but exist in the tracking url and is supported it will be replaced with `-1` as specified by iAB.

#### Example

Considering having the following tracker in the VAST xml

```xml
<Tracking event="skip"><![CDATA[https://example.com/tracking/skip?d=[DOMAIN]&adcount=[ADCOUNT]&podseq=[PODSEQUENCE]&contentplayhead=[CONTENTPLAYHEAD]&mediaplayhead=[MEDIAPLAYHEAD]playerstate=[PLAYERSTATE]]]></Tracking>
```

Call the vastTracker method with specified macros and values

```Javascript
const macrosParam = {
  CONTENTURI: 'https://mycontentserver.com/video.mp4',
  ADCOUNT: 2,
  CONTENTPLAYHEAD: vastTracker.convertToTimecode(120),
  MEDIAPLAYHEAD: vastTracker.convertToTimecode(120)
}
vastTracker.skip(macrosParam);
```

Macros will be replaced and the skip tracking URL will be called with the following URL:
`https://example.com/tracking/skip?curi=https%3A%2F%2Fmycontentserver.com%2Fvideo.mp4&adcount=2&podseq=1&contentplayhead=00:02:00.000&mediaplayhead=00:02:00.000&playerstate=-1`

## Public Methods 💚 <a name="methods"></a>

### error(macros, isCustomCode) <a name="error"></a>
Send a request to the URI provided by the VAST <Error> element. `macros` is an optional Object containing macros and their values to be used and replaced in the tracking calls.
Pass `isCustomCode` as true only if you want to use a custom code for the `[ERRORCODE]` macro. If false, and a value is provided for `[ERRORCODE]` macro the macro will be replaced in the tracking call only if the code is a number between 100 and 999 (see <https://gist.github.com/rhumlover/5747417>). Otherwise 900 will be used.

#### Parameters

- **`macros : Object `** - An optional Object containing macros and their values to be used and replaced in the tracking calls.
- **`isCustomCode: Boolean`** - Flag to allow custom values on error code.

#### Event emitted

- **`TRACKER-error`**

#### Example

```Javascript
const customCode = '405';

const macrosParam = {
  CONTENTURI: 'https://mycontentserver.com/video.mp4',
  ERRORCODE : customCode
}

// Bind error listener to the player
player.on('error', () => {
  vastTracker.error(macrosParam);
});
```

### errorWithCode(errorCode, isCustomCode) : ⚠️ This method is deprecated in favor of the [error method](#error)

Sends a request to the URI provided by the VAST `<Error>` element. If an `[ERRORCODE]` macro is included, it will be substituted with `errorCode`. `isCustomCode` and its value are related to `[ERRORCODE]`. Pass `isCustomCode` as true only if you want to use a custom code for the `[ERRORCODE]` macro. If false, and a value is provided for `[ERRORCODE]` macro the macro will be replaced in the tracking call only if the code is a number between 100 and 999 (see <https://gist.github.com/rhumlover/5747417>). Otherwise 900 will be used.

#### Parameters

- **`errorCode: String`** - Replaces `[ERRORCODE]` macro. `[ERRORCODE]` values are listed in the VAST specification
- **`isCustomCode: Boolean`** - Flag to allow custom values on error code.

#### Event emitted

- **`TRACKER-error`**

#### Example

```Javascript
const MEDIAFILE_PLAYBACK_ERROR = '405';

// Bind error listener to the player
player.on('error', () => {
  vastTracker.errorWithCode(MEDIAFILE_PLAYBACK_ERROR);
});
```

### load(macros) <a name="load"></a>

Must be called when the player considers that it has loaded and buffered the creative’s media and assets either fully or to the extent that it is ready to play the media.

#### Parameters

- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

#### Events emitted

- **`loaded`**
- **`TRACKER-error`**

#### Example

```Javascript
// Bind ended listener to the player
player.on('loaded', () => {
  vastTracker.load();
});

vastTracker.on('loaded', () => {
  // loaded tracking URLs have been called
});
```

### complete(macros) <a name="complete"></a>

Must be called when the user watched the linear creative until its end. Calls the complete tracking URLs.

#### Parameters

- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

#### Events emitted

- **`complete`**
- **`TRACKER-error`**

#### Example

```Javascript
// Bind ended listener to the player
player.on('ended', () => {
  vastTracker.complete();
});

vastTracker.on('complete', () => {
  // complete tracking URLs have been called
});
```

### click(fallbackClickThroughURL, macros) <a name="click"></a>

Must be called when the user clicks on the creative. Calls the tracking URLs.

#### Parameters

- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

- **`fallbackClickThroughURL: String`** Optional parameter. A clickThroughURL template that could be used as a fallback

#### Events emitted

- **`clickthrough`**
- **`TRACKER-error`**

#### Example

```Javascript
// Bind click listener to the player
player.on('click', () => {
  vastTracker.click();
});

vastTracker.on('clickthrough', url => {
  // Open the resolved clickThrough url
  document.location.href = url;
});
```

### close(macros) <a name="close"></a>

Must be called when the player or the window is closed during the ad. Calls the `closeLinear` (in VAST 3.0) and `close` tracking URLs

#### Parameters

- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

#### Events emitted

- **`closeLinear`**
- **`close`**
- **`TRACKER-error`**

#### Example

```Javascript
// When user exits the page
window.onbeforeunload = () => {
  vastTracker.close();
};

// event for VAST 3.0 linear ads
vastTracker.on('closeLinear', () => {
  // ...
});

// event for VAST 2.0 linear ads or companion ads
vastTracker.on('close', () => {
  // ...
});
```

### skip(macros) <a name="skip"></a>

Must be called when the skip button is clicked. Calls the skip tracking URLs.

#### Parameters

- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

#### Events emitted

- **`skip`**
- **`TRACKER-error`**

#### Example

```Javascript
// Bind click listener to the skip button
skipButton.on('click', () => {
  vastTracker.skip();
});

vastTracker.on('skip', () => {
  // skip tracking URLs have been called
});
```

### setDuration(duration) <a name="setDuration"></a>

Sets the duration of the ad and updates the quartiles based on that.

#### Parameters

- **`duration: Number`** - The duration of the ad

#### Event Emitted

- **`TRACKER-error`**

### setExpand(expanded, macros) <a name="setExpand"></a>

Updates the expand state and calls the expand/collapse as well as playerExpand/playerCollapse for VAST 4.1. tracking URLs.

#### Parameters

- **`expanded: Boolean`** - Indicates if the video is expanded or not
- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

#### Events emitted

- **`expand`**
- **`playerExpand`**
- **`collapse`**
- **`playerCollapse`**
- **`TRACKER-error`**

#### Example

```Javascript
// Sample function for a button that increase/decrease player size
let playerExpanded = false;
expandButton.addEventListener('click', e => {
  playerExpanded = !playerExpanded
  if (playerExpanded) {
    increasePlayerSize()
  } else {
    decreasePlayerSize()
  }
  vastTracker.setExpand(playerExpanded);
});

vastTracker.on('expand', () => {
  // expand tracking URLs have been called
});

vastTracker.on('collapse', () => {
  // collapse tracking URLs have been called
});
```

### setFullscreen(fullscreen, macros) <a name="setFullscreen"></a>

Updates the fullscreen state and calls the fullscreen tracking URLs.

#### Parameters

- **`fullscreen: Boolean`** - Indicates if the video is in fulscreen mode or not
- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

#### Events emitted

- **`fullscreen`**
- **`exitFullscreen`**
- **`TRACKER-error`**

#### Example

```Javascript
// Bind fullscreenchange listener to the player
// Note that the fullscreen API is still vendor-prefixed in browsers
player.addEventListener('fullscreenchange', e => {
  const isFullscreen = !!document.fullscreenElement;
  vastTracker.setFullscreen(isFullscreen);
});

vastTracker.on('fullscreen', () => {
  // fullscreen tracking URLs have been called
});

vastTracker.on('exitFullscreen', () => {
  // exitFullscreen tracking URLs have been called
});
```

### setMuted(muted, macros) <a name="setMuted"></a>

Updates the mute state and calls the mute/unmute tracking URLs.

> :warning: setMuted is relying on an internal mute state, which is `unmuted` by default. If the initial mute state is `muted`, be sure to set it up when initializing the VASTTracker. Otherwise, the first unmute event will not be fired.

#### Parameters

- **`muted: Boolean`** - Indicates if the video is muted or not
- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

#### Events emitted

- **`mute`**
- **`unmute`**
- **`TRACKER-error`**

#### Example

```Javascript
// Bind a volumechange listener to the player
player.addEventListener('volumechange', e => {
  vastTracker.setMuted(e.target.muted);
});

vastTracker.on('mute', () => {
  // mute tracking URLs have been called
});

vastTracker.on('unmute', () => {
  // unmute tracking URLs have been called
});
```

### setPaused(paused, macros) <a name="setPaused"></a>

Update the pause state and call the resume/pause tracking URLs.

#### Parameters

- **`paused: Boolean`** - Indicates if the video is paused or not
- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

#### Events emitted

- **`pause`**
- **`resume`**
- **`TRACKER-error`**

#### Example

```Javascript
// Bind play/pause listeners to the player
player.addEventListener('play', () => vastTracker.setPaused(false) );
player.addEventListener('pause', () => vastTracker.setPaused(true) );

vastTracker.on('resume', () => {
  // resume tracking URLs have been called
});

vastTracker.on('pause', () => {
  // pause tracking URLs have been called
});
```

### setProgress(progress, macros, trackOnce) <a name="setProgress"></a>

Sets the duration of the ad and updates the quartiles based on that. This is required for tracking time related events such as `start`, `firstQuartile`, `midpoint`, `thirdQuartile` or `rewind`.

#### Parameters

- **`progress: Number`** - Current playback time in seconds
- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.
- **`trackOnce: Boolean`** - Optional parameter. If set to false, quartile events can be triggered again after a 'rewind' situation.

#### Events emitted

- **`start`**
- **`skip-countdown`**
- **`progress-[0-100]%`**
- **`progress-[currentTime]`**
- **`rewind`**
- **`midpoint`**
- **`firstQuartile`**
- **`thirdQuartile`**
- **`TRACKER-error`**

#### Example

```Javascript
// Bind a timeupdate listener to the player
player.addEventListener('timeupdate', e => {
  vastTracker.setProgress(e.target.currentTime);
});

vastTracker.on('firstQuartile', () => {
  // firstQuartile tracking URLs have been called
});
```

### setSkipDelay(duration)

Must be called if you want to overwrite the `<Linear> Skipoffset` value. This will init the skip countdown duration. Then, every time `setProgress()` is called, it will decrease the countdown and emit a `skip-countdown` event with the remaining time.

Do not call this method if you want to keep the original `Skipoffset` value.

#### Parameters

- **`duration: Number`** - The time in seconds until the skip button is displayed

#### Event emitted

- **`TRACKER-error`**

#### Example

```Javascript
// Overwrite linear Skipoffset value – 5s countdown
vastTracker.setSkipDelay(5);
```

### trackImpression(macros) <a name="trackImpression"></a>

Reports the impression URI. Can only be called once. Will report the following URI:

- All `<Impression>` URI from the `<InLine>` and `<Wrapper>` tracking elements.
- The `creativeView` URI from the `<Tracking>` events

#### Parameters

- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

#### Events emitted

- **`creativeView`**
- **`TRACKER-error`**

#### Example

```Javascript
// Bind canplay listener to the player
player.on('canplay', () => {
  vastTracker.trackImpression();
});

vastTracker.on('creativeView', () => {
  // impression tracking URLs have been called
});
```
### trackViewableImpression(macros) <a name='trackviewableimpression'></a>

Reports the viewable impression URI. Will report the following URI:

- All `<Viewable>` URI from the `<InLine>` and `<Wrapper>` tracking elements

This method should be used when the ad meets criteria for Viewable impression as described in [MRC Viewable Ad Impression Guidelines](https://www.iab.com/wp-content/uploads/2015/06/MRC-Viewable-Ad-Impression-Measurement-Guideline.pdf)

#### Parameters

- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.
- **`once: Boolean`** - An optional Boolean to define if the event has to be tracked only once. Set to `false` by default


#### Event emitted

- **`TRACKER-error`**

#### Example


```Javascript
// Use case where the ad meet the IAB viewable criteria
if(isAdViewable){
  vastTracker.trackViewableImpression()
}
```

### trackNotViewableImpression(macro) <a name='tracknotviewableimpression'></a>

Reports the NotViewable impression URI. Will report the following URI:

- All `<NotViewable>` URI from the `<InLine>` and `<Wrapper>` tracking elements

This method should be used when the ad meets criteria for NotViewable impression as described in [MRC Viewable Ad Impression Guidelines](https://www.iab.com/wp-content/uploads/2015/06/MRC-Viewable-Ad-Impression-Measurement-Guideline.pdf)

#### Parameters

- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.
- **`once: Boolean`** - An optional Boolean to define if the event has to be tracked only once. Set to `false` by default


#### Event emitted

- **`TRACKER-error`**

#### Example


```Javascript
// Use case where the ad meet the IAB viewable criteria
if(!isAdViewable){
  vastTracker.trackNotViewableImpression();
}
```

### trackUndeterminedImpression(macro) <a name='trackundeterminedimpression'></a>

Reports the ViewUndetermined impression URI. Will report the following URI:

- All `<ViewUndetermined>` URI from the `<InLine>` and `<Wrapper>` tracking elements

This method should be used when the ad meets criteria for ViewUndetermined impression as described in [MRC Viewable Ad Impression Guidelines](https://www.iab.com/wp-content/uploads/2015/06/MRC-Viewable-Ad-Impression-Measurement-Guideline.pdf)

#### Parameters

- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.
- **`once: Boolean`** - An optional Boolean to define if the event has to be tracked only once. Set to `false` by default


#### Event emitted

- **`TRACKER-error`**

#### Example


```Javascript
// Use case where the ad meet the IAB viewable criteria
if(isViewUndetermined){
  vastTracker.trackUndeterminedImpression();
}
```

### notUsed(macros) <a name="notUsed"></a>

Must be called if the ad was not and will not be played (e.g. it was prefetched for a particular ad break but was not
chosen for playback). This allows ad servers to reuse an ad earlier than otherwise would be possible due to
budget/frequency capping. Player support is optional and if implemented is provided on a best effort basis as it is not
technically possible to fire this event for every unused ad (e.g. when the player itself is terminated before playback).
This is a terminal event; no other tracking events should be sent when this is used.

Calls the notUsed tracking URLs.

#### Parameters

- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

#### Events emitted

- **`notUsed`**
- **`TRACKER-error`**

#### Example

```Javascript
vastTracker.on('notUsed', () => {
  // notUsed tracking URLs have been called
});

// Called notUsed if the ad was not and will not be played.
vastTracker.notUsed();

```

### otherAdInteraction(macros) <a name="otherAdInteraction"></a>

An optional metric that can capture all other user interactions under one metric such as hover-overs, or custom clicks.
It should NOT replace clickthrough events or other existing events like mute, unmute, pause, etc.

Calls the otherAdInteraction tracking URLs.

#### Parameters

- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

#### Events emitted

- **`otherAdInteraction`**
- **`TRACKER-error`**

#### Example

```Javascript
// Bind mouseover listener to the player
player.addEventListener('mouseover', () => vastTracker.otherAdInteraction() );

vastTracker.on('otherAdInteraction', () => {
  // otherAdInteraction tracking URLs have been called
});
```

### acceptInvitation(macros) <a name="acceptInvitation"></a>

The user clicked or otherwise activated a control used to pause streaming content, which either expands the ad within
the player’s viewable area or “takes-over” the streaming content area by launching an additional portion of the ad.
An ad in video format ad is usually played upon acceptance, but other forms of media such as games, animation,
tutorials, social media, or other engaging media are also used.

Calls the acceptInvitation tracking URLs.

#### Parameters

- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

#### Events emitted

- **`acceptInvitation`**
- **`TRACKER-error`**

#### Example

```Javascript
// Bind click listener to the invitation button
invitationButton.on('click', () => {
  vastTracker.acceptInvitation();
});

vastTracker.on('acceptInvitation', () => {
  // acceptInvitation tracking URLs have been called
});
```

### adExpand(macros) <a name="adExpand"></a>

The user activated a control to expand the creative.

Calls the adExpand tracking URLs.

#### Parameters

- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

#### Events emitted

- **`adExpand`**
- **`TRACKER-error`**

#### Example

```Javascript
// Bind click listener to the ad expand button
adExpandButton.on('click', () => {
  vastTracker.adExpand();
});

vastTracker.on('adExpand', () => {
  // adExpand tracking URLs have been called
});
```

### adCollapse(macros) <a name="adCollapse"></a>

The user activated a control to reduce the creative to its original dimensions.

Calls the adCollapse tracking URLs.

#### Parameters

- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

#### Events emitted

- **`adCollapse`**
- **`TRACKER-error`**

#### Example

```Javascript
// Bind click listener to the ad collapse button
adCollapseButton.on('click', () => {
  vastTracker.adCollapse();
});

vastTracker.on('adCollapse', () => {
  // adCollapse tracking URLs have been called
});
```

### minimize(macros) <a name="minimize"></a>

The user clicked or otherwise activated a control used to minimize the ad to a size smaller than a collapsed ad but
without fully dispatching the ad from the player environment. Unlike a collapsed ad that is big enough to display it’s
message, the minimized ad is only big enough to offer a control that enables the user to redisplay the ad if desired.

Calls the minimize tracking URLs.

#### Parameters

- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

#### Events emitted

- **`minimize`**
- **`TRACKER-error`**

#### Example

```Javascript
// Bind click listener to the ad collapse button
minimizeButton.on('click', () => {
  vastTracker.minimize();
});

vastTracker.on('minimize', () => {
  // minimize tracking URLs have been called
});
```

### convertToTimecode(timeInSeconds)

Converts given seconds into a VAST compliant timecode (Format: `HH:MM:SS.sss`). Useful for passing in a proper `duration` as timecode to `overlayViewDuration` or setting `MEDIAPLAYHEAD` or `CONTENTPLAYHEAD` as macro.

#### Parameters

- **`timeInSeconds: Number`** - A time in seconds

#### Return

- **`timecode: String`** - The given seconds converted to timecode

### overlayViewDuration(duration, macros) <a name="overlayViewDuration"></a>

The time that the initial ad is displayed. This time is based on the time between the impression and either the
completed length of display based on the agreement between transactional parties or a close, minimize, or accept
invitation event. The macro [ADPLAYHEAD] will be replaced with given duration value.

Calls the overlayViewDuration tracking URLs.

#### Parameters

- **`duration: String`** - The time that the initial ad is displayed as timecode (Format: `00:00:00.000`, use `vastTracker.convertToTimecode` to convert a duration in seconds to a valid ADPLAYHEAD timecode)
- **`macros: Object`** - Optional parameter. Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

#### Events emitted

- **`overlayViewDuration`**
- **`TRACKER-error`**

#### Example

```Javascript
vastTracker.on('overlayViewDuration', () => {
  // overlayViewDuration tracking URLs have been called
});
// Trigger the overlayViewDuration event, and call tracking URLs
vastTracker.overlayViewDuration();
```

### verificationNotExecuted(macros) <a name="verificationNotExecuted"></a>

Must be called if the player did not or was not able to execute the provided verification code.The [REASON] macro must be filled with reason code. Reason code values can be found in the VAST specification.

Calls the verificationNotExecuted trackings URLs.

#### Parameters

- **`vendor: String`** An identifier for the verification vendor. The recommended format is [domain]-[useCase], to avoid name collisions. For example, "company.com-omid".
- **`macros: Object`** - Object containing macros and their values to be replaced. Macros must be supported by VAST specification.

#### Events emitted

- **`verificationNotExecuted`**
- **`TRACKER-error`**

#### Example

```Javascript
vastTracker.on('verificationNotExecuted', () => {
  // verificationNotExecuted tracking URLs have been called
});
const vendor = "company.com-omid"
// Trigger the verificationNotExecuted event, and call tracking URLs
vastTracker.verificationNotExecuted(vendor, {REASON: 3});
```

### track(eventName, { macros, once })

Calls the tracking URLs for the given eventName and emits the event.

#### Parameters

- **`eventName: String`** - The event name
- **`macros: Object`** - An optional Object of macros to be used in the tracking calls.
- **`once: Boolean`** - An optional Boolean to define if the event has to be tracked only once. Set to `false` by default

#### Events emitted

- **`given eventName`**
- **`TRACKER-error`**


#### Example

```Javascript
// Track the tracking URLs for skip event
vastTracker.track('skip', { macros });
```

## Private Methods ⚠️

These methods documentation is provided in order to make the tracker internal logic clearer. It should not be considered as part of the class public API.

### trackURLs(URLTemplates, macros , options)

Calls the tracking urls templates with the given macros.
Also automatically replaces the deducted value for following macros:

- CACHEBUSTING
- TIMESTAMP
- ADPLAYHEAD
- ASSETURI
- PODSEQUENCE
- UNIVERSALADID
- ADTYPE
- ADSERVINGID
- ADCATEGORIES
- BLOCKEDADCATEGORIES

#### Parameters

- **`URLTemplates: Array<String|Object>`** - An array of tracking url templates.
- **`macros: Object`** - An optional Object of macros to be used in the tracking calls.
- **`option: Object`** - An optional Object of options to be used in the tracking calls.
