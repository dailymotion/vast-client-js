import { VASTClient } from '../src/vast_client';
import { VASTTracker } from '../src/vast_tracker';
import { inlineTrackersParsed } from '../spec/samples/inline_trackers';

const vastClient = new VASTClient();

describe('VASTTracker', function() {
  let vastTracker = null;

  describe('#linear', () => {
    let spyEmitter;
    let spyTrackUrl;
    let adTrackingUrls;
    let ad;
    beforeEach(() => {
      ad = inlineTrackersParsed.ads[0];
      adTrackingUrls = ad.creatives[0].trackingEvents;
      vastTracker = new VASTTracker(vastClient, ad, ad.creatives[0]);
      spyEmitter = jest.spyOn(vastTracker, 'emit');
      spyTrackUrl = jest.spyOn(vastTracker, 'trackURLs');
    });

    describe('#minimize', () => {
      beforeEach(() => {
        vastTracker.minimize();
      });
      it('should be defined', () => {
        expect(adTrackingUrls.minimize).toBeDefined();
      });
      it('should have emitted minimize event and called trackUrl', () => {
        expect(spyEmitter).toHaveBeenCalledWith('minimize', {
          trackingURLTemplates: adTrackingUrls.minimize
        });

        expect(spyTrackUrl).toHaveBeenCalledWith(
          adTrackingUrls.minimize,
          expect.objectContaining({
            ASSETURI: 'http%3A%2F%2Fexample.com%2Flinear-asset.mp4',
            UNIVERSALADID: 'sample-registry%20000123',
            PODSEQUENCE: '1'
          })
        );
      });
    });

    describe('#verificationNotExecuted', () => {
      let verificationUrls;
      let reasonMacro = { REASON: 3 };
      beforeEach(() => {
        verificationUrls =
          ad.adVerifications[0].trackingEvents.verificationNotExecuted;
        vastTracker.verificationNotExecuted(reasonMacro);
      });
      it('should be defined', () => {
        expect(verificationUrls).toBeDefined();
      });
      it('should have emitted verificationNotExecuted event and called trackUrl', () => {
        expect(spyTrackUrl).toHaveBeenCalledWith(
          verificationUrls,
          expect.objectContaining(reasonMacro)
        );
        expect(spyEmitter).toHaveBeenCalledWith('verificationNotExecuted', {
          trackingURLTemplates: verificationUrls
        });
      });
      it('should throw missing AdVerification error', () => {
        ad.adVerifications.length = 0;
        expect(() => {
          vastTracker.verificationNotExecuted(reasonMacro);
        }).toThrowError('No adVerifications provided');
      });
    });

    describe('#otherAdInteraction', () => {
      beforeEach(() => {
        vastTracker.otherAdInteraction();
      });
      it('should be defined', () => {
        expect(adTrackingUrls.otherAdInteraction).toBeDefined();
      });
      it('should have emitted otherAdInteraction event and called trackUrl', () => {
        expect(spyEmitter).toHaveBeenCalledWith('otherAdInteraction', {
          trackingURLTemplates: adTrackingUrls.otherAdInteraction
        });
        expect(spyTrackUrl).toHaveBeenCalledWith(
          adTrackingUrls.otherAdInteraction,
          expect.objectContaining({
            ASSETURI: 'http%3A%2F%2Fexample.com%2Flinear-asset.mp4',
            UNIVERSALADID: 'sample-registry%20000123',
            PODSEQUENCE: '1'
          })
        );
      });
    });

    describe('#acceptInvitation', () => {
      beforeEach(() => {
        vastTracker.acceptInvitation();
      });
      it('should be defined', () => {
        expect(adTrackingUrls.acceptInvitation).toBeDefined();
      });
      it('should have emitted acceptInvitation event and called trackUrl', () => {
        expect(spyEmitter).toHaveBeenCalledWith('acceptInvitation', {
          trackingURLTemplates: adTrackingUrls.acceptInvitation
        });
        expect(spyTrackUrl).toHaveBeenCalledWith(
          adTrackingUrls.acceptInvitation,
          expect.objectContaining({
            ASSETURI: 'http%3A%2F%2Fexample.com%2Flinear-asset.mp4',
            UNIVERSALADID: 'sample-registry%20000123',
            PODSEQUENCE: '1'
          })
        );
      });
    });

    describe('#adExpand', () => {
      beforeEach(() => {
        vastTracker.adExpand();
      });
      it('should be defined', () => {
        expect(adTrackingUrls.adExpand).toBeDefined();
      });
      it('should have emitted adExpand event and called trackUrl', () => {
        expect(spyEmitter).toHaveBeenCalledWith('adExpand', {
          trackingURLTemplates: adTrackingUrls.adExpand
        });
        expect(spyTrackUrl).toHaveBeenCalledWith(
          adTrackingUrls.adExpand,
          expect.objectContaining({
            ASSETURI: 'http%3A%2F%2Fexample.com%2Flinear-asset.mp4',
            UNIVERSALADID: 'sample-registry%20000123',
            PODSEQUENCE: '1'
          })
        );
      });
    });

    describe('#adCollapse', () => {
      beforeEach(() => {
        vastTracker.adCollapse();
      });
      it('should be defined', () => {
        expect(adTrackingUrls.adCollapse).toBeDefined();
      });
      it('should have emitted adCollapse event and called trackUrl', () => {
        expect(spyEmitter).toHaveBeenCalledWith('adCollapse', {
          trackingURLTemplates: adTrackingUrls.adCollapse
        });
        expect(spyTrackUrl).toHaveBeenCalledWith(
          adTrackingUrls.adCollapse,
          expect.objectContaining({
            ASSETURI: 'http%3A%2F%2Fexample.com%2Flinear-asset.mp4',
            UNIVERSALADID: 'sample-registry%20000123',
            PODSEQUENCE: '1'
          })
        );
      });
    });

    describe('#overlayViewDuration', () => {
      beforeEach(() => {
        vastTracker.overlayViewDuration('00:00:30');
      });
      it('should be defined', () => {
        expect(adTrackingUrls.overlayViewDuration).toBeDefined();
      });
      it('should have emitted adExpand event and called trackUrl', () => {
        expect(spyEmitter).toHaveBeenCalledWith('overlayViewDuration', {
          trackingURLTemplates: adTrackingUrls.overlayViewDuration
        });
        expect(spyTrackUrl).toHaveBeenCalledWith(
          adTrackingUrls.overlayViewDuration,
          expect.objectContaining({
            ASSETURI: 'http%3A%2F%2Fexample.com%2Flinear-asset.mp4',
            UNIVERSALADID: 'sample-registry%20000123',
            PODSEQUENCE: '1'
          })
        );
      });
    });

    describe('#notUsed', () => {
      it('should be defined', () => {
        expect(adTrackingUrls.notUsed).toBeDefined();
      });
      it('should have emitted adExpand event, called trackUrl and not emitted any other event', () => {
        vastTracker.notUsed();
        vastTracker.adCollapse();

        expect(spyEmitter).toHaveBeenCalledWith('notUsed', {
          trackingURLTemplates: adTrackingUrls.notUsed
        });
        expect(spyTrackUrl).toHaveBeenCalledWith(
          adTrackingUrls.notUsed,
          expect.objectContaining({
            ASSETURI: 'http%3A%2F%2Fexample.com%2Flinear-asset.mp4',
            UNIVERSALADID: 'sample-registry%20000123',
            PODSEQUENCE: '1'
          })
        );
        expect(spyEmitter).toHaveBeenCalledTimes(1);
      });
    });
  });
});
