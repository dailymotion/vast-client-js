import { parseCreativeCompanion } from '../src/parser/creative_companion_parser';
import { getNodesFromXml } from './utils/utils';
import { companionAds } from './samples/companion_ads';

describe('parseCreativeCompanion', function() {
  const creativeElement = getNodesFromXml(companionAds);
  const creativeAttributes = {
    id: '1',
    adId: '1234',
    sequence: '1',
    apiFramework: null
  };
  let creative = null;

  beforeEach(() => {
    creative = parseCreativeCompanion(creativeElement, creativeAttributes);
  });

  it('has type companion', () => {
    expect(creative.type).toBe('companion');
  });

  it('contains the attributes of the creative', () => {
    expect(creative).toMatchObject({
      id: '1',
      adId: '1234',
      sequence: '1',
      apiFramework: null
    });
  });

  it('contains the required attribute', () => {
    expect(creative.required).toBe('any');
  });

  it('returns 3 companion ads', () => {
    expect(creative.variations).toHaveLength(3);
  });

  describe('first companion', () => {
    let companion = null;
    beforeEach(() => {
      companion = creative.variations[0];
    });

    it('contains the attributes of the companion', () => {
      expect(companion).toMatchObject({
        id: '1',
        width: '300',
        height: '250',
        assetWidth: '250',
        assetHeight: '200',
        expandedWidth: '350',
        expandedHeight: '250',
        apiFramework: 'VPAID',
        adSlotID: '1',
        pxratio: '2',
        renderingMode: 'end-card'
      });
    });

    it('gets the static resources and their creative types', () => {
      expect(companion.staticResources).toEqual([
        {
          url: 'http://example.com/companion1-static-resource1',
          creativeType: 'image/jpeg'
        },
        {
          url: 'http://example.com/companion1-static-resource2',
          creativeType: 'image/jpeg'
        }
      ]);
      expect(companion.iframeResources).toEqual([]);
      expect(companion.htmlResources).toEqual([]);
    });

    it('gets altText', () => {
      expect(companion.altText).toBe('Sample Alt Text Content');
    });

    it('gets tracking events', () => {
      expect(companion.trackingEvents).toEqual({
        creativeView: ['http://example.com/companion1-creativeview']
      });
    });

    it('gets companionClickThroughURLTemplate', () => {
      expect(companion.companionClickThroughURLTemplate).toBe(
        'http://example.com/companion1-clickthrough'
      );
    });

    it('gets companionClickTrackingURLTemplates', () => {
      expect(companion.companionClickTrackingURLTemplates).toEqual([
        {
          id: '1',
          url: 'http://example.com/companion1-clicktracking-first'
        },
        {
          id: '2',
          url: 'http://example.com/companion1-clicktracking-second'
        }
      ]);
    });

    describe('adParameters', () => {
      it('gets adParameters', () => {
        expect(companion.adParameters).toBe('campaign_id=1');
      });

      it('gets xmlEncoded attribute', () => {
        expect(companion.xmlEncoded).toBe('false');
      });
    });
  });

  describe('second companion', () => {
    let companion = null;
    beforeEach(() => {
      companion = creative.variations[1];
    });

    it('contains the attributes of the companion', () => {
      expect(companion).toMatchObject({
        id: '2',
        width: '300',
        height: '60',
        assetWidth: '250',
        assetHeight: '200',
        expandedWidth: '350',
        expandedHeight: '250',
        apiFramework: 'VPAID',
        adSlotID: '2',
        pxratio: '1',
        renderingMode: 'concurrent'
      });
    });

    it('gets the iframe resources', () => {
      expect(companion.staticResources).toEqual([]);
      expect(companion.iframeResources).toEqual([
        'http://www.example.com/companion2-example.php'
      ]);
      expect(companion.htmlResources).toEqual([]);
    });

    it('gets altText', () => {
      expect(companion.altText).toBe('Sample Alt Text Content');
    });

    it('gets tracking events', () => {
      expect(companion.trackingEvents).toEqual({
        creativeView: ['http://example.com/companion2-creativeview']
      });
    });

    it('gets companionClickThroughURLTemplate', () => {
      expect(companion.companionClickThroughURLTemplate).toBe(
        'http://www.example.com/companion2-clickthrough'
      );
    });

    it('has no companionClickTrackingURLTemplates', () => {
      expect(companion.companionClickTrackingURLTemplates).toEqual([]);
    });

    describe('adParameters', () => {
      it('gets adParameters', () => {
        expect(companion.adParameters).toBe('campaign_id=2');
      });

      it('has no xmlEncoded attribute', () => {
        expect(companion.xmlEncoded).toBeNull();
      });
    });
  });

  describe('third companion', () => {
    let companion = null;
    beforeEach(() => {
      companion = creative.variations[2];
    });

    it('contains the attributes of the companion', () => {
      expect(companion).toMatchObject({
        id: '3',
        width: '300',
        height: '60',
        assetWidth: '250',
        assetHeight: '200',
        expandedWidth: '350',
        expandedHeight: '250',
        apiFramework: 'VPAID',
        adSlotID: '3',
        pxratio: '1',
        renderingMode: 'default'
      });
    });

    it('gets the html resources', () => {
      expect(companion.staticResources).toEqual([]);
      expect(companion.iframeResources).toEqual([]);
      expect(companion.htmlResources).toEqual([
        '<a href="http://www.example.com" target="_blank">Some call to action HTML!</a>'
      ]);
    });

    it('gets altText', () => {
      expect(companion.altText).toBe('Sample Alt Text Content');
    });

    it('gets tracking events', () => {
      expect(companion.trackingEvents).toEqual({
        creativeView: ['http://example.com/companion3-creativeview']
      });
    });

    it('gets companionClickThroughURLTemplate', () => {
      expect(companion.companionClickThroughURLTemplate).toBe(
        'http://www.example.com/companion3-clickthrough'
      );
    });

    it('has no companionClickTrackingURLTemplates', () => {
      expect(companion.companionClickTrackingURLTemplates).toEqual([]);
    });

    describe('adParameters', () => {
      it('gets adParameters', () => {
        expect(companion.adParameters).toBe('campaign_id=3');
      });

      it('has no xmlEncoded attribute', () => {
        expect(companion.xmlEncoded).toBeNull();
      });
    });
  });
});
