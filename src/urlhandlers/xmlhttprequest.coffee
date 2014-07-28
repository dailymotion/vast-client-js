class XHRURLHandler
    @xhr: ->
        xhr = new window.XMLHttpRequest()
        if 'withCredentials' of xhr # check CORS support
            return xhr

    @supported: ->
        return !!@xhr()

    @get: (url, headers, timeout, cb) ->
        xhr = @xhr()
        xhr.open('GET', url)
        xhr.send()
        xhr.onreadystatechange = ->
            if xhr.readyState == 4
                cb(null, xhr.responseXML)

module.exports = XHRURLHandler
