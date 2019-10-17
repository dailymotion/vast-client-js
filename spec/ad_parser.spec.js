import { parseAd, _parseViewableImpression } from '../src/parser/ad_parser';
import { getNodesFromXml } from './utils/utils';
import { parserUtils } from '../src/parser/parser_utils';
import { linearAd } from './samples/linear_ads';
import {
  viewableImpression,
  viewableImpressionPartial
} from './samples/viewable_impression';

describe('CreativesParser', function() {
  describe('parseAdElement', function() {
    const adElement = getNodesFromXml(linearAd);
    let ad = null;

    beforeEach(() => {
      ad = parseAd(adElement, null);
    });

    it('contains the required Ad sub-elements values', () => {
      expect(ad.id).toBe('ad_id_0001');
      expect(ad.sequence).toBe('1');
      expect(ad.adType).toBe('video');
      expect(ad.expires).toBe(4567890);
      expect(ad.adServingId).toBe('Ad_serving_id_12345');
      expect(ad.title).toBe('Ad title');
      expect(ad.description).toBe('Description text');
      expect(ad.survey).toBe('http://example.com/survey');
      expect(ad.advertiser.id).toBe('advertiser-desc');
      expect(ad.advertiser.value).toBe('Advertiser name');
      expect(ad.pricing.value).toBe('1.09');
      expect(ad.pricing.model).toBe('CPM');
      expect(ad.pricing.currency).toBe('USD');
      expect(ad.system.value).toBe('AdServer');
      expect(ad.system.version).toBe('2.0');
    });

    it('returns 1 creative', () => {
      expect(ad.creatives).toHaveLength(1);
    });

    it('should have 3 extensions', () => {
      expect(ad.extensions).toHaveLength(3);
    });

    it('gets categories values', () => {
      expect(ad.categories).toHaveLength(2);
      expect(ad.categories[0].authority).toBe('iabtechlab.com');
      expect(ad.categories[0].value).toBe('232');
      expect(ad.categories[1].authority).toBe('google.com');
      expect(ad.categories[1].value).toBe('245');
    });

    it('gets viewableImpression values', () => {
      expect(ad.viewableImpression.id).toBe('viewable_impression_id');
      expect(ad.viewableImpression.viewable).toHaveLength(2);
      expect(ad.viewableImpression.viewable).toEqual([
        'http://www.example.com/viewable_impression_1',
        'http://www.sample.com/viewable_impression_2'
      ]);
      expect(ad.viewableImpression.notviewable).toHaveLength(3);
      expect(ad.viewableImpression.notviewable).toEqual([
        'http://www.example.com/not_viewable_1',
        'http://www.sample.com/not_viewable_2',
        'http://www.sample.com/not_viewable_3'
      ]);
      expect(ad.viewableImpression.viewundetermined).toHaveLength(1);
      expect(ad.viewableImpression.viewundetermined).toEqual([
        'http://www.example.com/view_undetermined_1'
      ]);
    });

    it('returns 1 errorURLTemplate', () => {
      expect(ad.errorURLTemplates).toHaveLength(1);
      expect(ad.errorURLTemplates).toEqual([
        'http://example.com/error_[ERRORCODE]'
      ]);
    });

    it('should have 3 impressionURLTemplates', () => {
      expect(ad.impressionURLTemplates).toHaveLength(3);
      expect(ad.impressionURLTemplates).toEqual([
        {
          id: 'sample-impression1',
          url: 'http://example.com/impression1_asset:[ASSETURI]_[CACHEBUSTING]'
        },
        {
          id: 'sample-impression2',
          url: 'http://example.com/impression2_[random]'
        },
        {
          id: 'sample-impression3',
          url: 'http://example.com/impression3_[RANDOM]'
        }
      ]);
    });

    it('should have 3 adVerifications', () => {
      expect(ad.adVerifications).toHaveLength(3);
    });

    it('validate first adVerification', () => {
      expect(ad.adVerifications[0].resource).toEqual(
        'http://example.com/omid1'
      );
      expect(ad.adVerifications[0].vendor).toEqual('company.com-omid');
      expect(ad.adVerifications[0].browserOptional).toEqual(true);
      expect(ad.adVerifications[0].apiFramework).toEqual('omid');
      expect(ad.adVerifications[0].type).toBeUndefined;
      expect(ad.adVerifications[0].parameters).toBeUndefined;
    });

    it('validate second adVerification', () => {
      expect(ad.adVerifications[1].resource).toEqual(
        'http://example.com/omid2'
      );
      expect(ad.adVerifications[1].vendor).toEqual('company2.com-omid');
      expect(ad.adVerifications[1].browserOptional).toEqual(false);
      expect(ad.adVerifications[1].apiFramework).toEqual('omid');
      expect(ad.adVerifications[1].parameters).toEqual(
        'test-verification-parameter'
      );
      expect(
        ad.adVerifications[1].trackingEvents.verificationNotExecuted
      ).toHaveLength(1);
      expect(
        ad.adVerifications[1].trackingEvents.verificationNotExecuted
      ).toEqual(['http://example.com/verification-not-executed-JS']);
    });

    it('validate third adVerification', () => {
      expect(ad.adVerifications[2].resource).toEqual(
        'http://example.com/omid1.exe'
      );
      expect(ad.adVerifications[2].vendor).toEqual('company.daily.com-omid');
      expect(ad.adVerifications[2].browserOptional).toEqual(false);
      expect(ad.adVerifications[2].apiFramework).toEqual('omid-sdk');
      expect(ad.adVerifications[2].type).toEqual('executable');
      expect(ad.adVerifications[2].parameters).toBeUndefined;
      expect(
        ad.adVerifications[2].trackingEvents.verificationNotExecuted
      ).toHaveLength(2);
      expect(
        ad.adVerifications[2].trackingEvents.verificationNotExecuted
      ).toEqual([
        'http://example.com/verification-not-executed-EXE',
        'http://sample.com/verification-not-executed-EXE'
      ]);
    });
  });

  describe('parseViewableImpression', function() {
    const viewableImpressionNode = parserUtils.childByName(
      getNodesFromXml(viewableImpression),
      'ViewableImpression'
    );
    const viewableImpressionPartialNode = parserUtils.childByName(
      getNodesFromXml(viewableImpressionPartial),
      'ViewableImpression'
    );
    let parsedViewableImpression, parsedViewableImpressionPartial;

    beforeAll(() => {
      parsedViewableImpression = _parseViewableImpression(
        viewableImpressionNode
      );
      parsedViewableImpressionPartial = _parseViewableImpression(
        viewableImpressionPartialNode
      );
    });

    it('validate viewableImpression has an id "viewable_impression"', () => {
      expect(parsedViewableImpression.id).toEqual('viewable_impression');
    });

    it('validate viewableImpression viewable array', () => {
      expect(parsedViewableImpression.viewable.length).toEqual(2);
      expect(parsedViewableImpression.viewable).toEqual([
        'http://www.example.com/viewable_impression_1',
        'http://www.sample.com/viewable_impression_2'
      ]);
    });

    it('validate viewableImpression notviewable array', () => {
      expect(parsedViewableImpression.notviewable.length).toEqual(3);
      expect(parsedViewableImpression.notviewable).toEqual([
        'http://www.example.com/not_viewable_1',
        'http://www.sample.com/not_viewable_2',
        'http://www.sample.com/not_viewable_3'
      ]);
    });

    it('validate viewableImpression viewundetermined array', () => {
      expect(parsedViewableImpression.viewundetermined.length).toEqual(1);
      expect(parsedViewableImpression.viewundetermined).toEqual([
        'http://www.example.com/view_undetermined_1'
      ]);
    });

    it('validate viewableImpressionPartial has id null', () => {
      expect(parsedViewableImpressionPartial.id).toEqual(null);
    });

    it('validate viewableImpressionPartial viewable array', () => {
      expect(parsedViewableImpressionPartial.viewable.length).toEqual(1);
      expect(parsedViewableImpressionPartial.viewable).toEqual([
        'http://www.example.com/viewable_impression_1'
      ]);
    });

    it('validate viewableImpressionPartial notviewable is undefined', () => {
      expect(parsedViewableImpressionPartial.notviewable).toBeUndefined;
    });

    it('validate viewableImpressionPartial viewundetermined is undefined', () => {
      expect(parsedViewableImpressionPartial.viewundetermined).toBeUndefined;
    });
  });
});
