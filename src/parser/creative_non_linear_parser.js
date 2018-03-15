import { CreativeNonLinear } from '../creative/creative_non_linear';
import { NonLinearAd } from '../non_linear_ad';
import { ParserUtils } from './parser_utils';

export class CreativeNonLinearParser {
    constructor() {
        this.parserUtils = new ParserUtils();
    }

    parse(creativeElement, creativeAttributes) {
        const creative = new CreativeNonLinear(creativeAttributes);

        for (let trackingEventsElement of this.parserUtils.childrenByName(creativeElement, "TrackingEvents")) {
            let eventName, trackingURLTemplate;
            for (let trackingElement of this.parserUtils.childrenByName(trackingEventsElement, "Tracking")) {
                eventName = trackingElement.getAttribute("event");
                trackingURLTemplate = this.parserUtils.parseNodeText(trackingElement);

                if ((eventName != null) && (trackingURLTemplate != null)) {
                    if (creative.trackingEvents[eventName] == null) { creative.trackingEvents[eventName] = []; }
                    creative.trackingEvents[eventName].push(trackingURLTemplate);
                }
            }

        }

        for (let nonlinearResource of this.parserUtils.childrenByName(creativeElement, "NonLinear")) {
            const nonlinearAd = new NonLinearAd();
            nonlinearAd.id = nonlinearResource.getAttribute("id") || null;
            nonlinearAd.width = nonlinearResource.getAttribute("width");
            nonlinearAd.height = nonlinearResource.getAttribute("height");
            nonlinearAd.expandedWidth = nonlinearResource.getAttribute("expandedWidth");
            nonlinearAd.expandedHeight = nonlinearResource.getAttribute("expandedHeight");
            nonlinearAd.scalable = this.parserUtils.parseBoolean(nonlinearResource.getAttribute("scalable"));
            nonlinearAd.maintainAspectRatio = this.parserUtils.parseBoolean(nonlinearResource.getAttribute("maintainAspectRatio"));
            nonlinearAd.minSuggestedDuration = this.parserUtils.parseDuration(nonlinearResource.getAttribute("minSuggestedDuration"));
            nonlinearAd.apiFramework = nonlinearResource.getAttribute("apiFramework");

            for (let htmlElement of this.parserUtils.childrenByName(nonlinearResource, "HTMLResource")) {
                nonlinearAd.type = htmlElement.getAttribute("creativeType") || 'text/html';
                nonlinearAd.htmlResource = this.parserUtils.parseNodeText(htmlElement);
            }

            for (let iframeElement of this.parserUtils.childrenByName(nonlinearResource, "IFrameResource")) {
                nonlinearAd.type = iframeElement.getAttribute("creativeType") || 0;
                nonlinearAd.iframeResource = this.parserUtils.parseNodeText(iframeElement);
            }

            for (let staticElement of this.parserUtils.childrenByName(nonlinearResource, "StaticResource")) {
                nonlinearAd.type = staticElement.getAttribute("creativeType") || 0;
                nonlinearAd.staticResource = this.parserUtils.parseNodeText(staticElement);
            }

            const adParamsElement = this.parserUtils.childByName(nonlinearResource, "AdParameters");
            if (adParamsElement != null) {
                nonlinearAd.adParameters = this.parserUtils.parseNodeText(adParamsElement);
            }

            nonlinearAd.nonlinearClickThroughURLTemplate = this.parserUtils.parseNodeText(this.parserUtils.childByName(nonlinearResource, "NonLinearClickThrough"));
            for (let clickTrackingElement of this.parserUtils.childrenByName(nonlinearResource, "NonLinearClickTracking")) {
                nonlinearAd.nonlinearClickTrackingURLTemplates.push(this.parserUtils.parseNodeText(clickTrackingElement));
            }

            creative.variations.push(nonlinearAd);
        }

        return creative;
    }
}
