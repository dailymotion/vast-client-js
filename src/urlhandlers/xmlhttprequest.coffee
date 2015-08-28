class XHRURLHandler
    @xhr: ->
        xhr = new window.XMLHttpRequest()
        if 'withCredentials' of xhr # check CORS support
            return xhr

    @supported: ->
        return !!@xhr()

    @get: (url, options, cb) ->

        try
            xhr = @xhr()
            xhr.open('GET', url)
            xhr.overrideMimeType('text/xml')
            xhr.timeout = options.timeout or 0
            xhr.withCredentials = options.withCredentials or false
            xhr.send()
            xhr.onreadystatechange = ->
                if xhr.readyState == 4
                    cb(null, xhr.responseXML)
        catch
            cb()

module.exports = XHRURLHandler
