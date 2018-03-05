CreativeCompanionParser = require './creative_companion_parser.coffee'
CreativeLinearParser = require './creative_linear_parser.coffee'
CreativeNonLinearParser = require './creative_non_linear_parser.coffee'
ParserUtils = require './parser_utils.coffee'
VASTAd = require '../ad.coffee'
VASTAdExtension = require '../extension.coffee'
VASTAdExtensionChild = require '../extensionchild.coffee'

class AdParser
    constructor: ->
        @creativeCompanionParser = new CreativeCompanionParser()
        @creativeNonLinearParser = new CreativeNonLinearParser()
        @creativeLinearParser = new CreativeLinearParser()
        @utils = new ParserUtils()

    parse: (inLineElement) ->
        ad = new VASTAd()
        ad.id = inLineElement.getAttribute("id") || null
        ad.sequence = inLineElement.getAttribute("sequence") || null

        for node in inLineElement.childNodes
            switch node.nodeName
                when "Error"
                    ad.errorURLTemplates.push (@utils.parseNodeText node)

                when "Impression"
                    ad.impressionURLTemplates.push (@utils.parseNodeText node)

                when "Creatives"
                    for creativeElement in @utils.childrenByName(node, "Creative")
                        creativeAttributes =
                            id           : creativeElement.getAttribute('id') or null
                            adId         : @parseCreativeAdIdAttribute(creativeElement)
                            sequence     : creativeElement.getAttribute('sequence') or null
                            apiFramework : creativeElement.getAttribute('apiFramework') or null

                        for creativeTypeElement in creativeElement.childNodes
                            switch creativeTypeElement.nodeName
                                when "Linear"
                                    creative = @creativeLinearParser.parse creativeTypeElement, creativeAttributes
                                    if creative
                                        ad.creatives.push creative
                                when "NonLinearAds"
                                    creative = @creativeNonLinearParser.parse creativeTypeElement, creativeAttributes
                                    if creative
                                        ad.creatives.push creative
                                when "CompanionAds"
                                    creative = @creativeCompanionParser.parse creativeTypeElement, creativeAttributes
                                    if creative
                                        ad.creatives.push creative
                when "Extensions"
                    @parseExtension(ad.extensions, @utils.childrenByName(node, "Extension"))

                when "AdSystem"
                    ad.system =
                        value : @utils.parseNodeText node
                        version : node.getAttribute("version") || null

                when "AdTitle"
                    ad.title = @utils.parseNodeText node

                when "Description"
                    ad.description = @utils.parseNodeText node

                when "Advertiser"
                    ad.advertiser = @utils.parseNodeText node

                when "Pricing"
                    ad.pricing =
                        value    : @utils.parseNodeText node
                        model    : node.getAttribute("model") || null
                        currency : node.getAttribute("currency") || null

                when "Survey"
                    ad.survey = @utils.parseNodeText node

        return ad

    parseExtension: (collection, extensions) ->
        for extNode in extensions
            ext = new VASTAdExtension()

            if extNode.attributes
                for extNodeAttr in extNode.attributes
                    ext.attributes[extNodeAttr.nodeName] = extNodeAttr.nodeValue;

            for childNode in extNode.childNodes
                txt = @utils.parseNodeText(childNode)

                # ignore comments / empty value
                if childNode.nodeName isnt '#comment' and txt isnt ''
                    extChild = new VASTAdExtensionChild()
                    extChild.name = childNode.nodeName
                    extChild.value = txt

                    if childNode.attributes
                        for extChildNodeAttr in childNode.attributes
                            extChild.attributes[extChildNodeAttr.nodeName] = extChildNodeAttr.nodeValue;

                    ext.children.push extChild

            collection.push ext

    parseCreativeAdIdAttribute: (creativeElement) ->
        return creativeElement.getAttribute('AdID') or  # VAST 2 spec
               creativeElement.getAttribute('adID') or  # VAST 3 spec
               creativeElement.getAttribute('adId') or  # VAST 4 spec
               null

module.exports = AdParser
