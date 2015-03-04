should = require 'should'
path = require 'path'
URLHandler = require '../src/urlhandler'

urlfor = (relpath) ->
    return 'file://' + path.resolve(path.dirname(module.filename), relpath)

describe 'URLHandler', ->
    describe '#get', ->
        it 'should return a VAST XML DOM object', (done) =>
            URLHandler.get urlfor('sample.xml'), 5000, (err, xml) ->
                should.not.exist err
                should.exists xml
                xml.documentElement.nodeName.should.equal 'VAST'
                done()

        it 'should return an error if not found', (done) =>
            URLHandler.get urlfor('not-found.xml'), 5000, (err, xml) ->
                should.exists err
                should.not.exist xml
                done()
