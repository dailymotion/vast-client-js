/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const VASTCompanionAd = require('../companionad.js');
const { VASTCreativeCompanion } = require('../creative.js');
const ParserUtils = require('./parser_utils.js');

class CreativeCompanionParser {
    constructor() {
        this.utils = new ParserUtils();
    }

    parse(creativeElement, creativeAttributes) {
        const creative = new VASTCreativeCompanion(creativeAttributes);

        for (let companionResource of Array.from(this.utils.childrenByName(creativeElement, "Companion"))) {
            const companionAd = new VASTCompanionAd();
            companionAd.id = companionResource.getAttribute("id") || null;
            companionAd.width = companionResource.getAttribute("width");
            companionAd.height = companionResource.getAttribute("height");
            companionAd.companionClickTrackingURLTemplates = [];
            for (let htmlElement of Array.from(this.utils.childrenByName(companionResource, "HTMLResource"))) {
                companionAd.type = htmlElement.getAttribute("creativeType") || 'text/html';
                companionAd.htmlResource = this.utils.parseNodeText(htmlElement);
            }
            for (let iframeElement of Array.from(this.utils.childrenByName(companionResource, "IFrameResource"))) {
                companionAd.type = iframeElement.getAttribute("creativeType") || 0;
                companionAd.iframeResource = this.utils.parseNodeText(iframeElement);
            }
            for (let staticElement of Array.from(this.utils.childrenByName(companionResource, "StaticResource"))) {
                companionAd.type = staticElement.getAttribute("creativeType") || 0;
                for (let child of Array.from(this.utils.childrenByName(companionResource, "AltText"))) {
                    companionAd.altText = this.utils.parseNodeText(child);
                }
                companionAd.staticResource = this.utils.parseNodeText(staticElement);
            }
            for (let trackingEventsElement of Array.from(this.utils.childrenByName(companionResource, "TrackingEvents"))) {
                for (let trackingElement of Array.from(this.utils.childrenByName(trackingEventsElement, "Tracking"))) {
                    const eventName = trackingElement.getAttribute("event");
                    const trackingURLTemplate = this.utils.parseNodeText(trackingElement);
                    if ((eventName != null) && (trackingURLTemplate != null)) {
                        if (companionAd.trackingEvents[eventName] == null) { companionAd.trackingEvents[eventName] = []; }
                        companionAd.trackingEvents[eventName].push(trackingURLTemplate);
                    }
                }
            }
            for (let clickTrackingElement of Array.from(this.utils.childrenByName(companionResource, "CompanionClickTracking"))) {
                companionAd.companionClickTrackingURLTemplates.push(this.utils.parseNodeText(clickTrackingElement));
            }
            companionAd.companionClickThroughURLTemplate = this.utils.parseNodeText(this.utils.childByName(companionResource, "CompanionClickThrough"));
            companionAd.companionClickTrackingURLTemplate = this.utils.parseNodeText(this.utils.childByName(companionResource, "CompanionClickTracking"));
            creative.variations.push(companionAd);
        }

        return creative;
    }
}

module.exports = CreativeCompanionParser;
