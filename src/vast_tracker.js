import { CompanionAd } from './companion_ad';
import { CreativeLinear } from './creative/creative_linear';
import { EventEmitter } from './util/event_emitter';
import { NonLinearAd } from './non_linear_ad';
import { util } from './util/util';

/**
 * The default skip delay used in case a custom one is not provided
 * @constant
 * @type {Number}
 */
const DEFAULT_SKIP_DELAY = -1;

/**
 * This class provides methods to track an ad execution.
 *
 * @export
 * @class VASTTracker
 * @extends EventEmitter
 */
export class VASTTracker extends EventEmitter {
  /**
   * Creates an instance of VASTTracker.
   *
   * @param {VASTClient} client - An instance of VASTClient that can be updated by the tracker. [optional]
   * @param {Ad} ad - The ad to track.
   * @param {Creative} creative - The creative to track.
   * @param {CompanionAd|NonLinearAd} [variation=null] - An optional variation of the creative.
   * @constructor
   */
  constructor(client, ad, creative, variation = null) {
    super();
    this.ad = ad;
    this.creative = creative;
    this.variation = variation;
    this.muted = false;
    this.impressed = false;
    this.skippable = false;
    this.trackingEvents = {};
    // We need to save the already triggered quartiles, in order to not trigger them again
    this._alreadyTriggeredQuartiles = {};
    // Tracker listeners should be notified with some events
    // no matter if there is a tracking URL or not
    this.emitAlwaysEvents = [
      'creativeView',
      'start',
      'firstQuartile',
      'midpoint',
      'thirdQuartile',
      'complete',
      'resume',
      'pause',
      'rewind',
      'skip',
      'closeLinear',
      'close'
    ];

    // Duplicate the creative's trackingEvents property so we can alter it
    for (const eventName in this.creative.trackingEvents) {
      const events = this.creative.trackingEvents[eventName];
      this.trackingEvents[eventName] = events.slice(0);
    }

    // Nonlinear and companion creatives provide some tracking information at a variation level
    // While linear creatives provided that at a creative level. That's why we need to
    // differentiate how we retrieve some tracking information.
    if (this.creative instanceof CreativeLinear) {
      this._initLinearTracking();
    } else {
      this._initVariationTracking();
    }

    // If the tracker is associated with a client we add a listener to the start event
    // to update the lastSuccessfulAd property.
    if (client) {
      this.on('start', () => {
        client.lastSuccessfulAd = Date.now();
      });
    }
  }

  /**
   * Init the custom tracking options for linear creatives.
   *
   * @return {void}
   */
  _initLinearTracking() {
    this.linear = true;
    this.skipDelay = this.creative.skipDelay;

    this.setDuration(this.creative.duration);

    this.clickThroughURLTemplate = this.creative.videoClickThroughURLTemplate;
    this.clickTrackingURLTemplates = this.creative.videoClickTrackingURLTemplates;
  }

  /**
   * Init the custom tracking options for nonlinear and companion creatives.
   * These options are provided in the variation Object.
   *
   * @return {void}
   */
  _initVariationTracking() {
    this.linear = false;
    this.skipDelay = DEFAULT_SKIP_DELAY;

    // If no variation has been provided there's nothing else to set
    if (!this.variation) {
      return;
    }

    // Duplicate the variation's trackingEvents property so we can alter it
    for (const eventName in this.variation.trackingEvents) {
      const events = this.variation.trackingEvents[eventName];

      // If for the given eventName we already had some trackingEvents provided by the creative
      // we want to keep both the creative trackingEvents and the variation ones
      if (this.trackingEvents[eventName]) {
        this.trackingEvents[eventName] = this.trackingEvents[eventName].concat(
          events.slice(0)
        );
      } else {
        this.trackingEvents[eventName] = events.slice(0);
      }
    }

    if (this.variation instanceof NonLinearAd) {
      this.clickThroughURLTemplate = this.variation.nonlinearClickThroughURLTemplate;
      this.clickTrackingURLTemplates = this.variation.nonlinearClickTrackingURLTemplates;
      this.setDuration(this.variation.minSuggestedDuration);
    } else if (this.variation instanceof CompanionAd) {
      this.clickThroughURLTemplate = this.variation.companionClickThroughURLTemplate;
      this.clickTrackingURLTemplates = this.variation.companionClickTrackingURLTemplates;
    }
  }

  /**
   * Sets the duration of the ad and updates the quartiles based on that.
   *
   * @param  {Number} duration - The duration of the ad.
   */
  setDuration(duration) {
    this.assetDuration = duration;
    // beware of key names, theses are also used as event names
    this.quartiles = {
      firstQuartile: Math.round(25 * this.assetDuration) / 100,
      midpoint: Math.round(50 * this.assetDuration) / 100,
      thirdQuartile: Math.round(75 * this.assetDuration) / 100
    };
  }

