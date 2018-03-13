/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const CreativeCompanionParser = require('./creative_companion_parser.coffee');
const CreativeLinearParser = require('./creative_linear_parser.coffee');
const CreativeNonLinearParser = require('./creative_non_linear_parser.coffee');
const ParserUtils = require('./parser_utils.js');
const VASTAd = require('../ad.js');
const VASTAdExtension = require('../extension.js');
const VASTAdExtensionChild = require('../extensionchild.js');

class AdParser {
    constructor() {
        this.creativeCompanionParser = new CreativeCompanionParser();
        this.creativeNonLinearParser = new CreativeNonLinearParser();
        this.creativeLinearParser = new CreativeLinearParser();
        this.utils = new ParserUtils();
    }

    parse(inLineElement) {
        const ad = new VASTAd();
        ad.id = inLineElement.getAttribute("id") || null;
        ad.sequence = inLineElement.getAttribute("sequence") || null;

        for (let node of Array.from(inLineElement.childNodes)) {
            switch (node.nodeName) {
                case "Error":
                    ad.errorURLTemplates.push((this.utils.parseNodeText(node)));
                    break;

                case "Impression":
                    ad.impressionURLTemplates.push((this.utils.parseNodeText(node)));
                    break;

                case "Creatives":
                    for (let creativeElement of Array.from(this.utils.childrenByName(node, "Creative"))) {
                        const creativeAttributes = {
                            id           : creativeElement.getAttribute('id') || null,
                            adId         : this.parseCreativeAdIdAttribute(creativeElement),
                            sequence     : creativeElement.getAttribute('sequence') || null,
                            apiFramework : creativeElement.getAttribute('apiFramework') || null
                        };

                        for (let creativeTypeElement of Array.from(creativeElement.childNodes)) {
                            switch (creativeTypeElement.nodeName) {
                                case "Linear":
                                    var creative = this.creativeLinearParser.parse(creativeTypeElement, creativeAttributes);
                                    if (creative) {
                                        ad.creatives.push(creative);
                                    }
                                    break;
                                case "NonLinearAds":
                                    creative = this.creativeNonLinearParser.parse(creativeTypeElement, creativeAttributes);
                                    if (creative) {
                                        ad.creatives.push(creative);
                                    }
                                    break;
                                case "CompanionAds":
                                    creative = this.creativeCompanionParser.parse(creativeTypeElement, creativeAttributes);
                                    if (creative) {
                                        ad.creatives.push(creative);
                                    }
                                    break;
                            }
                        }
                    }
                    break;
                case "Extensions":
                    this.parseExtension(ad.extensions, this.utils.childrenByName(node, "Extension"));
                    break;

                case "AdSystem":
                    ad.system = {
                        value : this.utils.parseNodeText(node),
                        version : node.getAttribute("version") || null
                    };
                    break;

                case "AdTitle":
                    ad.title = this.utils.parseNodeText(node);
                    break;

                case "Description":
                    ad.description = this.utils.parseNodeText(node);
                    break;

                case "Advertiser":
                    ad.advertiser = this.utils.parseNodeText(node);
                    break;

                case "Pricing":
                    ad.pricing = {
                        value    : this.utils.parseNodeText(node),
                        model    : node.getAttribute("model") || null,
                        currency : node.getAttribute("currency") || null
                    };
                    break;

                case "Survey":
                    ad.survey = this.utils.parseNodeText(node);
                    break;
            }
        }

        return ad;
    }

    parseExtension(collection, extensions) {
        return (() => {
            const result = [];
            for (let extNode of Array.from(extensions)) {
                const ext = new VASTAdExtension();

                if (extNode.attributes) {
                    for (let extNodeAttr of Array.from(extNode.attributes)) {
                        ext.attributes[extNodeAttr.nodeName] = extNodeAttr.nodeValue;
                    }
                }

                for (let childNode of Array.from(extNode.childNodes)) {
                    const txt = this.utils.parseNodeText(childNode);

                    // ignore comments / empty value
                    if ((childNode.nodeName !== '#comment') && (txt !== '')) {
                        const extChild = new VASTAdExtensionChild();
                        extChild.name = childNode.nodeName;
                        extChild.value = txt;

                        if (childNode.attributes) {
                            for (let extChildNodeAttr of Array.from(childNode.attributes)) {
                                extChild.attributes[extChildNodeAttr.nodeName] = extChildNodeAttr.nodeValue;
                            }
                        }

                        ext.children.push(extChild);
                    }
                }

                result.push(collection.push(ext));
            }
            return result;
        })();
    }

    parseCreativeAdIdAttribute(creativeElement) {
        return creativeElement.getAttribute('AdID') ||  // VAST 2 spec
               creativeElement.getAttribute('adID') ||  // VAST 3 spec
               creativeElement.getAttribute('adId') ||  // VAST 4 spec
               null;
    }
}

module.exports = AdParser;
