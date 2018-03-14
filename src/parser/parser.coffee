AdParser = require './ad_parser.js'
ParserUtils = require './parser_utils.js'
URLHandler = require '../urlhandler.js'
VASTResponse = require '../response.js'
VASTUtil = require '../util.js'
EventEmitter = require('events').EventEmitter

DEFAULT_MAX_WRAPPER_WIDTH = 10

DEFAULT_EVENT_DATA =
    ERRORCODE  : 900
    extensions : []

class VASTParser
    constructor: ->
        @maxWrapperDepth = null
        @URLTemplateFilters = []
        @utils = new ParserUtils();
        @adParser = new AdParser()
        @vastUtil = new VASTUtil()
        @urlHandler = new URLHandler()
        @vent = new EventEmitter()

    addURLTemplateFilter: (func) ->
        @URLTemplateFilters.push(func) if typeof func is 'function'
        return

    removeURLTemplateFilter: () -> @URLTemplateFilters.pop()
    countURLTemplateFilters: () -> @URLTemplateFilters.length
    clearUrlTemplateFilters: () -> @URLTemplateFilters = []

    parse: (url, options, cb) ->
        if not cb
            cb = options if typeof options is 'function'
            options = {}

        @maxWrapperDepth = options.wrapperLimit || DEFAULT_MAX_WRAPPER_WIDTH
        options.wrapperDepth = 0

        @_parse url, null, options, (err, response) ->
            cb(response, err)

    load: (xml, options, cb) ->
        if not cb
            cb = options if typeof options is 'function'
            options = {}

        @parseXmlDocument(null, [], options, xml, cb)

    track: (templates, errorCode, data...) ->
        @vent.emit 'VAST-error', @vastUtil.merge(DEFAULT_EVENT_DATA, errorCode, data...)
        @vastUtil.track(templates, errorCode)

    on: (eventName, cb) ->
        @vent.on eventName, cb

    once: (eventName, cb) ->
        @vent.once eventName, cb

    off: (eventName, cb) ->
        @vent.removeListener eventName, cb

    _parse: (url, parentURLs, options, cb) ->
        # Process url with defined filter
        url = filter(url) for filter in @URLTemplateFilters
        console.log(url)

        parentURLs ?= []
        parentURLs.push url

        @vent.emit 'resolving', { url: url }

        @urlHandler.get url, options, (err, xml) =>
            @vent.emit 'resolved', { url: url }

            return cb(err) if err?
            @parseXmlDocument(url, parentURLs, options, xml, cb)

    parseXmlDocument: (url, parentURLs, options, xml, cb) =>
        # Current VAST depth
        wrapperDepth = options.wrapperDepth++

        response = new VASTResponse()

        unless xml?.documentElement? and xml.documentElement.nodeName is "VAST"
            return cb(new Error('Invalid VAST XMLDocument'))

        for node in xml.documentElement.childNodes
            if node.nodeName is 'Error'
                response.errorURLTemplates.push (@utils.parseNodeText node)

        for node in xml.documentElement.childNodes
            if node.nodeName is 'Ad'
                ad = @parseAdElement node
                if ad?
                    response.ads.push ad
                else
                    # VAST version of response not supported.
                    @track(response.errorURLTemplates, ERRORCODE: 101)

        complete = () =>
            for ad, index in response.ads by -1
                # Still some Wrappers URL to be resolved -> continue
                return if ad.nextWrapperURL?

            # We've to wait for all <Ad> elements to be parsed before handling error so we can:
            # - Send computed extensions data
            # - Ping all <Error> URIs defined across VAST files
            if wrapperDepth is 0
                # No Ad case - The parser never bump into an <Ad> element
                if response.ads.length is 0
                    @track(response.errorURLTemplates, ERRORCODE: 303)
                else
                    for ad, index in response.ads by -1
                        # - Error encountred while parsing
                        # - No Creative case - The parser has dealt with soma <Ad><Wrapper> or/and an <Ad><Inline> elements
                        # but no creative was found
                        if ad.errorCode or ad.creatives.length is 0
                            @track(
                                ad.errorURLTemplates.concat(response.errorURLTemplates),
                                { ERRORCODE: ad.errorCode || 303 },
                                { ERRORMESSAGE: ad.errorMessage || '' },
                                { extensions : ad.extensions },
                                { system: ad.system }
                            )
                            response.ads.splice(index, 1)

            cb(null, response)

        loopIndex = response.ads.length
        while loopIndex--
            ad = response.ads[loopIndex]
            continue unless ad.nextWrapperURL?
            do (ad) =>
                if parentURLs.length >= @maxWrapperDepth or ad.nextWrapperURL in parentURLs
                    # Wrapper limit reached, as defined by the video player.
                    # Too many Wrapper responses have been received with no InLine response.
                    ad.errorCode = 302
                    delete ad.nextWrapperURL
                    return

                # Get full URL
                ad.nextWrapperURL = @resolveVastAdTagURI(ad.nextWrapperURL, url)

                @_parse ad.nextWrapperURL, parentURLs, options, (err, wrappedResponse) =>
                    delete ad.nextWrapperURL

                    if err?
                        # Timeout of VAST URI provided in Wrapper element, or of VAST URI provided in a subsequent Wrapper element.
                        # (URI was either unavailable or reached a timeout as defined by the video player.)
                        ad.errorCode = 301
                        ad.errorMessage = err.message
                        complete()
                        return

                    if wrappedResponse?.errorURLTemplates?
                        response.errorURLTemplates = response.errorURLTemplates.concat wrappedResponse.errorURLTemplates

                    if wrappedResponse.ads.length == 0
                        # No ads returned by the wrappedResponse, discard current <Ad><Wrapper> creatives
                        ad.creatives = []
                    else
                        index = response.ads.indexOf(ad)
                        response.ads.splice(index, 1)

                        for wrappedAd in wrappedResponse.ads
                            @mergeWrapperAdData wrappedAd, ad
                            response.ads.splice ++index, 0, wrappedAd

                    complete()

        complete()

    # Convert relative vastAdTagUri
    resolveVastAdTagURI: (vastAdTagUrl, originalUrl) ->
        if vastAdTagUrl.indexOf('//') == 0
            protocol = location.protocol
            return "#{protocol}#{vastAdTagUrl}"

        if vastAdTagUrl.indexOf('://') == -1
            # Resolve relative URLs (mainly for unit testing)
            baseURL = originalUrl.slice(0, originalUrl.lastIndexOf('/'))
            return "#{baseURL}/#{vastAdTagUrl}"

        return vastAdTagUrl

    # Merge ad tracking URLs / extensions data into wrappedAd
    mergeWrapperAdData: (wrappedAd, ad) ->
        wrappedAd.errorURLTemplates = ad.errorURLTemplates.concat wrappedAd.errorURLTemplates
        wrappedAd.impressionURLTemplates = ad.impressionURLTemplates.concat wrappedAd.impressionURLTemplates
        wrappedAd.extensions = ad.extensions.concat wrappedAd.extensions

        for creative in wrappedAd.creatives
            if ad.trackingEvents?[creative.type]?
                for eventName, urls of ad.trackingEvents[creative.type]
                    creative.trackingEvents[eventName] or= []
                    creative.trackingEvents[eventName] = creative.trackingEvents[eventName].concat urls

        if ad.videoClickTrackingURLTemplates?.length
            for creative in wrappedAd.creatives
                if creative.type is 'linear'
                    creative.videoClickTrackingURLTemplates = creative.videoClickTrackingURLTemplates.concat ad.videoClickTrackingURLTemplates

        if ad.videoCustomClickURLTemplates?.length
            for creative in wrappedAd.creatives
                if creative.type is 'linear'
                    creative.videoCustomClickURLTemplates = creative.videoCustomClickURLTemplates.concat ad.videoCustomClickURLTemplates

        # VAST 2.0 support - Use Wrapper/linear/clickThrough when Inline/Linear/clickThrough is null
        if ad.videoClickThroughURLTemplate?
            for creative in wrappedAd.creatives
                if creative.type is 'linear' and not creative.videoClickThroughURLTemplate?
                    creative.videoClickThroughURLTemplate = ad.videoClickThroughURLTemplate

    parseAdElement: (adElement) ->
        for adTypeElement in adElement.childNodes
            continue unless adTypeElement.nodeName in ["Wrapper", "InLine"]

            @utils.copyNodeAttribute "id", adElement, adTypeElement
            @utils.copyNodeAttribute "sequence", adElement, adTypeElement

            if adTypeElement.nodeName is "Wrapper"
                return @parseWrapperElement adTypeElement
            else if adTypeElement.nodeName is "InLine"
                return @adParser.parse adTypeElement

    parseWrapperElement: (wrapperElement) ->
        ad = @adParser.parse wrapperElement
        wrapperURLElement = @utils.childByName wrapperElement, "VASTAdTagURI"
        if wrapperURLElement?
            ad.nextWrapperURL = @utils.parseNodeText wrapperURLElement
        else
            wrapperURLElement = @utils.childByName wrapperElement, "VASTAdTagURL"
            if wrapperURLElement?
                ad.nextWrapperURL = @utils.parseNodeText @utils.childByName wrapperURLElement, "URL"

        for wrapperCreativeElement in ad.creatives
            if wrapperCreativeElement.type in ['linear', 'nonlinear']
                # TrackingEvents Linear / NonLinear
                if wrapperCreativeElement.trackingEvents?
                    ad.trackingEvents or= {}
                    ad.trackingEvents[wrapperCreativeElement.type] or= {}
                    for eventName, urls of wrapperCreativeElement.trackingEvents
                        ad.trackingEvents[wrapperCreativeElement.type][eventName] or= []
                        ad.trackingEvents[wrapperCreativeElement.type][eventName].push url for url in urls
                # ClickTracking
                if wrapperCreativeElement.videoClickTrackingURLTemplates?
                    ad.videoClickTrackingURLTemplates or= [] # tmp property to save wrapper tracking URLs until they are merged
                    ad.videoClickTrackingURLTemplates.push item for item in wrapperCreativeElement.videoClickTrackingURLTemplates
                # ClickThrough
                if wrapperCreativeElement.videoClickThroughURLTemplate?
                    ad.videoClickThroughURLTemplate = wrapperCreativeElement.videoClickThroughURLTemplate
                # CustomClick
                if wrapperCreativeElement.videoCustomClickURLTemplates?
                    ad.videoCustomClickURLTemplates or= [] # tmp property to save wrapper tracking URLs until they are merged
                    ad.videoCustomClickURLTemplates.push item for item in wrapperCreativeElement.videoCustomClickURLTemplates

        if ad.nextWrapperURL?
            return ad

module.exports = VASTParser
