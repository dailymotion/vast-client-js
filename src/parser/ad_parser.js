import { Ad } from '../ad';
import { AdExtension } from '../ad_extension';
import { AdExtensionChild } from '../ad_extension_child';
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

  for (let adTypeElementKey in childNodes) {
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

  for (let nodeKey in childNodes) {
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

            for (let creativeTypeElementKey in creativeElement.childNodes) {
              const creativeTypeElement =
                creativeElement.childNodes[creativeTypeElementKey];

              switch (creativeTypeElement.nodeName) {
                case 'Linear':
                  let creativeLinear = parseCreativeLinear(
                    creativeTypeElement,
                    creativeAttributes
                  );
                  if (creativeLinear) {
                    ad.creatives.push(creativeLinear);
                  }
                  break;
                case 'NonLinearAds':
                  let creativeNonLinear = parseCreativeNonLinear(
                    creativeTypeElement,
                    creativeAttributes
                  );
                  if (creativeNonLinear) {
                    ad.creatives.push(creativeNonLinear);
                  }
                  break;
                case 'CompanionAds':
                  let creativeCompanion = parseCreativeCompanion(
                    creativeTypeElement,
                    creativeAttributes
                  );
                  if (creativeCompanion) {
                    ad.creatives.push(creativeCompanion);
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
        for (let eventName in wrapperCreativeElement.trackingEvents) {
          const urls = wrapperCreativeElement.trackingEvents[eventName];
          if (!ad.trackingEvents[wrapperCreativeElement.type][eventName]) {
            ad.trackingEvents[wrapperCreativeElement.type][eventName] = [];
          }
          urls.forEach(url => {
            ad.trackingEvents[wrapperCreativeElement.type][eventName].push(url);
          });
        }
      }
      // ClickTracking
      if (wrapperCreativeElement.videoClickTrackingURLTemplates) {
        if (!ad.videoClickTrackingURLTemplates) {
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
        if (!ad.videoCustomClickURLTemplates) {
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
    const extNodeAttrs = extNode.attributes;
    const childNodes = extNode.childNodes;

    if (extNode.attributes) {
      for (let extNodeAttrKey in extNodeAttrs) {
        const extNodeAttr = extNodeAttrs[extNodeAttrKey];

        if (extNodeAttr.nodeName && extNodeAttr.nodeValue) {
          ext.attributes[extNodeAttr.nodeName] = extNodeAttr.nodeValue;
        }
      }
    }

    for (let childNodeKey in childNodes) {
      const childNode = childNodes[childNodeKey];
      const txt = parserUtils.parseNodeText(childNode);

      // ignore comments / empty value
      if (childNode.nodeName !== '#comment' && txt !== '') {
        const extChild = new AdExtensionChild();
        extChild.name = childNode.nodeName;
        extChild.value = txt;

        if (childNode.attributes) {
          const childNodeAttributes = childNode.attributes;

          for (let extChildNodeAttrKey in childNodeAttributes) {
            const extChildNodeAttr = childNodeAttributes[extChildNodeAttrKey];

            extChild.attributes[extChildNodeAttr.nodeName] =
              extChildNodeAttr.nodeValue;
          }
        }

        ext.children.push(extChild);
      }
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
