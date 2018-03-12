VASTCompanionAd = require '../companionad.js'
VASTCreativeCompanion = require('../creative.js').VASTCreativeCompanion
ParserUtils = require './parser_utils.coffee'

class CreativeCompanionParser
    constructor: ->
        @utils = new ParserUtils()

    parse: (creativeElement, creativeAttributes) ->
        creative = new VASTCreativeCompanion(creativeAttributes)

        for companionResource in @utils.childrenByName(creativeElement, "Companion")
            companionAd = new VASTCompanionAd()
            companionAd.id = companionResource.getAttribute("id") or null
            companionAd.width = companionResource.getAttribute("width")
            companionAd.height = companionResource.getAttribute("height")
            companionAd.companionClickTrackingURLTemplates = []
            for htmlElement in @utils.childrenByName(companionResource, "HTMLResource")
                companionAd.type = htmlElement.getAttribute("creativeType") or 'text/html'
                companionAd.htmlResource = @utils.parseNodeText(htmlElement)
            for iframeElement in @utils.childrenByName(companionResource, "IFrameResource")
                companionAd.type = iframeElement.getAttribute("creativeType") or 0
                companionAd.iframeResource = @utils.parseNodeText(iframeElement)
            for staticElement in @utils.childrenByName(companionResource, "StaticResource")
                companionAd.type = staticElement.getAttribute("creativeType") or 0
                for child in @utils.childrenByName(companionResource, "AltText")
                    companionAd.altText = @utils.parseNodeText(child)
                companionAd.staticResource = @utils.parseNodeText(staticElement)
            for trackingEventsElement in @utils.childrenByName(companionResource, "TrackingEvents")
                for trackingElement in @utils.childrenByName(trackingEventsElement, "Tracking")
                    eventName = trackingElement.getAttribute("event")
                    trackingURLTemplate = @utils.parseNodeText(trackingElement)
                    if eventName? and trackingURLTemplate?
                        companionAd.trackingEvents[eventName] ?= []
                        companionAd.trackingEvents[eventName].push trackingURLTemplate
            for clickTrackingElement in @utils.childrenByName(companionResource, "CompanionClickTracking")
                companionAd.companionClickTrackingURLTemplates.push @utils.parseNodeText(clickTrackingElement)
            companionAd.companionClickThroughURLTemplate = @utils.parseNodeText(@utils.childByName(companionResource, "CompanionClickThrough"))
            companionAd.companionClickTrackingURLTemplate = @utils.parseNodeText(@utils.childByName(companionResource, "CompanionClickTracking"))
            creative.variations.push companionAd

        return creative

module.exports = CreativeCompanionParser
