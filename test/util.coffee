should = require 'should'
VASTUtil = require '../src/util'

resolve = (URLTemplate, variables) ->
    VASTUtil.resolveURLTemplates([URLTemplate], variables)[0]

describe 'VASTUtil', ->
    describe '#resolvs', ->
        it 'should resolve cache busting', ->
            resolve("http://test.com/[CACHEBUSTING]").should.match /^http:\/\/test.com\/[0-9]+$/

        it 'should resolve playhead', ->
            resolve("http://test.com/[CONTENTPLAYHEAD]", CONTENTPLAYHEAD: 120).should.equal "http://test.com/120"
