import { Ad } from '../ad';
import { AdExtension } from '../ad_extension';
import { parseCreativeCompanion } from './creative_companion_parser';
import { parseCreativeLinear } from './creative_linear_parser';
import { parseCreativeNonLinear } from './creative_non_linear_parser';
import { parserUtils } from './parser_utils';

/**
 * This module provides methods to parse a VAST Ad Element.
 */

/**
 * Parses an Ad element (can either be a Wrapper or an InLine).
 * @param  {Object} adElement - The VAST Ad element to parse.
 * @return {Ad}
 */
export function parseAd(adElement) {
  const childNodes = adElement.childNodes;

  for (const adTypeElementKey in childNodes) {
    const adTypeElement = childNodes[adTypeElementKey];

    if (['Wrapper', 'InLine'].indexOf(adTypeElement.nodeName) === -1) {
      continue;
    }

    parserUtils.copyNodeAttribute('id', adElement, adTypeElement);
    parserUtils.copyNodeAttribute('sequence', adElement, adTypeElement);

    if (adTypeElement.nodeName === 'Wrapper') {
      return parseWrapper(adTypeElement);
    } else if (adTypeElement.nodeName === 'InLine') {
      return parseInLine(adTypeElement);
    }
  }
}

/**
 * Parses an Inline element.
 * @param  {Object} inLineElement - The VAST Inline element to parse.
 * @return {Ad}
 */
function parseInLine(inLineElement) {
  const childNodes = inLineElement.childNodes;
  const ad = new Ad();
  ad.id = inLineElement.getAttribute('id') || null;
  ad.sequence = inLineElement.getAttribute('sequence') || null;

  for (const nodeKey in childNodes) {
    const node = childNodes[nodeKey];

    switch (node.nodeName) {
      case 'Error':
        ad.errorURLTemplates.push(parserUtils.parseNodeText(node));
        break;

      case 'Impression':
        ad.impressionURLTemplates.push(parserUtils.parseNodeText(node));
        break;

      case 'Creatives':
        parserUtils
          .childrenByName(node, 'Creative')
          .forEach(creativeElement => {
            const creativeAttributes = {
              id: creativeElement.getAttribute('id') || null,
              adId: parseCreativeAdIdAttribute(creativeElement),
              sequence: creativeElement.getAttribute('sequence') || null,
              apiFramework: creativeElement.getAttribute('apiFramework') || null
            };

            for (const creativeTypeElementKey in creativeElement.childNodes) {
              const creativeTypeElement =
                creativeElement.childNodes[creativeTypeElementKey];
              let parsedCreative;

              switch (creativeTypeElement.nodeName) {
                case 'Linear':
                  parsedCreative = parseCreativeLinear(
                    creativeTypeElement,
                    creativeAttributes
                  );
                  if (parsedCreative) {
                    ad.creatives.push(parsedCreative);
                  }
                  break;
                case 'NonLinearAds':
                  parsedCreative = parseCreativeNonLinear(
                    creativeTypeElement,
                    creativeAttributes
                  );
                  if (parsedCreative) {
                    ad.creatives.push(parsedCreative);
                  }
                  break;
                case 'CompanionAds':
                  parsedCreative = parseCreativeCompanion(
                    creativeTypeElement,
                    creativeAttributes
                  );
                  if (parsedCreative) {
                    ad.creatives.push(parsedCreative);
                  }
                  break;
              }
            }
          });
        break;

      case 'Extensions':
        parseExtensions(
          ad.extensions,
          parserUtils.childrenByName(node, 'Extension')
        );
        break;

      case 'AdSystem':
        ad.system = {
          value: parserUtils.parseNodeText(node),
          version: node.getAttribute('version') || null
        };
        break;

      case 'AdTitle':
        ad.title = parserUtils.parseNodeText(node);
        break;

      case 'Description':
        ad.description = parserUtils.parseNodeText(node);
        break;

      case 'Advertiser':
        ad.advertiser = parserUtils.parseNodeText(node);
        break;

      case 'Pricing':
        ad.pricing = {
          value: parserUtils.parseNodeText(node),
          model: node.getAttribute('model') || null,
          currency: node.getAttribute('currency') || null
        };
        break;

      case 'Survey':
        ad.survey = parserUtils.parseNodeText(node);
        break;
    }
  }

  return ad;
}

/**
 * Parses a Wrapper element without resolving the wrapped urls.
 * @param  {Object} wrapperElement - The VAST Wrapper element to be parsed.
 * @return {Ad}
 */
