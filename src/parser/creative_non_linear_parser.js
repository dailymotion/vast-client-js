import { CreativeNonLinear } from '../creative/creative_non_linear';
import { NonLinearAd } from '../non_linear_ad';
import { ParserUtils } from './parser_utils';

/**
 * This class provides methods to parse a VAST NonLinear Element.
 * @export
 * @class CreativeNonLinearParser
 */
export class CreativeNonLinearParser {
  /**
   * Creates an instance of CreativeNonLinearParser.
   */
  constructor() {
    this.parserUtils = new ParserUtils();
  }

  /**
   * Parses a NonLinear element.
   * @param  {any} creativeElement - The VAST NonLinear element to parse.
   * @param  {any} creativeAttributes - The attributes of the NonLinear (optional).
   * @return {CreativeNonLinear}
   */
  parse(creativeElement, creativeAttributes) {
    const creative = new CreativeNonLinear(creativeAttributes);

    this.parserUtils
      .childrenByName(creativeElement, 'TrackingEvents')
      .forEach(trackingEventsElement => {
        let eventName, trackingURLTemplate;
        this.parserUtils
          .childrenByName(trackingEventsElement, 'Tracking')
          .forEach(trackingElement => {
            eventName = trackingElement.getAttribute('event');
            trackingURLTemplate = this.parserUtils.parseNodeText(
              trackingElement
            );

            if (eventName && trackingURLTemplate) {
              if (creative.trackingEvents[eventName] == null) {
                creative.trackingEvents[eventName] = [];
              }
              creative.trackingEvents[eventName].push(trackingURLTemplate);
            }
          });
      });

    this.parserUtils
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
        nonlinearAd.scalable = this.parserUtils.parseBoolean(
          nonlinearResource.getAttribute('scalable')
        );
        nonlinearAd.maintainAspectRatio = this.parserUtils.parseBoolean(
          nonlinearResource.getAttribute('maintainAspectRatio')
        );
        nonlinearAd.minSuggestedDuration = this.parserUtils.parseDuration(
          nonlinearResource.getAttribute('minSuggestedDuration')
        );
        nonlinearAd.apiFramework = nonlinearResource.getAttribute(
          'apiFramework'
        );

        this.parserUtils
          .childrenByName(nonlinearResource, 'HTMLResource')
          .forEach(htmlElement => {
            nonlinearAd.type =
              htmlElement.getAttribute('creativeType') || 'text/html';
            nonlinearAd.htmlResource = this.parserUtils.parseNodeText(
              htmlElement
            );
          });

        this.parserUtils
          .childrenByName(nonlinearResource, 'IFrameResource')
          .forEach(iframeElement => {
            nonlinearAd.type = iframeElement.getAttribute('creativeType') || 0;
            nonlinearAd.iframeResource = this.parserUtils.parseNodeText(
              iframeElement
            );
          });

        this.parserUtils
          .childrenByName(nonlinearResource, 'StaticResource')
          .forEach(staticElement => {
            nonlinearAd.type = staticElement.getAttribute('creativeType') || 0;
            nonlinearAd.staticResource = this.parserUtils.parseNodeText(
              staticElement
            );
          });

        const adParamsElement = this.parserUtils.childByName(
          nonlinearResource,
          'AdParameters'
        );
        if (adParamsElement) {
          nonlinearAd.adParameters = this.parserUtils.parseNodeText(
            adParamsElement
          );
        }

        nonlinearAd.nonlinearClickThroughURLTemplate = this.parserUtils.parseNodeText(
          this.parserUtils.childByName(
            nonlinearResource,
            'NonLinearClickThrough'
          )
        );
        this.parserUtils
          .childrenByName(nonlinearResource, 'NonLinearClickTracking')
          .forEach(clickTrackingElement => {
            nonlinearAd.nonlinearClickTrackingURLTemplates.push(
              this.parserUtils.parseNodeText(clickTrackingElement)
            );
          });

        creative.variations.push(nonlinearAd);
      });

    return creative;
  }
}
