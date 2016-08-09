# VAST Parser
The VAST Parser is accessed through *DMVAST.client* object.

### get( url [, options ], success )
Fetch a URL and parse the response into a valid VAST object.

* `String` *url* – Contains the URL for fetching the VAST XML document.

* `Object` *options* – An optional set of key/value to configure the Ajax request:
  * *response* – A VAST XML document. When *response* is provided, no Ajax request is made and thus the *url* parameter is ignored.
  * *urlhandler* – A URL handler module, used to fetch the VAST document instead of the [default ones](https://github.com/dailymotion/vast-client-js/tree/master/src/urlhandlers).

* `Function` *success* – Method to be called once the VAST document is parsed. The VAST json is passed as a parameter.

``` javascript
DMVAST.client.get('http://example.dailymotion.com/vast.xml', function(response)
{
  // process the VAST response
});
```

# VASTTracker

The VAST tracker constructor will process the tracking URLs of the selected ad/creative and returns an instance of `VASTTracker`. You can create an instance with `new DMVAST.tracker( ad , creative )`.

- `Object` *ad* – Reference to the `<Ad>` element of the selected `mediaFile`
- `Object` *creative* – Reference to the `<Creative>` element of the selected `mediaFile`

``` javascript
// Create a VAST Tracker instance
var vastTracker = new DMVAST.tracker(ad, creative);
```

## Methods
Each of the methods listed below are accessed through an instance of `VASTTracker`.

### on( eventName, listener )
Add a *listener* function for the specified event.

- `String` *eventName* – Name of the event to attach the listener to. See [events](#events) below for all details.
- `Function` *listener* – Method to be called when the event is emitted.

``` javascript
const onSkip = function() {
  console.log('Ad unit skipped');
};

// Log a message when event 'skip' is emitted
vastTracker.on('skip', onSkip);
```

### off( eventName [, listener] )
Remove a listener function for the specified event.

- `String` *eventName* – Name of the event.
- `Function` *listener* – Method to remove. Will remove all listeners for the given event if no specific callback is passed.

``` javascript
// Stop logging message
vastTracker.off('skip', onSkip);
```

### setProgress( progress )
Update the current time value. This is required for tracking time related events such as *start*, *firstQuartile*, *midpoint*, *thirdQuartile* or *rewind*.

- `Number` *progess* – Current playback time in seconds.

``` javascript
// Bind a timeupdate listener to the player
player.addEventListener('timeupdate', function(e) {
  vastTracker.setProgress(e.target.currentTime);
});

vastTracker.on('firstQuartile', function() {
  // firstQuartile tracking URLs have been called
});
```

### setMuted( muted )
Update the mute state and call the *mute*/*unmute* tracking URLs. Emit a *mute* or *unmute* event.

- `Boolean` *muted* – Indicate if the video is muted or not.

``` javascript
// Bind a volumechange listener to the player
player.addEventListener('volumechange', function(e) {
  vastTracker.setMuted(e.target.muted);
});

vastTracker.on('mute', function() {
  // mute tracking URLs have been called
});

vastTracker.on('unmute', function() {
  // unmute tracking URLs have been called
});
```

### setPaused( paused )
Update the pause state and call the *resume*/*pause* tracking URLs. Emit a *resume* or *pause* event.

- `Boolean` *paused* – Indicate if the video is paused or not.

``` javascript
// Bind play/pause listeners to the player
player.addEventListener('play',  function() { vastTracker.setPaused(false); });
player.addEventListener('pause', function() { vastTracker.setPaused(true); });

vastTracker.on('resume', function() {
  // resume tracking URLs have been called
});

vastTracker.on('pause', function() {
  // pause tracking URLs have been called
});
```

### setFullscreen( fullscreen )
Update the fullscreen state and call the *fullscreen* tracking URLs. Emit a *fullscreen* or *exitFullscreen* event.

- `Boolean` *fullscreen* – Indicate the fullscreen mode.

``` javascript
// Bind fullscreenchange listener to the player
// Note that the fullscreen API is still vendor-prefixed in browsers
player.addEventListener('fullscreenchange',  function(e) {
  var isFullscreen = !!document.fullscreenElement;
  vastTracker.setFullscreen(isFullscreen);
});

vastTracker.on('fullscreen', function() {
  // fullscreen tracking URLs have been called
});

vastTracker.on('exitFullscreen', function() {
  // exitFullscreen tracking URLs have been called
});
```

### setSkipDelay( duration )
Must be called if you want to overwrite the `<Linear>` `Skipoffset` value. This will init the skip countdown duration. Then, every time you call `setProgress()`, it will decrease the countdown and emit a `skip-countdown` event with the remaining time.

Do not call this method if you want to keep the original `Skipoffset` value.

- `Number` *duration* – The time in seconds until the skip button is displayed.

``` javascript
// Overwrite linear Skipoffset value – 5s countdown
vastTracker.setSkipDelay(5);
```

### load()
Report the impression URI. Can only be called once. Will report the following URI:

-  All `<Impression>` URI from the `<InLine>` and `<Wrapper>` tracking elements.
-  The `creativeView` URI from the `<Tracking>` events

Once done, a *creativeView* event is emitted.

``` javascript
// Bind canplay listener to the player
$player.on('canplay', function() {
  vastTracker.load();
});

vastTracker.on('creativeView', function() {
  // impression tracking URLs have been called
});
```

### errorWithCode( code )
Send a request to the URI provided by the VAST `<Error>` element. If an `[ERRORCODE]` macro is included, it will be substitute with `code`.

- `String` *code* – Replaces `[ERRORCODE]` macro. `[ERRORCODE]` values are liste in the VAST specification.

``` javascript
var MEDIAFILE_PLAYBACK_ERROR = '405';

// Bind error listener to the player
$player.on('error', function() {
  vastTracker.errorWithCode(MEDIAFILE_PLAYBACK_ERROR);
});
```

### complete()
Must be called when the user watched the linear creative until its end. Call the *complete* tracking URLs. Emit a *complete* events when done.

``` javascript
// Bind ended listener to the player
$player.on('ended', function() {
  vastTracker.complete();
});

vastTracker.on('complete', function() {
  // complete tracking URLs have been called
});
```

### close()
Must be called when the player or the window is closed during the ad. Call the *closeLinear* (in VAST 3.0) and *close* tracking URLs. Emit a *closeLinear* or a *close* event when done.

``` javascript
// When user exits the page
window.onbeforeunload = function() {
  vastTracker.close();
};

// use for VAST 3.0 linear ads
vastTracker.on('closeLinear', function() {
  // ...
});

// Use for VAST 2.0 linear ads or companion ads
vastTracker.on('close', function() {
  // ...
});
```

### skip()
Must be called when the skip button is clicked. Call the *skip* tracking URLs. Emit a *skip* event when done.

``` javascript
// Bind click listener to the skip button
$skipButton.on('click', function() {
  vastTracker.skip();
});

vastTracker.on('skip', function() {
  // skip tracking URLs have been called
});
```

### click()
Must be called when the user clicks on the creative. Call the *<ClickTracking>* tracking URLs. Emit a *clickthrough* event with the resolved *clickThrough* URL when done.

``` javascript
// Bind click listener to the player
$player.on('click', function() {
  vastTracker.click();
});

vastTracker.on('clickthrough', function(url) {
  // Open the resolved clickThrough url
  document.location.href = url;
});
```

## Events

### creativeView
Emitted after *load()* method has been called.

### start
Only for linear ad with a duration. Emitted on the 1st non-null *setProgress(duration)* call.

### progress-[0-100]%
Only for linear ad with a duration. Emitted on every *setProgress(duration)* calls, where *[0-100]* is the adunit percentage completion.

### progress-[currentTime]
Only for linear ad with a duration. Emitted on every *setProgress(duration)* calls, where *[currentTime]* is the adunit current time.

### firstQuartile
Only for linear ad with a duration. Emitted when the adunit has reached 25% of its duration.

### midpoint
Only for linear ad with a duration. Emitted when the adunit has reached 50% of its duration.

### thirdQuartile
Only for linear ad with a duration. Emitted when the adunit has reached 75% of its duration.

### complete
Only for linear ad with a duration. Emitted after *complete()* has been called.

### resume
Emitted when calling *setPaused(paused)* and changing the pause state from `true` to `false`.

### pause
Emitted when calling *setPaused(paused)* and changing the pause state from `false` to `true`.

### rewind
Emitted when *setProgress(duration)* is called with a smaller *duration* than the previous one.

### skip
Emitted after calling *skip()*.

### closeLinear
Only for linear ad, emitted when `close()` is called

### close
Only for non-linear ad, emitted when `close()` is called

### mute
Emitted when calling `setMuted(muted)` and changing the mute state from `false` to `true`.

### unmute
Emitted when calling `setMuted(muted)` and changing the mute state from `true` to `false`.

### fullscreen
Emitted when calling *setFullscreen(fullscreen)* and changing the fullscreen state from `false` to `true`.

### exitFullscreen
Emitted when calling *setFullscreen(fullscreen)* and changing the fullscreen state from `true` to `false`.

### clickthrough
Emitted when calling *click()* if there is at least one `<clickThroughURLTemplate>` element. A URL will be passed as a data.