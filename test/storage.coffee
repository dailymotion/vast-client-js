should = require 'should'
path = require 'path'
VASTUtil = require '../src/util'
VASTClient = require '../src/client'

urlfor = (relpath) ->
    return 'file://' + path.resolve(path.dirname(module.filename), relpath).replace(/\\/g, '/')

describe 'VASTClient Storage', ->
    wrapperUrl = urlfor('wrapper.xml')
    totalCallsTimeout = null

    describe '#1st call', ->
        VASTClient.cappingFreeLunch = 1

        it 'should be null', (done) =>
            VASTClient.get wrapperUrl, (response) =>
                totalCallsTimeout = VASTClient.totalCallsTimeout
                if response is null then done()
                else throw '1st response is not blank'

        it 'VASTClient.totalCalls should be equal to 1', () =>
            VASTClient.totalCalls.should.eql 1


    describe '#2nd call', ->
        it "shouldn't be null", (done) =>
            VASTClient.get wrapperUrl, (response) =>
                if response isnt null then done()
                else throw '2nd response is blank'

        it 'VASTClient.totalCalls should be equal to 2', () =>
            VASTClient.totalCalls.should.eql 2


    describe '#3rd call', ->
        it "shouldn't be null", (done) =>
            VASTClient.get wrapperUrl, (response) =>
                if response isnt null then done()
                else throw '3rd response is blank'

        it 'VASTClient.totalCalls should be equal to 3', () =>
            VASTClient.totalCalls.should.eql 3

        it 'VASTClient.totalCallsTimeout should be the same', () =>
            VASTClient.totalCallsTimeout.should.eql totalCallsTimeout


    describe '#4th call', ->
        it "4th request should be null", (done) =>
            console.log 'Resetting totalCallsTimeout'
            VASTClient.totalCallsTimeout = 0

            VASTClient.get wrapperUrl, (response) =>
                if response is null then done()
                else throw '4th response is not blank'
