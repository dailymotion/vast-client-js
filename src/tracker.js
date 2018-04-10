import { CompanionAd } from './companion_ad';
import { CreativeLinear } from './creative/creative_linear';
import { EventEmitter } from 'events';
import { NonLinearAd } from './non_linear_ad';
import { Util } from './util/util';

export class VASTTracker extends EventEmitter {
  constructor(client, ad, creative, variation = null) {
    super();
    this.client = client;
    this.ad = ad;
    this.creative = creative;
    this.variation = variation;
    this.util = new Util();
    this.muted = false;
    this.impressed = false;
    this.skipable = false;
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

    this.on('start', function() {
      this.client.lastSuccessfullAd = +new Date();
    });
  }

  off(eventName, cb) {
    this.removeListener(eventName, cb);
  }

  setDuration(duration) {
    this.assetDuration = duration;
    // beware of key names, theses are also used as event names
    this.quartiles = {
      firstQuartile: Math.round(25 * this.assetDuration) / 100,
      midpoint: Math.round(50 * this.assetDuration) / 100,
      thirdQuartile: Math.round(75 * this.assetDuration) / 100
    };
  }

  setProgress(progress) {
    const skipDelay =
      this.skipDelay === null ? this.skipDelayDefault : this.skipDelay;

    if (skipDelay !== -1 && !this.skipable) {
      if (skipDelay > progress) {
        this.emit('skip-countdown', skipDelay - progress);
      } else {
        this.skipable = true;
        this.emit('skip-countdown', 0);
      }
    }

    if (this.linear && this.assetDuration > 0) {
      const events = [];

      if (progress > 0) {
        events.push('start');

        const percent = Math.round(progress / this.assetDuration * 100);
        events.push(`progress-${percent}%`);
        events.push(`progress-${Math.round(progress)}`);

        for (let quartile in this.quartiles) {
          const time = this.quartiles[quartile];
          if (time <= progress && progress <= time + 1) {
            events.push(quartile);
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

  setMuted(muted) {
    if (this.muted !== muted) {
      this.track(muted ? 'mute' : 'unmute');
    }
    this.muted = muted;
  }

  setPaused(paused) {
    if (this.paused !== paused) {
      this.track(paused ? 'pause' : 'resume');
    }
    this.paused = paused;
  }

  setFullscreen(fullscreen) {
    if (this.fullscreen !== fullscreen) {
      this.track(fullscreen ? 'fullscreen' : 'exitFullscreen');
    }
    this.fullscreen = fullscreen;
  }

  setExpand(expanded) {
    if (this.expanded !== expanded) {
      this.track(expanded ? 'expand' : 'collapse');
    }
    this.expanded = expanded;
  }

  setSkipDelay(duration) {
    if (typeof duration === 'number') {
      this.skipDelay = duration;
    }
  }

  // To be called when the video started to log the impression
  load() {
    if (!this.impressed) {
      this.impressed = true;
      this.trackURLs(this.ad.impressionURLTemplates);
      this.track('creativeView');
    }
  }

  // To be called when an error happen with the proper error code
  errorWithCode(errorCode) {
    this.trackURLs(this.ad.errorURLTemplates, { ERRORCODE: errorCode });
  }

  // To be called when the user watched the creative until it's end
  complete() {
    this.track('complete');
  }

  // To be called when the player or the window is closed during the ad
  close() {
    this.track(this.linear ? 'closeLinear' : 'close');
  }

  // Deprecated
  stop() {}
  // noop for backward compat

  // To be called when the skip button is clicked
  skip() {
    this.track('skip');
    this.trackingEvents = [];
  }

  // To be called when the user clicks on the creative
  click() {
    if (
      this.clickTrackingURLTemplates != null
        ? this.clickTrackingURLTemplates.length
        : undefined
    ) {
      this.trackURLs(this.clickTrackingURLTemplates);
    }

    if (this.clickThroughURLTemplate != null) {
      let variables;
      if (this.linear) {
        variables = { CONTENTPLAYHEAD: this.progressFormated() };
      }
      const clickThroughURL = this.util.resolveURLTemplates(
        [this.clickThroughURLTemplate],
        variables
      )[0];

      this.emit('clickthrough', clickThroughURL);
    }
  }

  track(eventName, once) {
    // closeLinear event was introduced in VAST 3.0
    // Fallback to vast 2.0 close event if necessary
    if (once == null) {
      once = false;
    }
    if (
      eventName === 'closeLinear' &&
      (this.trackingEvents[eventName] == null &&
        this.trackingEvents['close'] != null)
    ) {
      eventName = 'close';
    }

    const trackingURLTemplates = this.trackingEvents[eventName];
    const idx = this.emitAlwaysEvents.indexOf(eventName);

    if (trackingURLTemplates != null) {
      this.emit(eventName, '');
      this.trackURLs(trackingURLTemplates);
    } else if (idx !== -1) {
      this.emit(eventName, '');
    }

    if (once === true) {
      delete this.trackingEvents[eventName];
      if (idx > -1) {
        this.emitAlwaysEvents.splice(idx, 1);
      }
    }
  }

  trackURLs(URLTemplates, variables) {
    if (variables == null) {
      variables = {};
    }
    if (this.linear) {
      if (
        (this.creative.mediaFiles[0] != null
          ? this.creative.mediaFiles[0].fileURL
          : undefined) != null
      ) {
        variables['ASSETURI'] = this.creative.mediaFiles[0].fileURL;
      }
      variables['CONTENTPLAYHEAD'] = this.progressFormated();
    }

    this.util.track(URLTemplates, variables);
  }

  progressFormated() {
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
