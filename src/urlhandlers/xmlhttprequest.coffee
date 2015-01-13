class XHRURLHandler
    @xhr: ->
        xhr = new window.XMLHttpRequest()
        if 'withCredentials' of xhr # check CORS support
            return xhr

    @supported: ->
        return !!@xhr()

    @get: (url, options, cb) ->
        if typeof options is 'function'
          cb = options
          options = null
        
        try
            xhr = @xhr()
            xhr.open('GET', url)
            xhr.withCredentials = true if options and options.withCredentials is true
            xhr.send()
            xhr.onreadystatechange = ->
                if xhr.readyState == 4
                    cb(null, xhr.responseXML)
        catch
            cb()

module.exports = XHRURLHandler