function parseWrapper(wrapperElement) {
  const ad = parseInLine(wrapperElement);
  let wrapperURLElement = parserUtils.childByName(
    wrapperElement,
    'VASTAdTagURI'
  );

  if (wrapperURLElement) {
    ad.nextWrapperURL = parserUtils.parseNodeText(wrapperURLElement);
  } else {
    wrapperURLElement = parserUtils.childByName(wrapperElement, 'VASTAdTagURL');

    if (wrapperURLElement) {
      ad.nextWrapperURL = parserUtils.parseNodeText(
        parserUtils.childByName(wrapperURLElement, 'URL')
      );
    }
  }

  ad.creatives.forEach(wrapperCreativeElement => {
    if (['linear', 'nonlinear'].indexOf(wrapperCreativeElement.type) !== -1) {
      // TrackingEvents Linear / NonLinear
      if (wrapperCreativeElement.trackingEvents) {
        if (!ad.trackingEvents) {
          ad.trackingEvents = {};
        }
        if (!ad.trackingEvents[wrapperCreativeElement.type]) {
          ad.trackingEvents[wrapperCreativeElement.type] = {};
        }
        for (const eventName in wrapperCreativeElement.trackingEvents) {
          const urls = wrapperCreativeElement.trackingEvents[eventName];
          if (
            !Array.isArray(
              ad.trackingEvents[wrapperCreativeElement.type][eventName]
            )
          ) {
            ad.trackingEvents[wrapperCreativeElement.type][eventName] = [];
          }
          urls.forEach(url => {
            ad.trackingEvents[wrapperCreativeElement.type][eventName].push(url);
          });
        }
      }
      // ClickTracking
      if (wrapperCreativeElement.videoClickTrackingURLTemplates) {
        if (!Array.isArray(ad.videoClickTrackingURLTemplates)) {
          ad.videoClickTrackingURLTemplates = [];
        } // tmp property to save wrapper tracking URLs until they are merged
        wrapperCreativeElement.videoClickTrackingURLTemplates.forEach(item => {
          ad.videoClickTrackingURLTemplates.push(item);
        });
      }
      // ClickThrough
      if (wrapperCreativeElement.videoClickThroughURLTemplate) {
        ad.videoClickThroughURLTemplate =
          wrapperCreativeElement.videoClickThroughURLTemplate;
      }
      // CustomClick
      if (wrapperCreativeElement.videoCustomClickURLTemplates) {
        if (!Array.isArray(ad.videoCustomClickURLTemplates)) {
          ad.videoCustomClickURLTemplates = [];
        } // tmp property to save wrapper tracking URLs until they are merged
        wrapperCreativeElement.videoCustomClickURLTemplates.forEach(item => {
          ad.videoCustomClickURLTemplates.push(item);
        });
      }
    }
  });

  if (ad.nextWrapperURL) {
    return ad;
  }
}

/**
 * Parses an array of Extension elements.
 * @param  {Array} collection - The array used to store the parsed extensions.
 * @param  {Array} extensions - The array of extensions to parse.
 */
function parseExtensions(collection, extensions) {
  extensions.forEach(extNode => {
    const ext = new AdExtension();

    ext.name = extNode.nodeName;
    ext.value = parserUtils.parseNodeText(extNode);

    const extNodeAttrs = extNode.attributes;

    if (extNodeAttrs) {
      for (const extNodeAttrKey in extNodeAttrs) {
        const extNodeAttr = extNodeAttrs[extNodeAttrKey];

        if (extNodeAttr.nodeName && extNodeAttr.nodeValue) {
          ext.attributes[extNodeAttr.nodeName] = extNodeAttr.nodeValue;
        }
      }
    }

    const childNodes = [];

    for (const childNodeKey in extNode.childNodes) {
      const childNode = extNode.childNodes[childNodeKey];

      const value = parserUtils.parseNodeText(childNode);

      // ignore comments / empty value
      if (
        childNode &&
        childNode.nodeName !== '#cdata-section' &&
        childNode.nodeName !== '#comment' &&
        value !== ''
      ) {
        childNodes.push(childNode);
      }
    }

    if (childNodes.length) {
      parseExtensions(ext.children, childNodes);
    }

    collection.push(ext);
  });
}

/**
 * Parses the creative adId Attribute.
 * @param  {any} creativeElement - The creative element to retrieve the adId from.
 * @return {String|null}
 */
function parseCreativeAdIdAttribute(creativeElement) {
  return (
    creativeElement.getAttribute('AdID') || // VAST 2 spec
    creativeElement.getAttribute('adID') || // VAST 3 spec
    creativeElement.getAttribute('adId') || // VAST 4 spec
    null
  );
}
