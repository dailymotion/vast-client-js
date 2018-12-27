import { CompanionAd } from '../companion_ad';
import { CreativeCompanion } from '../creative/creative_companion';
import { parserUtils } from './parser_utils';

/**
 * This module provides methods to parse a VAST CompanionAd Element.
 */

/**
 * Parses a CompanionAd.
 * @param  {Object} creativeElement - The VAST CompanionAd element to parse.
 * @param  {Object} creativeAttributes - The attributes of the CompanionAd (optional).
 * @return {CreativeCompanion}
 */
export function parseCreativeCompanion(creativeElement, creativeAttributes) {
  const creative = new CreativeCompanion(creativeAttributes);

  parserUtils
    .childrenByName(creativeElement, 'Companion')
    .forEach(companionResource => {
      const companionAd = new CompanionAd();
      companionAd.id = companionResource.getAttribute('id') || null;
      companionAd.width = companionResource.getAttribute('width');
      companionAd.height = companionResource.getAttribute('height');
      companionAd.companionClickTrackingURLTemplates = [];

      parserUtils
        .childrenByName(companionResource, 'HTMLResource')
        .forEach(htmlElement => {
          companionAd.type =
            htmlElement.getAttribute('creativeType') || 'text/html';
          companionAd.htmlResource = parserUtils.parseNodeText(htmlElement);
        });

      parserUtils
        .childrenByName(companionResource, 'IFrameResource')
        .forEach(iframeElement => {
          companionAd.type = iframeElement.getAttribute('creativeType') || 0;
          companionAd.iframeResource = parserUtils.parseNodeText(iframeElement);
        });

      parserUtils
        .childrenByName(companionResource, 'StaticResource')
        .forEach(staticElement => {
          companionAd.type = staticElement.getAttribute('creativeType') || 0;

          parserUtils
            .childrenByName(companionResource, 'AltText')
            .forEach(child => {
              companionAd.altText = parserUtils.parseNodeText(child);
            });

          companionAd.staticResource = parserUtils.parseNodeText(staticElement);
        });

      parserUtils
        .childrenByName(companionResource, 'TrackingEvents')
        .forEach(trackingEventsElement => {
          parserUtils
            .childrenByName(trackingEventsElement, 'Tracking')
            .forEach(trackingElement => {
              const eventName = trackingElement.getAttribute('event');
              const trackingURLTemplate = parserUtils.parseNodeText(
                trackingElement
              );
              if (eventName && trackingURLTemplate) {
                if (companionAd.trackingEvents[eventName] == null) {
                  companionAd.trackingEvents[eventName] = [];
                }
                companionAd.trackingEvents[eventName].push(trackingURLTemplate);
              }
            });
        });

      parserUtils
        .childrenByName(companionResource, 'CompanionClickTracking')
        .forEach(clickTrackingElement => {
          companionAd.companionClickTrackingURLTemplates.push(
            parserUtils.parseNodeText(clickTrackingElement)
          );
        });

      companionAd.companionClickThroughURLTemplate = parserUtils.parseNodeText(
        parserUtils.childByName(companionResource, 'CompanionClickThrough')
      );
      companionAd.companionClickTrackingURLTemplate = parserUtils.parseNodeText(
        parserUtils.childByName(companionResource, 'CompanionClickTracking')
      );
      creative.variations.push(companionAd);
    });

  return creative;
}
