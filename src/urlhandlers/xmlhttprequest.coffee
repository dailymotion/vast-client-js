class XHRURLHandler
    xhr: ->
        xhr = new window.XMLHttpRequest()
        if 'withCredentials' of xhr # check CORS support
            return xhr

    supported: ->
        return !!@xhr()

    get: (url, options, cb) ->
        if window.location.protocol == 'https:' && url.indexOf('http://') == 0
            return cb(new Error('XHRURLHandler: Cannot go from HTTPS to HTTP.'))

        try
            xhr = @xhr()
            xhr.open('GET', url)
            xhr.timeout = options.timeout or 0
            xhr.withCredentials = options.withCredentials or false
            xhr.overrideMimeType && xhr.overrideMimeType('text/xml');
            xhr.onreadystatechange = ->
                if xhr.readyState == 4
                    if xhr.status == 200
                        cb(null, xhr.responseXML)
                    else
                        cb(new Error("XHRURLHandler: #{xhr.statusText}"))
            xhr.send()
        catch
            cb(new Error('XHRURLHandler: Unexpected error'))

module.exports = XHRURLHandler
