import { util } from '../src/util/util';

describe('util', function() {
  describe('resolveURLTemplates', function() {
    const now = new Date().toISOString();
    const playhead = '00:12:30.212';
    const assetURI = 'http://example.com/linear-asset.mp4?foo=1&bar=_-[{bar';

    const encodeRFC3986 = str => util.encodeURIComponentRFC3986(str);

    const encodedAssetURI = encodeRFC3986(assetURI);
    const encodedPlayhead = encodeRFC3986(playhead);
    const encodedTimestamp = encodeRFC3986(now);

    const resolve = (URLTemplate, variables) =>
      util.resolveURLTemplates([URLTemplate], variables)[0];

    const realDateToISOString = Date.prototype.toISOString;

    beforeEach(() => {
      Date.prototype.toISOString = () => now;
    });

    afterAll(() => {
      Date.prototype.toISOString = realDateToISOString;
    });

    describe('assetURI', function() {
      it('should resolve assetURI', () => {
        expect(
          resolve('http://test.com/?url=[ASSETURI]', { ASSETURI: assetURI })
        ).toBe(`http://test.com/?url=${encodedAssetURI}`);
      });

      it('should resolve assetURI, with percents', () => {
        expect(
          resolve('http://test.com/?url=%%ASSETURI%%', { ASSETURI: assetURI })
        ).toBe(`http://test.com/?url=${encodedAssetURI}`);
      });
    });

    describe('cacheBusting', function() {
      it('should resolve cache busting', () => {
        const res = resolve('http://test.com/[CACHEBUSTING]');
        expect(/^http:\/\/test.com\/[0-9]+$/.test(res)).toBeTruthy();
      });

      it('should resolve cache buster, with percents', () => {
        const res = resolve('http://test.com/%%CACHEBUSTING%%', {
          CACHEBUSTING: 178
        });
        expect(/^http:\/\/test.com\/[0-9]+$/.test(res)).toBeTruthy();
      });
    });

    describe('contentPlayhead', function() {
      it('should resolve playhead', () => {
        expect(
          resolve('http://test.com/[CONTENTPLAYHEAD]', {
            CONTENTPLAYHEAD: playhead
          })
        ).toBe(`http://test.com/${encodedPlayhead}`);
      });

      it('should resolve playhead, with percents', () => {
        expect(
          resolve('http://test.com/%%CONTENTPLAYHEAD%%', {
            CONTENTPLAYHEAD: playhead
          })
        ).toBe(`http://test.com/${encodedPlayhead}`);
      });
    });

    describe('timestamp', function() {
      it('should resolve timestamp', () => {
        expect(resolve('http://test.com/[TIMESTAMP]')).toBe(
          `http://test.com/${encodedTimestamp}`
        );
      });

      it('should resolve timestamp, with percents', () => {
        expect(
          resolve('http://test.com/%%TIMESTAMP%%', { TIMESTAMP: 12345678 })
        ).toBe(`http://test.com/${encodedTimestamp}`);
      });
    });

    describe('random/RANDOM', function() {
      it('should resolve random', () => {
        const res = resolve('http://test.com/[random]');
        expect(/^http:\/\/test.com\/[0-9]+$/.test(res)).toBeTruthy();
      });

      it('should resolve cache buster, with percents', () => {
        const res = resolve('http://test.com/%%RANDOM%%');
        expect(/^http:\/\/test.com\/[0-9]+$/.test(res)).toBeTruthy();
      });
    });

    it('should resolve weird cases', () => {
      expect(
        resolve('http://test.com/%%CONTENTPLAYHEAD%%&[CONTENTPLAYHEAD]', {
          CONTENTPLAYHEAD: 120
        })
      ).toBe('http://test.com/120&120');
    });

    it('should ignore other types than strings', () => {
      [undefined, null, false, 123, {}, () => {}].forEach(URLTemplate => {
        expect(resolve(URLTemplate)).toBeUndefined();
      });
    });
  });

  describe('joinArrayUnique', () => {
    it('should join multiple arrays without duplicates', () => {
      expect(util.joinArrayUnique([1, 2, 3], [2, 2, 3, 4])).toEqual([
        1,
        2,
        3,
        4
      ]);
    });
    it('should remove duplicates from one array', () => {
      expect(util.joinArrayUnique([1, 2, 2, 3])).toEqual([1, 2, 3]);
    });
    it('should return empty array if there are no valid inputs', () => {
      expect(util.joinArrayUnique(null, undefined)).toEqual([]);
    });
  });

  describe('#extractURLsFromTemplates', function() {
    it('should return an array of urls', () => {
      const input = [
        {
          id: null,
          url: 'http://example.com/wrapperNoTracking-impression'
        },
        {
          id: 'wrapper-a-impression',
          url: 'http://example.com/wrapperA-impression'
        },
        {
          id: 'wrapper-b-impression1',
          url: 'http://example.com/wrapperB-impression1'
        }
      ];

      const expectedOutput = [
        'http://example.com/wrapperNoTracking-impression',
        'http://example.com/wrapperA-impression',
        'http://example.com/wrapperB-impression1'
      ];

      const output = util.extractURLsFromTemplates(input);

      expect(output).toEqual(expectedOutput);
    });

    it('should return the array of urls as passed in', () => {
      const input = [
        'http://example.com/wrapperNoTracking-impression',
        'http://example.com/wrapperA-impression',
        'http://example.com/wrapperB-impression'
      ];

      const expectedOutput = [
        'http://example.com/wrapperNoTracking-impression',
        'http://example.com/wrapperA-impression',
        'http://example.com/wrapperB-impression'
      ];

      const output = util.extractURLsFromTemplates(input);

      expect(output).toEqual(expectedOutput);
    });
  });
});
