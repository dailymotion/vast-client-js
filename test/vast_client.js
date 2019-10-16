import path from 'path';
import should from 'should';
import { VASTClient } from '../src/vast_client';
import { nodeURLHandler } from '../src/urlhandlers/node_url_handler';

describe('VASTClient', () => {
  const urlfor = relpath =>
    `file://${path
      .resolve(path.dirname(module.filename), 'vastfiles', relpath)
      .replace(/\\/g, '/')}`;

  describe('get with resolveAll option', () => {
    const vastUrl = urlfor('wrapper-multiple-ads.xml');
    const vastClient = new VASTClient();

    describe('when set to false', () => {
      const options = {
        urlhandler: nodeURLHandler,
        resolveAll: false
      };

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
  });
});
