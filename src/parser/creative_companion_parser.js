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
  creative.required = creativeElement.getAttribute('required') || null;

  creative.variations = parserUtils
    .childrenByName(creativeElement, 'Companion')
    .map(companionResource => {
      const attributes = {};
      const companionAttrs = companionResource.attributes;
      for (let i = 0; i < companionAttrs.length; i++) {
        attributes[companionAttrs[i].nodeName] = companionAttrs[i].nodeValue;
      }
      const companionAd = new CompanionAd(attributes);

      companionAd.htmlResource =
        parserUtils.parseNodeText(
          parserUtils.childByName(companionResource, 'HTMLResource')
        ) || null;

      companionAd.iframeResource =
        parserUtils.parseNodeText(
          parserUtils.childByName(companionResource, 'IFrameResource')
        ) || null;

      const staticElement = parserUtils.childByName(
        companionResource,
        'StaticResource'
      );
      if (staticElement) {
        companionAd.staticResource = parserUtils.parseNodeText(staticElement);
        companionAd.creativeType =
          staticElement.getAttribute('creativeType') || null;

        const altTextElement = parserUtils.childByName(
          companionResource,
          'AltText'
        );
        companionAd.altText = parserUtils.parseNodeText(altTextElement) || null;
      }

      const trackingEventsElement = parserUtils.childByName(
        companionResource,
        'TrackingEvents'
      );
      if (trackingEventsElement) {
        parserUtils
          .childrenByName(trackingEventsElement, 'Tracking')
          .forEach(trackingElement => {
            const eventName = trackingElement.getAttribute('event');
            const trackingURLTemplate = parserUtils.parseNodeText(
              trackingElement
            );
            if (eventName && trackingURLTemplate) {
              if (!Array.isArray(companionAd.trackingEvents[eventName])) {
                companionAd.trackingEvents[eventName] = [];
              }
              companionAd.trackingEvents[eventName].push(trackingURLTemplate);
            }
          });
      }

      companionAd.companionClickTrackingURLTemplates = parserUtils
        .childrenByName(companionResource, 'CompanionClickTracking')
        .map(clickTrackingElement =>
          parserUtils.parseNodeText(clickTrackingElement)
        );

      companionAd.companionClickThroughURLTemplate =
        parserUtils.parseNodeText(
          parserUtils.childByName(companionResource, 'CompanionClickThrough')
        ) || null;

      const adParametersElement = parserUtils.childByName(
        companionResource,
        'AdParameters'
      );
      if (adParametersElement) {
        companionAd.adParameters = parserUtils.parseNodeText(
          adParametersElement
        );
        companionAd.xmlEncoded =
          adParametersElement.getAttribute('xmlEncoded') || null;
      }

      return companionAd;
    });

  return creative;
}
