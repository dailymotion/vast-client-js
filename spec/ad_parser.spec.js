import { parseAd } from '../src/parser/ad_parser';
import { getNodesFromXml } from './utils/utils';

describe('AdParser', () => {
  describe('parseAd', () => {
    let inlineAdNode, wrapperAdNode, invalidAdNode;
    const emit = () => {};

    beforeAll(() => {
      inlineAdNode = getNodesFromXml(
        '<Ad id="id-123" sequence="seq-123"><InLine></InLine></Ad>'
      );
      wrapperAdNode = getNodesFromXml(
        '<Ad><Wrapper><VASTAdTagURI>foo</VASTAdTagURI></Wrapper></Ad>'
      );
      invalidAdNode = getNodesFromXml('<Ad><Foo></Foo></Ad>');
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
