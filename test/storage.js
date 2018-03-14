should = require 'should'
path = require 'path'
VASTClient = require '../src/client'

vastClient = new VASTClient();

urlfor = (relpath) ->
    return 'file://' + path.resolve(path.dirname(module.filename), relpath).replace(/\\/g, '/')

describe 'VASTClient Storage', ->
    wrapperUrl = urlfor('wrapper.xml')
    totalCallsTimeout = null

    describe '#1st call', ->
        vastClient.cappingFreeLunch = 1

        it 'should send an empty response', (done) =>
            vastClient.totalCallsTimeout = 0
            vastClient.get wrapperUrl, (response) =>
                totalCallsTimeout = vastClient.totalCallsTimeout
                should.equal response, null
                done()
                # else throw '1st call: response is not blank'

        it 'should send an error', (done) =>
            vastClient.totalCallsTimeout = 0
            vastClient.get wrapperUrl, (response, error) =>
                totalCallsTimeout = vastClient.totalCallsTimeout
                if error?.message? then done()
                # else throw '1st call: error is not sent'

        it 'VASTClient.totalCalls should be equal to 1', () =>
            vastClient.totalCalls.should.eql 1


    describe '#2nd call', ->
        it "should send a response", (done) =>
            vastClient.get wrapperUrl, (response) =>
                if response isnt null then done()
                # else throw '2nd call: response is blank'

        it 'VASTClient.totalCalls should be equal to 2', () =>
            vastClient.totalCalls.should.eql 2


    describe '#3rd call', ->
        it "should send a response", (done) =>
            vastClient.get wrapperUrl, (response) =>
                if response isnt null then done()
                # else throw '3rd call: response is blank'

        it 'VASTClient.totalCalls should be equal to 3', () =>
            vastClient.totalCalls.should.eql 3

        it 'VASTClient.totalCallsTimeout should be the same', () =>
            vastClient.totalCallsTimeout.should.eql totalCallsTimeout


    describe '#4th call', ->
        it 'should send an empty response', (done) =>
            vastClient.totalCallsTimeout = 0
            vastClient.get wrapperUrl, (response) =>
                totalCallsTimeout = vastClient.totalCallsTimeout
                if response is null then done()
                # else throw '4th call: response is not blank'

        it 'should send an error', (done) =>
            vastClient.totalCallsTimeout = 0
            vastClient.get wrapperUrl, (response, error) =>
                totalCallsTimeout = vastClient.totalCallsTimeout
                if error?.message? then done()
                # else throw '4th call: error is not sent'
