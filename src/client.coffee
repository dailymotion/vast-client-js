VASTParser = require './parser.coffee'

class VASTClient
    @totalCalls: 0 # TODO: make this persistent across requests
    @cappingFreeLunch: 0
    @cappingMinimumTimeInterval: 0
    @timeout: 0

    @get: (url, cb) ->
        # TODO handle timeout
        @totalCalls++

        if @cappingFreeLunch >= @totalCalls
            cb(null)
            return

        if new Date().getTime() - @lastSuccessfulAd < @cappingMinimumTimeInterval
            cb(null)
            return

        VASTParser.get url, (response) ->
            @lastSuccessfulAd = new Date().getTime() # TODO: make this persistent across requests
            cb(response)

module.export = VASTClient

if window?
    window.DMVASTClient = VASTClient