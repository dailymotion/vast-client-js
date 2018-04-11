import { CompanionAd } from '../companion_ad';
import { CreativeCompanion } from '../creative/creative_companion';
import { ParserUtils } from './parser_utils';

/**
 * This class provides methods to parse a VAST CompanionAd Element.
 * @export
 * @class CreativeCompanionParser
 */
export class CreativeCompanionParser {
  /**
   * Creates an instance of CreativeCompanionParser.
   */
  constructor() {
    this.parserUtils = new ParserUtils();
  }

  /**
   * Parses a CompanionAd.
   * @param  {Object} creativeElement - The VAST CompanionAd element to parse.
   * @param  {Object} creativeAttributes - The attributes of the CompanionAd (optional).
   * @return {CreativeCompanion}
   */
  parse(creativeElement, creativeAttributes) {
    const creative = new CreativeCompanion(creativeAttributes);

    this.parserUtils
      .childrenByName(creativeElement, 'Companion')
      .forEach(companionResource => {
        const companionAd = new CompanionAd();
        companionAd.id = companionResource.getAttribute('id') || null;
        companionAd.width = companionResource.getAttribute('width');
        companionAd.height = companionResource.getAttribute('height');
        companionAd.companionClickTrackingURLTemplates = [];

        this.parserUtils
          .childrenByName(companionResource, 'HTMLResource')
          .forEach(htmlElement => {
            companionAd.type =
              htmlElement.getAttribute('creativeType') || 'text/html';
            companionAd.htmlResource = this.parserUtils.parseNodeText(
              htmlElement
            );
          });

        this.parserUtils
          .childrenByName(companionResource, 'IFrameResource')
          .forEach(iframeElement => {
            companionAd.type = iframeElement.getAttribute('creativeType') || 0;
            companionAd.iframeResource = this.parserUtils.parseNodeText(
              iframeElement
            );
          });

        this.parserUtils
          .childrenByName(companionResource, 'StaticResource')
          .forEach(staticElement => {
            companionAd.type = staticElement.getAttribute('creativeType') || 0;

            this.parserUtils
              .childrenByName(companionResource, 'AltText')
              .forEach(child => {
                companionAd.altText = this.parserUtils.parseNodeText(child);
              });

            companionAd.staticResource = this.parserUtils.parseNodeText(
              staticElement
            );
          });

        this.parserUtils
          .childrenByName(companionResource, 'TrackingEvents')
          .forEach(trackingEventsElement => {
            this.parserUtils
              .childrenByName(trackingEventsElement, 'Tracking')
              .forEach(trackingElement => {
                const eventName = trackingElement.getAttribute('event');
                const trackingURLTemplate = this.parserUtils.parseNodeText(
                  trackingElement
                );
                if (eventName != null && trackingURLTemplate != null) {
                  if (companionAd.trackingEvents[eventName] == null) {
                    companionAd.trackingEvents[eventName] = [];
                  }
                  companionAd.trackingEvents[eventName].push(
                    trackingURLTemplate
                  );
                }
              });
          });

        this.parserUtils
          .childrenByName(companionResource, 'CompanionClickTracking')
          .forEach(clickTrackingElement => {
            companionAd.companionClickTrackingURLTemplates.push(
              this.parserUtils.parseNodeText(clickTrackingElement)
            );
          });

        companionAd.companionClickThroughURLTemplate = this.parserUtils.parseNodeText(
          this.parserUtils.childByName(
            companionResource,
            'CompanionClickThrough'
          )
        );
        companionAd.companionClickTrackingURLTemplate = this.parserUtils.parseNodeText(
          this.parserUtils.childByName(
            companionResource,
            'CompanionClickTracking'
          )
        );
        creative.variations.push(companionAd);
      });

    return creative;
  }
}
