should = require 'should'
path = require 'path'
VASTClient = require '../src/client'

urlfor = (relpath) ->
    return 'file://' + path.resolve(path.dirname(module.filename), relpath).replace(/\\/g, '/')

describe 'VASTClient Storage', ->
    wrapperUrl = urlfor('wrapper.xml')
    totalCallsTimeout = null

    describe '#1st call', ->
        VASTClient.cappingFreeLunch = 1

        it 'should send an empty response', (done) =>
            VASTClient.totalCallsTimeout = 0
            VASTClient.get wrapperUrl, (response) =>
                totalCallsTimeout = VASTClient.totalCallsTimeout
                if response is null then done()
                else throw '1st call: response is not blank'

        it 'should send an error', (done) =>
            VASTClient.totalCallsTimeout = 0
            VASTClient.get wrapperUrl, (response, error) =>
                totalCallsTimeout = VASTClient.totalCallsTimeout
                if error?.message? then done()
                else throw '1st call: error is not sent'

        it 'VASTClient.totalCalls should be equal to 1', () =>
            VASTClient.totalCalls.should.eql 1


    describe '#2nd call', ->
        it "should send a response", (done) =>
            VASTClient.get wrapperUrl, (response) =>
                if response isnt null then done()
                else throw '2nd call: response is blank'

        it 'VASTClient.totalCalls should be equal to 2', () =>
            VASTClient.totalCalls.should.eql 2


    describe '#3rd call', ->
        it "should send a response", (done) =>
            VASTClient.get wrapperUrl, (response) =>
                if response isnt null then done()
                else throw '3rd call: response is blank'

        it 'VASTClient.totalCalls should be equal to 3', () =>
            VASTClient.totalCalls.should.eql 3

        it 'VASTClient.totalCallsTimeout should be the same', () =>
            VASTClient.totalCallsTimeout.should.eql totalCallsTimeout


    describe '#4th call', ->
        it 'should send an empty response', (done) =>
            VASTClient.totalCallsTimeout = 0
            VASTClient.get wrapperUrl, (response) =>
                totalCallsTimeout = VASTClient.totalCallsTimeout
                if response is null then done()
                else throw '4th call: response is not blank'

        it 'should send an error', (done) =>
            VASTClient.totalCallsTimeout = 0
            VASTClient.get wrapperUrl, (response, error) =>
                totalCallsTimeout = VASTClient.totalCallsTimeout
                if error?.message? then done()
                else throw '4th call: error is not sent'
