import { Fetcher } from '../src/fetcher/fetcher';
import { VASTParser } from '../src/parser/vast_parser';
import * as Bitrate from '../src/parser/bitrate';
import { urlHandler } from '../src/fetcher/url_handler';
import { expect } from '@jest/globals';
import { getNodesFromXml } from './utils/utils';

describe('Fetcher', () => {
  let fetcher, mockEmit;
  const xml = getNodesFromXml('<VAST></VAST>');
  const urlHandlerSuccess = {
    get: (url, option) =>
      new Promise((resolve, _) =>
        resolve({ xml, details: { byteLength: 1234, statusCode: 200 } })
      ),
  };

  const urlHandlerFailure = {
    get: (url, option) =>
      new Promise((_, reject) =>
        reject({ error: new Error('AbortError'), statusCode: 408 })
      ),
  };

  beforeEach(() => {
    fetcher = new Fetcher();
    mockEmit = jest.fn();
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
          .fetchVAST({ url: url, maxWrapperDepth: 5, emitter: () => {} })
          .then(() => {
            expect(urlHandlerSpy).toHaveBeenCalledWith(
              expectedUrl,
              expect.any(Object)
            );
          });
      });

      it('should emits VAST-resolving and VAST-resolved events with a filtered url', () => {
        fetcher.URLTemplateFilters = [(url) => url.replace('foo', 'bar')];
        const expectedUrl = 'www.bar.foo';
        fetcher
          .fetchVAST({
            url: url,
            maxWrapperDepth: 4,
            emitter: mockEmit,
          })
          .then(() => {
            expect(mockEmit).toHaveBeenNthCalledWith(1, 'VAST-resolving', {
              url: expectedUrl,
              previousUrl: null,
              wrapperDepth: 0,
              maxWrapperDepth: 4,
              timeout: 120000,
              wrapperAd: null,
            });

            expect(mockEmit).toHaveBeenNthCalledWith(2, 'VAST-resolved', {
              url: expectedUrl,
              byteLength: 1234,
              duration: expect.any(Number),
              error: null,
              statusCode: 200,
              previousUrl: null,
              wrapperDepth: 0,
            });
          });
      });

      it('should updates the estimated bitrate', () => {
        jest.spyOn(Bitrate, 'updateEstimatedBitrate');
        fetcher
          .fetchVAST({ url: url, maxWrapperDepth: 5, emitter: () => {} })
          .then(() => {
            expect(Bitrate.updateEstimatedBitrate).toHaveBeenCalledWith(
              1234,
              expect.any(Number)
            );
          });
      });

      it('should resolves with xml', () => {
        let result = fetcher.fetchVAST({
          url: url,
          maxWrapperDepth: 5,
          emitter: () => {},
        });
        return expect(result).resolves.toEqual(xml);
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
          .fetchVAST({ url: url, maxWrapperDepth: 5, emitter: () => {} })
          .catch(() => {
            expect(urlHandlerSpy).toHaveBeenCalledWith(
              expectedUrl,
              expect.anything()
            );
          });
      });

      it('should emits VAST-resolving and VAST-resolved events with a filtered url', () => {
        fetcher.setOptions({});

        // We need to mock global.fetch since jest does not handle it.
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'internal server error',
        });

        fetcher.URLTemplateFilters = [(url) => url.replace('foo', 'bar')];
        const expectedUrl = 'www.bar.foo';

        fetcher
          .fetchVAST({
            url: url,
            maxWrapperDepth: 4,
            emitter: mockEmit,
          })
          .catch(() => {
            expect(mockEmit).toHaveBeenNthCalledWith(1, 'VAST-resolving', {
              url: expectedUrl,
              previousUrl: null,
              wrapperDepth: 0,
              maxWrapperDepth: 4,
              timeout: 120000,
              wrapperAd: null,
            });

            expect(mockEmit).toHaveBeenNthCalledWith(2, 'VAST-resolved', {
              url: expectedUrl,
              duration: expect.any(Number),
              error: expect.any(Error),
              statusCode: 500,
              previousUrl: null,
              wrapperDepth: 0,
            });
          });
      });

      it('should rejects with error', () => {
        let result = fetcher.fetchVAST({
          url: url,
          maxWrapperDepth: 5,
          emitter: () => {},
        });
        return expect(result).rejects.toEqual({
          error: new Error('AbortError'),
          statusCode: 408,
        });
      });
    });
  });

  describe('setOptions', () => {
    it('should assign options to properties', () => {
      const customUrlHandler = jest.fn();
      fetcher.setOptions({
        urlHandler: customUrlHandler,
        timeout: 50000,
        withCredentials: true,
      });
      expect(fetcher.urlHandler).toEqual(customUrlHandler);
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

  describe('URLtemplatefilter modifications', () => {
    let filter = jest.fn();
    beforeEach(() => {
      fetcher.URLTemplateFilters = [filter];
    });
    describe('addURLTemplateFilter', () => {
      it('add given urlTemplateFilters to the fetcher instance', () => {
        const myFilter = jest.fn();
        const anotherFilter = jest.fn();
        fetcher.addURLTemplateFilter(myFilter);
        fetcher.addURLTemplateFilter(anotherFilter);
        expect(fetcher.URLTemplateFilters).toEqual([
          filter,
          myFilter,
          anotherFilter,
        ]);
      });
      it('does not add given urlTemplateFilters when wrong type', () => {
        fetcher.addURLTemplateFilter(1);
        fetcher.addURLTemplateFilter('2');
        fetcher.addURLTemplateFilter(true);
        fetcher.addURLTemplateFilter();
        expect(fetcher.URLTemplateFilters.length).toBe(1);
      });
    });
    describe('clearURLTemplateFilters', () => {
      it('should clear URLTemplateFilters array', () => {
        fetcher.clearURLTemplateFilters();
        expect(fetcher.URLTemplateFilters).toEqual([]);
      });
    });

    describe('countURLTemplateFilters', () => {
      it('should return the length of URLTemplateFilters array', () => {
        let result = fetcher.countURLTemplateFilters();
        expect(result).toBe(1);
      });
    });

    describe('removeLastUrlTemplateFilter', () => {
      it('remove the last element of the URLTemplateFilters array', () => {
        fetcher.removeLastURLTemplateFilter();
        expect(fetcher.URLTemplateFilters.length).toBe(0);
      });
    });
  });
});
