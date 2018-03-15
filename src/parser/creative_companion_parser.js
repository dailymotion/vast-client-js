import { CompanionAd } from '../companion_ad';
import { CreativeCompanion } from '../creative/creative_companion';
import { ParserUtils } from './parser_utils';

export class CreativeCompanionParser {
    constructor() {
        this.parserUtils = new ParserUtils();
    }

    parse(creativeElement, creativeAttributes) {
        const creative = new CreativeCompanion(creativeAttributes);

        for (let companionResource of this.parserUtils.childrenByName(creativeElement, "Companion")) {
            const companionAd = new CompanionAd();
            companionAd.id = companionResource.getAttribute("id") || null;
            companionAd.width = companionResource.getAttribute("width");
            companionAd.height = companionResource.getAttribute("height");
            companionAd.companionClickTrackingURLTemplates = [];
            for (let htmlElement of this.parserUtils.childrenByName(companionResource, "HTMLResource")) {
                companionAd.type = htmlElement.getAttribute("creativeType") || 'text/html';
                companionAd.htmlResource = this.parserUtils.parseNodeText(htmlElement);
            }
            for (let iframeElement of this.parserUtils.childrenByName(companionResource, "IFrameResource")) {
                companionAd.type = iframeElement.getAttribute("creativeType") || 0;
                companionAd.iframeResource = this.parserUtils.parseNodeText(iframeElement);
            }
            for (let staticElement of this.parserUtils.childrenByName(companionResource, "StaticResource")) {
                companionAd.type = staticElement.getAttribute("creativeType") || 0;
                for (let child of this.parserUtils.childrenByName(companionResource, "AltText")) {
                    companionAd.altText = this.parserUtils.parseNodeText(child);
                }
                companionAd.staticResource = this.parserUtils.parseNodeText(staticElement);
            }
            for (let trackingEventsElement of this.parserUtils.childrenByName(companionResource, "TrackingEvents")) {
                for (let trackingElement of this.parserUtils.childrenByName(trackingEventsElement, "Tracking")) {
                    const eventName = trackingElement.getAttribute("event");
                    const trackingURLTemplate = this.parserUtils.parseNodeText(trackingElement);
                    if ((eventName != null) && (trackingURLTemplate != null)) {
                        if (companionAd.trackingEvents[eventName] == null) { companionAd.trackingEvents[eventName] = []; }
                        companionAd.trackingEvents[eventName].push(trackingURLTemplate);
                    }
                }
            }
            for (let clickTrackingElement of this.parserUtils.childrenByName(companionResource, "CompanionClickTracking")) {
                companionAd.companionClickTrackingURLTemplates.push(this.parserUtils.parseNodeText(clickTrackingElement));
            }
            companionAd.companionClickThroughURLTemplate = this.parserUtils.parseNodeText(this.parserUtils.childByName(companionResource, "CompanionClickThrough"));
            companionAd.companionClickTrackingURLTemplate = this.parserUtils.parseNodeText(this.parserUtils.childByName(companionResource, "CompanionClickTracking"));
            creative.variations.push(companionAd);
        }

        return creative;
    }
}
