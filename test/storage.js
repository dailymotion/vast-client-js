/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const should = require('should');
const path = require('path');
const VASTClient = require('../src/client');

const vastClient = new VASTClient();

const urlfor = relpath => `file://${path.resolve(path.dirname(module.filename), relpath).replace(/\\/g, '/')}`;

describe('VASTClient Storage', function() {
    const wrapperUrl = urlfor('wrapper.xml');
    let totalCallsTimeout = null;

    describe('#1st call', function() {
        vastClient.cappingFreeLunch = 1;

        it('should send an empty response', done => {
            vastClient.totalCallsTimeout = 0;
            return vastClient.get(wrapperUrl, response => {
                ({ totalCallsTimeout } = vastClient);
                should.equal(response, null);
                return done();
            });
        });
                // else throw '1st call: response is not blank'

        it('should send an error', done => {
            vastClient.totalCallsTimeout = 0;
            return vastClient.get(wrapperUrl, (response, error) => {
                ({ totalCallsTimeout } = vastClient);
                if ((error != null ? error.message : undefined) != null) { return done(); }
            });
        });
                // else throw '1st call: error is not sent'

        return it('VASTClient.totalCalls should be equal to 1', () => {
            return vastClient.totalCalls.should.eql(1);
        });
    });


    describe('#2nd call', function() {
        it("should send a response", done => {
            return vastClient.get(wrapperUrl, response => {
                if (response !== null) { return done(); }
            });
        });
                // else throw '2nd call: response is blank'

        return it('VASTClient.totalCalls should be equal to 2', () => {
            return vastClient.totalCalls.should.eql(2);
        });
    });


    describe('#3rd call', function() {
        it("should send a response", done => {
            return vastClient.get(wrapperUrl, response => {
                if (response !== null) { return done(); }
            });
        });
                // else throw '3rd call: response is blank'

        it('VASTClient.totalCalls should be equal to 3', () => {
            return vastClient.totalCalls.should.eql(3);
        });

        return it('VASTClient.totalCallsTimeout should be the same', () => {
            return vastClient.totalCallsTimeout.should.eql(totalCallsTimeout);
        });
    });


    return describe('#4th call', function() {
        it('should send an empty response', done => {
            vastClient.totalCallsTimeout = 0;
            return vastClient.get(wrapperUrl, response => {
                ({ totalCallsTimeout } = vastClient);
                if (response === null) { return done(); }
            });
        });
                // else throw '4th call: response is not blank'

        return it('should send an error', done => {
            vastClient.totalCallsTimeout = 0;
            return vastClient.get(wrapperUrl, (response, error) => {
                ({ totalCallsTimeout } = vastClient);
                if ((error != null ? error.message : undefined) != null) { return done(); }
            });
        });
    });
});
                // else throw '4th call: error is not sent'
