class FlashURLHandler
    @xdr: ->
        xdr = new XDomainRequest() if window.XDomainRequest
        return xdr

    @supported: ->
        return !!@xdr()

    @get: (url, options, cb) ->

        if xmlDocument = new window.ActiveXObject? "Microsoft.XMLDOM"
          xmlDocument.async = false
        else
          return cb()

        xdr = @xdr()
        xdr.open('GET', url)
        xdr.timeout = options.timeout or 0
        xdr.withCredentials = options.withCredentials or false
        xdr.send()
        xdr.onload = ->
             xmlDocument.loadXML(xdr.responseText)
             cb(null, xmlDocument)

module.exports = FlashURLHandler
