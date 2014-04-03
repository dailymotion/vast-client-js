class FlashURLHandler
    @xdr: ->
	      xdr = new XDomainRequest();
	      return xdr

    @supported: ->
        return !!@xdr()

    @get: (url, cb) ->
        xmlDocument = new ActiveXObject('Microsoft.XMLDOM')
        xmlDocument.async = false
        xdr = @xdr()
        xdr.open('GET', url)
        xdr.send()
        xdr.onload = ->
             xmlDocument.loadXML(xdr.responseText)
             cb(null, xmlDocument)

module.exports = FlashURLHandler
