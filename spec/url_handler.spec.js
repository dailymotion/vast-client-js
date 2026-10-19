import { urlHandler } from '../src/fetcher/url_handler';
import { Fetcher } from '../src/fetcher/fetcher';
import { util } from '../src/util/util';

const pendingFetch = (url, { signal }) =>
  new Promise((_, reject) => {
    signal.addEventListener('abort', () => {
      const error = new Error('The operation was aborted.');
      error.name = 'AbortError';
      reject(error);
    });
  });

describe('urlHandler', () => {
  beforeEach(() => {
    global.AbortController = class AbortController {
      constructor() {
        this.signal = {
          addEventListener: (type, listener) => {
            this.listener = type === 'abort' ? listener : this.listener;
          },
        };
      }

      abort() {
        this.listener();
      }
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    delete global.fetch;
    delete global.AbortController;
  });

  it('clears the timeout after a successful response', async () => {
    jest.useFakeTimers();
    jest.spyOn(util, 'isBrowserEnvironment').mockReturnValue(false);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      url: 'https://example.com/vast.xml',
      text: async () => '<VAST/>',
    });

    const result = await urlHandler.get('https://example.com/vast.xml', {
      timeout: 100,
      withCredentials: false,
    });

    expect(result.details.statusCode).toBe(200);
    expect(() => jest.advanceTimersByTime(100)).not.toThrow();
  });

  it('keeps an HTTP failure distinct from a request timeout', async () => {
    jest.useFakeTimers();
    jest.spyOn(util, 'isBrowserEnvironment').mockReturnValue(false);
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      url: 'https://example.com/vast.xml',
    });

    const result = await urlHandler.get('https://example.com/vast.xml', {
      timeout: 100,
      withCredentials: false,
    });

    expect(result).toEqual({
      error: new Error('URLHandler: Service Unavailable (503)'),
      statusCode: 503,
    });
    expect(() => jest.advanceTimersByTime(100)).not.toThrow();
  });

  it('aborts timed out requests without throwing outside the promise', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn(pendingFetch);

    const result = urlHandler.get('https://example.com/vast.xml', {
      timeout: 100,
      withCredentials: false,
    });

    expect(() => jest.advanceTimersByTime(100)).not.toThrow();
    await expect(result).resolves.toEqual({
      error: expect.objectContaining({ name: 'AbortError' }),
      statusCode: 408,
    });
  });

  it('reports timed out requests through the fetcher error path', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn(pendingFetch);
    const fetcher = new Fetcher();
    fetcher.setOptions({ timeout: 100 });
    const emitter = jest.fn();

    const result = fetcher.fetchVAST({
      url: 'https://example.com/vast.xml',
      maxWrapperDepth: 0,
      emitter,
    });
    const rejection = expect(result).rejects.toThrow('AbortError');

    expect(() => jest.advanceTimersByTime(100)).not.toThrow();
    await rejection;
    expect(emitter).toHaveBeenNthCalledWith(
      2,
      'VAST-resolved',
      expect.objectContaining({
        error: expect.objectContaining({ name: 'AbortError' }),
        statusCode: 408,
      })
    );
  });
});
