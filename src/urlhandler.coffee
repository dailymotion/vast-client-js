xhr = require './urlhandlers/xmlhttprequest'
flash = require './urlhandlers/flash'

class URLHandler
    @get: (url, options, cb) ->
        if not cb
            cb = options if typeof options is 'function'
            options = {}

        if options.urlhandler && options.urlhandler.supported()
            # explicitly supply your own URLHandler object
            return options.urlhandler.get(url, options, cb)
        else if not window?
            # prevents browserify from including this file
            return require('./urlhandlers/' + 'node').get(url, options, cb)
        else if xhr.supported()
            return xhr.get(url, options, cb)
        else if flash.supported()
            return flash.get(url, options, cb)
        else
            return cb()

module.exports = URLHandler
