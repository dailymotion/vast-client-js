class XHRURLHandler
    @xhr: ->
        xhr = new window.XMLHttpRequest()
        if 'withCredentials' of xhr # check CORS support
            return xhr

    @supported: ->
        return !!@xhr()

    @get: (url, options, cb) ->
        if window.location.protocol == 'https:' && url.indexOf('http://') == 0
            return cb(new Error('Cannot go from HTTPS to HTTP.'))

        try
            xhr = @xhr()
            xhr.open('GET', url)
            xhr.timeout = options.timeout or 0
            xhr.withCredentials = options.withCredentials or false
            xhr.send()
            xhr.onreadystatechange = ->
                if xhr.readyState == 4
                    cb(null, xhr.responseXML)
        catch
            cb()

module.exports = XHRURLHandler
