xhr = require './urlhandlers/xmlhttprequest.coffee'
flash = require './urlhandlers/flash.coffee'
VASTClient = require './client.coffee'

class URLHandler
    @get: (url, cb) ->
        if not window?
            # prevents browserify from including this file
            return require('./urlhandlers/' + 'node.coffee').get(url, cb)
        else if xhr.supported()
            return xhr.get(url, cb)
        else if flash.supported()
            return flash.get(url, cb)
        else
            return cb()

module.exports = URLHandler
