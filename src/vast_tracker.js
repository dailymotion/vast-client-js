import { CompanionAd } from './companion_ad';
import { CreativeLinear } from './creative/creative_linear';
import { EventEmitter } from 'events';
import { NonLinearAd } from './non_linear_ad';
import { Util } from './util/util';

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
    this.util = new Util();
    this.muted = false;
    this.impressed = false;
    this.skippable = false;
    this.skipDelayDefault = -1;
    this.trackingEvents = {};
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
    // Have to save already triggered quartile, to not trigger again
    this._alreadyTriggeredQuartiles = {};
    // Duplicate the creative's trackingEvents property so we can alter it
    for (let eventName in this.creative.trackingEvents) {
      const events = this.creative.trackingEvents[eventName];
      this.trackingEvents[eventName] = events.slice(0);
    }
    if (this.creative instanceof CreativeLinear) {
      this.setDuration(this.creative.duration);

      this.skipDelay = this.creative.skipDelay;
      this.linear = true;
      this.clickThroughURLTemplate = this.creative.videoClickThroughURLTemplate;
      this.clickTrackingURLTemplates = this.creative.videoClickTrackingURLTemplates;
      // Nonlinear and Companion
    } else {
      this.skipDelay = -1;
      this.linear = false;
      // Used variation has been specified
      if (this.variation) {
        if (this.variation instanceof NonLinearAd) {
          this.clickThroughURLTemplate = this.variation.nonlinearClickThroughURLTemplate;
          this.clickTrackingURLTemplates = this.variation.nonlinearClickTrackingURLTemplates;
        } else if (this.variation instanceof CompanionAd) {
          this.clickThroughURLTemplate = this.variation.companionClickThroughURLTemplate;
          this.clickTrackingURLTemplates = this.variation.companionClickTrackingURLTemplates;
        }
      }
    }

    // If the tracker is associated with a client we add a listener to the start event
    // to update the lastSuccessfulAd property.
    if (client) {
      this.on('start', () => {
        client.lastSuccessfullAd = Date.now();
      });
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
    const skipDelay = this.skipDelay || this.skipDelayDefault;

    if (skipDelay !== -1 && !this.skippable) {
      if (skipDelay > progress) {
        this.emit('skip-countdown', skipDelay - progress);
      } else {
        this.skippable = true;
        this.emit('skip-countdown', 0);
      }
    }

    if (this.linear && this.assetDuration > 0) {
      const events = [];

      if (progress > 0) {
        const percent = Math.round(progress / this.assetDuration * 100);

        events.push('start');
        events.push(`progress-${percent}%`);
        events.push(`progress-${Math.round(progress)}`);

        for (let quartile in this.quartiles) {
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
   * @emits VASTTracker#collapse
   */
  setExpand(expanded) {
    if (this.expanded !== expanded) {
      this.track(expanded ? 'expand' : 'collapse');
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
   */
  errorWithCode(errorCode) {
    this.trackURLs(this.ad.errorURLTemplates, { ERRORCODE: errorCode });
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
    this.trackingEvents = [];
  }

  /**
   * Must be called when the user clicks on the creative.
   * It calls the tracking URLs and emits a 'clickthrough' event with the resolved
   * clickthrough URL when done.
   *
   * @emits VASTTracker#clickthrough
   */
  click() {
    if (
      this.clickTrackingURLTemplates &&
      this.clickTrackingURLTemplates.length
    ) {
      this.trackURLs(this.clickTrackingURLTemplates);
    }

    if (this.clickThroughURLTemplate) {
      const variables = this.linear
        ? { CONTENTPLAYHEAD: this.progressFormatted() }
        : {};
      const clickThroughURL = this.util.resolveURLTemplates(
        [this.clickThroughURLTemplate],
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
      this.emit(eventName, '');
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
   */
  trackURLs(URLTemplates, variables = {}) {
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

    this.util.track(URLTemplates, variables);
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