  /**
   * Sets the duration of the ad and updates the quartiles based on that.
   * This is required for tracking time related events.
   *
   * @param {Number} progress - Current playback time in seconds.
   * @emits VASTTracker#start
   * @emits VASTTracker#skip-countdown
   * @emits VASTTracker#progress-[0-100]%
   * @emits VASTTracker#progress-[currentTime]
   * @emits VASTTracker#rewind
   * @emits VASTTracker#firstQuartile
   * @emits VASTTracker#midpoint
   * @emits VASTTracker#thirdQuartile
   */
  setProgress(progress) {
    const skipDelay = this.skipDelay || DEFAULT_SKIP_DELAY;

    if (skipDelay !== -1 && !this.skippable) {
      if (skipDelay > progress) {
        this.emit('skip-countdown', skipDelay - progress);
      } else {
        this.skippable = true;
        this.emit('skip-countdown', 0);
      }
    }

    if (this.assetDuration > 0) {
      const events = [];

      if (progress > 0) {
        const percent = Math.round((progress / this.assetDuration) * 100);

        events.push('start');
        events.push(`progress-${percent}%`);
        events.push(`progress-${Math.round(progress)}`);

        for (const quartile in this.quartiles) {
          if (
            this.isQuartileReached(quartile, this.quartiles[quartile], progress)
          ) {
            events.push(quartile);
            this._alreadyTriggeredQuartiles[quartile] = true;
          }
        }
      }

      events.forEach(eventName => {
        this.track(eventName, true);
      });

      if (progress < this.progress) {
        this.track('rewind');
      }
    }

    this.progress = progress;
  }

  /**
   * Checks if a quartile has been reached without have being triggered already.
   *
   * @param {String} quartile - Quartile name
   * @param {Number} time - Time offset, when this quartile is reached in seconds.
   * @param {Number} progress - Current progress of the ads in seconds.
   *
   * @return {Boolean}
   */
  isQuartileReached(quartile, time, progress) {
    let quartileReached = false;
    // if quartile time already reached and never triggered
    if (time <= progress && !this._alreadyTriggeredQuartiles[quartile]) {
      quartileReached = true;
    }
    return quartileReached;
  }

  /**
   * Updates the mute state and calls the mute/unmute tracking URLs.
   *
   * @param {Boolean} muted - Indicates if the video is muted or not.
   * @emits VASTTracker#mute
   * @emits VASTTracker#unmute
   */
  setMuted(muted) {
    if (this.muted !== muted) {
      this.track(muted ? 'mute' : 'unmute');
    }
    this.muted = muted;
  }

  /**
   * Update the pause state and call the resume/pause tracking URLs.
   *
   * @param {Boolean} paused - Indicates if the video is paused or not.
   * @emits VASTTracker#pause
   * @emits VASTTracker#resume
   */
  setPaused(paused) {
    if (this.paused !== paused) {
      this.track(paused ? 'pause' : 'resume');
    }
    this.paused = paused;
  }

  /**
   * Updates the fullscreen state and calls the fullscreen tracking URLs.
   *
   * @param {Boolean} fullscreen - Indicates if the video is in fulscreen mode or not.
   * @emits VASTTracker#fullscreen
   * @emits VASTTracker#exitFullscreen
   */
  setFullscreen(fullscreen) {
    if (this.fullscreen !== fullscreen) {
      this.track(fullscreen ? 'fullscreen' : 'exitFullscreen');
    }
    this.fullscreen = fullscreen;
  }

  /**
   * Updates the expand state and calls the expand/collapse tracking URLs.
   *
   * @param {Boolean} expanded - Indicates if the video is expanded or not.
   * @emits VASTTracker#expand
   * @emits VASTTracker#playerExpand
   * @emits VASTTracker#collapse
   * @emits VASTTracker#playerCollapse
   */
  setExpand(expanded) {
    if (this.expanded !== expanded) {
      this.track(expanded ? 'expand' : 'collapse');
      this.track(expanded ? 'playerExpand' : 'playerCollapse');
    }
    this.expanded = expanded;
  }

  /**
   * Must be called if you want to overwrite the <Linear> Skipoffset value.
   * This will init the skip countdown duration. Then, every time setProgress() is called,
   * it will decrease the countdown and emit a skip-countdown event with the remaining time.
   * Do not call this method if you want to keep the original Skipoffset value.
   *
   * @param {Number} duration - The time in seconds until the skip button is displayed.
   */
  setSkipDelay(duration) {
    if (typeof duration === 'number') {
      this.skipDelay = duration;
    }
  }

  /**
   * Tracks an impression (can be called only once).
   *
   * @emits VASTTracker#creativeView
   */
  trackImpression() {
    if (!this.impressed) {
      this.impressed = true;
      this.trackURLs(this.ad.impressionURLTemplates);
      this.track('creativeView');
    }
  }

