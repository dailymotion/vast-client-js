import { VASTClient } from '../src/vast_client';
import { readFile } from 'fs/promises';

const wrapperMultipleAdsVastUrl = './spec/samples/wrapper-multiple-ads.xml';
const emptyVastUrl = './spec/samples/empty-no-ad.xml';

const nodeUrlHandler = {
  get: async (file) => {
    try {
      const response = await readFile(file, 'utf-8');
      return {
        xml: new DOMParser().parseFromString(response, 'text/xml'),
        details: { byteLength: 1234, statusCode: 200 },
      };
    } catch (err) {
      return { error: err, statusCode: 400 };
    }
  },
};

const options = {
  urlHandler: nodeUrlHandler,
  withCredentials: true,
};

describe('VASTClient', () => {
  describe('when cappingFreeLunch is set to 1', () => {
    const VastClient = new VASTClient(1, undefined, undefined);

    afterAll(() => {
      VastClient.storage.clear();
    });

    it('ignores the first call and updates total calls', () => {
      return expect(
        VastClient.get(wrapperMultipleAdsVastUrl, options)
      ).rejects.toEqual(
        new Error(`VAST call canceled – FreeLunch capping not reached yet 1/1`)
      );
    });

    it('succeeds with the second call and updates total calls', async () => {
      const res = await VastClient.get(wrapperMultipleAdsVastUrl, options);
      expect(res).toEqual({
        ads: expect.any(Array),
        errorURLTemplates: [],
        version: '4.3',
      });
      expect(VastClient.totalCalls).toBe('2');
    });
  });

  describe('when cappingMinimumTimeInterval is set to 30 seconds', () => {
    const VastClient = new VASTClient(0, 30000, undefined);

    it('succeeds with the first call and updates total calls', async () => {
      const res = await VastClient.get(wrapperMultipleAdsVastUrl, options);
      expect(res).toEqual({
        ads: expect.any(Array),
        errorURLTemplates: [],
        version: '4.3',
      });
      expect(VastClient.totalCalls).toBe('1');
    });

    it('should ignore the second call sent under 30 seconds', async () => {
      try {
        await VastClient.get(wrapperMultipleAdsVastUrl, options);
        jest.spyOn(Date, 'now').mockImplementation(() => 0);
        await VastClient.get(wrapperMultipleAdsVastUrl, options);
      } catch (error) {
        expect(error).toEqual(
          new Error('VAST call canceled – (30000)ms minimum interval reached')
        );
      }
    });
  });

  describe('when custom storage is provided', () => {
    let getCount = 0;
    let setCount = 0;
    const customStorage = {
      getItem() {
        getCount++;
      },
      setItem() {
        setCount++;
      },
    };
    const VastClient = new VASTClient(0, 0, customStorage);

    it('uses the custom storage', () => {
      expect(getCount).toBe(3);
      expect(setCount).toBe(3);

      VastClient.lastSuccessfulAd;

      expect(getCount).toBe(4);
    });
  });

  describe('get', () => {
    let VastClient;

    beforeEach(() => {
      VastClient = new VASTClient();
    });

    describe('with resolveAll set to false', () => {
      const optionsWithNoResolveAll = {
        ...options,
        resolveAll: false,
      };
      let res;
      beforeEach(async () => {
        res = await VastClient.get(
          wrapperMultipleAdsVastUrl,
          optionsWithNoResolveAll
        );
      });
      it('returns first ad parsed', () => {
        expect(res).toEqual({
          ads: expect.any(Array),
          errorURLTemplates: [],
          version: '4.3',
        });
        expect(res.ads).toHaveLength(2);
      });

      it('should return only the errorURLs for the first ad', () => {
        expect(res.ads[0].errorURLTemplates).toEqual([
          'http://example.com/error',
          'http://example.com/error_[ERRORCODE]',
        ]);
      });

      it('handles empty ads correctly', async () => {
        const response = await VastClient.get(
          emptyVastUrl,
          optionsWithNoResolveAll
        );
        expect(response).toEqual({
          ads: [],
          errorURLTemplates: ['http://example.com/empty-no-ad'],
          version: '4.3',
        });
      });

      it('returns true for hasRemainingAds', () => {
        expect(VastClient.hasRemainingAds()).toBeTruthy();
      });

      describe('getNextAds', () => {
        it('resolves all next ads if requested', async () => {
          const res = await VastClient.getNextAds(true);
          expect(res).toEqual({
            ads: expect.any(Array),
            errorURLTemplates: [],
            version: '4.3',
          });
          expect(res.ads).toHaveLength(3);
        });

        it('resolves only next ad if requested', async () => {
          await VastClient.get(
            wrapperMultipleAdsVastUrl,
            optionsWithNoResolveAll
          );
          const response = await VastClient.getNextAds(false);
          expect(response).toEqual({
            ads: expect.any(Array),
            errorURLTemplates: [],
            version: '4.3',
          });
          expect(response.ads).toHaveLength(2);
        });
      });
    });

    describe('with resolveAll set to true', () => {
      const optionsWithResolveAll = { ...options, resolveAll: true };
      let res;
      beforeEach(async () => {
        res = await VastClient.get(
          wrapperMultipleAdsVastUrl,
          optionsWithResolveAll
        );
      });
      it('returns all ads parsed', () => {
        expect(res).toEqual({
          ads: expect.any(Array),
          errorURLTemplates: [],
          version: '4.3',
        });
        expect(res.ads).toHaveLength(5);
      });

      it('will not have remaining ads', () => {
        expect(VastClient.hasRemainingAds()).toBeFalsy();
      });
    });
  });
});
