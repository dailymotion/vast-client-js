import { VASTParser } from '../src/parser/vast_parser';
import { nodeURLHandler } from '../src/urlhandlers/node_url_handler';
import { urlFor, fetchXml } from './utils/utils';
import { util } from '../src/util/util';
import { parserUtils } from '../src/parser/parser_utils';

const xml = new DOMParser().parseFromString('<VAST></VAST>', 'text/xml');
const urlHandlerSuccess = {
  get: (url, options, cb) => {
    cb(null, xml, { byteLength: 1234, statusCode: 200 });
  },
};
const urlHandlerFailure = {
  get: (url, options, cb) => {
    cb(new Error('timeout'), null, { statusCode: 408 });
  },
};

const wrapperAVastUrl = urlFor('wrapper-a.xml');
const wrapperBVastUrl = urlFor('wrapper-b.xml');
const inlineSampleVastUrl = urlFor('sample.xml');
const inlineVpaidVastUrl = urlFor('vpaid.xml');
const inlineInvalidVastUrl = urlFor('invalid-xmlfile.xml');
const wrapperWithAttributesVastUrl = urlFor(
  'wrapper-attributes-multiple-ads.xml'
);
const wrapperInvalidVastUrl = urlFor('wrapper-invalid-xmlfile.xml');
const vastWithErrorUrl = urlFor('empty-no-ad.xml');

