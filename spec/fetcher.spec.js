import { Fetcher } from '../src/fetcher';
import { VASTParser } from '../src/parser/vast_parser';
import * as Bitrate from '../src/parser/bitrate';
import { urlHandler } from '../src/url_handler';
import { expect } from '@jest/globals';

describe('Fetcher', () => {
  let fetcher, vastParser;
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

  beforeEach(() => {
    fetcher = new Fetcher();
    vastParser = new VASTParser();
    jest.spyOn(vastParser, 'emit');
  });

  describe('fetchVAST', () => {
    const url = 'www.foo.foo';

    describe('on resolved', () => {
      beforeEach(() => {
        fetcher.setOptions({
          wrapperLimit: 8,
          urlHandler: urlHandlerSuccess,
        });
      });

      it('should applies url filters', () => {
        fetcher.URLTemplateFilters = [(url) => url.replace('foo', 'bar')];
        let urlHandlerSpy = jest.spyOn(fetcher.urlHandler, 'get');
        const expectedUrl = 'www.bar.foo';

        fetcher
          .fetchVAST(url, {}, 5, () => {})
          .then(() => {
            expect(urlHandlerSpy).toHaveBeenCalledWith(
              expectedUrl,
              expect.anything(),
              expect.anything()
            );
          });
      });

      it('should emits VAST-resolving and VAST-resolved events with a filtered url', () => {
        fetcher.URLTemplateFilters = [(url) => url.replace('foo', 'bar')];
        const expectedUrl = 'www.bar.foo';
        fetcher
          .fetchVAST(url, {}, 4, vastParser.emit.bind(vastParser))
          .then(() => {
            expect(vastParser.emit).toHaveBeenNthCalledWith(
              1,
              'VAST-resolving',
              {
                url: expectedUrl,
                previousUrl: null,
                wrapperDepth: 0,
                maxWrapperDepth: 4,
                timeout: 120000,
                wrapperAd: null,
              }
            );

            expect(vastParser.emit).toHaveBeenNthCalledWith(
              2,
              'VAST-resolved',
              {
                url: expectedUrl,
                byteLength: 1234,
                duration: expect.any(Number),
                error: null,
                statusCode: 200,
                previousUrl: null,
                wrapperDepth: 0,
              }
            );
          });
      });

      it('should updates the estimated bitrate', () => {
        jest.spyOn(Bitrate, 'updateEstimatedBitrate');
        return fetcher
          .fetchVAST(url, {}, 5, () => {})
          .finally(() => {
            expect(Bitrate.updateEstimatedBitrate).toHaveBeenCalledWith(
              1234,
              expect.any(Number)
            );
          });
      });

      it('should resolves with xml', () => {
        let result = fetcher.fetchVAST(url, {}, 5, () => {});
        expect(result).resolves.toEqual(xml);
      });
    });

    describe('on rejected', () => {
      beforeEach(() => {
        fetcher.setOptions({
          wrapperLimit: 5,
          urlHandler: urlHandlerFailure,
        });
      });

      it('should applies url filters', () => {
        fetcher.URLTemplateFilters = [(url) => url.replace('foo', 'bar')];
        let urlHandlerSpy = jest.spyOn(fetcher.urlHandler, 'get');
        const expectedUrl = 'www.bar.foo';

        fetcher
          .fetchVAST(url, {}, 5, () => {})
          .catch(() => {
            expect(urlHandlerSpy).toHaveBeenCalledWith(
              expectedUrl,
              expect.anything(),
              expect.anything()
            );
          });
      });

      it('should emits VAST-resolving and VAST-resolved events with a filtered url', () => {
        fetcher.URLTemplateFilters = [(url) => url.replace('foo', 'bar')];
        const expectedUrl = 'www.bar.foo';

        fetcher
          .fetchVAST(url, {}, 4, vastParser.emit.bind(vastParser))
          .catch(() => {
            expect(vastParser.emit).toHaveBeenNthCalledWith(
              1,
              'VAST-resolving',
              {
                url: expectedUrl,
                previousUrl: null,
                wrapperDepth: 0,
                maxWrapperDepth: 4,
                timeout: 120000,
                wrapperAd: null,
              }
            );

            expect(vastParser.emit).toHaveBeenNthCalledWith(
              2,
              'VAST-resolved',
              {
                url: expectedUrl,
                duration: expect.any(Number),
                error: new Error('timeout'),
                statusCode: 408,
                previousUrl: null,
                wrapperDepth: 0,
              }
            );
          });
      });

      it('should rejects with error', () => {
        let result = fetcher.fetchVAST(url, {}, 5, () => {});
        expect(result).rejects.toEqual(new Error('timeout'));
      });
    });
  });

  describe('setOptions', () => {
    it('should assign option to properties', () => {
      const urlhandler = jest.fn();
      fetcher.setOptions({
        urlHandler: urlhandler,
        timeout: 50000,
        withCredentials: true,
      });
      expect(fetcher.urlHandler).toEqual(urlhandler);
      expect(fetcher.fetchingOptions.timeout).toEqual(50000);
      expect(fetcher.fetchingOptions.withCredentials).toEqual(true);
    });

    it('should assign default option when no options are given', () => {
      fetcher.setOptions();
      expect(fetcher.urlHandler).toEqual(urlHandler);
      expect(fetcher.fetchingOptions.timeout).toEqual(120000);
      expect(fetcher.fetchingOptions.withCredentials).toEqual(false);
    });
  });
});
