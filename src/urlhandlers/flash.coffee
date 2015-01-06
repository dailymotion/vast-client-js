class FlashURLHandler
    @xdr: ->
        xdr = new XDomainRequest() if window.XDomainRequest
        return xdr

    @supported: ->
        return !!@xdr()

    @get: (url, options, cb) ->
        if typeof options is 'function'
          cb = options
          options = null

        if xmlDocument = new window.ActiveXObject? "Microsoft.XMLDOM"
          xmlDocument.async = false
        else
          return cb()

        xdr = @xdr()
        xdr.open('GET', url)
        xdr.withCredentials = true if options and options.withCredentials is true
        xdr.send()
        xdr.onload = ->
             xmlDocument.loadXML(xdr.responseText)
             cb(null, xmlDocument)

module.exports = FlashURLHandler
