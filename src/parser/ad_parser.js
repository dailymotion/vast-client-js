import { Ad } from '../ad';
import { AdExtension } from '../ad_extension';
import { AdExtensionChild } from '../ad_extension_child';
import { CreativeCompanionParser } from './creative_companion_parser';
import { CreativeLinearParser } from './creative_linear_parser';
import { CreativeNonLinearParser } from './creative_non_linear_parser';
import { ParserUtils } from './parser_utils';

export class AdParser {
  constructor() {
    this.creativeCompanionParser = new CreativeCompanionParser();
    this.creativeNonLinearParser = new CreativeNonLinearParser();
    this.creativeLinearParser = new CreativeLinearParser();
    this.parserUtils = new ParserUtils();
  }

  // Parse an Ad element (can be either be a Wrapper or an InLine)
  parse(adElement) {
    const childNodes = adElement.childNodes;

    for (let adTypeElementKey in childNodes) {
      const adTypeElement = childNodes[adTypeElementKey];

      if (!['Wrapper', 'InLine'].includes(adTypeElement.nodeName)) {
        continue;
      }

      this.parserUtils.copyNodeAttribute('id', adElement, adTypeElement);
      this.parserUtils.copyNodeAttribute('sequence', adElement, adTypeElement);

      if (adTypeElement.nodeName === 'Wrapper') {
        return this.parseWrapper(adTypeElement);
      } else if (adTypeElement.nodeName === 'InLine') {
        return this.parseInLine(adTypeElement);
      }
    }
  }

  parseInLine(inLineElement) {
    const childNodes = inLineElement.childNodes;
    const ad = new Ad();
    ad.id = inLineElement.getAttribute('id') || null;
    ad.sequence = inLineElement.getAttribute('sequence') || null;

    for (let nodeKey in childNodes) {
      const node = childNodes[nodeKey];

      switch (node.nodeName) {
        case 'Error':
          ad.errorURLTemplates.push(this.parserUtils.parseNodeText(node));
          break;

        case 'Impression':
          ad.impressionURLTemplates.push(this.parserUtils.parseNodeText(node));
          break;

        case 'Creatives':
          for (let creativeElement of this.parserUtils.childrenByName(
            node,
            'Creative'
          )) {
            const creativeAttributes = {
              id: creativeElement.getAttribute('id') || null,
              adId: this.parseCreativeAdIdAttribute(creativeElement),
              sequence: creativeElement.getAttribute('sequence') || null,
              apiFramework: creativeElement.getAttribute('apiFramework') || null
            };

            for (let creativeTypeElementKey in creativeElement.childNodes) {
              const creativeTypeElement =
                creativeElement.childNodes[creativeTypeElementKey];

              switch (creativeTypeElement.nodeName) {
                case 'Linear':
                  let creativeLinear = this.creativeLinearParser.parse(
                    creativeTypeElement,
                    creativeAttributes
                  );
                  if (creativeLinear) {
                    ad.creatives.push(creativeLinear);
                  }
                  break;
                case 'NonLinearAds':
                  let creativeNonLinear = this.creativeNonLinearParser.parse(
                    creativeTypeElement,
                    creativeAttributes
                  );
                  if (creativeNonLinear) {
                    ad.creatives.push(creativeNonLinear);
                  }
                  break;
                case 'CompanionAds':
                  let creativeCompanion = this.creativeCompanionParser.parse(
                    creativeTypeElement,
                    creativeAttributes
                  );
                  if (creativeCompanion) {
                    ad.creatives.push(creativeCompanion);
                  }
                  break;
              }
            }
          }
          break;
        case 'Extensions':
          this.parseExtension(
            ad.extensions,
            this.parserUtils.childrenByName(node, 'Extension')
          );
          break;

        case 'AdSystem':
          ad.system = {
            value: this.parserUtils.parseNodeText(node),
            version: node.getAttribute('version') || null
          };
          break;

        case 'AdTitle':
          ad.title = this.parserUtils.parseNodeText(node);
          break;

        case 'Description':
          ad.description = this.parserUtils.parseNodeText(node);
          break;

        case 'Advertiser':
          ad.advertiser = this.parserUtils.parseNodeText(node);
          break;

        case 'Pricing':
          ad.pricing = {
            value: this.parserUtils.parseNodeText(node),
            model: node.getAttribute('model') || null,
            currency: node.getAttribute('currency') || null
          };
          break;

        case 'Survey':
          ad.survey = this.parserUtils.parseNodeText(node);
          break;
      }
    }

    return ad;
  }

  parseWrapper(wrapperElement) {
    const ad = this.parseInLine(wrapperElement);
    let wrapperURLElement = this.parserUtils.childByName(
      wrapperElement,
      'VASTAdTagURI'
    );

    if (wrapperURLElement != null) {
      ad.nextWrapperURL = this.parserUtils.parseNodeText(wrapperURLElement);
    } else {
      wrapperURLElement = this.parserUtils.childByName(
        wrapperElement,
        'VASTAdTagURL'
      );

      if (wrapperURLElement != null) {
        ad.nextWrapperURL = this.parserUtils.parseNodeText(
          this.parserUtils.childByName(wrapperURLElement, 'URL')
        );
      }
    }

    for (let wrapperCreativeElement of ad.creatives) {
      if (['linear', 'nonlinear'].includes(wrapperCreativeElement.type)) {
        // TrackingEvents Linear / NonLinear
        if (wrapperCreativeElement.trackingEvents != null) {
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
            for (let url of urls) {
              ad.trackingEvents[wrapperCreativeElement.type][eventName].push(
                url
              );
            }
          }
        }
        // ClickTracking
        if (wrapperCreativeElement.videoClickTrackingURLTemplates != null) {
          if (!ad.videoClickTrackingURLTemplates) {
            ad.videoClickTrackingURLTemplates = [];
          } // tmp property to save wrapper tracking URLs until they are merged
          for (let item of wrapperCreativeElement.videoClickTrackingURLTemplates) {
            ad.videoClickTrackingURLTemplates.push(item);
          }
        }
        // ClickThrough
        if (wrapperCreativeElement.videoClickThroughURLTemplate != null) {
          ad.videoClickThroughURLTemplate =
            wrapperCreativeElement.videoClickThroughURLTemplate;
        }
        // CustomClick
        if (wrapperCreativeElement.videoCustomClickURLTemplates != null) {
          if (!ad.videoCustomClickURLTemplates) {
            ad.videoCustomClickURLTemplates = [];
          } // tmp property to save wrapper tracking URLs until they are merged
          for (let item of wrapperCreativeElement.videoCustomClickURLTemplates) {
            ad.videoCustomClickURLTemplates.push(item);
          }
        }
      }
    }

    if (ad.nextWrapperURL != null) {
      return ad;
    }
  }

  parseExtension(collection, extensions) {
    for (let extNode of extensions) {
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
        const txt = this.parserUtils.parseNodeText(childNode);

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
    }
  }

  parseCreativeAdIdAttribute(creativeElement) {
    return (
      creativeElement.getAttribute('AdID') || // VAST 2 spec
      creativeElement.getAttribute('adID') || // VAST 3 spec
      creativeElement.getAttribute('adId') || // VAST 4 spec
      null
    );
  }
}
