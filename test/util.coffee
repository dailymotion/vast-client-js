should = require 'should'
sinon  = require 'sinon'
VASTUtil = require '../src/util'

now      = new Date()
playhead = '00:12:30.212'
assetURI = 'http://example.com/linear-asset.mp4?foo=1&bar=_-\[{bar'
util = new VASTUtil()

resolve = (URLTemplate, variables) ->
    util.resolveURLTemplates([URLTemplate], variables)[0]

encodeRFC3986 = (str) ->
    util.encodeURIComponentRFC3986(str)

encodedAssetURI  = encodeRFC3986(assetURI)
encodedPlayhead  = encodeRFC3986(playhead)
encodedTimestamp = encodeRFC3986(now.toISOString())

describe 'VASTUtil', ->
    before () =>
        @sinon = sinon.sandbox.create()
        @sinon.stub(Math, 'random').returns(0.0012)
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
                resolve("http://test.com/[CACHEBUSTING]").should.match /^http:\/\/test.com\/00120000$/

            it 'should resolve cache buster, with percents', ->
                resolve("http://test.com/%%CACHEBUSTING%%", CACHEBUSTING: 178).should.match /^http:\/\/test.com\/00120000$/

        describe 'contentPlayhead', ->
            it 'should resolve playhead', ->
                resolve("http://test.com/[CONTENTPLAYHEAD]", CONTENTPLAYHEAD: playhead).should.equal "http://test.com/#{encodedPlayhead}"

            it 'should resolve playhead, with percents', ->
                resolve("http://test.com/%%CONTENTPLAYHEAD%%", CONTENTPLAYHEAD: playhead).should.equal "http://test.com/#{encodedPlayhead}"

        describe 'timestamp', ->
            it 'should resolve timestamp', ->
                resolve("http://test.com/[TIMESTAMP]").should.equal "http://test.com/#{encodedTimestamp}"

            it 'should resolve timestamp, with percents', ->
                resolve("http://test.com/%%TIMESTAMP%%", TIMESTAMP: 12345678).should.equal "http://test.com/#{encodedTimestamp}"

        describe 'random/RANDOM', ->
            it 'should resolve random', ->
                resolve("http://test.com/[random]").should.match /^http:\/\/test.com\/[0-9]+$/

            it 'should resolve cache buster, with percents', ->
                resolve("http://test.com/%%RANDOM%%").should.match /^http:\/\/test.com\/[0-9]+$/

        it 'should resolve weird cases', ->
            resolve("http://test.com/%%CONTENTPLAYHEAD%%&[CONTENTPLAYHEAD]", CONTENTPLAYHEAD: 120).should.equal "http://test.com/120&120"

        it 'should handle undefined', ->
            should(resolve(undefined)).equal undefined

    describe '#merge', ->
        it 'should merge 2 objects', ->
            foo = { a: 1, b: 1 }
            bar = { b: 2, c: 3}
            util.merge(foo, bar).should.eql { a: 1, b: 2, c: 3 }
