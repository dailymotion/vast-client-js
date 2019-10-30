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

    const resolve = (URLTemplate, macros) =>
      util.resolveURLTemplates([URLTemplate], macros)[0];

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

  describe('extractURLsFromTemplates', function() {
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

  describe('isTemplateObjectEqual', function() {
    const obj1 = {
      id: null,
      url: 'http://example.com/wrapperA-impression'
    };
    const obj2 = {
      id: 'wrapper-a-impression',
      url: 'http://example.com/wrapperA-impression'
    };
    const copyOfObj2 = {
      id: 'wrapper-a-impression',
      url: 'http://example.com/wrapperA-impression'
    };
    const obj3 = {
      url: 'http://example.com/wrapperA-impression'
    };
    const copyOfObj3 = {
      url: 'http://example.com/wrapperA-impression'
    };
    const obj4 = {
      id: 'wrapper-a-impression'
    };
    const copyOfObj4 = {
      id: 'wrapper-a-impression'
    };
    const obj5 = null;

    it('should return false for unequal objects (ids dont match)', () => {
      let output = util.isTemplateObjectEqual(obj1, obj2);
      expect(output).toBe(false);
    });

    it('should return true for equivalent objects', () => {
      let output = util.isTemplateObjectEqual(obj2, copyOfObj2);
      expect(output).toBe(true);
    });

    it('should return false for unequal objects (id field missing)', () => {
      let output = util.isTemplateObjectEqual(obj2, obj3);
      expect(output).toBe(false);
    });

    it('should return false for unequal objects (url field missing)', () => {
      let output = util.isTemplateObjectEqual(obj2, obj4);
      expect(output).toBe(false);
    });

    it('should return true for equivalent objects without the id', () => {
      let output = util.isTemplateObjectEqual(obj3, copyOfObj3);
      expect(output).toBe(true);
    });

    it('should return false for unequal objects (id/url field missing)', () => {
      let output = util.isTemplateObjectEqual(obj3, obj4);
      expect(output).toBe(false);
    });

    it('should return true for equivalent objects without the url', () => {
      let output = util.isTemplateObjectEqual(obj4, copyOfObj4);
      expect(output).toBe(true);
    });

    it('should return false for unequal objects (an object is null)', () => {
      let output = util.isTemplateObjectEqual(obj1, obj5);
      expect(output).toBe(false);
    });
  });

  describe('containsTemplateObject', function() {
    const obj1 = {
      id: null,
      url: 'http://example.com/wrapperNoTracking-impression'
    };
    const obj2 = {
      id: 'wrapper-a-impression',
      url: 'http://example.com/wrapperA-impression'
    };
    const copyOfObj2 = {
      id: 'wrapper-a-impression',
      url: 'http://example.com/wrapperA-impression'
    };

    it('should return false for an empty array', () => {
      const myArr = [];
      let output = util.containsTemplateObject(obj1, myArr);
      expect(output).toBe(false);
    });

    it('should return true for an object existing in the array', () => {
      const myArr = [];
      myArr.push(obj1);
      myArr.push(obj2);
      let output = util.containsTemplateObject(obj2, myArr);
      expect(output).toBe(true);
    });

    it('should return true for a copy of an object existing in the array', () => {
      const myArr = [];
      myArr.push(obj1);
      myArr.push(obj2);
      let output = util.containsTemplateObject(copyOfObj2, myArr);
      expect(output).toBe(true);
    });

    it('should return false for an object not existing in the array', () => {
      const myArr = [];
      myArr.push(obj1);
      let output = util.containsTemplateObject(obj2, myArr);
      expect(output).toBe(false);
    });
  });

  describe('joinArrayOfUniqueTemplateObjs', function() {
    it('should return an array of unique objects', () => {
      const obj1 = {
        id: null,
        url: 'http://example.com/wrapperNoTracking-impression'
      };
      const obj2 = {
        id: 'wrapper-a-impression',
        url: 'http://example.com/wrapperA-impression'
      };
      const copyOfObj2 = {
        id: 'wrapper-a-impression',
        url: 'http://example.com/wrapperA-impression'
      };
      const obj3 = {
        id: 'wrapper-b-impression1',
        url: 'http://example.com/wrapperB-impression'
      };
      const obj4 = {
        id: 'wrapper-b-impression2',
        url: 'http://example.com/wrapperB-impression'
      };
      const copyOfObj4 = {
        id: 'wrapper-b-impression2',
        url: 'http://example.com/wrapperB-impression'
      };

      const arr1 = [obj1, obj2];
      const arr2 = [copyOfObj2, obj3, obj4, copyOfObj4];

      const expectedOutput = [
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
          url: 'http://example.com/wrapperB-impression'
        },
        {
          id: 'wrapper-b-impression2',
          url: 'http://example.com/wrapperB-impression'
        }
      ];

      let outputArr = util.joinArrayOfUniqueTemplateObjs(arr1, arr2);
      expect(outputArr.length).toEqual(4);
      expect(outputArr).toEqual(expectedOutput);
    });
  });

  describe('#replaceUrlMacros', function() {
    it('replace macro with corresponding values', () => {
      const replacedUrlMacros = util.replaceUrlMacros(
        'http://test.com?bp=[BREAKPOSITION]',
        {
          BREAKPOSITION: 2
        }
      );
      expect(replacedUrlMacros).toEqual('http://test.com?bp=2');
    });

    it('replace multiple macros with corresponding values', () => {
      const replacedUrlMacros = util.replaceUrlMacros(
        'http://test.com?bp=[BREAKPOSITION]&ext=[EXTENSIONS]',
        {
          BREAKPOSITION: 2,
          EXTENSIONS: ['AdVerifications', 'extensionA', 'extensionB']
        }
      );
      expect(replacedUrlMacros).toEqual(
        'http://test.com?bp=2&ext=AdVerifications,extensionA,extensionB'
      );
    });

    it('replace macro without value with -1', () => {
      const replacedUrlMacros = util.replaceUrlMacros(
        'http://test.com?bp=[BREAKPOSITION]',
        {}
      );
      expect(replacedUrlMacros).toEqual('http://test.com?bp=-1');
    });
  });
});
