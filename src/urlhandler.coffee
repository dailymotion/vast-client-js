xhr = require './urlhandlers/xmlhttprequest'
flash = require './urlhandlers/flash'

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
            return cb(new Error('Current context is not supported by any of the default URLHandlers. Please provide a custom URLHandler'))

module.exports = URLHandler
