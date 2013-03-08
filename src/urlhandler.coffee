class URLHandler
    @get: (url, cb) ->
        if not window?
            # prevents browserify from including this file
            return require('./urlhandlers/' + 'node.coffee').get(url, cb)
        else if jQuery.cors
            return require('./urlhandlers/xmlhttprequest.coffee').get(url, cb)
        else
            return require('./urlhandlers/flash.coffee').get(url, cb)

module.exports = URLHandler