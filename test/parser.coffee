should = require 'should'
path = require 'path'
VASTParser = require '../src/parser'
VASTResponse = require '../src/response'

urlfor = (relpath) ->
    return 'file://' + path.resolve(path.dirname(module.filename), relpath)

describe 'VASTParser', ->
    describe '#parse', ->
        @response = null
        @templateFilterCalls = []

        before (done) =>
            VASTParser.addURLTemplateFilter (url) =>
              @templateFilterCalls.push url
              return url
            VASTParser.parse urlfor('wrapper.xml'), (@response) =>
                done()

        after () =>
            VASTParser.clearUrlTemplateFilters()

        it 'should have 1 filter defined', =>
            VASTParser.countURLTemplateFilters().should.equal 1

        it 'should have called URLtemplateFilter twice', =>
            @templateFilterCalls.should.have.length 2
            @templateFilterCalls.should.eql [urlfor('wrapper.xml'), urlfor('sample.xml')]

        it 'should have found 1 ad', =>
            @response.ads.should.have.length 1

        it 'should return a VAST response object', =>
            @response.should.be.an.instanceOf(VASTResponse)

        it 'should have merged top level error URLs', =>
            @response.errorURLTemplates.should.eql ["http://example.com/wrapper-error", "http://example.com/error"]

        it 'should have merged wrapped ad error URLs', =>
            @response.ads[0].errorURLTemplates.should.eql ["http://example.com/wrapper-error", "http://example.com/error"]

        it 'should have merged impression URLs', =>
            @response.ads[0].impressionURLTemplates.should.eql ["http://example.com/wrapper-impression", "http://example.com/impression1", "http://example.com/impression2", "http://example.com/impression3"]

        it 'should have a single creative', =>
            @response.ads[0].creatives.should.have.length 1

        it 'should have 1 media file', =>
            @response.ads[0].creatives[0].mediaFiles.should.have.length 1

        it 'should have a duration of s', =>
            @response.ads[0].creatives[0].duration.should.equal 90.123

        it 'should have parsed media file attributes', =>
            mediaFile = @response.ads[0].creatives[0].mediaFiles[0]
            mediaFile.width.should.equal 512
            mediaFile.height.should.equal 288
            mediaFile.mimeType.should.equal "video/mp4"
            mediaFile.fileURL.should.equal "http://example.com/asset.mp4"

        it 'should have 6 tracking events', =>
            @response.ads[0].creatives[0].trackingEvents.should.have.keys 'start', 'close', 'midpoint', 'complete', 'firstQuartile', 'thirdQuartile'

        it 'should have 2 urls for start event', =>
            @response.ads[0].creatives[0].trackingEvents['start'].should.eql ['http://example.com/start', 'http://example.com/wrapper-start']

        it 'should have 2 urls for complete event', =>
            @response.ads[0].creatives[0].trackingEvents['complete'].should.eql ['http://example.com/complete', 'http://example.com/wrapper-complete']

