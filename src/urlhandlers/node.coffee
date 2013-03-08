uri = require 'url'
fs = require 'fs'
http = require 'http'
DOMParser = require('xmldom').DOMParser

class NodeURLHandler
    @get: (url, cb) ->
        url = uri.parse(url)
        if url.protocol is 'file:'
            fs.readFile url.pathname, 'utf8', (err, data) ->
                return cb(err) if (err)
                xml = new DOMParser().parseFromString(data)
                cb(null, xml)
        else
            data = ''
            req = http.get url.href, (res) ->
                res.on 'data', (chunk) ->
                    data += chunk
                res.on 'end', ->
                    xml = new DOMParser().parseFromString(data)
                    cb(null, xml)
            req.on 'error', (err) ->
                cb(err)

module.exports = NodeURLHandler