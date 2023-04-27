import { parseCreatives } from '../src/parser/creatives_parser';
import { parserUtils } from '../src/parser/parser_utils';
import { getNodesFromXml } from './utils/utils';
import { creatives } from './samples/creatives';

describe('CreativesParser', function () {
  describe('ParseCreatives', function () {
    let parsedCreatives;

    beforeAll(() => {
      const creativeNodes = parserUtils.childrenByName(
        getNodesFromXml(creatives),
        'Creative'
      );
      parsedCreatives = parseCreatives(creativeNodes);
    });

    it('validate parsedCreatives has length 3', () => {
      expect(parsedCreatives.length).toEqual(3);
    });

    it('validate first parsedCreative', () => {
      const creative = parsedCreatives[0];
      expect(creative.id).toEqual('id130984');
      expect(creative.adId).toEqual('adId345690');
      expect(creative.universalAdIds[0].idRegistry).toEqual('daily-motion-L1');
      expect(creative.universalAdIds[0].value).toEqual('Linear-12345');
      expect(creative.universalAdIds[1].idRegistry).toEqual('daily-motion-L2');
      expect(creative.universalAdIds[1].value).toEqual('Linear-5678');
      expect(creative.type).toEqual('linear');
      expect(creative.mediaFiles.length).toEqual(2);
      expect(creative.adParameters).toEqual({
        value: '{"key":"value"}',
        xmlEncoded: 'false',
      });
    });

    it('parse icon attributes', () => {
      const icon = parsedCreatives[0].icons[0];
      expect(icon.program).toEqual('ad1');
      expect(icon.height).toEqual(20);
      expect(icon.width).toEqual(60);
      expect(icon.xPosition).toEqual('left');
      expect(icon.yPosition).toEqual('bottom');
      expect(icon.apiFramework).toEqual('VPAID');
      expect(icon.offset).toEqual(15);
      expect(icon.duration).toEqual(90);
      expect(icon.type).toEqual('image/gif');
      expect(icon.staticResource).toEqual('http://example.com/linear-icon.gif');
      expect(icon.htmlResource).toBeNull();
      expect(icon.iframeResource).toBeNull();
      expect(icon.pxratio).toEqual('2');
      expect(icon.iconClickThroughURLTemplate).toEqual(
        'http://example.com/linear-clickthrough'
      );
      expect(icon.iconClickTrackingURLTemplates).toHaveLength(2);
      expect(icon.iconClickTrackingURLTemplates).toEqual([
        {
          id: 'icon-click-1',
          url: 'http://example.com/linear-clicktracking1',
        },
        {
          id: 'icon-click-2',
          url: 'http://example.com/linear-clicktracking2',
        },
      ]);
      expect(icon.iconViewTrackingURLTemplate).toEqual(
        'http://example.com/linear-viewtracking'
      );
      expect(icon.iconClickFallbackImages).toEqual([
        {
          url: 'http://adserver.com/fallback.png',
          width: '10px',
          height: '10px',
        },
        {
          url: null,
          width: '10px',
          height: '10px',
        },
        {
          url: 'http://adserver.com/fallback.png',
          width: null,
          height: '10px',
        },
        {
          url: 'http://adserver.com/fallback.png',
          width: '10px',
          height: null,
        },
      ]);
    });

    it('validate second parsedCreative', () => {
      const creative = parsedCreatives[1];
      expect(creative.id).toEqual('id130985');
      expect(creative.adId).toEqual('adId345691');
      expect(creative.universalAdIds).toEqual([]);
      expect(creative.type).toEqual('companion');
      expect(creative.variations.length).toEqual(3);
    });

    describe('validate third parsedCreative', function () {
      it('validate NonLinearAds', () => {
        const creative = parsedCreatives[2];
        expect(creative.id).toEqual('id130986');
        expect(creative.adId).toBeNull();
        expect(creative.sequence).toBeNull();
        expect(creative.universalAdIds[0].idRegistry).toEqual(
          'daily-motion-NL'
        );
        expect(creative.universalAdIds[0].value).toEqual('NonLinear-12345');
        expect(creative.type).toEqual('nonlinear');
        expect(creative.variations.length).toEqual(1);
      });

      describe('validate NonLinear', function () {
        it('validate variation attributes', () => {
          const variation = parsedCreatives[2].variations[0];
          expect(variation.id).toEqual('nonlinear1');
          expect(variation.width).toEqual('300');
          expect(variation.height).toEqual('200');
          expect(variation.expandedWidth).toEqual('600');
          expect(variation.expandedHeight).toEqual('400');
          expect(variation.scalable).toEqual(false);
          expect(variation.maintainAspectRatio).toEqual(true);
          expect(variation.minSuggestedDuration).toEqual(100);
          expect(variation.apiFramework).toEqual('someAPI');
          expect(variation.adType).toEqual('nonLinearAd');
          expect(variation.type).toEqual('image/jpeg');
          expect(variation.staticResource).toEqual(
            'http://example.com/nonlinear-static-resource'
          );
          expect(variation.htmlResource).toBeNull();
          expect(variation.iframeResource).toBeNull();
          expect(variation.nonlinearClickThroughURLTemplate).toEqual(
            'http://example.com/nonlinear-clickthrough'
          );
          expect(variation.nonlinearClickTrackingURLTemplates).toHaveLength(2);
          expect(variation.nonlinearClickTrackingURLTemplates).toContainEqual(
            {
              id: 'nonlinear-click-1',
              url: 'http://example.com/nonlinear-clicktracking-1',
            },
            { id: null, url: 'http://example.com/nonlinear-clicktracking-2' }
          );
          expect(variation.adParameters).toEqual({
            value: '{"key":"value"}',
            xmlEncoded: 'false',
          });
        });
      });

      describe('validate tracking Events', function () {
        let trackingEvents;
        beforeAll(() => {
          trackingEvents = parsedCreatives[2].trackingEvents;
        });
        it('should contain properties', function () {
          expect(trackingEvents).toHaveProperty(
            'start',
            'close',
            'midpoint',
            'complete',
            'firstQuartile',
            'thirdQuartile'
          );
        });
        it('validate properties', () => {
          expect(trackingEvents.start).toHaveLength(1);
          expect(trackingEvents.start).toContain(
            'http://example.com/nonlinear-start'
          );
          expect(trackingEvents.midpoint).toHaveLength(1);
          expect(trackingEvents.midpoint).toContain(
            'http://example.com/nonlinear-midpoint'
          );
          expect(trackingEvents.complete).toHaveLength(1);
          expect(trackingEvents.complete).toContain(
            'http://example.com/nonlinear-complete'
          );
          expect(trackingEvents.firstQuartile).toHaveLength(1);
          expect(trackingEvents.firstQuartile).toContain(
            'http://example.com/nonlinear-firstQuartile'
          );

          expect(trackingEvents.close).toHaveLength(1);
          expect(trackingEvents.close).toContain(
            'http://example.com/nonlinear-close'
          );

          expect(trackingEvents.thirdQuartile).toHaveLength(1);
          expect(trackingEvents.thirdQuartile).toContain(
            'http://example.com/nonlinear-thirdQuartile'
          );
        });
      });
    });
  });
});
