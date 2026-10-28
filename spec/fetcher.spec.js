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
          .fetchVAST({ url: url, maxWrapperDepth: 5, emitter: () => { } })
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
              wrapperChainId: 0,
            });

            expect(mockEmit).toHaveBeenNthCalledWith(2, 'VAST-resolved', {
              url: expectedUrl,
              byteLength: 1234,
              duration: expect.any(Number),
              error: null,
              statusCode: 200,
              previousUrl: null,
              wrapperDepth: 0,
              wrapperChainId: 0,
            });
          });
      });

      it('should updates the estimated bitrate', () => {
        jest.spyOn(Bitrate, 'updateEstimatedBitrate');
        fetcher
          .fetchVAST({ url: url, maxWrapperDepth: 5, emitter: () => { } })
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
          emitter: () => { },
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
          .fetchVAST({ url: url, maxWrapperDepth: 5, emitter: () => { } })
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
              wrapperChainId: 0,
            });

            expect(mockEmit).toHaveBeenNthCalledWith(2, 'VAST-resolved', {
              url: expectedUrl,
              duration: expect.any(Number),
              error: expect.any(Error),
              statusCode: 500,
              previousUrl: null,
              wrapperDepth: 0,
              wrapperChainId: 0,
            });
          });
      });

      it('should rejects with error', () => {
        let result = fetcher.fetchVAST({
          url: url,
          maxWrapperDepth: 5,
          emitter: () => { },
        });
        return expect(result).rejects.toEqual({
          error: new Error('AbortError'),
          statusCode: 408,
        });
      });
    });
  });

  describe('urlHandler.get timeout', () => {
    const url = 'http://example.com/vast.xml';
    const timeout = 500;
    let originalFetch;

    // Rejects like fetch and response.text() do when the signal is aborted.
    const rejectOnAbort = (signal) =>
      new Promise((_, reject) => {
        signal.addEventListener('abort', () => {
          const error = new Error('The operation was aborted.');
          error.name = 'AbortError';
          reject(error);
        });
      });

    const flushPromises = async () => {
      for (let i = 0; i < 10; i++) {
        await Promise.resolve();
      }
    };

    beforeEach(() => {
      originalFetch = global.fetch;
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
      global.fetch = originalFetch;
    });

    it('should resolve with a 408 error, without throwing, when the response never arrives', async () => {
      global.fetch = jest.fn((_, options) => rejectOnAbort(options.signal));

      const result = urlHandler.get(url, { timeout });
      // Before the fix, the timer callback threw: in Node.js that is an
      // uncaught exception that ends the process.
      expect(() => jest.advanceTimersByTime(timeout)).not.toThrow();

      expect(global.fetch.mock.calls[0][1].signal.aborted).toBe(true);
      await expect(result).resolves.toEqual({
        error: expect.objectContaining({ name: 'AbortError' }),
        statusCode: 408,
      });
    });

    it('should resolve with a 408 error when the body stalls after the headers', async () => {
      let signal;
      global.fetch = jest.fn((_, options) => {
        signal = options.signal;
        return Promise.resolve({
          ok: true,
          status: 200,
          url,
          text: () => rejectOnAbort(signal),
        });
      });

      let settled = false;
      const result = urlHandler.get(url, { timeout });
      result.then(() => {
        settled = true;
      });
      await flushPromises(); // headers received, body pending

      expect(() => jest.advanceTimersByTime(timeout)).not.toThrow();
      await flushPromises();

      expect(signal.aborted).toBe(true);
      expect(settled).toBe(true);
      await expect(result).resolves.toEqual({
        error: expect.objectContaining({ name: 'AbortError' }),
        statusCode: 408,
      });
    });

    it('should not abort a body that completes before the timeout', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        url,
        text: () =>
          new Promise((resolve) => setTimeout(resolve, 100, '<VAST/>')),
      });

      const result = urlHandler.get(url, { timeout });
      await flushPromises();
      jest.advanceTimersByTime(100);

      await expect(result).resolves.toMatchObject({
        details: { statusCode: 200, rawXml: '<VAST/>' },
      });
      expect(global.fetch.mock.calls[0][1].signal.aborted).toBe(false);
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should resolve with the error when reading the body fails', async () => {
      const bodyError = new TypeError('terminated');
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        url,
        text: () => Promise.reject(bodyError),
      });

      await expect(urlHandler.get(url, { timeout })).resolves.toEqual({
        error: bodyError,
        statusCode: null,
      });
    });

    it('should leave no timer pending after an HTTP error or a network failure', async () => {
      const networkError = new TypeError('Failed to fetch');
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          url,
        })
        .mockRejectedValueOnce(networkError);

      await expect(urlHandler.get(url, { timeout })).resolves.toEqual({
        error: new Error('URLHandler: Not Found (404)'),
        statusCode: 404,
      });
      expect(jest.getTimerCount()).toBe(0);

      await expect(urlHandler.get(url, { timeout })).resolves.toEqual({
        error: networkError,
        statusCode: null,
      });
      expect(jest.getTimerCount()).toBe(0);
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

    it('should spread fetchOptions into fetchingOptions', () => {
      const fetchOptions = {
        headers: {
          'User-Agent': 'Custom User Agent',
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
      };

      fetcher.setOptions({
        fetchOptions,
      });

      expect(fetcher.fetchingOptions.headers).toEqual(fetchOptions.headers);
      expect(fetcher.fetchingOptions.cache).toEqual(fetchOptions.cache);
    });

    it('should not override timeout and withCredentials when using fetchOptions', () => {
      const fetchOptions = {
        timeout: 30000,
        withCredentials: false,
        headers: {
          'User-Agent': 'Custom User Agent',
        },
      };

      fetcher.setOptions({
        timeout: 60000,
        withCredentials: true,
        fetchOptions,
      });

      expect(fetcher.fetchingOptions.timeout).toEqual(60000);
      expect(fetcher.fetchingOptions.withCredentials).toEqual(true);
      expect(fetcher.fetchingOptions.headers).toEqual(fetchOptions.headers);
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
