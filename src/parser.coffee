URLHandler = require './urlhandler.coffee'
VASTResponse = require './response.coffee'
VASTAd = require './ad.coffee'
VASTUtil = require './util.coffee'
VASTCreativeLinear = require('./creative.coffee').VASTCreativeLinear
VASTMediaFile = require './mediafile.coffee'

class VASTParser
    @parse: (url, cb) ->
        @_parse url, null, (err, response) ->
            cb(response)

    @_parse: (url, parentURLs, cb) ->
        parentURLs ?= []
        parentURLs.push url

        URLHandler.get url, (err, xml) =>
            return cb(err) if err?

            response = new VASTResponse()

            unless xml?.documentElement? and xml.documentElement.nodeName is "VAST"
                return cb()

            for node in xml.documentElement.childNodes
                if node.nodeName is 'Error'
                    response.errorURLTemplates.push node.textContent

            for node in xml.documentElement.childNodes
                if node.nodeName is 'Ad'
                    ad = @parseAdElement node
                    if ad?
                        response.ads.push ad
                    else
                        # VAST version of response not supported.
                        VASTUtil.track(response.errorURLTemplates, ERRORCODE: 101)

            complete = =>
                return unless response
                for ad in response.ads
                    return if ad.nextWrapperURL?
                if response.ads.length == 0
                    # No Ad Response
                    # The VAST <Error> element is optional but if included, the video player must send a request to the URI
                    # provided when the VAST response returns an empty InLine response after a chain of one or more wrapper ads.
                    # If an [ERRORCODE] macro is included, the video player should substitute with error code 303.
                    VASTUtil.track(response.errorURLTemplates, ERRORCODE: 303)
                    response = null
                cb(null, response)

            for ad in response.ads
                continue unless ad.nextWrapperURL?

                if parentURLs.length >= 10 or ad.nextWrapperURL in parentURLs
                    # Wrapper limit reached, as defined by the video player.
                    # Too many Wrapper responses have been received with no InLine response.
                    VASTUtil.track(ad.errorURLTemplates, ERRORCODE: 302)
                    response.ads.splice(response.ads.indexOf(ad), 1)
                    complete()
                    break

                if ad.nextWrapperURL.indexOf('://') == -1
                    # Resolve relative URLs (mainly for unit testing)
                    baseURL = url.slice(0, url.lastIndexOf('/'))
                    ad.nextWrapperURL = "#{baseURL}/#{ad.nextWrapperURL}"

                @_parse ad.nextWrapperURL, parentURLs, (err, wrappedResponse) =>
                    if err?
                        # Timeout of VAST URI provided in Wrapper element, or of VAST URI provided in a subsequent Wrapper element.
                        # (URI was either unavailable or reached a timeout as defined by the video player.)
                        VASTUtil.track(ad.errorURLTemplates, ERRORCODE: 301)
                        response.ads.splice(response.ads.indexOf(ad), 1)
                    else if not wrappedResponse?
                        # No Ads VAST response after one or more Wrappers
                        VASTUtil.track(ad.errorURLTemplates, ERRORCODE: 303)
                        response.ads.splice(response.ads.indexOf(ad), 1)
                    else
                        response.errorURLTemplates = response.errorURLTemplates.concat wrappedResponse.errorURLTemplates
                        index = response.ads.indexOf(ad)
                        response.ads.splice(index, 1)
                        for wrappedAd in wrappedResponse.ads
                            wrappedAd.errorURLTemplates = ad.errorURLTemplates.concat wrappedAd.errorURLTemplates
                            wrappedAd.impressionURLTemplates = ad.impressionURLTemplates.concat wrappedAd.impressionURLTemplates
                            response.ads.splice index, 0, wrappedAd

                    complete()

            complete()

    @childByName: (node, name) ->
        for child in node.childNodes
            if child.nodeName is name
                return child

    @childsByName: (node, name) ->
        childs = []
        for child in node.childNodes
            if child.nodeName is name
                childs.push child
        return childs


    @parseAdElement: (adElement) ->
        for adTypeElement in adElement.childNodes
            if adTypeElement.nodeName is "Wrapper"
                return @parseWrapperElement adTypeElement
            else if adTypeElement.nodeName is "InLine"
                return @parseInLineElement adTypeElement

    @parseWrapperElement: (wrapperElement) ->
        ad = @parseInLineElement wrapperElement
        wrapperURLElement = @childByName wrapperElement, "VASTAdTagURI"
        if wrapperURLElement?
            ad.nextWrapperURL = wrapperURLElement.textContent


        if ad.nextWrapperURL?
            return ad

    @parseInLineElement: (inLineElement) ->
        ad = new VASTAd()

        for node in inLineElement.childNodes
            switch node.nodeName
                when "Error"
                    ad.errorURLTemplates.push node.textContent

                when "Impression"
                    ad.impressionURLTemplates.push node.textContent

                when "Creatives"
                    creativeElement = @childByName(node, "Creative")
                    for creativeTypeElement in creativeElement.childNodes
                        switch creativeTypeElement.nodeName
                            when "Linear"
                                creative = @parseCreativeLinearElement creativeTypeElement
                                if creative
                                    ad.creatives.push creative
                            #when "NonLinearAds"
                                # TODO
                            #when "CompanionAds"
                                # TODO

        return ad

    @parseCreativeLinearElement: (creativeElement) ->
        creative = new VASTCreativeLinear()

        creative.duration = @parseDuration @childByName(creativeElement, "Duration")?.textContent
        if creative.duration == -1
            return null # can't parse duration, element is required

        skipOffset = creativeElement.getAttribute("skipoffset")
        if skipOffset? and skipOffset[skipOffset.length - 1] is "%"
            percent = parseInt(skipOffset)
            creative.skipOffset = creative.duration * (percent / 100)
        else
            creative.skipOffset = @parseDuration skipOffset

        videoClicksElement = @childByName(creativeElement, "VideoClicks")
        if videoClicksElement?
            creative.videoClickThroughURLTemplate = @childByName(videoClicksElement, "ClickThrough")?.textContent
            creative.videoClickTrackingURLTemplate = @childByName(videoClicksElement, "ClickTracking")?.textContent

        for trackingEventsElement in @childsByName(creativeElement, "TrackingEvents")
            for trackingElement in @childsByName(trackingEventsElement, "Tracking")
                eventName = trackingElement.getAttribute("event")
                trackingURLTemplate = trackingElement.textContent
                if eventName? and trackingURLTemplate?
                    creative.trackingEvents[eventName] ?= []
                    creative.trackingEvents[eventName].push trackingURLTemplate

        for mediaFilesElement in @childsByName(creativeElement, "MediaFiles")
            for mediaFileElement in @childsByName(mediaFilesElement, "MediaFile")
                mediaFile = new VASTMediaFile()
                mediaFile.fileURL = mediaFileElement.textContent
                mediaFile.deliveryType = mediaFileElement.getAttribute("delivery")
                mediaFile.codec = mediaFileElement.getAttribute("codec")
                mediaFile.mimeType = mediaFileElement.getAttribute("type")
                mediaFile.bitrate = parseInt mediaFileElement.getAttribute("bitrate") or 0
                mediaFile.minBitrate = parseInt mediaFileElement.getAttribute("minBitrate") or 0
                mediaFile.maxBitrate = parseInt mediaFileElement.getAttribute("maxBitrate") or 0
                mediaFile.width = parseInt mediaFileElement.getAttribute("width") or 0
                mediaFile.height = parseInt mediaFileElement.getAttribute("height") or 0
                creative.mediaFiles.push mediaFile

        return creative

    @parseDuration: (durationString) ->
        unless (durationString?)
            return -1
        durationComponents = durationString.split(":")
        if durationComponents.length != 3
            return -1

        secondsAndMS = durationComponents[2].split(".")
        seconds = parseInt secondsAndMS[0]
        if secondsAndMS.length == 2
            seconds += parseFloat "0." + secondsAndMS[1]

        minutes = parseInt durationComponents[1] * 60
        hours = parseInt durationComponents[0] * 60 * 60

        if isNaN hours or isNaN minutes or isNaN seconds or minutes > 60 * 60 or seconds > 60
            return -1
        return hours + minutes + seconds

module.exports = VASTParser