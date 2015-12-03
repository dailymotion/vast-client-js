VASTClient = require('./client')
VASTUtil = require('./util')
VASTCreativeLinear = require('./creative').VASTCreativeLinear
EventEmitter = require('events').EventEmitter

class VASTTracker extends EventEmitter
    constructor: (@ad, @creative) ->
        @muted = no
        @impressed = no
        @skipable = no
        @skipDelayDefault = -1
        @trackingEvents = {}
        # Tracker listeners should be notified with some events
        # no matter if there is a tracking URL or not
        @emitAlwaysEvents = [
            'creativeView',
            'start', 'firstQuartile', 'midpoint', 'thirdQuartile', 'complete',
            'resume', 'pause', 'rewind', 'skip', 'closeLinear', 'close'
        ]
        # Duplicate the creative's trackingEvents property so we can alter it
        for eventName, events of @creative.trackingEvents
            @trackingEvents[eventName] = events.slice(0)
        if @creative instanceof VASTCreativeLinear
            @setDuration @creative.duration

            @skipDelay = @creative.skipDelay
            @linear = yes
            @clickThroughURLTemplate = @creative.videoClickThroughURLTemplate
            @clickTrackingURLTemplates = @creative.videoClickTrackingURLTemplates
        else
            @skipDelay = -1
            @linear = no

        @on 'start', ->
            VASTClient.lastSuccessfullAd = +new Date()
            return

    setDuration: (duration) ->
        @assetDuration = duration
        # beware of key names, theses are also used as event names
        @quartiles =
            'firstQuartile' : Math.round(25 * @assetDuration) / 100
            'midpoint'      : Math.round(50 * @assetDuration) / 100
            'thirdQuartile' : Math.round(75 * @assetDuration) / 100

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
                events.push "progress-#{Math.round(progress)}"

                for quartile, time of @quartiles
                    events.push quartile if time <= progress <= (time + 1)

            for eventName in events
                @track eventName, yes

            if progress < @progress
                @track "rewind"

        @progress = progress


    setMuted: (muted) ->
        if @muted != muted
            @track(if muted then "mute" else "unmute")
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

    # To be called when the video started to log the impression
    load: ->
        unless @impressed
            @impressed = yes
            @trackURLs @ad.impressionURLTemplates
            @track "creativeView"

    # To be called when an error happen with the proper error code
    errorWithCode: (errorCode) ->
        @trackURLs @ad.errorURLTemplates, ERRORCODE: errorCode

    # To be called when the user watched the creative until it's end
    complete: ->
        @track "complete"

    # To be called when the player or the window is closed during the ad
    close: ->
        @track(if @linear then "closeLinear" else "close")

    # Deprecated
    stop: ->
    	# noop for backward compat

    # To be called when the skip button is clicked
    skip: ->
        @track "skip"
        @trackingEvents = []

    # To be called when the user clicks on the creative
    click: ->
        if @clickTrackingURLTemplates?.length
            @trackURLs @clickTrackingURLTemplates

        if @clickThroughURLTemplate?
            if @linear
                variables = CONTENTPLAYHEAD: @progressFormated()
            clickThroughURL = VASTUtil.resolveURLTemplates([@clickThroughURLTemplate], variables)[0]

            @emit "clickthrough", clickThroughURL

    track: (eventName, once=no) ->

        # closeLinear event was introduced in VAST 3.0
        # Fallback to vast 2.0 close event if necessary
        if eventName is 'closeLinear' and (not @trackingEvents[eventName]? and @trackingEvents['close']?)
            eventName = 'close'

        trackingURLTemplates = @trackingEvents[eventName]
        idx = @emitAlwaysEvents.indexOf(eventName)

        if trackingURLTemplates?
            @emit eventName, ''
            @trackURLs trackingURLTemplates
        else if idx isnt -1
            @emit eventName, ''

        if once is yes
            delete @trackingEvents[eventName]
            @emitAlwaysEvents.splice idx, 1 if idx > -1
        return

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
