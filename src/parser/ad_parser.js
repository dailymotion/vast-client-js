import { createAd } from '../ad';
import { createAdVerification } from '../ad_verification';
import { parseCreatives } from './creatives_parser';
import { parseExtensions } from './extensions_parser';
import { parserUtils } from './parser_utils';
import { parserVerification } from './parser_verification';
/**
 * This module provides methods to parse a VAST Ad Element.
 */

/**
 * Parses an Ad element (can either be a Wrapper or an InLine).
 * @param  {Object} adElement - The VAST Ad element to parse.
 * @param  {Function} emit - Emit function used to trigger Warning event
 * @emits  VASTParser#VAST-warning
 * @return {Ad}
 */
export function parseAd(adElement, emit) {
  const childNodes = adElement.childNodes;

  for (const adTypeElementKey in childNodes) {
    const adTypeElement = childNodes[adTypeElementKey];

    if (['Wrapper', 'InLine'].indexOf(adTypeElement.nodeName) === -1) {
      continue;
    }

    parserUtils.copyNodeAttribute('id', adElement, adTypeElement);
    parserUtils.copyNodeAttribute('sequence', adElement, adTypeElement);
    if (adTypeElement.nodeName === 'Wrapper') {
      return parseWrapper(adTypeElement, emit);
    } else if (adTypeElement.nodeName === 'InLine') {
      return parseInLine(adTypeElement, emit);
    }
  }
}

/**
 * Parses an Inline
 * @param  {Object} ad Element - The VAST Inline element to parse.
 * @param  {Function} emit - Emit function used to trigger Warning event.
 * @emits  VASTParser#VAST-warning
 * @return {Object} ad - The ad object.
 */
function parseInLine(adElement, emit) {
  return parseAdElement(adElement, emit);
}

/**
 * Parses an ad type (Inline or Wrapper)
 * @param  {Object} adTypeElement - The VAST Inline or Wrapper element to parse.
 * @param  {Function} emit - Emit function used to trigger Warning event.
 * @emits  VASTParser#VAST-warning
 * @return {Object} ad - The ad object.
 */
function parseAdElement(adTypeElement, emit) {
  if (emit) {
    parserVerification.verifyRequiredValues(adTypeElement, emit);
  }

  const childNodes = adTypeElement.childNodes;
  const ad = createAd();
  ad.id = adTypeElement.getAttribute('id') || null;
  ad.sequence = adTypeElement.getAttribute('sequence') || null;

  for (const nodeKey in childNodes) {
    const node = childNodes[nodeKey];
    switch (node.nodeName) {
      case 'Error':
        ad.errorURLTemplates.push(parserUtils.parseNodeText(node));
        break;

      case 'Impression':
        ad.impressionURLTemplates.push({
          id: node.getAttribute('id') || null,
          url: parserUtils.parseNodeText(node)
        });
        break;

      case 'Creatives':
        ad.creatives = parseCreatives(
          parserUtils.childrenByName(node, 'Creative')
        );
        break;

      case 'Extensions':
        ad.extensions = parseExtensions(
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
        ad.advertiser = {
          id: node.getAttribute('id') || null,
          value: parserUtils.parseNodeText(node)
        };
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
 * @param  {Function} emit - Emit function used to trigger Warning event.
 * @emits  VASTParser#VAST-warning
 * @return {Ad}
 */
function parseWrapper(wrapperElement, emit) {
  const ad = parseAdElement(wrapperElement, emit);
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
 * Parses the AdVerifications Element.
 * @param  {Array} verifications - The array of verifications to parse.
 * @return {Array<Object>}
 */

export function _parseAdVerifications(verifications) {
  const ver = [];

  verifications.forEach(verificationNode => {
    const verification = createAdVerification();
    const childNodes = verificationNode.childNodes;

    parserUtils.assignAttributes(verificationNode.attributes, verification);
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
