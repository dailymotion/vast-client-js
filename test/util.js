import should from 'should';
import sinon from 'sinon';
import { util } from '../src/util/util';

const now = new Date();
const playhead = '00:12:30.212';
const assetURI = 'http://example.com/linear-asset.mp4?foo=1&bar=_-[{bar';

const resolve = (URLTemplate, variables) =>
  util.resolveURLTemplates([URLTemplate], variables)[0];

const encodeRFC3986 = str => util.encodeURIComponentRFC3986(str);

const encodedAssetURI = encodeRFC3986(assetURI);
const encodedPlayhead = encodeRFC3986(playhead);
const encodedTimestamp = encodeRFC3986(now.toISOString());

describe('Util', function() {
  before(() => {
    this.clock = sinon.useFakeTimers(now.getTime());
  });

  after(() => {
    this.clock.restore();
  });

  describe('#resolveURLTemplates', function() {
    describe('assetURI', function() {
      it('should resolve assetURI', () =>
        resolve('http://test.com/?url=[ASSETURI]', {
          ASSETURI: assetURI
        }).should.match(`http://test.com/?url=${encodedAssetURI}`));

      it('should resolve assetURI, with percents', () =>
        resolve('http://test.com/?url=%%ASSETURI%%', {
          ASSETURI: assetURI
        }).should.match(`http://test.com/?url=${encodedAssetURI}`));
    });

    describe('cacheBusting', function() {
      it('should resolve cache busting', () =>
        resolve('http://test.com/[CACHEBUSTING]').should.match(
          /^http:\/\/test.com\/[0-9]+$/
        ));

      it('should resolve cache buster, with percents', () =>
        resolve('http://test.com/%%CACHEBUSTING%%', {
          CACHEBUSTING: 178
        }).should.match(/^http:\/\/test.com\/[0-9]+$/));
    });

    describe('contentPlayhead', function() {
      it('should resolve playhead', () =>
        resolve('http://test.com/[CONTENTPLAYHEAD]', {
          CONTENTPLAYHEAD: playhead
        }).should.equal(`http://test.com/${encodedPlayhead}`));

      it('should resolve playhead, with percents', () =>
        resolve('http://test.com/%%CONTENTPLAYHEAD%%', {
          CONTENTPLAYHEAD: playhead
        }).should.equal(`http://test.com/${encodedPlayhead}`));
    });

    describe('timestamp', function() {
      it('should resolve timestamp', () =>
        resolve('http://test.com/[TIMESTAMP]').should.equal(
          `http://test.com/${encodedTimestamp}`
        ));

      it('should resolve timestamp, with percents', () =>
        resolve('http://test.com/%%TIMESTAMP%%', {
          TIMESTAMP: 12345678
        }).should.equal(`http://test.com/${encodedTimestamp}`));
    });

    describe('random/RANDOM', function() {
      it('should resolve random', () =>
        resolve('http://test.com/[random]').should.match(
          /^http:\/\/test.com\/[0-9]+$/
        ));

      it('should resolve cache buster, with percents', () =>
        resolve('http://test.com/%%RANDOM%%').should.match(
          /^http:\/\/test.com\/[0-9]+$/
        ));
    });

    it('should resolve weird cases', () =>
      resolve('http://test.com/%%CONTENTPLAYHEAD%%&[CONTENTPLAYHEAD]', {
        CONTENTPLAYHEAD: 120
      }).should.equal('http://test.com/120&120'));

    it('should ignore other types than strings', () =>
      [undefined, null, false, 123, {}, () => {}].forEach(URLTemplate =>
        should(resolve(URLTemplate)).equal(undefined)
      ));
  });
});
