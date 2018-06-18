import path from 'path';
import should from 'should';
import sinon from 'sinon';
import { VASTClient } from '../src/vast_client';

describe('VASTClient', () => {
  const urlfor = relpath =>
    `file://${path
      .resolve(path.dirname(module.filename), 'vastfiles', relpath)
      .replace(/\\/g, '/')}`;
  const wrapperUrl = urlfor('wrapper-a.xml');

  describe('when cappingFreeLunch is set to 1', () => {
    const vastClient = new VASTClient(1);

    describe('the 1st call', () => {
      it('should be ignored', done => {
        vastClient.get(wrapperUrl).catch(err => {
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
        vastClient.get(wrapperUrl).then(response => {
          should.notEqual(response, null);
          done();
        });
      });

      it('totalCalls should be equal to 2', () => {
        vastClient.totalCalls.should.eql(2);
      });
    });
  });

  describe('when cappingMinimumTimeInterval is set to 30 seconds', () => {
    const vastClient = new VASTClient(0, 30000);

    describe('the 1st call', () => {
      it('should be successfull', done => {
        vastClient.get(wrapperUrl).then(response => {
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
        vastClient.get(wrapperUrl).catch(err => {
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

    beforeEach('when called with options parameter', done => {
      const options = {
        withCredentials: true
      };
      vastParser.getAndParseVAST = sinon.spy();

      vastClient
        .get(wrapperUrl, options)
        .then(response => done())
        .catch(err => done());
    });

    it('should merge options', () => {
      const mergedOptions = {
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
});
