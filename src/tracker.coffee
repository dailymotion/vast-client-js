VASTClient = require('./client.coffee')
VASTUtil = require('./util.coffee')
VASTCreativeLinear = require('./creative.coffee').VASTCreativeLinear
EventEmitter = require('events').EventEmitter

class VASTTracker extends EventEmitter
    constructor: (@ad, @creative) ->
        @muted = no
        @impressed = no
        @skipable = no
        @skipDelayDefault = -1
        @trackingEvents = {}
        # Duplicate the creative's trackingEvents property so we can alter it
        for eventName, events of creative.trackingEvents
            @trackingEvents[eventName] = events.slice(0)
        if creative instanceof VASTCreativeLinear
            @assetDuration = creative.duration
            @skipDelay = creative.skipDelay
            @linear = yes
            @clickThroughURLTemplate = creative.videoClickThroughURLTemplate
            @clickTrackingURLTemplate = creative.videoClickTrackingURLTemplate
        else
            @skipDelay = -1
            @linear = no

        @on 'start', ->
            VASTClient.lastSuccessfullAd = +new Date()
            return

    setProgress: (progress) ->
        skipDelay = if @skipDelay is null then @skipDelayDefault else @skipDelay

        if skipDelay != -1 and not @skipable
            if skipDelay > progress
                @emit 'skip-countdown', skipDelay - progress
            else
                @skipable = yes
                @emit 'skip-countdown', 0

        if @linear and @assetDuration > 0
            events = []

            if progress > 0
                events.push "start"

                percent = Math.round(progress / @assetDuration * 100)
                events.push "progress-#{percent}%"

                events.push "firstQuartile" if percent >= 25
                events.push "midpoint" if percent >= 50
                events.push "thirdQuartile" if percent >= 75

            for eventName in events
                @track eventName
                delete @trackingEvents[eventName]

            if progress < @progress
                @track "rewind"

        @progress = progress


    setMuted: (muted) ->
        if @muted != muted
            @track(if muted then "muted" else "unmuted")
        @muted = muted

    setPaused: (paused) ->
        if @paused != paused
            @track(if paused then "pause" else "resume")
        @paused = paused

    setFullscreen: (fullscreen) ->
        if @fullscreen != fullscreen
            @track(if fullscreen then "fullscreen" else "exitFullscreen")
        @fullscreen = fullscreen

    setSkipDelay: (duration) ->
        @skipDelay = duration if typeof duration is 'number'

    load: ->
        unless @impressed
            @impressed = yes
            @trackURLs @ad.impressionURLTemplates
            @track "creativeView"

    errorWithCode: (errorCode) ->
        @trackURLs @ad.errorURLTemplates, ERRORCODE: errorCode

    complete: ->
        @track "complete"

    stop: ->
        @track(if @linear then "cloaseLinear" else "close")

    skip: ->
        @track "skip"
        @trackingEvents = []

    click: ->
        if @clickTrackingURLTemplate?
            @trackURLs @clickTrackingURLTemplate

        if @clickThroughURLTemplate?
            if @linear
                variables = CONTENTPLAYHEAD: @progressFormated()
            clickThroughURL = VASTUtil.resolveURLTemplates([@clickThroughURLTemplate], variables)[0]

            @emit "clickthrough", clickThroughURL

    track: (eventName) ->
        trackingURLTemplates = @trackingEvents[eventName]
        if trackingURLTemplates?
            @emit eventName, ''
            @trackURLs trackingURLTemplates

    trackURLs: (URLTemplates, variables) ->
        variables ?= {}

        if @linear
            variables["CONTENTPLAYHEAD"] = @progressFormated()

        VASTUtil.track(URLTemplates, variables)

    progressFormated: ->
        seconds = parseInt(@progress)
        h = seconds / (60 * 60)
        h = "0#{h}" if h.length < 2
        m = seconds / 60 % 60
        m = "0#{m}" if m.length < 2
        s = seconds % 60
        s = "0#{m}" if s.length < 2
        ms = parseInt((@progress - seconds) * 100)
        return "#{h}:#{m}:#{s}.#{ms}"

module.exports = VASTTracker