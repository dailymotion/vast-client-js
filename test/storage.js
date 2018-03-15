import path from 'path';
import should from 'should';
import { VASTClient } from '../src/client';

const vastClient = new VASTClient();

const urlfor = relpath => `file://${path.resolve(path.dirname(module.filename), 'vastfiles', relpath).replace(/\\/g, '/')}`;

describe('VASTClient Storage', function() {
    const wrapperUrl = urlfor('wrapper-a.xml');
    let totalCallsTimeout = null;

    describe('#1st call', function() {
        vastClient.cappingFreeLunch = 1;

        it('should send an empty response', done => {
            vastClient.totalCallsTimeout = 0;
            vastClient.get(wrapperUrl, response => {
                ({ totalCallsTimeout } = vastClient);
                should.equal(response, null);
                done();
            });
        });

        it('should send an error', done => {
            vastClient.totalCallsTimeout = 0;
            vastClient.get(wrapperUrl, (response, error) => {
                ({ totalCallsTimeout } = vastClient);
                should.notEqual(error.message, null);
                done();
            });
        });

        it('VASTClient.totalCalls should be equal to 1', () => {
            vastClient.totalCalls.should.eql(1);
        });
    });


    describe('#2nd call', function() {
        it("should send a response", done => {
            vastClient.get(wrapperUrl, response => {
                should.notEqual(response, null);
                done();
            });
        });

        it('VASTClient.totalCalls should be equal to 2', () => {
            vastClient.totalCalls.should.eql(2);
        });
    });


    describe('#3rd call', function() {
        it("should send a response", done => {
            vastClient.get(wrapperUrl, response => {
                should.notEqual(response, null);
                done();
            });
        });

        it('VASTClient.totalCalls should be equal to 3', () => {
            vastClient.totalCalls.should.eql(3);
        });

        it('VASTClient.totalCallsTimeout should be the same', () => {
            vastClient.totalCallsTimeout.should.eql(totalCallsTimeout);
        });
    });


    describe('#4th call', function() {
        it('should send an empty response', done => {
            vastClient.totalCallsTimeout = 0;
            vastClient.get(wrapperUrl, response => {
                ({ totalCallsTimeout } = vastClient);
                should.equal(response, null);
                done();
            });
        });

        it('should send an error', done => {
            vastClient.totalCallsTimeout = 0;
            vastClient.get(wrapperUrl, (response, error) => {
                ({ totalCallsTimeout } = vastClient);
                should.notEqual(error.message, null);
                done();
            });
        });
    });
});
