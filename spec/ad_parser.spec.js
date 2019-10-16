import { parseAd } from '../src/parser/ad_parser';
import { getNodesFromXml } from './utils/utils';
import { inlineAd, wrapperAd, invalidAd } from './samples/ad';

describe('AdParser', () => {
  describe('parseAd', () => {
    let inlineAdNode, wrapperAdNode, invalidAdNode;
    const emit = () => {};

    beforeAll(() => {
      inlineAdNode = getNodesFromXml(inlineAd);
      wrapperAdNode = getNodesFromXml(wrapperAd);
      invalidAdNode = getNodesFromXml(invalidAd);
    });

    it('correctly returns inline and passes ad attributes down', () => {
      expect(parseAd(inlineAdNode, emit)).toEqual({
        ad: expect.objectContaining({ id: 'id-123', sequence: 'seq-123' }),
        type: 'INLINE'
      });
    });

    it('correctly returns wrapper', () => {
      expect(parseAd(wrapperAdNode, emit)).toEqual({
        ad: expect.any(Object),
        type: 'WRAPPER'
      });
    });

    it('does not return if ad does not contain wrapper or inline', () => {
      expect(parseAd(invalidAdNode, emit)).toBeUndefined();
    });
  });
});
