XHRURLHandler = require './urlhandlers/xmlhttprequest.coffee'
FlashURLHandler = require './urlhandlers/flash.coffee'
NodeURLHandler = require './urlhandlers/node.coffee'

class URLHandler
    constructor: ->
        @flash = new FlashURLHandler()
        @node = new NodeURLHandler()
        @xhr = new XHRURLHandler()

    get: (url, options, cb) ->
        # Allow skip of the options param
        if not cb
            cb = options if typeof options is 'function'
            options = {}

        if options.response?
            # Trick: the VAST response XML document is passed as an option
            response = options.response
            delete options.response
            cb(null, response)
        else if options.urlhandler?.supported()
            # explicitly supply your own URLHandler object
            return options.urlhandler.get(url, options, cb)
        else if not window?
            # prevents browserify from including this file
            return @node.get(url, options, cb)
        else if @xhr.supported()
            return @xhr.get(url, options, cb)
        else if @flash.supported()
            return @flash.get(url, options, cb)
        else
            return cb(new Error('Current context is not supported by any of the default URLHandlers. Please provide a custom URLHandler'))

module.exports = URLHandler
