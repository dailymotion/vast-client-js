import { VASTClient } from '../src/vast_client';
import { VASTParser } from '../src/parser/vast_parser';
import { VASTTracker } from '../src/vast_tracker';
import { inlineTrackers } from '../spec/samples/inline_trackers';

const vastParser = new VASTParser();
const vastClient = new VASTClient();

describe('VASTTracker', function() {
  describe('#constructor', function() {
    let vastTracker = null;
    let response = {};

    beforeAll(done => {
      const vastXml = new window.DOMParser().parseFromString(
        inlineTrackers,
        'text/xml'
      );
      vastParser.parseVAST(vastXml).then(res => {
        response = res;
        done();
      });
    });

    describe('#linear', () => {
      let spyEmitter;
      let spyTrackUrl;
      beforeAll(() => {
        const ad = response.ads[0];
        vastTracker = new VASTTracker(vastClient, ad, ad.creatives[0]);
        spyEmitter = jest.spyOn(vastTracker, 'emit');
        spyTrackUrl = jest.spyOn(vastTracker, 'trackURLs');
      });

      describe('#minimize', () => {
        beforeEach(() => {
          vastTracker.minimize();
        });

        it('should have emitted minimize event and called trackUrl', () => {
          expect(spyEmitter).toHaveBeenCalledWith('minimize', {
            trackingURLTemplates: ['http://example.com/linear-minimize']
          });
          expect(spyTrackUrl).toHaveBeenCalledWith([
            'http://example.com/linear-minimize'
          ]);
        });
      });

      describe('#otherAdInteraction', () => {
        beforeEach(() => {
          vastTracker.otherAdInteraction();
        });

        it('should have emitted otherAdInteraction event and called trackUrl', () => {
          expect(spyEmitter).toHaveBeenCalledWith('otherAdInteraction', {
            trackingURLTemplates: [
              'http://example.com/linear-otherAdInteraction'
            ]
          });
          expect(spyTrackUrl).toHaveBeenCalledWith([
            'http://example.com/linear-otherAdInteraction'
          ]);
        });
      });

      describe('#acceptInvitation', () => {
        beforeEach(() => {
          vastTracker.acceptInvitation();
        });

        it('should have emitted acceptInvitation event and called trackUrl', () => {
          expect(spyEmitter).toHaveBeenCalledWith('acceptInvitation', {
            trackingURLTemplates: ['http://example.com/linear-acceptInvitation']
          });
          expect(spyTrackUrl).toHaveBeenCalledWith([
            'http://example.com/linear-acceptInvitation'
          ]);
        });
      });

      describe('#adExpand', () => {
        beforeEach(() => {
          vastTracker.adExpand();
        });

        it('should have emitted adExpand event and called trackUrl', () => {
          expect(spyEmitter).toHaveBeenCalledWith('adExpand', {
            trackingURLTemplates: ['http://example.com/linear-adExpand']
          });
          expect(spyTrackUrl).toHaveBeenCalledWith([
            'http://example.com/linear-adExpand'
          ]);
        });
      });

      describe('#adCollapse', () => {
        beforeEach(() => {
          vastTracker.adCollapse();
        });

        it('should have emitted adCollapse event and called trackUrl', () => {
          expect(spyEmitter).toHaveBeenCalledWith('adCollapse', {
            trackingURLTemplates: ['http://example.com/linear-adCollapse']
          });
          expect(spyTrackUrl).toHaveBeenCalledWith([
            'http://example.com/linear-adCollapse'
          ]);
        });
      });

      describe('#overlayViewDuration', () => {
        beforeEach(() => {
          vastTracker.overlayViewDuration();
        });

        it('should have emitted adExpand event and called trackUrl', () => {
          expect(spyEmitter).toHaveBeenCalledWith('overlayViewDuration', {
            trackingURLTemplates: [
              'http://example.com/linear-overlayViewDuration'
            ]
          });
          expect(spyTrackUrl).toHaveBeenCalledWith([
            'http://example.com/linear-overlayViewDuration'
          ]);
        });
      });

      describe('#notUsed', () => {
        it('should have emitted adExpand event and called trackUrl', () => {
          vastTracker.notUsed();
          expect(spyEmitter).toHaveBeenCalledWith('notUsed', {
            trackingURLTemplates: ['http://example.com/linear-notUsed']
          });
          expect(spyTrackUrl).toHaveBeenCalledWith([
            'http://example.com/linear-notUsed'
          ]);
        });

        it('should not emitted any other event', () => {
          vastTracker.adCollapse();
          expect(spyEmitter).not.toHaveBeenCalled();
        });
      });
    });
  });
});
