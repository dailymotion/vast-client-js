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

  parse(inLineElement) {
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
                  var creative = this.creativeLinearParser.parse(
                    creativeTypeElement,
                    creativeAttributes
                  );
                  if (creative) {
                    ad.creatives.push(creative);
                  }
                  break;
                case 'NonLinearAds':
                  creative = this.creativeNonLinearParser.parse(
                    creativeTypeElement,
                    creativeAttributes
                  );
                  if (creative) {
                    ad.creatives.push(creative);
                  }
                  break;
                case 'CompanionAds':
                  creative = this.creativeCompanionParser.parse(
                    creativeTypeElement,
                    creativeAttributes
                  );
                  if (creative) {
                    ad.creatives.push(creative);
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
