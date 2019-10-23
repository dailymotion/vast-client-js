import { parserVerification } from '../src/parser/parser_verification';
import { vastInLine } from './samples/inline_missing_values';
import { vastMissingWrapperValues } from './samples/wrapper_missing_values';
import { getNodesFromXml } from './utils/utils';

describe('parserVerification', function() {
  describe('verifyRequiredValues', function() {
    let warnings = [];

    const emitter = (emitType, { message }) => {
      if (emitType === 'VAST-warning') {
        warnings.push(message);
      }
    };

    beforeEach(() => {
      warnings = [];
    });

    it('should have emitted warning for InLine "missing required sub elements"', () => {
      const inLineElement = getNodesFromXml(
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
      const inLineAndChildsElements = getNodesFromXml(
        vastInLine.childMissingRequiredSubElements
      );
      parserVerification.verifyRequiredValues(inLineAndChildsElements, emitter);
      expect(warnings).toEqual(
        expect.arrayContaining([
          "Element 'InLine' missing required sub element(s) 'AdSystem, AdTitle, Impression, AdServingId' ",
          "Element 'Creatives' missing required sub element(s) 'Creative' ",
          "Element 'Creative' missing required sub element(s) 'UniversalAdId' ",
          "Element 'Linear' missing required sub element(s) 'MediaFiles, Duration' ",
          "Element 'Icons' missing required sub element(s) 'Icon' ",
          "Element 'Verification' must provide one of the following 'JavaScriptResource, ExecutableResource' ",
          "Element 'MediaFiles' missing required sub element(s) 'MediaFile' "
        ])
      );
    });

    it('should have emitted warning "missing required sub elements" for Wrapper', () => {
      const wrapperElement = getNodesFromXml(vastMissingWrapperValues);
      parserVerification.verifyRequiredValues(wrapperElement, emitter);
      expect(warnings).toEqual(
        expect.arrayContaining([
          "Element 'Wrapper' missing required sub element(s) 'VASTAdTagURI, Impression' "
        ])
      );
    });
    it('should have emitted warning "missing required attributes" for Wrapper', () => {
      const wrapperElement = getNodesFromXml(vastMissingWrapperValues);
      parserVerification.verifyRequiredValues(wrapperElement, emitter);
      expect(warnings).toEqual(
        expect.arrayContaining([
          "Element 'BlockedAdCategories' missing required attribute(s) 'authority' "
        ])
      );
    });

    it('should have emitted warnings "missing attributes" and warnings "missing one of following subElements"', () => {
      const missingAttributesElement = getNodesFromXml(
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
          "Element 'UniversalAdId' missing required attribute(s) 'idRegistry' ",
          "Element 'Verification' missing required attribute(s) 'vendor' ",
          "Element 'JavaScriptResource' missing required attribute(s) 'apiFramework, browserOptional' ",
          "Element 'JavaScriptResource' missing required attribute(s) 'browserOptional' ",
          "Element 'ExecutableResource' missing required attribute(s) 'apiFramework, type' ",
          "Element 'Tracking' missing required attribute(s) 'event' ",
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
      const missingAttributesElement = getNodesFromXml(
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

  describe('hasSubElements', function() {
    it('should return false', () => {
      const element = getNodesFromXml('<InLine></InLine>');
      expect(parserVerification.hasSubElements(element)).toEqual(false);
    });
    it('should return false even if there is cdata, comment or text', () => {
      const element = getNodesFromXml(
        '<Pricing><!-- test --><![CDATA[ 25.00 ]]> test </Pricing>'
      );
      expect(parserVerification.hasSubElements(element)).toEqual(false);
    });
    it('should return true', () => {
      const element = getNodesFromXml(
        '<InLine><AdTitle>test</AdTitle></InLine>'
      );
      expect(parserVerification.hasSubElements(element)).toEqual(true);
    });
  });

  describe('emitMissingValueWarning', function() {
    let warning = {};

    const emitter = (emitType, payload) => {
      if (emitType === 'VAST-warning') {
        warning = payload;
      }
    };

    beforeEach(() => {
      warning = {};
    });
    it('should emit missing required attributes warning', () => {
      const warn = {
        name: 'node',
        parentName: 'parentNode',
        attributes: ['attribute1', 'attribute2']
      };
      parserVerification.emitMissingValueWarning(warn, emitter);
      expect(warning).toMatchObject({
        message:
          "Element 'node' missing required attribute(s) 'attribute1, attribute2' ",
        parentElement: 'parentNode',
        specVersion: 4.1
      });
    });

    it('should emit missing required sub elements warning', () => {
      const warn = {
        name: 'node',
        parentName: 'parentNode',
        subElements: ['subelement1', 'subelement2']
      };
      parserVerification.emitMissingValueWarning(warn, emitter);
      expect(warning).toMatchObject({
        message:
          "Element 'node' missing required sub element(s) 'subelement1, subelement2' ",
        parentElement: 'parentNode',
        specVersion: 4.1
      });
    });

    it('should emit missing required one of ressources warning', () => {
      const warn = {
        name: 'node',
        parentName: 'parentNode',
        oneOfResources: ['ressource1', 'ressource2', 'ressource3']
      };
      parserVerification.emitMissingValueWarning(warn, emitter);
      expect(warning).toMatchObject({
        message:
          "Element 'node' must provide one of the following 'ressource1, ressource2, ressource3' ",
        parentElement: 'parentNode',
        specVersion: 4.1
      });
    });

    it('should emit node is empty warning', () => {
      const warn = {
        name: 'node',
        parentName: 'parentNode'
      };

      parserVerification.emitMissingValueWarning(warn, emitter);
      expect(warning).toMatchObject({
        message: "Element 'node' is empty",
        parentElement: 'parentNode',
        specVersion: 4.1
      });
    });
  });

  describe('verifyRequiredAttributes', function() {
    it('should call the emit function for missing required attributes', () => {
      const emitMock = jest.fn();
      const element = getNodesFromXml('<MediaFile></MediaFile>');
      parserVerification.verifyRequiredAttributes(element, emitMock);
      expect(emitMock).toHaveBeenCalledTimes(1);
    });

    it('should not call the emit function when missing non required attributes', () => {
      const emitMock = jest.fn();
      // missing optional attribute: id, bitrate and scalable
      const element = getNodesFromXml(
        '<MediaFile delivery="progressive" type="video/mp4" width="1280" height="720"></MediaFile>'
      );
      parserVerification.verifyRequiredAttributes(element, emitMock);
      expect(emitMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('verifyRequiredSubElements', function() {
    it('should call the emit function for missing required subelement', () => {
      const element = getNodesFromXml('<Creatives></Creatives>');
      const emitMock = jest.fn();
      const isAdInLine = true;
      parserVerification.verifyRequiredSubElements(
        element,
        emitMock,
        isAdInLine
      );
      expect(emitMock).toHaveBeenCalledTimes(1);
    });

    it('should not call the emit function if node inside Wrapper has a missing sub element that is required when inside InLine', () => {
      const emitMock = jest.fn();
      const element = getNodesFromXml('<Creatives></Creatives>');
      const isAdInLine = false;
      parserVerification.verifyRequiredSubElements(
        element,
        emitMock,
        isAdInLine
      );
      expect(emitMock).toHaveBeenCalledTimes(0);
    });
  });
});
