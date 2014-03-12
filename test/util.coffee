should = require 'should'
VASTUtil = require '../src/util'

resolve = (URLTemplate, variables) ->
    VASTUtil.resolveURLTemplates([URLTemplate], variables)[0]

describe 'VASTUtil', ->
    describe '#resolve', ->
        it 'should resolve cache busting', ->
            resolve("http://test.com/[CACHEBUSTING]").should.match /^http:\/\/test.com\/[0-9]+$/

        it 'should resolve playhead', ->
            resolve("http://test.com/[CONTENTPLAYHEAD]", CONTENTPLAYHEAD: 120).should.equal "http://test.com/120"

        it 'should resolve cache buster, with percents', ->
            resolve("http://test.com/%%CACHEBUSTER%%", CACHEBUSTER: Math.round(Math.random() * 1.0e+10)).should.match /^http:\/\/test.com\/[0-9]+$/

        it 'should resolve playhead, with percents', ->
            resolve("http://test.com/%%CONTENTPLAYHEAD%%", CONTENTPLAYHEAD: 120).should.equal "http://test.com/120"
