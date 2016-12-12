should = require 'should'
sinon  = require 'sinon'
VASTUtil = require '../src/util'

now = new Date()

assetURI = 'http://example.com/linear-asset.mp4?foo=1&bar=_-\[{bar'
encodedAssetURI = 'http%3A%2F%2Fexample.com%2Flinear-asset.mp4%3Ffoo%3D1%26bar%3D_-%5B%7Bbar'

resolve = (URLTemplate, variables) ->
    VASTUtil.resolveURLTemplates([URLTemplate], variables)[0]

encodeRFC3986 = (str) ->
    VASTUtil.encodeURIComponentRFC3986(str)

describe 'VASTUtil', ->
    before () =>
        @sinon = sinon.sandbox.create()
        @sinon.stub(Math, 'random').returns(0.1)
        @clock = sinon.useFakeTimers(now.getTime())

    after () =>
        @clock.restore()
        @sinon.restore()

    describe '#resolveURLTemplates', ->

        describe 'assetURI', ->
            it 'should resolve assetURI', ->
                resolve("http://test.com/?url=[ASSETURI]", { "ASSETURI" : assetURI }).should.match "http://test.com/?url=#{encodedAssetURI}"

            it 'should resolve assetURI, with percents', ->
                resolve("http://test.com/?url=%%ASSETURI%%", { "ASSETURI" : assetURI }).should.match "http://test.com/?url=#{encodedAssetURI}"

        describe 'cacheBusting', ->
            it 'should resolve cache busting', ->
                resolve("http://test.com/[CACHEBUSTING]").should.match /^http:\/\/test.com\/[0-9]+$/

            it 'should resolve cache buster, with percents', ->
                resolve("http://test.com/%%CACHEBUSTER%%", CACHEBUSTER: 12345678).should.match /^http:\/\/test.com\/12345678$/

        describe 'contentPlayhead', ->
            it 'should resolve playhead', ->
                resolve("http://test.com/[CONTENTPLAYHEAD]", CONTENTPLAYHEAD: 120).should.equal "http://test.com/120"

            it 'should resolve playhead, with percents', ->
                resolve("http://test.com/%%CONTENTPLAYHEAD%%", CONTENTPLAYHEAD: 120).should.equal "http://test.com/120"

        describe 'timestamp', ->
            ISOTimeStamp = now.toISOString()

            it 'should resolve timestamp', ->
                resolve("http://test.com/[TIMESTAMP]").should.match "http://test.com/#{ISOTimeStamp}"

            it 'should resolve timestamp, with percents', ->
                resolve("http://test.com/%%TIMESTAMP%%", TIMESTAMP: 12345678).should.match /^http:\/\/test.com\/12345678$/

        describe 'random/RANDOM', ->
            it 'should resolve random', ->
                resolve("http://test.com/[random]").should.match /^http:\/\/test.com\/[0-9]+$/

            it 'should resolve cache buster, with percents', ->
                resolve("http://test.com/%%RANDOM%%").should.match /^http:\/\/test.com\/[0-9]+$/

        it 'should resolve weird cases', ->
            resolve("http://test.com/%%CONTENTPLAYHEAD%%&[CONTENTPLAYHEAD]", CONTENTPLAYHEAD: 120).should.equal "http://test.com/120&120"

        it 'should handle undefined', ->
            should(resolve(undefined)).equal undefined