  /**
   * Send a request to the URI provided by the VAST <Error> element.
   * If an [ERRORCODE] macro is included, it will be substitute with errorCode.
   *
   * @param {String} errorCode - Replaces [ERRORCODE] macro. [ERRORCODE] values are listed in the VAST specification.
   * @param {Boolean} [isCustomCode=false] - Flag to allow custom values on error code.
   */
  errorWithCode(errorCode, isCustomCode = false) {
    this.trackURLs(
      this.ad.errorURLTemplates,
      { ERRORCODE: errorCode },
      { isCustomCode }
    );
  }

  /**
   * Must be called when the user watched the linear creative until its end.
   * Calls the complete tracking URLs.
   *
   * @emits VASTTracker#complete
   */
  complete() {
    this.track('complete');
  }

  /**
   * Must be called when the player or the window is closed during the ad.
   * Calls the `closeLinear` (in VAST 3.0) and `close` tracking URLs.
   *
   * @emits VASTTracker#closeLinear
   * @emits VASTTracker#close
   */
  close() {
    this.track(this.linear ? 'closeLinear' : 'close');
  }

  /**
   * Must be called when the skip button is clicked. Calls the skip tracking URLs.
   *
   * @emits VASTTracker#skip
   */
  skip() {
    this.track('skip');
  }

  /**
   * Must be called then loaded and buffered the creative’s media and assets either fully
   * or to the extent that it is ready to play the media
   * Calls the loaded tracking URLs.
   *
   * @emits VASTTracker#loaded
   */
  load() {
    this.track('loaded');
  }

  /**
   * Must be called when the user clicks on the creative.
   * It calls the tracking URLs and emits a 'clickthrough' event with the resolved
   * clickthrough URL when done.
   *
   * @param {String} [fallbackClickThroughURL=null] - an optional clickThroughURL template that could be used as a fallback
   * @emits VASTTracker#clickthrough
   */
  click(fallbackClickThroughURL = null) {
    if (
      this.clickTrackingURLTemplates &&
      this.clickTrackingURLTemplates.length
    ) {
      this.trackURLs(this.clickTrackingURLTemplates);
    }

    // Use the provided fallbackClickThroughURL as a fallback
    const clickThroughURLTemplate =
      this.clickThroughURLTemplate || fallbackClickThroughURL;

    if (clickThroughURLTemplate) {
      const variables = this.linear
        ? { CONTENTPLAYHEAD: this.progressFormatted() }
        : {};
      const clickThroughURL = util.resolveURLTemplates(
        [clickThroughURLTemplate],
        variables
      )[0];

      this.emit('clickthrough', clickThroughURL);
    }
  }

  /**
   * Calls the tracking URLs for the given eventName and emits the event.
   *
   * @param {String} eventName - The name of the event.
   * @param {Boolean} [once=false] - Boolean to define if the event has to be tracked only once.
   */
  track(eventName, once = false) {
    // closeLinear event was introduced in VAST 3.0
    // Fallback to vast 2.0 close event if necessary
    if (
      eventName === 'closeLinear' &&
      !this.trackingEvents[eventName] &&
      this.trackingEvents['close']
    ) {
      eventName = 'close';
    }

    const trackingURLTemplates = this.trackingEvents[eventName];
    const isAlwaysEmitEvent = this.emitAlwaysEvents.indexOf(eventName) > -1;

    if (trackingURLTemplates) {
      this.emit(eventName, trackingURLTemplates);
      this.trackURLs(trackingURLTemplates);
    } else if (isAlwaysEmitEvent) {
      this.emit(eventName, '');
    }

    if (once) {
      delete this.trackingEvents[eventName];
      if (isAlwaysEmitEvent) {
        this.emitAlwaysEvents.splice(
          this.emitAlwaysEvents.indexOf(eventName),
          1
        );
      }
    }
  }

  /**
   * Calls the tracking urls templates with the given variables.
   *
   * @param {Array} URLTemplates - An array of tracking url templates.
   * @param {Object} [variables={}] - An optional Object of parameters to be used in the tracking calls.
   * @param {Object} [options={}] - An optional Object of options to be used in the tracking calls.
   */
  trackURLs(URLTemplates, variables = {}, options = {}) {
    if (this.linear) {
      if (
        this.creative &&
        this.creative.mediaFiles &&
        this.creative.mediaFiles[0] &&
        this.creative.mediaFiles[0].fileURL
      ) {
        variables['ASSETURI'] = this.creative.mediaFiles[0].fileURL;
      }
      variables['CONTENTPLAYHEAD'] = this.progressFormatted();
    }

    util.track(URLTemplates, variables, options);
  }

  /**
   * Formats time progress in a readable string.
   *
   * @return {String}
   */
  progressFormatted() {
    const seconds = parseInt(this.progress);
    let h = seconds / (60 * 60);
    if (h.length < 2) {
      h = `0${h}`;
    }
    let m = (seconds / 60) % 60;
    if (m.length < 2) {
      m = `0${m}`;
    }
    let s = seconds % 60;
    if (s.length < 2) {
      s = `0${m}`;
    }
    const ms = parseInt((this.progress - seconds) * 100);
    return `${h}:${m}:${s}.${ms}`;
  }
}
