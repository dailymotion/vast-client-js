const ParserUtils = require('./parser_utils.js');
const { VASTCreativeNonLinear } = require('../creative.js');
const VASTNonLinear = require('../nonlinear.js');

class CreativeNonLinearParser {
    constructor() {
        this.utils = new ParserUtils();
    }

    parse(creativeElement, creativeAttributes) {
        const creative = new VASTCreativeNonLinear(creativeAttributes);

        for (let trackingEventsElement of this.utils.childrenByName(creativeElement, "TrackingEvents")) {
            let eventName, trackingURLTemplate;
            for (let trackingElement of this.utils.childrenByName(trackingEventsElement, "Tracking")) {
                eventName = trackingElement.getAttribute("event");
                trackingURLTemplate = this.utils.parseNodeText(trackingElement);

                if ((eventName != null) && (trackingURLTemplate != null)) {
                    if (creative.trackingEvents[eventName] == null) { creative.trackingEvents[eventName] = []; }
                    creative.trackingEvents[eventName].push(trackingURLTemplate);
                }
            }

        }

        for (let nonlinearResource of this.utils.childrenByName(creativeElement, "NonLinear")) {
            const nonlinearAd = new VASTNonLinear();
            nonlinearAd.id = nonlinearResource.getAttribute("id") || null;
            nonlinearAd.width = nonlinearResource.getAttribute("width");
            nonlinearAd.height = nonlinearResource.getAttribute("height");
            nonlinearAd.expandedWidth = nonlinearResource.getAttribute("expandedWidth");
            nonlinearAd.expandedHeight = nonlinearResource.getAttribute("expandedHeight");
            nonlinearAd.scalable = this.utils.parseBoolean(nonlinearResource.getAttribute("scalable"));
            nonlinearAd.maintainAspectRatio = this.utils.parseBoolean(nonlinearResource.getAttribute("maintainAspectRatio"));
            nonlinearAd.minSuggestedDuration = this.utils.parseDuration(nonlinearResource.getAttribute("minSuggestedDuration"));
            nonlinearAd.apiFramework = nonlinearResource.getAttribute("apiFramework");

            for (let htmlElement of this.utils.childrenByName(nonlinearResource, "HTMLResource")) {
                nonlinearAd.type = htmlElement.getAttribute("creativeType") || 'text/html';
                nonlinearAd.htmlResource = this.utils.parseNodeText(htmlElement);
            }

            for (let iframeElement of this.utils.childrenByName(nonlinearResource, "IFrameResource")) {
                nonlinearAd.type = iframeElement.getAttribute("creativeType") || 0;
                nonlinearAd.iframeResource = this.utils.parseNodeText(iframeElement);
            }

            for (let staticElement of this.utils.childrenByName(nonlinearResource, "StaticResource")) {
                nonlinearAd.type = staticElement.getAttribute("creativeType") || 0;
                nonlinearAd.staticResource = this.utils.parseNodeText(staticElement);
            }

            const adParamsElement = this.utils.childByName(nonlinearResource, "AdParameters");
            if (adParamsElement != null) {
                nonlinearAd.adParameters = this.utils.parseNodeText(adParamsElement);
            }

            nonlinearAd.nonlinearClickThroughURLTemplate = this.utils.parseNodeText(this.utils.childByName(nonlinearResource, "NonLinearClickThrough"));
            for (let clickTrackingElement of this.utils.childrenByName(nonlinearResource, "NonLinearClickTracking")) {
                nonlinearAd.nonlinearClickTrackingURLTemplates.push(this.utils.parseNodeText(clickTrackingElement));
            }

            creative.variations.push(nonlinearAd);
        }

        return creative;
    }
}

module.exports = CreativeNonLinearParser;
