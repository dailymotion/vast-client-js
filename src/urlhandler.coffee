xhr = require './urlhandlers/xmlhttprequest.coffee'
flash = require './urlhandlers/flash.coffee'

class URLHandler
    @get: (url, options, cb) ->
        if not window?
            # prevents browserify from including this file
            return require('./urlhandlers/' + 'node.coffee').get(url, options, cb)
        else if xhr.supported()
            return xhr.get(url, options, cb)
        else if flash.supported()
            return flash.get(url, options, cb)
        else
            return cb()

module.exports = URLHandler
