should = require 'should'
path = require 'path'
URLHandler = require '../src/urlhandler'

urlHandler = new URLHandler()

urlfor = (relpath) ->
    return 'file://' + path.resolve(path.dirname(module.filename), 'vastfiles', relpath).replace(/\\/g, '/')

describe 'URLHandler', ->
    describe '#get', ->
        it 'should return options.response when it\'s provided', (done) =>
            options = {response: 'response'}
            urlHandler.get urlfor('sample.xml'), options, (err, xml) ->
                should.not.exist err
                should.exists xml
                xml.should.equal 'response'
                should.not.exist(options.response)
                done()

        it 'should return a VAST XML DOM object', (done) =>
            urlHandler.get urlfor('sample.xml'), (err, xml) ->
                should.not.exist err
                should.exists xml
                xml.documentElement.nodeName.should.equal 'VAST'
                done()

        it 'should return an error if not found', (done) =>
            urlHandler.get urlfor('not-found.xml'), (err, xml) ->
                should.exists err
                should.not.exist xml
                done()
