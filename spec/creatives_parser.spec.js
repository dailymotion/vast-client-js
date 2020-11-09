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
      expect(creative.universalAdIds[0].idRegistry).toEqual('daily-motion-L');
      expect(creative.universalAdIds[0].value).toEqual('Linear-12345');
      expect(creative.type).toEqual('linear');
      expect(creative.mediaFiles.length).toEqual(2);
    });

    it('validate second parsedCreative', () => {
      const creative = parsedCreatives[1];
      expect(creative.id).toEqual('id130985');
      expect(creative.adId).toEqual('adId345691');
      expect(creative.universalAdIds).toEqual([]);
      expect(creative.type).toEqual('companion');
      expect(creative.variations.length).toEqual(3);
    });

    it('validate third parsedCreative', () => {
      const creative = parsedCreatives[2];
      expect(creative.id).toEqual('id130986');
      expect(creative.adId).toEqual(null);
      expect(creative.universalAdIds[0].idRegistry).toEqual('daily-motion-NL');
      expect(creative.universalAdIds[0].value).toEqual('NonLinear-12345');
      expect(creative.type).toEqual('nonlinear');
      expect(creative.variations.length).toEqual(1);
    });
  });
});
