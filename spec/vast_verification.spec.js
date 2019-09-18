import { parserVerification } from '../src/parser/parser_verification';
import { vastInLine } from './samples/inline_missing_values';
import { vastMissingWrapperValues } from './samples/wrapper_missing_values';

describe('parserVerification', function() {
  describe('verifyRequiredValues', function() {
    let warnings = [];

    const parseXmlFromString = xmlString => {
      var parser = new DOMParser();
      return parser.parseFromString(xmlString, 'application/xml');
    };

    const emitter = (emitType, { message }) => {
      if (emitType === 'VAST-warning') {
        warnings.push(message);
      }
    };

    beforeEach(() => {
      warnings = [];
    });

    it('should have emitted warning for InLine "missing required sub elements"', () => {
      const inLineElement = parseXmlFromString(
        vastInLine.missingRequiredSubElements
      );
      parserVerification.verifyRequiredValues(inLineElement, emitter);
      expect(warnings).toEqual(
        expect.arrayContaining([
          "Element 'InLine' missing required sub element(s) 'AdSystem, AdTitle, Impression, AdServingId, Creatives' "
        ])
      );
    });

    it('should have emitted warnings "missing required sub elements" for InLine childs: Linear, Icons, MediaFiles', () => {
      const inLineAndChildsElements = parseXmlFromString(
        vastInLine.childMissingRequiredSubElements
      );
      parserVerification.verifyRequiredValues(inLineAndChildsElements, emitter);
      expect(warnings).toEqual(
        expect.arrayContaining([
          "Element 'InLine' missing required sub element(s) 'AdSystem, AdTitle, Impression, AdServingId' ",
          "Element 'Creatives' missing required sub element(s) 'Creative' ",
          "Element 'Linear' missing required sub element(s) 'MediaFiles, Duration' ",
          "Element 'Icons' missing required sub element(s) 'Icon' ",
          "Element 'MediaFiles' missing required sub element(s) 'MediaFile' "
        ])
      );
    });

    it('should have emitted warning "missing required sub elements" for Wrapper', () => {
      const wrapperElement = parseXmlFromString(vastMissingWrapperValues);
      parserVerification.verifyRequiredValues(wrapperElement, emitter);
      expect(warnings).toEqual(
        expect.arrayContaining([
          "Element 'Wrapper' missing required sub element(s) 'VASTAdTagURI, Impression' "
        ])
      );
    });
    it('should have emitted warning "missing required attributes" for Wrapper', () => {
      const wrapperElement = parseXmlFromString(vastMissingWrapperValues);
      parserVerification.verifyRequiredValues(wrapperElement, emitter);
      expect(warnings).toEqual(
        expect.arrayContaining([
          "Element 'BlockedAdCategories' missing required attribute(s) 'authority' "
        ])
      );
    });

    it('should have emitted warnings "missing attributes" and warnings "missing one of following subElements"', () => {
      const missingAttributesElement = parseXmlFromString(
        vastInLine.missingRequiredAttributes
      );
      parserVerification.verifyRequiredValues(
        missingAttributesElement,
        emitter
      );
      expect(warnings).toEqual(
        expect.arrayContaining([
          "Element 'Category' missing required attribute(s) 'authority' ",
          "Element 'Pricing' missing required attribute(s) 'model, currency' ",
          "Element 'Verification' missing required attribute(s) 'vendor' ",
          "Element 'JavaScriptResource' missing required attribute(s) 'apiFramework, browserOptional' ",
          "Element 'ExecutableResource' missing required attribute(s) 'apiFramework, type' ",
          "Element 'MediaFile' missing required attribute(s) 'delivery, type, width, height' ",
          "Element 'Mezzanine' missing required attribute(s) 'delivery, type, width, height' ",
          "Element 'Icon' must provide one of the following 'StaticResource, IFrameResource, HTMLResource' ",
          "Element 'Companion' missing required attribute(s) 'width, height' ",
          "Element 'StaticResource' missing required attribute(s) 'creativeType' ",
          "Element 'Companion' missing required attribute(s) 'width, height' ",
          "Element 'Companion' must provide one of the following 'StaticResource, IFrameResource, HTMLResource' ",
          "Element 'NonLinear' missing required attribute(s) 'width, height' ",
          "Element 'NonLinear' must provide one of the following 'StaticResource, IFrameResource, HTMLResource' "
        ])
      );
    });

    it('should have emitted warnings "Element is empty"', () => {
      const missingAttributesElement = parseXmlFromString(
        vastInLine.emptyRequiredValues
      );
      parserVerification.verifyRequiredValues(
        missingAttributesElement,
        emitter
      );
      expect(warnings).toEqual(
        expect.arrayContaining([
          "Element 'AdServingId' is empty",
          "Element 'AdSystem' is empty",
          "Element 'AdTitle' is empty",
          "Element 'Impression' is empty",
          "Element 'Duration' is empty",
          "Element 'MediaFiles' is empty",
          "Element 'Creative' is empty",
          "Element 'Creatives' is empty",
          "Element 'InLine' is empty"
        ])
      );
    });
  });
});
