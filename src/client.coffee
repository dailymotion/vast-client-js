VASTParser = require './parser.coffee'
VASTUtil = require './util.coffee'

class VASTClient
    @cappingFreeLunch: 0
    @cappingMinimumTimeInterval: 0
    @timeout: 0

    @get: (url, headers, timeout, logger, cb) ->
        now = +new Date()

        # Check totalCallsTimeout (first call + 1 hour), if older than now,
        # reset totalCalls number, by this way the client will be eligible again
        # for freelunch capping
        if @totalCallsTimeout < now
            @totalCalls = 1
            @totalCallsTimeout = now + (60 * 60 * 1000)
        else
            @totalCalls++

        if @cappingFreeLunch >= @totalCalls
            cb(null)
            return

        if now - @lastSuccessfullAd < @cappingMinimumTimeInterval
            cb(null)
            return

        # TODO: handle request timeout

        VASTParser.parse url, headers, timeout, logger, (response) =>
            cb(response)


    # 'Fake' static constructor
    do ->
        storage = VASTUtil.storage
        defineProperty = Object.defineProperty

        # Create new properties for VASTClient, using ECMAScript 5
        # we can define custom getters and setters logic.
        # By this way, we implement the use of storage inside these methods,
        # while it will be fully transparent for the user
        ['lastSuccessfullAd', 'totalCalls', 'totalCallsTimeout'].forEach (property) ->
            defineProperty VASTClient, property,
            {
                get: () -> storage.getItem property
                set: (value) -> storage.setItem property, value
                configurable: false
                enumerable: true
            }
            return

        # Init values if not already set
        VASTClient.totalCalls ?= 0
        VASTClient.totalCallsTimeout ?= 0
        return

module.exports = VASTClient
