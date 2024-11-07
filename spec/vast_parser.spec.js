import { VASTParser } from '../src/parser/vast_parser';
import { urlFor, getNodesFromXml } from './utils/utils';
import { util } from '../src/util/util';
import { parserUtils } from '../src/parser/parser_utils';
import * as Bitrate from '../src/parser/bitrate';
import { Fetcher } from '../src/fetcher/fetcher';
import { linearAd } from './samples/linear_ads';
import { VASTClient } from '../src/vast_client';
import { readFile } from 'fs/promises';

const xml = getNodesFromXml(`<VAST>${linearAd}</VAST>`, 'text/xml');

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

const wrapperAVastUrl = urlFor('wrapper-a.xml');
const wrapperBVastUrl = urlFor('wrapper-b.xml');
const inlineSampleVastUrl = urlFor('sample.xml');
const inlineInvalidVastUrl = urlFor('invalid-xmlfile.xml');

describe('VASTParser', () => {
  let vastClient;
  let VastParser;
  let fetcher;
  let inlineXml, invalidXml, errorXml, wrapperXml, outdatedXml;

  beforeAll(async () => {
    inlineXml = await nodeUrlHandler.get('./spec/samples/sample.xml');
    errorXml = await nodeUrlHandler.get('./spec/samples/empty-no-ad.xml');
    outdatedXml = await nodeUrlHandler.get('./spec/samples/outdated-vast.xml');
    wrapperXml = await nodeUrlHandler.get(
      './spec/samples/wrapper-attributes-multiple-ads.xml'
    );
    invalidXml = await nodeUrlHandler.get('./spec/samples/invalid-xmlfile.xml');
  });

  beforeEach(() => {
    vastClient = new VASTClient();
    fetcher = new Fetcher();
    VastParser = new VASTParser({ fetcher });
    jest.spyOn(VastParser, 'emit');
  });

  describe('initParsingStatus', () => {
    beforeEach(() => {
      jest.spyOn(VastParser, 'resetParsingStatus');
    });

    it('assigns options to properties', () => {
      jest.spyOn(Bitrate, 'updateEstimatedBitrate');

      VastParser.initParsingStatus({
        wrapperLimit: 5,
        allowMultipleAds: true,
        byteLength: 1000,
        requestDuration: 200,
      });

      expect(VastParser.rootURL).toBe('');
      expect(VastParser.remainingAds).toEqual([]);
      expect(VastParser.errorURLTemplates).toEqual([]);
      expect(VastParser.rootErrorURLTemplates).toEqual([]);
      expect(VastParser.maxWrapperDepth).toBe(5);
      expect(VastParser.vastVersion).toBeNull();
      expect(VastParser.parsingOptions).toEqual({ allowMultipleAds: true });
      expect(Bitrate.updateEstimatedBitrate).toBeCalledWith(1000, 200);
      expect(VastParser.resetParsingStatus).toHaveBeenCalled();
    });

    it('uses default values if no options are passed', () => {
      VastParser.initParsingStatus();

      expect(VastParser.rootURL).toBe('');
      expect(VastParser.remainingAds).toEqual([]);
      expect(VastParser.errorURLTemplates).toEqual([]);
      expect(VastParser.rootErrorURLTemplates).toEqual([]);
      expect(VastParser.maxWrapperDepth).toBe(10);
      expect(VastParser.vastVersion).toBeNull();
      expect(VastParser.parsingOptions).toEqual({
        allowMultipleAds: undefined,
      });
      expect(VastParser.resetParsingStatus).toHaveBeenCalled();
    });
  });

  describe('parseVastXml', () => {
    it('handles invalid XML vast', () => {
      try {
        VastParser.parseVastXml(invalidXml.xml, {
          isRootVAST: true,
          url: inlineInvalidVastUrl,
          wrapperDepth: 0,
        });
      } catch (e) {
        expect(e.message).toBe('Invalid VAST XMLDocument');
        expect(VastParser.emit).toHaveBeenLastCalledWith('VAST-ad-parsed', {
          type: 'ERROR',
          url: inlineInvalidVastUrl,
          wrapperDepth: 0,
        });
      }
    });

    it('throw a error for non supported XML vast', () => {
      try {
        VastParser.parseVastXml(outdatedXml.xml, {
          isRootVAST: true,
          url: null,
          wrapperDepth: 0,
        });
      } catch (e) {
        expect(e.message).toBe('VAST response version not supported');
        expect(VastParser.emit).toHaveBeenLastCalledWith('VAST-ad-parsed', {
          type: 'ERROR',
          url: null,
          wrapperDepth: 0,
        });
      }
    });

    it('gets vast version from original vast', () => {
      VastParser.parseVastXml(inlineXml.xml, {
        isRootVAST: true,
        url: inlineSampleVastUrl,
        wrapperDepth: 0,
      });
      expect(VastParser.vastVersion).toBe('4.3');
    });

    it('handles Error tag for root VAST', () => {
      //initParsingStatus always  will be called before parseVastXml
      VastParser.rootErrorURLTemplates = [];
      VastParser.parseVastXml(errorXml.xml, { isRootVAST: true });
      expect(VastParser.rootErrorURLTemplates).toEqual([
        'http://example.com/empty-no-ad',
      ]);
    });

    it('handles Error tag for not root VAST', () => {
      VastParser.initParsingStatus();
      VastParser.parseVastXml(errorXml.xml, { isRootVAST: false });
      expect(VastParser.errorURLTemplates).toEqual([
        'http://example.com/empty-no-ad',
      ]);
    });

    it('handles Ad tag', () => {
      const ads = VastParser.parseVastXml(inlineXml.xml, {
        isRootVAST: true,
        url: inlineSampleVastUrl,
        wrapperDepth: 0,
        allowMultipleAds: true,
      });

      expect(ads).toHaveLength(2);
      expect(VastParser.emit).toHaveBeenCalledTimes(2);
      expect(VastParser.emit).toHaveBeenCalledWith('VAST-ad-parsed', {
        adIndex: 0,
        type: 'INLINE',
        url: inlineSampleVastUrl,
        wrapperDepth: 0,
        vastVersion: '4.3',
      });
      expect(VastParser.emit).toHaveBeenCalledWith('VAST-ad-parsed', {
        adIndex: 1,
        type: 'INLINE',
        url: inlineSampleVastUrl,
        wrapperDepth: 0,
        vastVersion: '4.3',
      });
    });
  });

  describe('parse', () => {
    it('calls parseVastXml with passed options', () => {
      jest.spyOn(VastParser, 'parseVastXml');

      return VastParser.parse(inlineXml.xml, {
        url: inlineSampleVastUrl,
        previousUrl: wrapperBVastUrl,
        resolveAll: true,
        wrapperSequence: 1,
        wrapperDepth: 0,
        isRootVAST: true,
      }).then(() => {
        expect(VastParser.parseVastXml).toHaveBeenCalledWith(inlineXml.xml, {
          isRootVAST: true,
          url: inlineSampleVastUrl,
          wrapperDepth: 0,
        });
      });
    });

    it('rejects if parsing xml failed', () => {
      jest.spyOn(VastParser, 'parseVastXml');

      return VastParser.parse(invalidXml.xml, {
        url: inlineInvalidVastUrl,
        previousUrl: wrapperBVastUrl,
        resolveAll: true,
        wrapperSequence: 1,
        wrapperDepth: 0,
        isRootVAST: true,
      }).catch((e) => {
        expect(e.message).toBe('Invalid VAST XMLDocument');
      });
    });

    it('resolves first ad and saves remaining ads if resolveAll is false', () => {
      return VastParser.parse(inlineXml.xml, {
        url: inlineSampleVastUrl,
        previousUrl: wrapperBVastUrl,
        resolveAll: false,
        wrapperSequence: 1,
        wrapperDepth: 0,
        isRootVAST: true,
        allowMultipleAds: true,
      }).then((ads) => {
        expect(VastParser.remainingAds).toHaveLength(1);
        expect(ads).toHaveLength(1);
      });
    });

    it('parse wrapper sub elements based on allowMultipleAds and followAdditionalWrappers values', () => {
      return VastParser.parse(wrapperXml.xml).then((ads) => {
        expect(ads.length).toEqual(4);
      });
    });

    it('it replaces the ad sequence with the value of the wrapper sequence if it contains only one ad', () => {
      jest.spyOn(VastParser, 'parseVastXml').mockReturnValue([{ sequence: 2 }]);
      return VastParser.parse(wrapperXml, { wrapperSequence: 4 }).then(
        (ads) => {
          expect(ads[0].sequence).toEqual(4);
        }
      );
    });

    it('does not keep wrapper sequence value when wrapper contain an adpod', () => {
      jest
        .spyOn(VastParser, 'parseVastXml')
        .mockReturnValue([{ sequence: 1 }, { sequence: 2 }, { sequence: 3 }]);
      return VastParser.parse(wrapperXml, { wrapperSequence: 4 }).then(
        (ads) => {
          expect(ads[0].sequence).toEqual(1);
          expect(ads[1].sequence).toEqual(2);
          expect(ads[2].sequence).toEqual(3);
        }
      );
    });
  });

  describe('parseVAST', () => {
    let options;
    beforeEach(() => {
      options = {
        wrapperLimit: 5,
        allowMultipleAds: true,
        byteLength: 1234,
        requestDuration: 12000,
      };
      jest.spyOn(VastParser, 'initParsingStatus');
      jest
        .spyOn(VastParser, 'parse')
        .mockReturnValue(Promise.resolve([linearAd]));
      jest.spyOn(VastParser, 'buildVASTResponse').mockReturnValue({
        ads: [linearAd],
        errorURLTemplates: [],
        version: null,
      });
      jest.spyOn(Bitrate, 'updateEstimatedBitrate');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return a VAST response object', (done) => {
      VastParser.parseVAST(xml, options).then((response) => {
        expect(response).toEqual({
          ads: [linearAd],
          errorURLTemplates: [],
          version: null,
        });
        expect(VastParser.initParsingStatus).toHaveBeenCalled();
        expect(VastParser.parse).toHaveBeenCalled();
        expect(VastParser.buildVASTResponse).toHaveBeenCalled();
        done();
      });
    });

    it('should have set the options if given', (done) => {
      VastParser.parseVAST(xml, options).then(() => {
        expect(VastParser.maxWrapperDepth).toBe(5);
        expect(VastParser.parsingOptions).toEqual({ allowMultipleAds: true });
        expect(Bitrate.updateEstimatedBitrate).toHaveBeenCalledWith(
          1234,
          12000
        );
        done();
      });
    });

    it('should have set the default options if not given', (done) => {
      VastParser.parseVAST(xml).then(() => {
        expect(VastParser.maxWrapperDepth).toBe(10);
        expect(VastParser.parsingOptions).toEqual({
          allowMultipleAds: undefined,
        });
      });
      done();
    });
  });

  describe('Tracking', () => {
    let trackCalls = null;
    let dataTriggered = null;
    const options = {
      urlhandler: nodeUrlHandler,
    };

    beforeEach(() => {
      VastParser.removeAllListeners();
      dataTriggered = [];
      trackCalls = [];

      VastParser.on('VAST-error', (variables) => dataTriggered.push(variables));

      util.track = (templates, variables) => {
        trackCalls.push({
          templates,
          variables,
        });
      };
    });

    describe('No Ad', () => {
      it('should emits a VAST-error & track', (done) => {
        let vast = new DOMParser().parseFromString(
          `<VAST><Error>http://example.com/empty-no-ad</Error></VAST>`,
          'text/xml'
        );
        VastParser.parseVAST(vast)
          .then((response) => {
            // Response doesn't have any ads
            expect(response.ads).toEqual([]);
            expect(dataTriggered.length).toBe(1);
            // Error has been triggered
            expect(dataTriggered.length).toBe(1);
            expect(dataTriggered[0].ERRORCODE).toBe(303);
            expect(dataTriggered[0].extensions).toEqual([]);
            // Tracking has been done
            expect(trackCalls.length).toBe(1);
            expect(trackCalls[0].templates).toEqual([
              'http://example.com/empty-no-ad',
            ]);
            expect(trackCalls[0].variables).toEqual({ ERRORCODE: 303 });
            done();
          })
          .catch((error) => {
            console.error(error);
            done(error);
          });
      });

      it('should emits VAST-error & track when wrapped', async () => {
        const url = './spec/samples/wrapper-empty.xml';
        const response = await nodeUrlHandler.get(
          './spec/samples/wrapper-empty.xml'
        );

        fetcher.setOptions({ ...options, url: url, previousUrl: url });
        VastParser.fetchingCallback = fetcher.fetchVAST.bind(fetcher);

        const vastXML = await VastParser.parseVAST(response.xml, {
          url: url,
          previousUrl: url,
        });
        // Response doesn't have any ads

        expect(vastXML.ads).toEqual([]);
        // error has been triggered
        expect(dataTriggered.length).toBe(1);
        expect(dataTriggered[0].ERRORCODE).toBe(303);
        expect(dataTriggered[0].extensions[0].children[0].name).toBe(
          'paramWrapperEmptyNoAd'
        );
        expect(dataTriggered[0].extensions[0].children[0].value).toBe(
          'valueWrapperEmptyNoAd'
        );
        // TRacking has been done
        expect(trackCalls.length).toBe(1);
        expect(trackCalls[0].templates).toEqual([
          'http://example.com/wrapper-empty_wrapper-error',
          'http://example.com/empty-no-ad',
        ]);
        expect(trackCalls[0].variables).toEqual({ ERRORCODE: 303 });
      });
    });

    describe('Ad with no creatives', () => {
      it('should emits a VAST-error & track', async () => {
        const url = './spec/samples/empty-no-creative.xml';
        const response = await nodeUrlHandler.get(url);

        const vastXML = await VastParser.parseVAST(response.xml);
        // Response doesn't have any ads
        expect(vastXML.ads).toEqual([]);
        // Error has been triggered
        expect(dataTriggered.length).toBe(1);
        expect(dataTriggered[0].ERRORCODE).toBe(303);
        expect(dataTriggered[0].extensions[0].children[0].name).toBe(
          'paramEmptyNoCreative'
        );
        expect(dataTriggered[0].extensions[0].children[0].value).toBe(
          'valueEmptyNoCreative'
        );
        // Tracking has been done;
        expect(trackCalls.length).toBe(1);
        expect(trackCalls[0].templates).toEqual([
          'http://example.com/empty-no-creative_inline-error',
        ]);
        expect(trackCalls[0].variables).toEqual({ ERRORCODE: 303 });
      });

      it('should emits a VAST-ERROR & track when wrapped', async () => {
        const url = './spec/samples/wrapper-empty-no-creative.xml';
        const response = await nodeUrlHandler.get(url);

        fetcher.setOptions({ ...options, url: url, previousUrl: url });
        VastParser.fetchingCallback = fetcher.fetchVAST.bind(fetcher);

        const vastXML = await VastParser.parseVAST(response.xml, {
          url: url,
          previousUrl: url,
        });
        // Response doesn't have any ads
        expect(vastXML.ads).toEqual([]);
        // Error has been triggered
        expect(dataTriggered.length).toBe(1);
        expect(dataTriggered[0].ERRORCODE).toBe(303);
        expect(dataTriggered[0].extensions[0].children[0].name).toBe(
          'paramWrapperEmptyNoCreative'
        );
        expect(dataTriggered[0].extensions[0].children[0].value).toBe(
          'valueWrapperEmptyNoCreative'
        );
        expect(dataTriggered[0].extensions[1].children[0].name).toBe(
          'paramEmptyNoCreative'
        );
        expect(dataTriggered[0].extensions[1].children[0].value).toBe(
          'valueEmptyNoCreative'
        );
        // Tracking has been done
        expect(trackCalls.length).toBe(1);
        expect(trackCalls[0].templates).toEqual([
          'http://example.com/wrapper-no-creative_wrapper-error',
          'http://example.com/empty-no-creative_inline-error',
        ]);
        expect(trackCalls[0].variables).toEqual({ ERRORCODE: 303 });
      });
    });

    describe('Wrapper URL unavailable/timeout', () => {
      it('should emits a VAST-error and track', async () => {
        const url = './spec/samples/wrapper-unavailable-url.xml';

        const response = await nodeUrlHandler.get(url);

        fetcher.setOptions({ ...options, url: url, previousUrl: url });
        VastParser.fetchingCallback = fetcher.fetchVAST.bind(fetcher);

        const vast = await VastParser.parseVAST(response.xml, {
          url: url,
          previousUrl: url,
        });
        // Response doesn't have any ads
        expect(vast.ads).toEqual([]);
        // Error has been trigered
        expect(dataTriggered.length).toBe(1);
        expect(dataTriggered[0].ERRORCODE).toBe(301);
        expect(dataTriggered[0].extensions[0].children[0].name).toBe(
          'paramWrapperInvalidXmlfile'
        );
        expect(dataTriggered[0].extensions[0].children[0].value).toBe(
          'valueWrapperInvalidXmlfile'
        );
        // Tracking has been done
        expect(trackCalls.length).toBe(1);
        expect(trackCalls[0].templates).toEqual([
          'http://example.com/wrapper-invalid-xmlfile_wrapper-error',
        ]);
        expect(trackCalls[0].variables).toEqual({ ERRORCODE: 301 });
      });
    });

    describe('Wrapper limit reached', () => {
      it('should emits a VAST-error & track', async () => {
        const url = './spec/samples/wrapper-b.xml';

        const response = await nodeUrlHandler.get(url);

        fetcher.setOptions({ ...options, url: url, previousUrl: url });
        VastParser.fetchingCallback = fetcher.fetchVAST.bind(fetcher);

        const vastXML = await VastParser.parseVAST(response.xml, {
          url: url,
          previousUrl: url,
          wrapperLimit: 1,
        });
        // Response doesn't have any ads
        expect(vastXML.ads).toEqual([]);
        // Error has been triggered
        expect(dataTriggered.length).toBe(1);
        expect(dataTriggered[0].ERRORCODE).toBe(302);
        expect(dataTriggered[0].extensions.length).toBe(0);
        // Tracking has been done
        expect(trackCalls.length).toBe(1);
        expect(trackCalls[0].templates).toEqual([
          'http://example.com/wrapperB-error',
        ]);
        expect(trackCalls[0].variables).toEqual({ ERRORCODE: 302 });
      });
    });
    describe('Legacy', () => {
      let response = null;

      beforeEach((done) => {
        VastParser.removeAllListeners();
        vastClient
          .get('./spec/samples/wrapper-legacy.xml', options)
          .then((res) => {
            response = res;
            done();
          });
      });
      describe('should correctly loads a wrapped ad, even with the VASTAdTagURL-Tag', () => {
        it('should have found 1 ad', () => {
          expect(response.ads.length).toBe(1);
        });

        it('should have returned a VAST response object', () => {
          expect(response.ads.length).toBe(1);
          expect(response).toHaveProperty('ads');
          expect(response).toHaveProperty('errorURLTemplates');
          expect(response).toHaveProperty('version');
        });

        it('should have found 2 creatives', () => {
          expect(response.ads[0].creatives.length).toBe(2);
        });

        it('should have parsed mediafile attribute', () => {
          const mediafile = response.ads[0].creatives[1].mediaFiles[0];
          expect(mediafile.mimeType).toBe('video/mp4');
          expect(mediafile.width).toBe(400);
          expect(mediafile.height).toBe(300);
          expect(mediafile.fileURL).toBe(
            'https://iabtechlab.com/wp-content/uploads/2016/07/VAST-4.0-Short-Intro.mp4'
          );
          expect(mediafile.bitrate).toBe(500);
          expect(mediafile.minBitrate).toBe(360);
          expect(mediafile.maxBitrate).toBe(1080);
          expect(mediafile.scalable).toBe(true);
        });
      });
    });
  });

  describe('resolveAds', () => {
    it('updates previousUrl value and calls resolveWrappers for each ad', () => {
      jest
        .spyOn(VastParser, 'resolveWrappers')
        .mockReturnValue(Promise.resolve(['ad1', 'ad2']));
      return VastParser.resolveAds(['ad1', 'ad2'], {
        wrapperDepth: 1,
        previousUrl: wrapperBVastUrl,
        url: inlineSampleVastUrl,
      }).then(() => {
        expect(VastParser.resolveWrappers).toHaveBeenCalledTimes(2);
        expect(VastParser.resolveWrappers.mock.calls).toEqual([
          ['ad1', 1, inlineSampleVastUrl],
          ['ad2', 1, inlineSampleVastUrl],
        ]);
      });
    });
  });

  describe('resolveWrappers', () => {
    const ad = {
      id: null,
      sequence: 1,
      system: { value: 'VAST', version: null },
      title: null,
      description: null,
      advertiser: null,
      pricing: null,
      survey: null,
      errorURLTemplates: ['http://example.com/wrapperA-error'],
      impressionURLTemplates: [],
      creatives: [],
      extensions: [],
      adVerifications: [],
      trackingEvents: { nonlinear: [], linear: [] },
      videoClickTrackingURLTemplates: [],
      videoCustomClickURLTemplates: [],
      viewableImpression: [],
    };

    beforeEach(() => {
      VastParser.previousUrl = wrapperAVastUrl;
      VastParser.initParsingStatus();
    });

    it('resolves with ad if there is no more wrappers', () => {
      return VastParser.resolveWrappers(ad, 0).then((res) => {
        expect(res).toEqual(ad);
      });
    });

    it('will add errorcode to resolved ad if parsing has reached maximum amount of unwrapping', () => {
      const adWithWrapper = { ...ad, nextWrapperURL: 'http://example.com/foo' };
      VastParser.fetchingCallback = () => {};
      VastParser.maxWrapperDepth = 10;
      return VastParser.resolveWrappers(adWithWrapper, 10, null).then((res) => {
        expect(res).toEqual({
          ...ad,
          errorCode: 302,
        });
      });
    });

    it('will successfully fetch the next wrapper url if it is provided', () => {
      const adWithWrapper = { ...ad, nextWrapperURL: wrapperBVastUrl };

      jest
        .spyOn(fetcher, 'fetchVAST')
        .mockReturnValue(Promise.resolve(expect.any(Object)));
      VastParser.fetchingCallback = fetcher.fetchVAST;

      jest
        .spyOn(VastParser, 'parse')
        .mockImplementation(() => Promise.resolve([ad]));
      jest.spyOn(parserUtils, 'mergeWrapperAdData');
      VastParser.maxWrapperDepth = 10;

      return VastParser.resolveWrappers(adWithWrapper, 0, wrapperAVastUrl).then(
        (res) => {
          expect(fetcher.fetchVAST).toHaveBeenCalledWith({
            url: wrapperBVastUrl,
            maxWrapperDepth: VastParser.maxWrapperDepth,
            emitter: expect.any(Function),
          });
          expect(VastParser.parse).toHaveBeenCalledWith(expect.any(Object), {
            url: wrapperBVastUrl,
            previousUrl: wrapperAVastUrl,
            wrapperSequence: 1,
            wrapperDepth: 1,
          });
          expect(parserUtils.mergeWrapperAdData).toBeCalled();
          expect(res).toHaveLength(1);
        }
      );
    });

    it('will pass timeout error to ad if fetching next wrapper fails', () => {
      const adWithWrapper = { ...ad, nextWrapperURL: wrapperBVastUrl };
      jest.spyOn(fetcher, 'fetchVAST').mockImplementation(() => {
        return Promise.reject(new Error('timeout'));
      });
      VastParser.fetchingCallback = fetcher.fetchVAST;
      jest.spyOn(VastParser, 'parse');
      jest.spyOn(parserUtils, 'mergeWrapperAdData');
      VastParser.maxWrapperDepth = 10;

      return VastParser.resolveWrappers(adWithWrapper, 0, wrapperAVastUrl).then(
        (res) => {
          expect(fetcher.fetchVAST).toHaveBeenCalledWith({
            url: wrapperBVastUrl,
            maxWrapperDepth: VastParser.maxWrapperDepth,
            emitter: expect.any(Function),
          });
          expect(VastParser.parse).not.toHaveBeenCalled();
          expect(parserUtils.mergeWrapperAdData).not.toBeCalled();
          expect(res).toEqual(
            expect.objectContaining({
              errorCode: 301,
              errorMessage: 'timeout',
            })
          );
        }
      );
    });

    it('will take the allowMultipleAds value from the option', () => {
      jest
        .spyOn(fetcher, 'fetchVAST')
        .mockReturnValue(Promise.resolve('<xml></xml>'));
      VastParser.fetchingCallback = fetcher.fetchVAST;
      jest.spyOn(VastParser, 'parse').mockReturnValue(Promise.resolve());

      const adWithWrapper = {
        ...ad,
        nextWrapperURL: wrapperBVastUrl,
        allowMultipleAds: false,
      };

      const expectedValue = { allowMultipleAds: true };
      VastParser.initParsingStatus(expectedValue);

      return VastParser.resolveWrappers(adWithWrapper, 0).then(() => {
        expect(VastParser.parse).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining(expectedValue)
        );
      });
    });

    it('will take the allowMultipleAds value from the ad if does not set in the option', () => {
      jest
        .spyOn(fetcher, 'fetchVAST')
        .mockReturnValue(Promise.resolve('<xml></xml>'));
      VastParser.fetchingCallback = fetcher.fetchVAST;
      jest.spyOn(VastParser, 'parse').mockReturnValue(Promise.resolve());

      const expectedValue = { allowMultipleAds: true };
      const adWithWrapper = {
        ...ad,
        nextWrapperURL: wrapperBVastUrl,
        ...expectedValue,
      };
      VastParser.initParsingStatus();

      return VastParser.resolveWrappers(adWithWrapper, 0).then(() => {
        expect(VastParser.parse).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining(expectedValue)
        );
      });
    });
  });

  describe('getEstimatedBitrate', () => {
    it('should return value from imported estimatedBitrate', () => {
      Bitrate.estimatedBitrate = 42;
      expect(VastParser.getEstimatedBitrate()).toEqual(42);
    });
  });
});
