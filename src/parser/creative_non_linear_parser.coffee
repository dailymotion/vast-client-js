ParserUtils = require './parser_utils.js'
VASTCreativeNonLinear = require('../creative.js').VASTCreativeNonLinear
VASTNonLinear = require '../nonlinear.js'

class CreativeNonLinearParser
    constructor: ->
        @utils = new ParserUtils()

    parse: (creativeElement, creativeAttributes) ->
        creative = new VASTCreativeNonLinear(creativeAttributes)

        for trackingEventsElement in @utils.childrenByName(creativeElement, "TrackingEvents")
          for trackingElement in @utils.childrenByName(trackingEventsElement, "Tracking")
            eventName = trackingElement.getAttribute("event")
            trackingURLTemplate = @utils.parseNodeText(trackingElement)
            if eventName? and trackingURLTemplate?
              creative.trackingEvents[eventName] ?= []
              creative.trackingEvents[eventName].push trackingURLTemplate

        for nonlinearResource in @utils.childrenByName(creativeElement, "NonLinear")
            nonlinearAd = new VASTNonLinear()
            nonlinearAd.id = nonlinearResource.getAttribute("id") or null
            nonlinearAd.width = nonlinearResource.getAttribute("width")
            nonlinearAd.height = nonlinearResource.getAttribute("height")
            nonlinearAd.expandedWidth = nonlinearResource.getAttribute("expandedWidth")
            nonlinearAd.expandedHeight = nonlinearResource.getAttribute("expandedHeight")
            nonlinearAd.scalable = @utils.parseBoolean nonlinearResource.getAttribute("scalable")
            nonlinearAd.maintainAspectRatio = @utils.parseBoolean nonlinearResource.getAttribute("maintainAspectRatio")
            nonlinearAd.minSuggestedDuration = @utils.parseDuration nonlinearResource.getAttribute("minSuggestedDuration")
            nonlinearAd.apiFramework = nonlinearResource.getAttribute("apiFramework")

            for htmlElement in @utils.childrenByName(nonlinearResource, "HTMLResource")
                nonlinearAd.type = htmlElement.getAttribute("creativeType") or 'text/html'
                nonlinearAd.htmlResource = @utils.parseNodeText(htmlElement)

            for iframeElement in @utils.childrenByName(nonlinearResource, "IFrameResource")
                nonlinearAd.type = iframeElement.getAttribute("creativeType") or 0
                nonlinearAd.iframeResource = @utils.parseNodeText(iframeElement)

            for staticElement in @utils.childrenByName(nonlinearResource, "StaticResource")
                nonlinearAd.type = staticElement.getAttribute("creativeType") or 0
                nonlinearAd.staticResource = @utils.parseNodeText(staticElement)

            adParamsElement = @utils.childByName(nonlinearResource, "AdParameters")
            if adParamsElement?
                nonlinearAd.adParameters = @utils.parseNodeText(adParamsElement)

            nonlinearAd.nonlinearClickThroughURLTemplate = @utils.parseNodeText(@utils.childByName(nonlinearResource, "NonLinearClickThrough"))
            for clickTrackingElement in @utils.childrenByName(nonlinearResource, "NonLinearClickTracking")
                nonlinearAd.nonlinearClickTrackingURLTemplates.push @utils.parseNodeText(clickTrackingElement)

            creative.variations.push nonlinearAd

        return creative

module.exports = CreativeNonLinearParser
