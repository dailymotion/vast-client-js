import { Ad } from '../ad';
import { AdExtension } from '../ad_extension';
import { AdVerification } from '../ad_verification';
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
        ad.extensions = _parseExtensions(
          parserUtils.childrenByName(node, 'Extension')
        );
        break;

      case 'AdVerifications':
        ad.adVerifications = _parseAdVerifications(
          parserUtils.childrenByName(node, 'Verification')
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
 * Parses an array of Extension elements. Exported for unit test purpose
 * @param  {Node[]} extensions - The array of extensions to parse.
 * @return {AdExtension[]} - The nodes parsed to extensions
 */
export function _parseExtensions(extensions) {
  const exts = [];
  extensions.forEach(extNode => {
    const ext = _parseExtension(extNode);

    if (ext) {
      exts.push(ext);
    }
  });
  return exts;
}

/**
 * Parses an extension child node
 * @param {Node} extNode - The extension node to parse
 * @return {AdExtension|null} - The node parsed to extension
 */
function _parseExtension(extNode) {
  // Ignore comments
  if (extNode.nodeName === '#comment') return null;

  const ext = new AdExtension();
  const extNodeAttrs = extNode.attributes;
  const childNodes = extNode.childNodes;

  ext.name = extNode.nodeName;

  // Parse attributes
  if (extNode.attributes) {
    for (const extNodeAttrKey in extNodeAttrs) {
      if (extNodeAttrs.hasOwnProperty(extNodeAttrKey)) {
        const extNodeAttr = extNodeAttrs[extNodeAttrKey];

        if (extNodeAttr.nodeName && extNodeAttr.nodeValue) {
          ext.attributes[extNodeAttr.nodeName] = extNodeAttr.nodeValue;
        }
      }
    }
  }

  // Parse all children
  for (const childNodeKey in childNodes) {
    if (childNodes.hasOwnProperty(childNodeKey)) {
      const parsedChild = _parseExtension(childNodes[childNodeKey]);
      if (parsedChild) {
        ext.children.push(parsedChild);
      }
    }
  }

  /*
    Only parse value of Nodes with only eather no children or only a cdata or text
    to avoid useless parsing that would result to a concatenation of all children
  */
  if (
    ext.children.length === 0 ||
    (ext.children.length === 1 &&
      ['#cdata-section', '#text'].indexOf(ext.children[0].name) >= 0)
  ) {
    const txt = parserUtils.parseNodeText(extNode);

    if (txt !== '') {
      ext.value = txt;
    }

    // Remove the children if it's a cdata or simply text to avoid useless children
    ext.children = [];
  }

  // Only return not empty objects to not pollute extentions
  return ext.isEmpty() ? null : ext;
}

/**
 * Parses the AdVerifications Element.
 * @param  {Array} verifications - The array of verifications to parse.
 * @return {Array<AdVerification>}
 */

export function _parseAdVerifications(verifications) {
  const ver = [];

  verifications.forEach(verificationNode => {
    const verification = new AdVerification();
    const childNodes = verificationNode.childNodes;

    parserUtils.assignAttributes(
        verificationNode.attributes,
        verification
    );
    for (const nodeKey in childNodes) {
      const node = childNodes[nodeKey];

      switch (node.nodeName) {
        case 'JavaScriptResource':
          verification.resource = parserUtils.parseNodeText(node);
          parserUtils.assignAttributes(node.attributes, verification);
          break;
        case 'VerificationParameters':
          verification.parameters = parserUtils.parseNodeText(node);
          break;
      }
    }

    ver.push(verification);
  });

  return ver;
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