describe('VASTParser', () => {
  let VastParser;
  let inlineXml, invalidXml, errorXml, wrapperXml;

  beforeAll((done) => {
    return Promise.all([
      fetchXml(inlineInvalidVastUrl),
      fetchXml(inlineSampleVastUrl),
      fetchXml(vastWithErrorUrl),
      fetchXml(wrapperWithAttributesVastUrl),
    ]).then(([invalid, inline, error, wrapper]) => {
      invalidXml = invalid.xml;
      inlineXml = inline.xml;
      errorXml = error.xml;
      wrapperXml = wrapper.xml;
      done();
    });
  });

  beforeEach(() => {
    VastParser = new VASTParser();
    jest.spyOn(VastParser, 'emit');
  });

  describe('fetchVAST', () => {
    describe('on resolved', () => {
      beforeEach(() => {
        VastParser.initParsingStatus({
          wrapperLimit: 8,
          urlHandler: urlHandlerSuccess,
        });
      });

      it('applies url filters and saves url in parentURLs', () => {
        VastParser.URLTemplateFilters = [(url) => url.replace('foo', 'bar')];

        return VastParser.fetchVAST('www.foo.foo').finally(() => {
          expect(VastParser.parentURLs).toEqual(['www.bar.foo']);
        });
      });

      it('emits VAST-resolving and VAST-resolved events', () => {
        return VastParser.fetchVAST(
          'www.foo.foo',
          2,
          'www.original.foo'
        ).finally(() => {
          expect(VastParser.emit).toHaveBeenNthCalledWith(1, 'VAST-resolving', {
            url: 'www.foo.foo',
            previousUrl: 'www.original.foo',
            wrapperDepth: 2,
            maxWrapperDepth: 8,
            timeout: 120000,
          });

          expect(VastParser.emit).toHaveBeenNthCalledWith(2, 'VAST-resolved', {
            url: 'www.foo.foo',
            previousUrl: 'www.original.foo',
            wrapperDepth: 2,
            error: null,
            duration: expect.any(Number),
            byteLength: 1234,
            statusCode: 200,
          });
        });
      });

      it('resolves with xml', () => {
        return expect(
          VastParser.fetchVAST('www.foo.foo', 2, 'www.original.foo')
        ).resolves.toEqual(xml);
      });
    });

    describe('on rejected', () => {
      beforeEach(() => {
        VastParser.initParsingStatus({
          wrapperLimit: 8,
          urlHandler: urlHandlerFailure,
        });
      });

      it('applies url filters and saves url in parentURLs', () => {
        VastParser.URLTemplateFilters = [(url) => url.replace('foo', 'bar')];

        return VastParser.fetchVAST('www.foo.foo')
          .then(() => {
            expect(true).toBeFalsy();
          })
          .catch(() => {
            expect(VastParser.parentURLs).toEqual(['www.bar.foo']);
          });
      });

      it('emits VAST-resolving and VAST-resolved events', () => {
        return VastParser.fetchVAST('www.foo.foo', 2, 'www.original.foo')
          .then(() => {
            expect(true).toBeFalsy();
          })
          .catch(() => {
            expect(VastParser.emit).toHaveBeenNthCalledWith(
              1,
              'VAST-resolving',
              {
                url: 'www.foo.foo',
                previousUrl: 'www.original.foo',
                wrapperDepth: 2,
                maxWrapperDepth: 8,
                timeout: 120000,
              }
            );

            expect(VastParser.emit).toHaveBeenNthCalledWith(
              2,
              'VAST-resolved',
              {
                url: 'www.foo.foo',
                previousUrl: 'www.original.foo',
                wrapperDepth: 2,
                error: new Error('timeout'),
                duration: expect.any(Number),
                statusCode: 408,
              }
            );
          });
      });

      it('rejects with error', () => {
        return expect(
          VastParser.fetchVAST('www.foo.foo', 2, 'www.original.foo')
        ).rejects.toEqual(new Error('timeout'));
      });
    });
  });

  describe('initParsingStatus', () => {
    it('assigns options to properties', () => {
      const urlHandler = jest.fn();
      VastParser.initParsingStatus({
        wrapperLimit: 5,
        timeout: 1000,
        withCredentials: true,
        urlHandler,
        allowMultipleAds: true,
      });

      expect(VastParser.rootURL).toBe('');
      expect(VastParser.remainingAds).toEqual([]);
      expect(VastParser.parentURLs).toEqual([]);
      expect(VastParser.errorURLTemplates).toEqual([]);
      expect(VastParser.rootErrorURLTemplates).toEqual([]);
      expect(VastParser.maxWrapperDepth).toBe(5);
      expect(VastParser.fetchingOptions).toEqual({
        timeout: 1000,
        withCredentials: true,
      });
      expect(VastParser.urlHandler).toEqual(urlHandler);
      expect(VastParser.vastVersion).toBeNull();
      expect(VastParser.parsingOptions).toEqual({ allowMultipleAds: true });
    });

    it('uses default values if no options are passed', () => {
      VastParser.initParsingStatus();

      expect(VastParser.rootURL).toBe('');
      expect(VastParser.remainingAds).toEqual([]);
      expect(VastParser.parentURLs).toEqual([]);
      expect(VastParser.errorURLTemplates).toEqual([]);
      expect(VastParser.rootErrorURLTemplates).toEqual([]);
      expect(VastParser.maxWrapperDepth).toBe(10);
      expect(VastParser.fetchingOptions).toEqual({
        timeout: 120000,
        withCredentials: undefined,
      });
      expect(VastParser.vastVersion).toBeNull();
      expect(VastParser.parsingOptions).toEqual({
        allowMultipleAds: undefined,
      });
    });
  });

  describe('getAndParseVAST', () => {
    beforeEach(() => {
      jest.spyOn(VastParser, 'initParsingStatus');
      jest.spyOn(VastParser, 'fetchVAST');
      jest.spyOn(VastParser, 'parse');
      jest.spyOn(VastParser, 'buildVASTResponse');
    });

    it('passes options to initParsingStatus and assigns rootUrl', () => {
      VastParser.getAndParseVAST(wrapperAVastUrl, {
        wrapperLimit: 8,
        urlHandler: nodeURLHandler,
      });

      expect(VastParser.initParsingStatus).toHaveBeenCalledWith({
        wrapperLimit: 8,
        urlHandler: nodeURLHandler,
      });
      expect(VastParser.rootURL).toBe(wrapperAVastUrl);
    });

    describe('on success', () => {
      it('calls fetchVast with correct params multiple times', () => {
        return VastParser.getAndParseVAST(wrapperAVastUrl, {
          wrapperLimit: 8,
          urlHandler: nodeURLHandler,
        }).finally(() => {
          expect(VastParser.fetchVAST).toHaveBeenCalledTimes(4);
          expect(VastParser.fetchVAST.mock.calls).toEqual(
            expect.arrayContaining([
              [wrapperAVastUrl],
              [wrapperBVastUrl, 1, wrapperAVastUrl],
              [inlineVpaidVastUrl, 1, wrapperAVastUrl],
              [inlineSampleVastUrl, 2, wrapperBVastUrl],
              [inlineSampleVastUrl, 2, wrapperBVastUrl],
            ])
          );
        });
      });

      it('emits events in the right order', () => {
        return VastParser.getAndParseVAST(wrapperAVastUrl, {
          wrapperLimit: 8,
          urlHandler: nodeURLHandler,
        }).finally(() => {
          expect(VastParser.emit).toHaveBeenCalledTimes(14);
          expect(VastParser.emit.mock.calls).toEqual(
            expect.arrayContaining([
              // WRAPPER A
              [
                'VAST-resolving',
                {
                  url: wrapperAVastUrl,
                  previousUrl: null,
                  wrapperDepth: 0,
                  maxWrapperDepth: 8,
                  timeout: 120000,
                },
              ],
              [
                'VAST-resolved',
                {
                  url: wrapperAVastUrl,
                  previousUrl: null,
                  wrapperDepth: 0,
                  error: null,
                  duration: expect.any(Number),
                  byteLength: expect.any(Number),
                },
              ],
              [
                'VAST-ad-parsed',
                {
                  type: 'WRAPPER',
                  url: wrapperAVastUrl,
                  wrapperDepth: 0,
                  adIndex: 0,
                  vastVersion: '2.0',
                },
              ],
              [
                'VAST-ad-parsed',
                {
                  type: 'WRAPPER',
                  url: wrapperAVastUrl,
                  wrapperDepth: 0,
                  adIndex: 1,
                  vastVersion: '2.0',
                },
              ],
              // RESOLVING AD 1 (WRAPPER B) IN WRAPPER A
              [
                'VAST-resolving',
                {
                  url: wrapperBVastUrl,
                  previousUrl: wrapperAVastUrl,
                  wrapperDepth: 1,
                  maxWrapperDepth: 8,
                  timeout: 120000,
                },
              ],
              // RESOLVING AD 2 (WRAPPER VPAID) IN WRAPPER A
              [
                'VAST-resolving',
                {
                  url: inlineVpaidVastUrl,
                  previousUrl: wrapperAVastUrl,
                  wrapperDepth: 1,
                  maxWrapperDepth: 8,
                  timeout: 120000,
                },
              ],
              // AD 1 (WRAPPER B) IN WRAPPER A
              [
                'VAST-resolved',
                {
                  url: wrapperBVastUrl,
                  previousUrl: wrapperAVastUrl,
                  wrapperDepth: 1,
                  error: null,
                  duration: expect.any(Number),
                  byteLength: expect.any(Number),
                },
              ],
              [
                'VAST-ad-parsed',
                {
                  type: 'WRAPPER',
                  url: wrapperBVastUrl,
                  wrapperDepth: 1,
                  adIndex: 0,
                  vastVersion: '2.0',
                },
              ],
              // AD 1 (WRAPPER SAMPLE) IN WRAPPER B
              [
                'VAST-resolving',
                {
                  url: inlineSampleVastUrl,
                  previousUrl: wrapperBVastUrl,
                  wrapperDepth: 2,
                  maxWrapperDepth: 8,
                  timeout: 120000,
                },
              ],
              // AD 2 (WRAPPER VPAID) IN WRAPPER A
              [
                'VAST-resolved',
                {
                  url: inlineVpaidVastUrl,
                  previousUrl: wrapperAVastUrl,
                  wrapperDepth: 1,
                  error: null,
                  duration: expect.any(Number),
                  byteLength: expect.any(Number),
                },
              ],
              [
                'VAST-ad-parsed',
                {
                  type: 'INLINE',
                  url: inlineVpaidVastUrl,
                  wrapperDepth: 1,
                  adIndex: 0,
                  vastVersion: '2.0',
                },
              ],
              // AD 1 (WRAPPER SAMPLE) IN WRAPPER B
              [
                'VAST-resolved',
                {
                  url: inlineSampleVastUrl,
                  previousUrl: wrapperBVastUrl,
                  wrapperDepth: 2,
                  error: null,
                  duration: expect.any(Number),
                  byteLength: expect.any(Number),
                },
              ],
              [
                'VAST-ad-parsed',
                {
                  type: 'INLINE',
                  url: inlineSampleVastUrl,
                  wrapperDepth: 2,
                  adIndex: 0,
                  vastVersion: '2.1',
                },
              ],
              [
                'VAST-ad-parsed',
                {
                  type: 'INLINE',
                  url: inlineSampleVastUrl,
                  wrapperDepth: 2,
                  adIndex: 1,
                  vastVersion: '2.1',
                },
              ],
            ])
          );
        });
      });

      it('calls parse with correct params multiple times', () => {
        return VastParser.getAndParseVAST(wrapperAVastUrl, {
          wrapperLimit: 8,
          urlHandler: nodeURLHandler,
        }).finally(() => {
          expect(VastParser.parse).toHaveBeenCalledTimes(4);
          expect(VastParser.parse.mock.calls).toEqual(
            expect.arrayContaining([
              [
                jasmine.any(Object),
                {
                  wrapperLimit: 8,
                  urlHandler: nodeURLHandler,
                  previousUrl: wrapperAVastUrl,
                  isRootVAST: true,
                  url: wrapperAVastUrl,
                },
              ],
              [
                jasmine.any(Object),
                {
                  url: wrapperBVastUrl,
                  previousUrl: wrapperAVastUrl,
                  wrapperDepth: 1,
                  wrapperSequence: null,
                  allowMultipleAds: false,
                  followAdditionalWrappers: true,
                },
              ],
              [
                jasmine.any(Object),
                {
                  url: inlineSampleVastUrl,
                  previousUrl: wrapperBVastUrl,
                  wrapperDepth: 2,
                  wrapperSequence: null,
                  allowMultipleAds: false,
                  followAdditionalWrappers: true,
                },
              ],
              [
                jasmine.any(Object),
                {
                  url: inlineSampleVastUrl,
                  previousUrl: wrapperBVastUrl,
                  wrapperDepth: 2,
                  wrapperSequence: null,
                  allowMultipleAds: false,
                  followAdditionalWrappers: true,
                },
              ],
            ])
          );
        });
      });

      it('calls buildVASTResponse with correct params one time', () => {
        return VastParser.getAndParseVAST(wrapperAVastUrl, {
          wrapperLimit: 8,
          urlHandler: nodeURLHandler,
        }).finally(() => {
          expect(VastParser.buildVASTResponse).toBeCalledTimes(1);
        });
      });
    });

    describe('on failure', () => {
      it('fails on bad fetch request', () => {
        return VastParser.getAndParseVAST('badUrl', {
          urlHandler: nodeURLHandler,
        })
          .then(() => {
            expect(true).toBeFalsy();
          })
          .catch((e) => {
            expect(e).toBeTruthy();
            expect(VastParser.parse).not.toBeCalled();
          });
      });

      describe('invalid VAST xml', () => {
        it('when inline, rejects with error', () => {
          return VastParser.getAndParseVAST(inlineInvalidVastUrl, {
            urlHandler: nodeURLHandler,
          })
            .then(() => {
              expect(true).toBeFalsy();
            })
            .catch((e) => {
              expect(e.message).toEqual('Invalid VAST XMLDocument');
              expect(VastParser.buildVASTResponse).not.toBeCalled();
            });
        });
        it('when wrapped, emits a VAST-error & track', (done) => {
          const errorData = [];
          const trackCalls = [];
          VastParser.on('VAST-error', (data) => errorData.push(data));
          jest
            .spyOn(util, 'track')
            .mockImplementation((templates, variables) => {
              trackCalls.push({ templates, variables });
            });

          return VastParser.getAndParseVAST(wrapperInvalidVastUrl, {
            urlHandler: nodeURLHandler,
          }).then((res) => {
            expect(res.ads).toHaveLength(0);
            expect(errorData).toHaveLength(1);
            expect(errorData[0]).toEqual({
              ERRORCODE: 301,
              ERRORMESSAGE: 'Invalid VAST XMLDocument',
              extensions: [
                {
                  attributes: {},
                  name: 'Extension',
                  value: null,
                  children: [
                    {
                      attributes: {},
                      name: 'paramWrapperInvalidXmlfile',
                      value: 'valueWrapperInvalidXmlfile',
                      children: [],
                    },
                  ],
                },
              ],
              system: { value: 'VAST', version: null },
            });

            expect(trackCalls).toHaveLength(1);
            expect(trackCalls[0]).toEqual({
              templates: [
                'http://example.com/wrapper-invalid-xmlfile_wrapper-error',
              ],
              variables: { ERRORCODE: 301 },
            });
            done();
          });
        });
      });
    });
  });

  describe('parseVastXml', () => {
    it('handles invalid XML vast', () => {
      try {
        VastParser.parseVastXml(invalidXml, {
          isRootVAST: true,
          url: inlineInvalidVastUrl,
          wrapperDepth: 0,
        });
        expect(true).toBeFalsy();
      } catch (e) {
        expect(e.message).toBe('Invalid VAST XMLDocument');
        expect(VastParser.emit).toHaveBeenLastCalledWith('VAST-ad-parsed', {
          type: 'ERROR',
          url: inlineInvalidVastUrl,
          wrapperDepth: 0,
        });
      }
    });

    it('gets vast version from original vast', () => {
      VastParser.parseVastXml(inlineXml, {
        isRootVAST: true,
        url: inlineSampleVastUrl,
        wrapperDepth: 0,
      });
      expect(VastParser.vastVersion).toBe('2.1');
    });

    it('handles Error tag for root VAST', () => {
      VastParser.parseVastXml(errorXml, { isRootVAST: true });
      expect(VastParser.rootErrorURLTemplates).toEqual([
        'http://example.com/empty-no-ad',
      ]);
    });

    it('handles Error tag for not root VAST', () => {
      VastParser.parseVastXml(errorXml, { isRootVAST: false });
      expect(VastParser.errorURLTemplates).toEqual([
        'http://example.com/empty-no-ad',
      ]);
    });

    it('handles Ad tag', () => {
      const ads = VastParser.parseVastXml(inlineXml, {
        isRootVAST: true,
        url: inlineSampleVastUrl,
        wrapperDepth: 0,
        allowMultipleAds: true,
      });

      expect(ads).toHaveLength(2);
      expect(VastParser.emit).toHaveBeenCalledTimes(2);
      expect(VastParser.emit.mock.calls).toEqual([
        [
          'VAST-ad-parsed',
          {
            adIndex: 0,
            type: 'INLINE',
            url: inlineSampleVastUrl,
            wrapperDepth: 0,
            vastVersion: '2.1',
          },
        ],
        [
          'VAST-ad-parsed',
          {
            adIndex: 1,
            type: 'INLINE',
            url: inlineSampleVastUrl,
            wrapperDepth: 0,
            vastVersion: '2.1',
          },
        ],
      ]);
    });
  });

  describe('parse', () => {
    it('calls parseVastXml with passed options', () => {
      jest.spyOn(VastParser, 'parseVastXml');

      return VastParser.parse(inlineXml, {
        url: inlineSampleVastUrl,
        previousUrl: wrapperBVastUrl,
        resolveAll: true,
        wrapperSequence: 1,
        wrapperDepth: 0,
        isRootVAST: true,
      }).then(() => {
        expect(VastParser.parseVastXml).toHaveBeenCalledWith(inlineXml, {
          isRootVAST: true,
          url: inlineSampleVastUrl,
          wrapperDepth: 0,
        });
      });
    });

    it('rejects if parsing xml failed', () => {
      jest.spyOn(VastParser, 'parseVastXml');

      return VastParser.parse(invalidXml, {
        url: inlineInvalidVastUrl,
        previousUrl: wrapperBVastUrl,
        resolveAll: true,
        wrapperSequence: 1,
        wrapperDepth: 0,
        isRootVAST: true,
      })
        .then(() => {
          expect(true).toBeFalsy();
        })
        .catch((e) => {
          expect(e.message).toBe('Invalid VAST XMLDocument');
        });
    });

    it('resolves first ad and saves remaining ads if resolveAll is false', () => {
      return VastParser.parse(inlineXml, {
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
      return VastParser.parse(wrapperXml).then((ads) => {
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

  describe('resolveAds', () => {
    it('updates previousUrl value and calls resolveWrappers for each ad', () => {
      jest
        .spyOn(VastParser, 'resolveWrappers')
        .mockImplementation(() => Promise.resolve(['ad1', 'ad2']));
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
    };

    beforeEach(() => {
      VastParser.previousUrl = wrapperAVastUrl;
      VastParser.initParsingStatus({ urlHandler: urlHandlerSuccess });
    });

    it('resolves with ad if there is no more wrappers', () => {
      return VastParser.resolveWrappers(ad, 0).then((res) => {
        expect(res).toEqual(ad);
      });
    });

    it('will add errorcode to resolved ad if parsing has reached maximum amount of unwrapping', () => {
      const adWithWrapper = { ...ad, nextWrapperURL: 'http://example.com/foo' };
      VastParser.maxWrapperDepth = 10;
      return VastParser.resolveWrappers(adWithWrapper, 10).then((res) => {
        expect(res).toEqual({ ...ad, errorCode: 302 });
      });
    });

    it('will successfully fetch the next wrapper url if it is provided', () => {
      const adWithWrapper = { ...ad, nextWrapperURL: wrapperBVastUrl };
      jest.spyOn(VastParser, 'fetchVAST');
      jest
        .spyOn(VastParser, 'parse')
        .mockImplementation(() => Promise.resolve([ad]));
      jest.spyOn(parserUtils, 'mergeWrapperAdData');
      VastParser.maxWrapperDepth = 10;

      return VastParser.resolveWrappers(adWithWrapper, 0, wrapperAVastUrl).then(
        (res) => {
          expect(VastParser.fetchVAST).toHaveBeenCalledWith(
            wrapperBVastUrl,
            1,
            wrapperAVastUrl
          );
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
      VastParser.initParsingStatus({ urlHandler: urlHandlerFailure });
      const adWithWrapper = { ...ad, nextWrapperURL: wrapperBVastUrl };
      jest.spyOn(VastParser, 'fetchVAST');
      jest.spyOn(VastParser, 'parse');
      jest.spyOn(parserUtils, 'mergeWrapperAdData');
      VastParser.maxWrapperDepth = 10;

      return VastParser.resolveWrappers(adWithWrapper, 0, wrapperAVastUrl).then(
        (res) => {
          expect(VastParser.fetchVAST).toHaveBeenCalledWith(
            wrapperBVastUrl,
            1,
            wrapperAVastUrl
          );
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
        .spyOn(VastParser, 'fetchVAST')
        .mockReturnValue(Promise.resolve('<xml></xml>'));
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
        .spyOn(VastParser, 'fetchVAST')
        .mockReturnValue(Promise.resolve('<xml></xml>'));
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
});
