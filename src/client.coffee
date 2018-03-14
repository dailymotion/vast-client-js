VASTParser = require './parser/parser.coffee'
VASTUtil = require './util.js'

class VASTClient
    @cappingFreeLunch: 0
    @cappingMinimumTimeInterval: 0
    @options:
        withCredentials : false,
        timeout : 0
    @vastParser = new VASTParser()

    @get: (url, opts, cb) ->
        now = +new Date()

        extend = exports.extend = (object, properties) ->
            for key, val of properties
                object[key] = val
            object

        if not cb
            cb = opts if typeof opts is 'function'
            options = {}

        options = extend @options, opts

        # Check totalCallsTimeout (first call + 1 hour), if older than now,
        # reset totalCalls number, by this way the client will be eligible again
        # for freelunch capping
        if @totalCallsTimeout < now
            @totalCalls = 1
            @totalCallsTimeout = now + (60 * 60 * 1000)
        else
            @totalCalls++

        if @cappingFreeLunch >= @totalCalls
            cb(null, new Error("VAST call canceled – FreeLunch capping not reached yet #{@totalCalls}/#{@cappingFreeLunch}"))
            return

        timeSinceLastCall = now - @lastSuccessfullAd
        # Check timeSinceLastCall to be a positive number. If not, this mean the
        # previous was made in the future. We reset lastSuccessfullAd value
        if timeSinceLastCall < 0
            @lastSuccessfullAd = 0
        else if timeSinceLastCall < @cappingMinimumTimeInterval
            cb(null, new Error("VAST call canceled – (#{@cappingMinimumTimeInterval})ms minimum interval reached"))
            return

        @vastParser.parse url, options, (response, err) =>
            cb(response, err)


    # 'Fake' static constructor
    do ->
        @vastUtil = new VASTUtil()
        storage = @vastUtil.getStorage()
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
        VASTClient.lastSuccessfullAd ?= 0
        VASTClient.totalCalls ?= 0
        VASTClient.totalCallsTimeout ?= 0
        return

module.exports = VASTClient
