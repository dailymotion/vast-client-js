uri = require 'url'
fs = require 'fs'
http = require 'http'
DOMParser = require('xmldom').DOMParser

class NodeURLHandler
    @get: (url, options, cb) ->
   
        url = uri.parse(url)
        if url.protocol is 'file:'
            fs.readFile url.pathname, 'utf8', (err, data) ->
                return cb(err) if (err)
                xml = new DOMParser().parseFromString(data)
                cb(null, xml)
        else
            data = ''

            timeout_wrapper ( req ) ->
                return ->
                    req.abort( );

            req = http.get url.href, (res) ->
                res.on 'data', (chunk) ->
                    data += chunk
                    clearTimeout( timing );
                    timing = setTimeout( fn, timeout );
                res.on 'end', ->
                    clearTimeout( timing );
                    xml = new DOMParser().parseFromString(data)
                    cb(null, xml)
            req.on 'error', (err) ->
                clearTimeout( timing );
                cb(err)
            
            fn = timeout_wrapper req
            timing = setTimeout( fn, timeout );

module.exports = NodeURLHandler