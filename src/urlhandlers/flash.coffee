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
          return cb(new Error('FlashURLHandler: Microsoft.XMLDOM format not supported'))

        xdr = @xdr()
        xdr.open('GET', url)
        xdr.timeout = options.timeout or 0
        xdr.withCredentials = options.withCredentials or false
        xdr.send()
        xdr.onprogress = ->

        xdr.onload = ->
             xmlDocument.loadXML(xdr.responseText)
             cb(null, xmlDocument)

        return xdr

module.exports = FlashURLHandler
