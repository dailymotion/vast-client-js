xhr = require './urlhandlers/xmlhttprequest.coffee'
flash = require './urlhandlers/flash.coffee'

class URLHandler
    @get: (url, headers, timeout, cb) ->
        if not window?
            # prevents browserify from including this file
            return require('./urlhandlers/' + 'node.coffee').get(url, headers, timeout, cb)
        else if xhr.supported()
            return xhr.get(url, headers, timeout, cb)
        else if flash.supported()
            return flash.get(url, headers, timeout, cb)
        else
            return cb()

module.exports = URLHandler
