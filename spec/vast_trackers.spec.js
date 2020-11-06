import { VASTClient } from '../src/vast_client';
import { VASTTracker } from '../src/vast_tracker';
import { inlineTrackersParsed } from '../spec/samples/inline_trackers';

const vastClient = new VASTClient();

describe('VASTTracker', function () {
  let vastTracker = null;

  describe('#linear', () => {
    let spyEmitter;
    let spyTrackUrl;
    let spyTrack;
    let adTrackingUrls;
    let ad;
    const expectedMacros = {
      ASSETURI: 'http%3A%2F%2Fexample.com%2Flinear-asset.mp4',
      UNIVERSALADID: 'sample-registry%20000123',
      PODSEQUENCE: '1',
      ADSERVINGID: 'z292x16y-3d7f-6440-bd29-2ec0f153fc89',
      ADTYPE: 'video',
      ADCATEGORIES: 'Category-A%2CCategory-B%2CCategory-C',
    };

    beforeEach(() => {
      ad = inlineTrackersParsed.ads[0];
      adTrackingUrls = ad.creatives[0].trackingEvents;
      vastTracker = new VASTTracker(vastClient, ad, ad.creatives[0]);
      spyEmitter = jest.spyOn(vastTracker, 'emit');
      spyTrackUrl = jest.spyOn(vastTracker, 'trackURLs');
      spyTrack = jest.spyOn(vastTracker, 'track');
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

    describe('setProgress', () => {
      beforeEach(() => {
        vastTracker.assetDuration = 10;
        vastTracker.setProgress(5);
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
      it('should also calls track for previous missing percentages', () => {
        vastTracker.lastPercentage = 1;
        expect(spyTrack.mock.calls).toContainEqual(
          ['progress-2%', expect.anything()],
          ['progress-3%', expect.anything()],
          ['progress-4%', expect.anything()]
        );
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
});
