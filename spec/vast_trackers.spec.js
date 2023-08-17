import { VASTClient } from '../src/vast_client';
import { VASTTracker } from '../src/vast_tracker';
import { inlineTrackersParsed } from '../spec/samples/inline_trackers';
import { util } from '../src/util/util';
import { createCreativeLinear } from '../src/creative/creative_linear';

const vastClient = new VASTClient();

describe('VASTTracker', function () {
  let vastTracker = null;
  let ad = inlineTrackersParsed.ads[0];
  let spyEmitter;
  let spyTrackUrl;
  let spyTrack;

  describe('#linear', () => {
    let adTrackingUrls = ad.creatives[0].trackingEvents;
    const expectedMacros = {
      ASSETURI: 'http%3A%2F%2Fexample.com%2Flinear-asset.mp4',
      UNIVERSALADID: 'sample-registry%20000123%2Csample-registry-2%20000456',
      PODSEQUENCE: '1',
      ADSERVINGID: 'z292x16y-3d7f-6440-bd29-2ec0f153fc89',
      ADTYPE: 'video',
      ADCATEGORIES: 'Category-A%2CCategory-B%2CCategory-C',
    };

    beforeEach(() => {
      vastTracker = new VASTTracker(vastClient, ad, ad.creatives[0]);
      spyEmitter = jest.spyOn(vastTracker, 'emit');
      spyTrackUrl = jest.spyOn(vastTracker, 'trackURLs');
      spyTrack = jest.spyOn(vastTracker, 'track');
    });

    it('should have firstQuartile set', () => {
      expect(vastTracker.quartiles.firstQuartile).toBe(22.53);
    });

    it('should have midpoint set', () => {
      expect(vastTracker.quartiles.midpoint).toBe(45.06);
    });

    it('should have thirdQuartile set', () => {
      expect(vastTracker.quartiles.thirdQuartile).toBe(67.59);
    });

    describe('#Track', () => {
      Object.entries(adTrackingUrls).forEach(([event, url]) => {
        it(`should call emit with ${event}`, () => {
          vastTracker.track(event, {
            macro: {},
            once: false,
          });
          expect(spyEmitter).toHaveBeenCalledWith(event, {
            trackingURLTemplates: url,
          });
        });

        it(`should call trackURLs with ${url} and emit with ${event} `, () => {
          vastTracker.track(event, {
            macro: {},
            once: false,
          });
          expect(spyEmitter).toHaveBeenCalledWith(event, {
            trackingURLTemplates: url,
          });
          expect(spyTrackUrl).toHaveBeenCalledWith(url, {});
        });
      });

      it('should call trackURLs with the right trackingURLTemplates and macros', () => {
        vastTracker.track('adExpand', {
          macros: { PLAYERSIZE: [200, 200] },
          once: false,
        });
        expect(spyTrackUrl).toHaveBeenCalledWith(
          ['http://example.com/linear-adExpand'],
          { PLAYERSIZE: [200, 200] }
        );
      });

      it('should emit close when closeLinear is given ', () => {
        vastTracker.track('closeLinear', { macro: {}, once: false });

        expect(spyEmitter).toHaveBeenCalledWith('close', {
          trackingURLTemplates: ['http://example.com/linear-close'],
        });
      });

      it('should emit event only once when once is true', () => {
        vastTracker.track('start', { macro: {}, once: true });
        vastTracker.track('start', { macro: {}, once: true });
        expect(spyEmitter).toHaveBeenCalledTimes(1);
      });

      it('should delete event from trackingEvents when once is true', () => {
        vastTracker.track('start', { macro: {}, once: true });
        expect(vastTracker.trackingEvents).not.toHaveProperty('start');
      });
    });

    describe('#click', () => {
      beforeEach(() => {
        vastTracker.setProgress(60 * 75 + 5.25);
        vastTracker.click(null, expectedMacros);
      });
      it('should have emitted click event and called trackUrl', () => {
        expect(spyEmitter).toHaveBeenCalledWith(
          'clickthrough',
          'http://example.com/linear-clickthrough_adplayhead:01%3A15%3A05.250'
        );
        expect(spyTrackUrl).toHaveBeenCalledWith(
          ad.creatives[0].videoClickTrackingURLTemplates,
          expectedMacros
        );
      });
    });

    describe('#minimize', () => {
      beforeEach(() => {
        vastTracker.minimize(expectedMacros);
      });
      it('should be defined', () => {
        expect(adTrackingUrls.minimize).toBeDefined();
      });
      it('should have emitted minimize event and called trackUrl', () => {
        expect(spyEmitter).toHaveBeenCalledWith('minimize', {
          trackingURLTemplates: adTrackingUrls.minimize,
        });

        expect(spyTrackUrl).toHaveBeenCalledWith(
          adTrackingUrls.minimize,
          expectedMacros
        );
      });
    });

    describe('#verificationNotExecuted', () => {
      let verificationUrl;
      let reasonMacro = { REASON: 3 };
      const vendor = 'company.com-omid';
      beforeEach(() => {
        verificationUrl =
          ad.adVerifications[0].trackingEvents.verificationNotExecuted;
        vastTracker.verificationNotExecuted(vendor, reasonMacro);
      });
      it('should be defined', () => {
        expect(verificationUrl).toBeDefined();
      });
      it('should have emitted verificationNotExecuted event and called trackUrl', () => {
        expect(spyTrackUrl).toHaveBeenCalledWith(
          verificationUrl,
          expect.objectContaining(reasonMacro)
        );
        expect(spyEmitter).toHaveBeenCalledWith('verificationNotExecuted', {
          trackingURLTemplates: verificationUrl,
        });
      });
      it('should throw missing AdVerification vendor error', () => {
        const vendor = ad.adVerifications[0].vendor;
        ad.adVerifications[0].vendor = null;
        expect(() => {
          vastTracker.verificationNotExecuted(vendor, reasonMacro);
        }).toThrowError(
          'No associated verification element found for vendor: company.com-omid'
        );
        ad.adVerifications[0].vendor = vendor;
      });
      it('should throw missing AdVerification error', () => {
        ad.adVerifications.length = 0;
        expect(() => {
          vastTracker.verificationNotExecuted(vendor, reasonMacro);
        }).toThrowError('No adVerifications provided');
      });
    });

    describe('#otherAdInteraction', () => {
      beforeEach(() => {
        vastTracker.otherAdInteraction(expectedMacros);
      });
      it('should be defined', () => {
        expect(adTrackingUrls.otherAdInteraction).toBeDefined();
      });
      it('should have emitted otherAdInteraction event and called trackUrl', () => {
        expect(spyEmitter).toHaveBeenCalledWith('otherAdInteraction', {
          trackingURLTemplates: adTrackingUrls.otherAdInteraction,
        });
        expect(spyTrackUrl).toHaveBeenCalledWith(
          adTrackingUrls.otherAdInteraction,
          expectedMacros
        );
      });
    });

    describe('#acceptInvitation', () => {
      beforeEach(() => {
        vastTracker.acceptInvitation(expectedMacros);
      });
      it('should be defined', () => {
        expect(adTrackingUrls.acceptInvitation).toBeDefined();
      });
      it('should have emitted acceptInvitation event and called trackUrl', () => {
        expect(spyEmitter).toHaveBeenCalledWith('acceptInvitation', {
          trackingURLTemplates: adTrackingUrls.acceptInvitation,
        });
        expect(spyTrackUrl).toHaveBeenCalledWith(
          adTrackingUrls.acceptInvitation,
          expectedMacros
        );
      });
    });

    describe('#adExpand', () => {
      beforeEach(() => {
        vastTracker.adExpand(expectedMacros);
      });
      it('should be defined', () => {
        expect(adTrackingUrls.adExpand).toBeDefined();
      });
      it('should have emitted adExpand event and called trackUrl', () => {
        expect(spyEmitter).toHaveBeenCalledWith('adExpand', {
          trackingURLTemplates: adTrackingUrls.adExpand,
        });
        expect(spyTrackUrl).toHaveBeenCalledWith(
          adTrackingUrls.adExpand,
          expectedMacros
        );
      });
    });

    describe('#complete', () => {
      it('should have sent complete event and trackers', () => {
        vastTracker.complete();
        expect(spyTrack).toHaveBeenCalledWith('complete', expect.any(Object));
      });
      it('should be called multiple times', () => {
        vastTracker.complete();
        vastTracker.complete();
        expect(spyTrack).toHaveBeenCalledWith('complete', expect.any(Object));
        expect(spyTrack).toHaveBeenCalledTimes(2);
      });
    });

    describe('#close', () => {
      let a;
      beforeEach(() => {
        vastTracker.close();
        a = jest.spyOn(vastTracker, 'emit');
      });
      it('should have emit and track close event', () => {
        expect(spyEmitter).toHaveBeenCalledWith('close', {
          trackingURLTemplates: ['http://example.com/linear-close'],
        });
        expect(spyTrack).toHaveBeenCalledWith(
          'closeLinear',
          expect.any(Object)
        );
      });
    });

    describe('#skip', () => {
      it('should emit and track skip event', () => {
        vastTracker.skip();
        expect(spyEmitter).toHaveBeenCalledWith('skip', {
          trackingURLTemplates: ['http://example.com/linear-skip'],
        });
        expect(spyTrack).toHaveBeenCalledWith('skip', expect.any(Object));
      });
    });

    describe('#loaded', () => {
      it('should have emit and track loaded event', () => {
        vastTracker.load();
        expect(spyEmitter).toHaveBeenCalledWith('loaded', {
          trackingURLTemplates: ['http://example.com/linear-loaded'],
        });
        expect(spyTrack).toHaveBeenCalledWith('loaded', expect.any(Object));
      });
    });

    describe('#adCollapse', () => {
      beforeEach(() => {
        vastTracker.adCollapse(expectedMacros);
      });
      it('should be defined', () => {
        expect(adTrackingUrls.adCollapse).toBeDefined();
      });
      it('should have emitted adCollapse event and called trackUrl', () => {
        expect(spyEmitter).toHaveBeenCalledWith('adCollapse', {
          trackingURLTemplates: adTrackingUrls.adCollapse,
        });
        expect(spyTrackUrl).toHaveBeenCalledWith(
          adTrackingUrls.adCollapse,
          expectedMacros
        );
      });
    });

    describe('#overlayViewDuration', () => {
      const overlayViewMacros = {
        ADPLAYHEAD: '00:00:40',
        CONTENTPLAYHEAD: '00:00:40',
        MEDIAPLAYHEAD: '00:00:40',
        ...expectedMacros,
      };
      beforeEach(() => {
        vastTracker.overlayViewDuration('00:00:30', overlayViewMacros);
      });
      it('should be defined', () => {
        expect(adTrackingUrls.overlayViewDuration).toBeDefined();
      });
      it('should have emitted adExpand event and called trackUrl', () => {
        expect(spyEmitter).toHaveBeenCalledWith('overlayViewDuration', {
          trackingURLTemplates: adTrackingUrls.overlayViewDuration,
        });
        expect(spyTrackUrl).toHaveBeenCalledWith(
          adTrackingUrls.overlayViewDuration,
          {
            ...overlayViewMacros,
            ADPLAYHEAD: '00:00:30',
          }
        );
      });
    });

    describe('#notUsed', () => {
      it('should be defined', () => {
        expect(adTrackingUrls.notUsed).toBeDefined();
      });
      it('should have emitted adExpand event, called trackUrl and not emitted any other event', () => {
        vastTracker.notUsed(expectedMacros);
        vastTracker.adCollapse(expectedMacros);

        expect(spyEmitter).toHaveBeenCalledWith('notUsed', {
          trackingURLTemplates: adTrackingUrls.notUsed,
        });
        expect(spyTrackUrl).toHaveBeenCalledWith(
          adTrackingUrls.notUsed,
          expectedMacros
        );
        expect(spyEmitter).toHaveBeenCalledTimes(1);
      });
    });

    describe('#setDuration', () => {
      it('should update assetDuration with the given value', () => {
        const newDuration = 123;
        vastTracker.assetDuration = null;
        vastTracker.setDuration(newDuration);
        expect(vastTracker.assetDuration).toEqual(123);
      });
    });

    describe('#setProgress', () => {
      beforeEach(() => {
        vastTracker.assetDuration = 10;
        vastTracker.setProgress(5);
      });

      it('should track start when set at 1', () => {
        vastTracker.setProgress(1);
        expect(spyTrack).toHaveBeenCalledWith('start', expect.any(Object));
      });

      it('should send skip-countdown event', () => {
        vastTracker.skipDelay = 5;
        vastTracker.setProgress(6);
        expect(spyEmitter).toHaveBeenCalledWith('skip-countdown', 0);
      });

      it('should track rewind  when set to 2', () => {
        vastTracker.setProgress(2);
        expect(spyTrack).toHaveBeenCalledWith('rewind', expect.any(Object));
      });

      it('should track firstQuartile', () => {
        vastTracker.setProgress(23);
        expect(spyTrack).toHaveBeenCalledWith(
          'firstQuartile',
          expect.any(Object)
        );
      });

      it('should track progress-30', () => {
        vastTracker.setProgress(30);
        expect(spyTrack).toHaveBeenCalledWith(
          'progress-30',
          expect.any(Object)
        );
      });

      it('should track midpoint', () => {
        vastTracker.setProgress(46);
        expect(spyTrack).toHaveBeenCalledWith('midpoint', expect.any(Object));
      });

      it('call track with progress-5', () => {
        expect(spyTrack).toHaveBeenCalledWith('progress-5', expect.anything());
      });

      it('call track with progress-50%', () => {
        expect(spyTrack).toHaveBeenCalledWith(
          'progress-50%',
          expect.anything()
        );
      });

      it('should track progress-60%', () => {
        vastTracker.setProgress(54);
        expect(spyTrack).toHaveBeenCalledWith(
          'progress-60%',
          expect.any(Object)
        );
      });

      it('should track thirdQuartile', () => {
        vastTracker.setProgress(68);
        expect(spyTrack).toHaveBeenCalledWith(
          'thirdQuartile',
          expect.any(Object)
        );
      });

      it('should also calls track for previous missing percentages', () => {
        vastTracker.lastPercentage = 1;
        expect(spyTrack.mock.calls).toContainEqual(
          ['progress-2%', expect.anything()],
          ['progress-3%', expect.anything()],
          ['progress-4%', expect.anything()]
        );
      });
    });

    describe('#isQuartileReached', () => {
      it('should return true when the given quartile has been reached', () => {
        const time = 20;
        const progress = 30;
        const quartile = 'midpoint';
        expect(
          vastTracker.isQuartileReached(quartile, time, progress)
        ).toBeTruthy();
      });
    });

    describe('#setMuted', () => {
      beforeEach(() => {
        vastTracker.muted = false;
      });
      afterAll(() => {
        vastTracker.muted = false;
      });
      it('Should emit mute tracker and update muted attribute when muted', () => {
        vastTracker.setMuted(true);
        expect(spyTrack).toHaveBeenCalledWith('mute', expect.anything());
      });
      it('Should emit unmute tracker and update muted attribute when unmuted', () => {
        vastTracker.muted = true;
        vastTracker.setMuted(false);
        expect(spyTrack).toHaveBeenCalledWith('unmute', expect.anything());
      });
      it('Should not emit any tracker for same value', () => {
        vastTracker.setMuted(false);
        expect(spyTrack).not.toHaveBeenCalled();
      });
      it('Should not emit any tracker and not update muted attribute for invalid value', () => {
        vastTracker.setMuted(null);
        vastTracker.setMuted({ foo: 'bar' });
        expect(spyTrack).not.toHaveBeenCalled();
        expect(vastTracker.muted).toEqual(false);
      });
    });

    describe('#setPaused', () => {
      it('should be paused and track pause event', () => {
        vastTracker.setPaused(true);
        expect(vastTracker.paused).toEqual(true);
        expect(spyTrack).toHaveBeenCalledWith('pause', expect.any(Object));
      });

      it('should be resumed and track resume event', () => {
        vastTracker.setPaused(false);
        expect(vastTracker.paused).toEqual(false);
        expect(spyTrack).toHaveBeenCalledWith('resume', expect.any(Object));
      });

      it('should not track any event', () => {
        vastTracker.paused = false;
        vastTracker.setPaused(false);
        expect(vastTracker.paused).toEqual(false);
        expect(spyEmitter).not.toHaveBeenCalled();
      });
    });

    describe('#setFullScreen', () => {
      it('should be in fullscreen mode and send fullscreen event', () => {
        vastTracker.setFullscreen(true);
        expect(vastTracker.fullscreen).toEqual(true);
        expect(spyTrack).toHaveBeenCalledWith('fullscreen', expect.any(Object));
      });

      it('shout be in exitFullscreen mode an send exitFullscreen event', () => {
        vastTracker.setFullscreen(false);
        expect(vastTracker.fullscreen).toEqual(false);
        expect(spyTrack).toHaveBeenCalledWith(
          'exitFullscreen',
          expect.any(Object)
        );
      });

      it('should not sent any event ', () => {
        vastTracker.fullscreen = false;
        vastTracker.setFullscreen(false);
        expect(spyTrack).not.toHaveBeenCalled();
      });
    });

    describe('#setExpand', () => {
      it('should expand and send expand tracker', () => {
        vastTracker.setExpand(true);
        expect(vastTracker.expanded).toEqual(true);
        expect(spyTrack).toHaveBeenCalledWith('expand', expect.any(Object));
        expect(spyTrack).toHaveBeenCalledWith(
          'playerExpand',
          expect.any(Object)
        );
      });

      it('should collapse and send collapse tracker', () => {
        vastTracker.setExpand(false);
        expect(vastTracker.expanded).toEqual(false);
        expect(spyTrack).toHaveBeenCalledWith('collapse', expect.any(Object));
        expect(spyTrack).toHaveBeenCalledWith(
          'playerCollapse',
          expect.any(Object)
        );
      });

      it('should not track any event', () => {
        vastTracker.expanded = false;
        vastTracker.setExpand(false);
        expect(spyTrack).not.toHaveBeenCalled();
      });
    });

    describe('#setSkipDelay', () => {
      beforeEach(() => {
        vastTracker.setSkipDelay(8);
      });
      it('should update skipDelay value to the given value', () => {
        const newSkipDelay = 123;
        vastTracker.skipDelay = null;
        vastTracker.setSkipDelay(newSkipDelay);
        expect(vastTracker.skipDelay).toEqual(123);
      });

      it('should have skipDelay still set to 8', () => {
        vastTracker.setSkipDelay('foo');
        expect(vastTracker.skipDelay).toBe(8);
      });
    });

    describe('#trackImpression', () => {
      const macros = {
        SERVERSIDE: '0',
      };

      beforeEach(() => {
        // Reset impressed to run trackImpression each time
        vastTracker.impressed = false;
        vastTracker.trackImpression(macros);
      });

      it('should have impressed set to true', () => {
        expect(vastTracker.impressed).toEqual(true);
      });

      it('should have called impression URLs', () => {
        expect(spyTrackUrl).toHaveBeenCalledWith(
          ad.impressionURLTemplates,
          macros
        );
      });

      it('should have sent creativeView event', () => {
        expect(spyTrack).toHaveBeenCalledWith('creativeView', { macros });
      });

      it('should only be called once', () => {
        vastTracker.trackImpression(macros);
        expect(spyTrackUrl).not.toHaveBeenCalledTimes(2);
        expect(spyTrack).not.toHaveBeenCalledTimes(2);
      });

      it('should skip invalid urls', () => {
        const expectedUrlTemplates = [
          {
            id: 'sample-impression1',
            url: 'http://example.com/impression1_asset:[ASSETURI]_[CACHEBUSTING]',
          },
          {
            id: 'sample-impression2',
            url: 'http://example.com/impression2_[random]',
          },
          {
            id: 'sample-impression3',
            url: '//example.com/impression3_[RANDOM]',
          },
        ];
        const spyUtilTrack = jest.spyOn(util, 'track');
        vastTracker.trackURLs(ad.impressionURLTemplates);
        expect(spyUtilTrack).toHaveBeenCalledWith(
          expectedUrlTemplates,
          expect.anything(),
          expect.anything()
        );
      });
    });

    describe('#viewableImpression', () => {
      const macros = {
        SERVERSIDE: '0',
      };

      describe('#trackViewableImpression', () => {
        it('should call Viewable URLs', () => {
          vastTracker.trackViewableImpression(macros);
          expect(spyTrackUrl).toHaveBeenCalledWith(
            ['http://example.com/viewable', 'http://example.com/viewable2'],
            macros
          );
        });
      });

      describe('#trackNotViewableImpression', () => {
        it('should call NotViewable URLs', () => {
          vastTracker.trackNotViewableImpression(macros);
          expect(spyTrackUrl).toHaveBeenCalledWith(
            [
              'http://example.com/notviewable',
              'http://example.com/notviewable2',
            ],
            macros
          );
        });
      });

      describe('#trackUndeterminedImpression', () => {
        it('should call ViewUndetermined URLs', () => {
          vastTracker.trackUndeterminedImpression(macros);
          expect(spyTrackUrl).toHaveBeenCalledWith(
            [
              'http://example.com/undertermined',
              'http://example.com/undertermined2',
            ],
            macros
          );
        });
      });
    });

    describe('#convertToTimecode', () => {
      it('should return the formatted time string', () => {
        const timeInSeconds = 3600 + 1200 + 36 + 0.123; // 1h + 20min + 36sec + 0.123ms
        const expectedResult = '01:20:36.123';
        const result = vastTracker.convertToTimecode(timeInSeconds);
        expect(result).toEqual(expectedResult);
      });
    });

    describe('#error', () => {
      it('should be called with the right arguments', () => {
        vastTracker.error(expectedMacros);
        expect(spyTrackUrl).toHaveBeenCalledWith(
          ['http://example.com/error_[ERRORCODE]'],
          expectedMacros,
          { isCustomCode: false }
        );
      });
    });

    describe('#errorWithCode', () => {
      it('should be called with the right arguments', () => {
        const spyError = jest.fn();
        vastTracker.error = spyError;
        vastTracker.errorWithCode('1234', true);
        expect(spyError).toHaveBeenCalledWith({ ERRORCODE: '1234' }, true);
      });
    });
  });

  describe('#companion', () => {
    let variation = ad.creatives[2].variations[0];

    beforeEach(() => {
      vastTracker = new VASTTracker(vastClient, ad, ad.creatives[2], variation);
    });

    describe('#click', () => {
      let spyEmit;
      beforeEach(() => {
        spyTrackUrl = jest.spyOn(vastTracker, 'trackURLs');
        spyEmit = jest.spyOn(vastTracker, 'emit');
        vastTracker.click();
      });
      it('shouls have sent clickthrough events with clickThough url', () => {
        expect(spyEmit).toHaveBeenCalledWith(
          'clickthrough',
          'https://iabtechlab.com'
        );
      });

      it('should have sent clickTracking event', () => {
        expect(spyTrackUrl).toHaveBeenCalledWith(
          [{ id: null, url: 'https://example.com/tracking/clickTracking' }],
          expect.any(Object)
        );
      });
    });
  });

  describe('#NonLinear', () => {
    let variation = ad.creatives[1].variations[0];
    beforeEach(() => {
      vastTracker = new VASTTracker(vastClient, ad, ad.creatives[1], variation);
    });

    it('shoutd correctly set the tracker duration', () => {
      expect(vastTracker.assetDuration).toBe(10);
    });

    describe('click', () => {
      let spyEmit;
      beforeEach(() => {
        spyEmit = jest.spyOn(vastTracker, 'emit');
        spyTrack = jest.spyOn(vastTracker, 'trackURLs');
        vastTracker.click();
      });
      it('should have sent  clickthrough event with clickThrough url', () => {
        expect(spyEmit).toHaveBeenCalledWith(
          'clickthrough',
          'https://iabtechlab.com'
        );
      });

      it('should have sent clicktracking event ', () => {
        expect(spyTrack).toHaveBeenCalledWith(
          [{ id: null, url: 'https://example.com/tracking/clickTracking' }],
          expect.any(Object)
        );
      });
    });
  });

  describe('#clickthroughs', () => {
    let spyEmit;
    const fallbackClickThroughURL = 'http://example.com/fallback-clickthrough',
      clickThroughURL = 'http://example.com/clickthrough';

    describe('#VAST clichthrough with no fallback provided', () => {
      beforeEach(() => {
        const creative = createCreativeLinear();
        creative.videoClickThroughURLTemplate = clickThroughURL;
        vastTracker = new VASTTracker(vastClient, {}, creative);
        spyEmit = jest.spyOn(vastTracker, 'emit');
        vastTracker.click();
      });
      it('should have sent clickthrough event with VAST clickthrough url', () => {
        expect(spyEmit).toHaveBeenCalledWith(
          'clickthrough',
          'http://example.com/clickthrough'
        );
      });
    });

    describe('#VAST clickthrough with fallback provided', () => {
      beforeEach(() => {
        const creative = createCreativeLinear();
        creative.videoClickThroughURLTemplate = clickThroughURL;
        vastTracker = new VASTTracker(vastClient, {}, creative);
        spyEmit = jest.spyOn(vastTracker, 'emit');
        vastTracker.click(fallbackClickThroughURL);
      });

      it('it should have sent clickthrough event with VAST clickTrhough url', () => {
        expect(spyEmit).toHaveBeenCalledWith(
          'clickthrough',
          'http://example.com/clickthrough'
        );
      });
    });

    describe('#empty VAST clickThrough with no fallback provided', () => {
      beforeEach(() => {
        vastTracker = new VASTTracker(vastClient, {}, {});
        spyEmit = jest.spyOn(vastTracker, 'emit');
        vastTracker.click();
      });

      it("shouldn't have sent any event", () => {
        expect(spyEmit).not.toHaveBeenCalled();
      });
    });

    describe('#empty VAST clickThrough with fallback provided', () => {
      beforeEach(() => {
        vastTracker = new VASTTracker(vastClient, {}, {});
        spyEmit = jest.spyOn(vastTracker, 'emit');
        vastTracker.click(fallbackClickThroughURL);
      });

      it('should have sent fallback clickthrough', () => {
        expect(spyEmit).toHaveBeenCalledWith(
          'clickthrough',
          'http://example.com/fallback-clickthrough'
        );
      });
    });
  });
});
