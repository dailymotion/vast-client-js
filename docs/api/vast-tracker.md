# VASTTracker

The `VASTTracker` class provides methods to track the execution of an Ad.

* [Constructor](#constructor)
* [Events](#events)
* [Methods](#methods)

## Constructor<a name="constructor"></a>

The constructor signature is:
```Javascript
constructor(client, ad, creative, variation = null)
```
#### Parameters
 * **`client: VASTClient`** - An optional instance of VASTClient that can be updated by the tracker.
 * **`ad: Ad`** - The ad to track
 * **`creative: Creative`** - The creative to track
 * **`variation: CompanionAd|NonLinearAd`** - An optional variation of the creative, for Companion and NonLinear Ads

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

// Without a client instance
const vastTracker = new VASTTracker(null, ad, creative);
```

## Events<a name="events"></a>
`VASTTracker` extends [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter), therefore is possible to add event listeners like this:
```Javascript
vastTracker.on('exitFullscreen', () => {
  // Deal with the event
});
```

Here is the list of events emitted by the class:
 * **`complete`** - Only for linear ads with a duration. Emitted after `complete()` has been called.
 * **`clickthrough`** - Emitted when calling `click()` if there is at least one <clickThroughURLTemplate> element. A URL will be passed as a data
 * **`close`** - Only for non-linear ads, emitted when `close()` is called
 * **`closeLinear`** - Only for linear ads, emitted when `close()` is called
 * **`creativeView`** - Emitted after `load()` method has been called.
 * **`exitFullscreen`** - Emitted when calling `setFullscreen(fullscreen)` and changing the fullscreen state from true to false
 * **`firstQuartile`** - Only for linear ads with a duration. Emitted when the adunit has reached 25% of its duration
 * **`fullscreen`** - Emitted when calling `setFullscreen(fullscreen)` and changing the fullscreen state from false to true
 * **`midpoint`** - Only for linear ads with a duration. Emitted when the adunit has reached 50% of its duration
 * **`mute`** - Emitted when calling `setMuted(muted)` and changing the mute state from false to true
 * **`pause`** - Emitted when calling `setPaused(paused)` and changing the pause state from false to true
 * **`progress-[0-100]%`** - Only for linear ads with a duration. Emitted on every `setProgress(duration)` calls, where [0-100] is the adunit percentage completion
 * **`progress-[currentTime]`** - Only for linear ads with a duration. Emitted on every `setProgress(duration)` calls, where [currentTime] is the adunit current time
 * **`resume`** - Emitted when calling `setPaused(paused)` and changing the pause state from true to false
 * **`rewind`** - Emitted when `setProgress(duration)` is called with a smaller duration than the previous one
 * **`skip`** - Emitted after calling `skip()`
 * **`skip-countdown`** - Only for linear ads with a duration. Emitted on every `setProgress(duration)` calls, the updated countdown will be passed as a data
 * **`start`** - Only for linear ads with a duration. Emitted on the 1st non-null `setProgress(duration)` call
 * **`thirdQuartile`** - Only for linear ads with a duration. Emitted when the adunit has reached 75% of its duration
 * **`unmute`** - Emitted when calling `setMuted(muted)` and changing the mute state from true to false

## Public Methods 💚 <a name="methods"></a>

### errorWithCode(errorCode)
Sends a request to the URI provided by the VAST `<Error>` element. If an `[ERRORCODE]` macro is included, it will be substituted with `errorCode`.

#### Parameters
 * **`errorCode: String`** - Replaces `[ERRORCODE]` macro. `[ERRORCODE]` values are listed in the VAST specification

#### Example
```Javascript
const MEDIAFILE_PLAYBACK_ERROR = '405';

// Bind error listener to the player
player.on('error', () => {
  vastTracker.errorWithCode(MEDIAFILE_PLAYBACK_ERROR);
});
```

### complete()
Must be called when the user watched the linear creative until its end. Calls the complete tracking URLs.

#### Events emitted
 * **`complete`**

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

### click()
Must be called when the user clicks on the creative. Calls the tracking URLs.

#### Events emitted
 * **`clickthrough`**

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

### close()
Must be called when the player or the window is closed during the ad. Calls the `closeLinear` (in VAST 3.0) and `close` tracking URLs

#### Events emitted
 * **`closeLinear`**
 * **`close`**

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

### skip()
Must be called when the skip button is clicked. Calls the skip tracking URLs.

#### Events emitted
 * **`skip`**

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

### setDuration(duration)
Sets the duration of the ad and updates the quartiles based on that.

#### Parameters
 * **`duration: Number`** - The duration of the ad

### setExpand(expanded)
Updates the expand state and calls the expand/collapse tracking URLs.

#### Parameters
 * **`expanded: Boolean`** - Indicates if the video is expanded or not

#### Events emitted
 * **`expand`**
 * **`collapse`**

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

### setFullscreen(fullscreen)
Updates the fullscreen state and calls the fullscreen tracking URLs.

#### Parameters
 * **`fullscreen: Boolean`** - Indicates if the video is in fulscreen mode or not

#### Events emitted
 * **`fullscreen`**
 * **`exitFullscreen`**

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

### setMuted(muted)
Updates the mute state and calls the mute/unmute tracking URLs.

#### Parameters
 * **`muted: Boolean`** - Indicates if the video is muted or not

#### Events emitted
 * **`mute`**
 * **`unmute`**

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

### setPaused(paused)
Update the pause state and call the resume/pause tracking URLs.

#### Parameters
 * **`paused: Boolean`** - Indicates if the video is paused or not

#### Events emitted
 * **`pause`**
 * **`resume`**

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

### setProgress(progress)
Sets the duration of the ad and updates the quartiles based on that. This is required for tracking time related events such as `start`, `firstQuartile`, `midpoint`, `thirdQuartile` or `rewind`.

#### Parameters
 * **`progress: Number`** - Current playback time in seconds

#### Events emitted
 * **`start`**
 * **`skip-countdown`**
 * **`progress-[0-100]%`**
 * **`progress-[currentTime]`**
 * **`rewind`**
 * **`midpoint`**
 * **`firstQuartile`**
 * **`thirdQuartile`**

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
 * **`duration: Number`** - The time in seconds until the skip button is displayed

#### Example
```Javascript
// Overwrite linear Skipoffset value – 5s countdown
vastTracker.setSkipDelay(5);
```

### trackImpression()
Reports the impression URI. Can only be called once. Will report the following URI:

 * All `<Impression>` URI from the `<InLine>` and `<Wrapper>` tracking elements.
 * The `creativeView` URI from the `<Tracking>` events

#### Events emitted
 * **`creativeView`**

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
