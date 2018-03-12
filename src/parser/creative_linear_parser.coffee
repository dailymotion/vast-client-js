ParserUtils = require './parser_utils.coffee'
VASTCreativeLinear = require('../creative.js').VASTCreativeLinear
VASTIcon = require '../icon.js'
VASTMediaFile = require '../mediafile.js'

class CreativeLinearParser
    constructor: ->
        @utils = new ParserUtils()

    parse: (creativeElement, creativeAttributes) ->
        creative = new VASTCreativeLinear(creativeAttributes)

        creative.duration = @utils.parseDuration @utils.parseNodeText(@utils.childByName(creativeElement, "Duration"))
        skipOffset = creativeElement.getAttribute("skipoffset")

        if not skipOffset? then creative.skipDelay = null
        else if skipOffset.charAt(skipOffset.length - 1) is "%" and  creative.duration != -1
            percent = parseInt(skipOffset, 10)
            creative.skipDelay = creative.duration * (percent / 100)
        else
            creative.skipDelay = @utils.parseDuration skipOffset

        videoClicksElement = @utils.childByName(creativeElement, "VideoClicks")
        if videoClicksElement?
            creative.videoClickThroughURLTemplate = @utils.parseNodeText(@utils.childByName(videoClicksElement, "ClickThrough"))
            for clickTrackingElement in @utils.childrenByName(videoClicksElement, "ClickTracking")
                creative.videoClickTrackingURLTemplates.push @utils.parseNodeText(clickTrackingElement)
            for customClickElement in @utils.childrenByName(videoClicksElement, "CustomClick")
                creative.videoCustomClickURLTemplates.push @utils.parseNodeText(customClickElement)

        adParamsElement = @utils.childByName(creativeElement, "AdParameters")
        if adParamsElement?
            creative.adParameters = @utils.parseNodeText(adParamsElement)

        for trackingEventsElement in @utils.childrenByName(creativeElement, "TrackingEvents")
            for trackingElement in @utils.childrenByName(trackingEventsElement, "Tracking")
                eventName = trackingElement.getAttribute("event")
                trackingURLTemplate = @utils.parseNodeText(trackingElement)
                if eventName? and trackingURLTemplate?
                    if eventName == "progress"
                        offset = trackingElement.getAttribute("offset")
                        if not offset
                            continue
                        if offset.charAt(offset.length - 1) == '%'
                            eventName = "progress-#{offset}"
                        else
                            eventName = "progress-#{Math.round(@utils.parseDuration offset)}"

                    creative.trackingEvents[eventName] ?= []
                    creative.trackingEvents[eventName].push trackingURLTemplate

        for mediaFilesElement in @utils.childrenByName(creativeElement, "MediaFiles")
            for mediaFileElement in @utils.childrenByName(mediaFilesElement, "MediaFile")
                mediaFile = new VASTMediaFile()
                mediaFile.id = mediaFileElement.getAttribute("id")
                mediaFile.fileURL = @utils.parseNodeText(mediaFileElement)
                mediaFile.deliveryType = mediaFileElement.getAttribute("delivery")
                mediaFile.codec = mediaFileElement.getAttribute("codec")
                mediaFile.mimeType = mediaFileElement.getAttribute("type")
                mediaFile.apiFramework = mediaFileElement.getAttribute("apiFramework")
                mediaFile.bitrate = parseInt mediaFileElement.getAttribute("bitrate") or 0
                mediaFile.minBitrate = parseInt mediaFileElement.getAttribute("minBitrate") or 0
                mediaFile.maxBitrate = parseInt mediaFileElement.getAttribute("maxBitrate") or 0
                mediaFile.width = parseInt mediaFileElement.getAttribute("width") or 0
                mediaFile.height = parseInt mediaFileElement.getAttribute("height") or 0

                scalable = mediaFileElement.getAttribute("scalable")
                if scalable and typeof scalable is "string"
                  scalable = scalable.toLowerCase()
                  if scalable is "true" then mediaFile.scalable = true
                  else if scalable is "false" then mediaFile.scalable = false

                maintainAspectRatio = mediaFileElement.getAttribute("maintainAspectRatio")
                if maintainAspectRatio and typeof maintainAspectRatio is "string"
                  maintainAspectRatio = maintainAspectRatio.toLowerCase()
                  if maintainAspectRatio is "true" then mediaFile.maintainAspectRatio = true
                  else if maintainAspectRatio is "false" then mediaFile.maintainAspectRatio = false

                creative.mediaFiles.push mediaFile

        iconsElement = @utils.childByName(creativeElement, "Icons")
        if iconsElement?
            for iconElement in @utils.childrenByName(iconsElement, "Icon")
                icon = new VASTIcon()
                icon.program = iconElement.getAttribute("program")
                icon.height = parseInt iconElement.getAttribute("height") or 0
                icon.width = parseInt iconElement.getAttribute("width") or 0
                icon.xPosition = @parseXPosition iconElement.getAttribute("xPosition")
                icon.yPosition = @parseYPosition iconElement.getAttribute("yPosition")
                icon.apiFramework = iconElement.getAttribute("apiFramework")
                icon.offset = @utils.parseDuration iconElement.getAttribute("offset")
                icon.duration = @utils.parseDuration iconElement.getAttribute("duration")

                for htmlElement in @utils.childrenByName(iconElement, "HTMLResource")
                    icon.type = htmlElement.getAttribute("creativeType") or 'text/html'
                    icon.htmlResource = @utils.parseNodeText(htmlElement)

                for iframeElement in @utils.childrenByName(iconElement, "IFrameResource")
                    icon.type = iframeElement.getAttribute("creativeType") or 0
                    icon.iframeResource = @utils.parseNodeText(iframeElement)

                for staticElement in @utils.childrenByName(iconElement, "StaticResource")
                    icon.type = staticElement.getAttribute("creativeType") or 0
                    icon.staticResource = @utils.parseNodeText(staticElement)

                iconClicksElement = @utils.childByName(iconElement, "IconClicks")
                if iconClicksElement?
                    icon.iconClickThroughURLTemplate = @utils.parseNodeText(@utils.childByName(iconClicksElement, "IconClickThrough"))
                    for iconClickTrackingElement in @utils.childrenByName(iconClicksElement, "IconClickTracking")
                        icon.iconClickTrackingURLTemplates.push @utils.parseNodeText(iconClickTrackingElement)

                icon.iconViewTrackingURLTemplate = @utils.parseNodeText(@utils.childByName(iconElement, "IconViewTracking"))

                creative.icons.push icon

        return creative

    parseXPosition: (xPosition) ->
        if xPosition in ["left", "right"]
            return xPosition

        return parseInt xPosition or 0

    parseYPosition: (yPosition) ->
        if yPosition in ["top", "bottom"]
            return yPosition

        return parseInt yPosition or 0

module.exports = CreativeLinearParser
