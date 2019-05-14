import { _parseExtensions } from '../src/parser/ad_parser';
import { parserUtils } from '../src/parser/parser_utils';
import { getNodesFromXml } from './utils/utils';
import { extensions } from './samples/extensions';

describe('AdParser', function() {
  describe('Extensions', function() {
    let parsedExts;

    beforeAll(() => {
      const extensionNodes = parserUtils.childrenByName(
        getNodesFromXml(extensions),
        'Extension'
      );
      parsedExts = _parseExtensions(extensionNodes);
    });

    it('validate WrapperExtension', () => {
      const ext = parsedExts[0];
      expect(ext.attributes['type']).toEqual('WrapperExtension');
      expect(ext.children.length).toEqual(1);
      expect(ext.children[0].name).toEqual('extension_tag');
      expect(ext.children[0].value).toEqual('extension_value');
    });

    it('validate Count extension', () => {
      const ext = parsedExts[1];
      expect(ext.attributes['type']).toEqual('Count');
      expect(ext.children.length).toEqual(0);
      expect(ext.name).toEqual('Extension');
      expect(ext.value).toEqual('4');
    });

    it('validate simple JSON on cdata extension', () => {
      const ext = parsedExts[2];
      expect(ext.attributes).toEqual({});
      expect(ext.children.length).toEqual(0);
      expect(ext.name).toEqual('Extension');
      expect(ext.value).toEqual('{ foo: bar }');
    });

    it('validate Pricing extension', () => {
      const ext = parsedExts[3];
      expect(ext.attributes['type']).toEqual('Pricing');
      expect(ext.children.length).toEqual(2);
      const prices = ext.children[0];
      expect(prices.name).toEqual('Prices');
      expect(prices.children.length).toEqual(4);
      expect(prices.children[0].name).toEqual('Price');
      expect(prices.children[0].attributes['model']).toEqual('CPM');
      expect(prices.children[1].attributes['source']).toEqual('someone_else');
      expect(prices.children[2].attributes['model']).toEqual('CPL');
      expect(prices.children[3].attributes['currency']).toEqual('USD');
      expect(prices.children[0].value).toEqual('0');
      expect(prices.children[1].value).toEqual('42');
      expect(prices.children[2].value).toEqual('69');
      expect(prices.children[3].value).toEqual('234.5');
      expect(ext.children[1].name).toEqual('PricingPolicy');
      expect(ext.children[1].value).toEqual(
        'http://example.com/pricing-policy.html'
      );
    });

    it('validate an overly nested extension', () => {
      const ext = parsedExts[4];
      expect(ext.attributes['type']).toEqual('OverlyNestedExtension');
      expect(ext.children.length).toEqual(1);
      const greatFather = ext.children[0];
      expect(greatFather.name).toEqual('GreatFather');
      expect(greatFather.attributes['age']).toEqual('70');
      expect(greatFather.children.length).toEqual(1);
      const father = greatFather.children[0];
      expect(father.name).toEqual('Father');
      expect(father.attributes['age']).toEqual('40');
      expect(father.attributes['alive']).toEqual('false');
      expect(father.children.length).toEqual(3);
      expect(father.children[0].name).toEqual('Daughter');
      expect(father.children[0].attributes['age']).toEqual('20');
      expect(father.children[0].value).toEqual('Maria');
      expect(father.children[1].name).toEqual('Daughter');
      expect(father.children[1].attributes['age']).toEqual('20');
      expect(father.children[1].value).toEqual('Lola');
      expect(father.children[2].name).toEqual('Son');
      expect(father.children[2].attributes['age']).toEqual('25');
      expect(father.children[2].value).toEqual('Paul');
    });
  });
});
