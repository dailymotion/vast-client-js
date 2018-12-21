import { CreativeNonLinear } from '../creative/creative_non_linear';
import { NonLinearAd } from '../non_linear_ad';
import { parserUtils } from './parser_utils';

/**
 * This module provides methods to parse a VAST NonLinear Element.
 */

/**
 * Parses a NonLinear element.
 * @param  {any} creativeElement - The VAST NonLinear element to parse.
 * @param  {any} creativeAttributes - The attributes of the NonLinear (optional).
 * @return {CreativeNonLinear}
 */
function parse(creativeElement, creativeAttributes) {
  const creative = new CreativeNonLinear(creativeAttributes);

  parserUtils
    .childrenByName(creativeElement, 'TrackingEvents')
    .forEach(trackingEventsElement => {
      let eventName, trackingURLTemplate;
      parserUtils
        .childrenByName(trackingEventsElement, 'Tracking')
        .forEach(trackingElement => {
          eventName = trackingElement.getAttribute('event');
          trackingURLTemplate = parserUtils.parseNodeText(trackingElement);

          if (eventName && trackingURLTemplate) {
            if (creative.trackingEvents[eventName] == null) {
              creative.trackingEvents[eventName] = [];
            }
            creative.trackingEvents[eventName].push(trackingURLTemplate);
          }
        });
    });

  parserUtils
    .childrenByName(creativeElement, 'NonLinear')
    .forEach(nonlinearResource => {
      const nonlinearAd = new NonLinearAd();
      nonlinearAd.id = nonlinearResource.getAttribute('id') || null;
      nonlinearAd.width = nonlinearResource.getAttribute('width');
      nonlinearAd.height = nonlinearResource.getAttribute('height');
      nonlinearAd.expandedWidth = nonlinearResource.getAttribute(
        'expandedWidth'
      );
      nonlinearAd.expandedHeight = nonlinearResource.getAttribute(
        'expandedHeight'
      );
      nonlinearAd.scalable = parserUtils.parseBoolean(
        nonlinearResource.getAttribute('scalable')
      );
      nonlinearAd.maintainAspectRatio = parserUtils.parseBoolean(
        nonlinearResource.getAttribute('maintainAspectRatio')
      );
      nonlinearAd.minSuggestedDuration = parserUtils.parseDuration(
        nonlinearResource.getAttribute('minSuggestedDuration')
      );
      nonlinearAd.apiFramework = nonlinearResource.getAttribute('apiFramework');

      parserUtils
        .childrenByName(nonlinearResource, 'HTMLResource')
        .forEach(htmlElement => {
          nonlinearAd.type =
            htmlElement.getAttribute('creativeType') || 'text/html';
          nonlinearAd.htmlResource = parserUtils.parseNodeText(htmlElement);
        });

      parserUtils
        .childrenByName(nonlinearResource, 'IFrameResource')
        .forEach(iframeElement => {
          nonlinearAd.type = iframeElement.getAttribute('creativeType') || 0;
          nonlinearAd.iframeResource = parserUtils.parseNodeText(iframeElement);
        });

      parserUtils
        .childrenByName(nonlinearResource, 'StaticResource')
        .forEach(staticElement => {
          nonlinearAd.type = staticElement.getAttribute('creativeType') || 0;
          nonlinearAd.staticResource = parserUtils.parseNodeText(staticElement);
        });

      const adParamsElement = parserUtils.childByName(
        nonlinearResource,
        'AdParameters'
      );
      if (adParamsElement) {
        nonlinearAd.adParameters = parserUtils.parseNodeText(adParamsElement);
      }

      nonlinearAd.nonlinearClickThroughURLTemplate = parserUtils.parseNodeText(
        parserUtils.childByName(nonlinearResource, 'NonLinearClickThrough')
      );
      parserUtils
        .childrenByName(nonlinearResource, 'NonLinearClickTracking')
        .forEach(clickTrackingElement => {
          nonlinearAd.nonlinearClickTrackingURLTemplates.push(
            parserUtils.parseNodeText(clickTrackingElement)
          );
        });

      creative.variations.push(nonlinearAd);
    });

  return creative;
}

export const creativeNonLinearParser = {
  parse
};
