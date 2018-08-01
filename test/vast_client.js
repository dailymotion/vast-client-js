import path from 'path';
import should from 'should';
import sinon from 'sinon';
import { VASTClient } from '../src/vast_client';
import { NodeURLHandler } from '../src/urlhandlers/node_url_handler';

describe('VASTClient', () => {
  const urlfor = relpath =>
    `file://${path
      .resolve(path.dirname(module.filename), 'vastfiles', relpath)
      .replace(/\\/g, '/')}`;
  const urlhandler = new NodeURLHandler();
  const wrapperUrl = urlfor('wrapper-a.xml');

  describe('when cappingFreeLunch is set to 1', () => {
    const vastClient = new VASTClient(1);
    const options = {
      urlhandler
    };

    describe('the 1st call', () => {
      it('should be ignored', done => {
        vastClient.get(wrapperUrl, options).catch(err => {
          should.equal(
            err.message,
            'VAST call canceled – FreeLunch capping not reached yet 1/1'
          );
          done();
        });
      });

      it('totalCalls should be equal to 1', () => {
        vastClient.totalCalls.should.eql(1);
      });
    });

    describe('the 2nd call', () => {
      it('should be successfull', done => {
        vastClient
          .get(wrapperUrl, options)
          .then(response => {
            should.notEqual(response, null);
            done();
          })
          .catch(err => console.log(err));
      });

      it('totalCalls should be equal to 2', () => {
        vastClient.totalCalls.should.eql(2);
      });
    });
  });

  describe('when cappingMinimumTimeInterval is set to 30 seconds', () => {
    const vastClient = new VASTClient(0, 30000);
    const options = {
      urlhandler
    };

    describe('the 1st call', () => {
      it('should be successfull', done => {
        vastClient.get(wrapperUrl, options).then(response => {
          vastClient.lastSuccessfulAd = +new Date();
          should.notEqual(response, null);
          done();
        });
      });

      it('totalCalls should be equal to 3', () => {
        vastClient.totalCalls.should.eql(3);
      });
    });

    describe('the 2nd call (executed before 30 seconds)', () => {
      it('should be ignored', done => {
        console.log(options);
        vastClient.get(wrapperUrl, options).catch(err => {
          should.equal(
            err.message,
            'VAST call canceled – (30000)ms minimum interval reached'
          );
          done();
        });
      });

      it('totalCalls should be equal to 4', () => {
        vastClient.totalCalls.should.eql(4);
      });
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
      }
    };

    it('should use the custom storage', () => {
      const vastClient = new VASTClient(0, 0, customStorage);

      should.equal(getCount, 3);
      should.equal(setCount, 3);

      vastClient.lastSuccessfulAd;

      should.equal(getCount, 4);
    });
  });

  describe('get', () => {
    const vastClient = new VASTClient();
    const vastParser = vastClient.getParser();
    const options = {
      urlhandler,
      withCredentials: true
    };

    beforeEach('when called with options parameter', done => {
      vastParser.getAndParseVAST = sinon.spy();

      vastClient
        .get(wrapperUrl, options)
        .then(response => done())
        .catch(err => done());
    });

    it('should merge options', () => {
      const mergedOptions = {
        urlhandler,
        resolveAll: false,
        withCredentials: true,
        timeout: 0
      };

      sinon.assert.calledWith(
        vastParser.getAndParseVAST,
        wrapperUrl,
        mergedOptions
      );
    });
  });

  describe('get with resolveAll option', () => {
    const vastUrl = urlfor('wrapper-multiple-ads.xml');
    const vastClient = new VASTClient();
    let vastResponse = null;

    describe('when set to false', () => {
      const options = {
        urlhandler,
        resolveAll: false
      };

      it('should handle correctly a no ad response', done => {
        vastClient.get(urlfor('empty-no-ad.xml'), options).then(response => {
          vastResponse = response;
          should.notEqual(response, null);
          // Response doesn't have any ads
          response.ads.should.eql([]);
          done();
        });
      });

      it('should be successfull', done => {
        vastClient.get(vastUrl, options).then(response => {
          vastResponse = response;
          should.notEqual(response, null);
          done();
        });
      });

      it('should return a single ad', () => {
        vastResponse.ads.length.should.equal(1);
      });

      it('should return only the errorURLs for the given ad', () => {
        vastResponse.ads[0].errorURLTemplates.should.eql([
          'http://example.com/error',
          'http://example.com/error'
        ]);
      });

      describe('hasRemainingAds', () => {
        it('should return true', done => {
          vastClient.get(vastUrl, options).then(response => {
            const hasRemainingAds = vastClient.hasRemainingAds();
            hasRemainingAds.should.equal(true);
            done();
          });
        });
      });

      describe('getNextAds', () => {
        beforeEach(done => {
          vastClient.get(vastUrl, options).then(response => {
            done();
          });
        });

        describe('when all parameter is set to false', () => {
          it('should only return the next ad', done => {
            vastClient.getNextAds().then(res => {
              should.notEqual(res, null);
              res.ads.length.should.equal(2);
              done();
            });
          });
        });

        describe('when all parameter is set to true', () => {
          it('should return all the following ads', done => {
            vastClient.getNextAds(true).then(res => {
              should.notEqual(res, null);
              res.ads.length.should.equal(3);
              done();
            });
          });
        });
      });
    });

    describe('when set to true', () => {
      const options = {
        urlhandler,
        resolveAll: true
      };

      it('should be successfull', done => {
        vastClient.get(vastUrl, options).then(response => {
          vastResponse = response;
          should.notEqual(response, null);
          done();
        });
      });

      it('should return all the ads', () => {
        vastResponse.ads.length.should.equal(4);
      });

      describe('hasRemainingAds', () => {
        it('should return false', done => {
          vastClient.get(vastUrl, options).then(response => {
            const hasRemainingAds = vastClient.hasRemainingAds();
            hasRemainingAds.should.equal(false);
            done();
          });
        });
      });
    });
  });
});
