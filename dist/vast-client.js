(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VAST = {}));
}(this, (function (exports) { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  function createAd() {
    var adAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
      id: adAttributes.id || null,
      sequence: adAttributes.sequence || null,
      adType: adAttributes.adType || null,
      adServingId: null,
      categories: [],
      expires: null,
      viewableImpression: {},
      system: null,
      title: null,
      description: null,
      advertiser: null,
      pricing: null,
      survey: null,
      // @deprecated in VAST 4.1
      errorURLTemplates: [],
      impressionURLTemplates: [],
      creatives: [],
      extensions: [],
      adVerifications: [],
      blockedAdCategories: [],
      followAdditionalWrappers: true,
      allowMultipleAds: false,
      fallbackOnNoAd: null
    };
  }

  function createAdVerification() {
    return {
      resource: null,
      vendor: null,
      browserOptional: false,
      apiFramework: null,
      type: null,
      parameters: null,
      trackingEvents: {}
    };
  }

  function createCompanionAd() {
    var creativeAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
      id: creativeAttributes.id || null,
      adType: 'companionAd',
      width: creativeAttributes.width || 0,
      height: creativeAttributes.height || 0,
      assetWidth: creativeAttributes.assetWidth || null,
      assetHeight: creativeAttributes.assetHeight || null,
      expandedWidth: creativeAttributes.expandedWidth || null,
      expandedHeight: creativeAttributes.expandedHeight || null,
      apiFramework: creativeAttributes.apiFramework || null,
      adSlotID: creativeAttributes.adSlotID || null,
      pxratio: creativeAttributes.pxratio || '1',
      renderingMode: creativeAttributes.renderingMode || 'default',
      staticResources: [],
      htmlResources: [],
      iframeResources: [],
      adParameters: null,
      xmlEncoded: null,
      altText: null,
      companionClickThroughURLTemplate: null,
      companionClickTrackingURLTemplates: [],
      trackingEvents: {}
    };
  }
  function isCompanionAd(ad) {
    return ad.adType === 'companionAd';
  }

  function createCreative() {
    var creativeAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
      id: creativeAttributes.id || null,
      adId: creativeAttributes.adId || null,
      sequence: creativeAttributes.sequence || null,
      apiFramework: creativeAttributes.apiFramework || null,
      universalAdId: {
        value: null,
        idRegistry: 'unknown'
      },
      creativeExtensions: []
    };
  }

  function createCreativeCompanion() {
    var creativeAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _createCreative = createCreative(creativeAttributes),
        id = _createCreative.id,
        adId = _createCreative.adId,
        sequence = _createCreative.sequence,
        apiFramework = _createCreative.apiFramework;

    return {
      id: id,
      adId: adId,
      sequence: sequence,
      apiFramework: apiFramework,
      type: 'companion',
      required: null,
      variations: []
    };
  }

  var supportedMacros = ['ADCATEGORIES', 'ADCOUNT', 'ADPLAYHEAD', 'ADSERVINGID', 'ADTYPE', 'APIFRAMEWORKS', 'APPBUNDLE', 'ASSETURI', 'BLOCKEDADCATEGORIES', 'BREAKMAXADLENGTH', 'BREAKMAXADS', 'BREAKMAXDURATION', 'BREAKMINADLENGTH', 'BREAKMINDURATION', 'BREAKPOSITION', 'CLICKPOS', 'CLICKTYPE', 'CLIENTUA', 'CONTENTID', 'CONTENTPLAYHEAD', // @deprecated VAST 4.1
  'CONTENTURI', 'DEVICEIP', 'DEVICEUA', 'DOMAIN', 'EXTENSIONS', 'GDPRCONSENT', 'IFA', 'IFATYPE', 'INVENTORYSTATE', 'LATLONG', 'LIMITADTRACKING', 'MEDIAMIME', 'MEDIAPLAYHEAD', 'OMIDPARTNER', 'PAGEURL', 'PLACEMENTTYPE', 'PLAYERCAPABILITIES', 'PLAYERSIZE', 'PLAYERSTATE', 'PODSEQUENCE', 'REGULATIONS', 'SERVERSIDE', 'SERVERUA', 'TRANSACTIONID', 'UNIVERSALADID', 'VASTVERSIONS', 'VERIFICATIONVENDORS'];

  function track(URLTemplates, macros, options) {
    var URLs = resolveURLTemplates(URLTemplates, macros, options);
    URLs.forEach(function (URL) {
      if (typeof window !== 'undefined' && window !== null) {
        var i = new Image();
        i.src = URL;
      }
    });
  }
  /**
   * Replace the provided URLTemplates with the given values
   *
   * @param {Array} URLTemplates - An array of tracking url templates.
   * @param {Object} [macros={}] - An optional Object of parameters to be used in the tracking calls.
   * @param {Object} [options={}] - An optional Object of options to be used in the tracking calls.
   */


  function resolveURLTemplates(URLTemplates) {
    var macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var resolvedURLs = [];
    var URLArray = extractURLsFromTemplates(URLTemplates); // Set default value for invalid ERRORCODE

    if (macros['ERRORCODE'] && !options.isCustomCode && !/^[0-9]{3}$/.test(macros['ERRORCODE'])) {
      macros['ERRORCODE'] = 900;
    } // Calc random/time based macros


    macros['CACHEBUSTING'] = leftpad(Math.round(Math.random() * 1.0e8).toString());
    macros['TIMESTAMP'] = new Date().toISOString(); // RANDOM/random is not defined in VAST 3/4 as a valid macro tho it's used by some adServer (Auditude)

    macros['RANDOM'] = macros['random'] = macros['CACHEBUSTING'];

    for (var macro in macros) {
      macros[macro] = encodeURIComponentRFC3986(macros[macro]);
    }

    for (var URLTemplateKey in URLArray) {
      var resolveURL = URLArray[URLTemplateKey];

      if (typeof resolveURL !== 'string') {
        continue;
      }

      resolvedURLs.push(replaceUrlMacros(resolveURL, macros));
    }

    return resolvedURLs;
  }
  /**
   * Replace the macros tracking url with their value.
   * If no value is provided for a supported macro and it exists in the url,
   * it will be replaced by -1 as described by the VAST 4.1 iab specifications
   *
   * @param {String} url - Tracking url.
   * @param {Object} macros - Object of macros to be replaced in the tracking calls
   */


  function replaceUrlMacros(url, macros) {
    url = replaceMacrosValues(url, macros); // match any macros from the url that was not replaced

    var remainingMacros = url.match(/[^[\]]+(?=])/g);

    if (!remainingMacros) {
      return url;
    }

    var supportedRemainingMacros = remainingMacros.filter(function (macro) {
      return supportedMacros.indexOf(macro) > -1;
    });

    if (supportedRemainingMacros.length === 0) {
      return url;
    }

    supportedRemainingMacros = supportedRemainingMacros.reduce(function (accumulator, macro) {
      accumulator[macro] = -1;
      return accumulator;
    }, {});
    return replaceMacrosValues(url, supportedRemainingMacros);
  }
  /**
   * Replace the macros tracking url with their value.
   *
   * @param {String} url - Tracking url.
   * @param {Object} macros - Object of macros to be replaced in the tracking calls
   */


  function replaceMacrosValues(url, macros) {
    var replacedMacrosUrl = url;

    for (var key in macros) {
      var value = macros[key]; // this will match [${key}] and %%${key}%% and replace it

      replacedMacrosUrl = replacedMacrosUrl.replace(new RegExp("(?:\\[|%%)(".concat(key, ")(?:\\]|%%)"), 'g'), value);
    }

    return replacedMacrosUrl;
  }
  /**
   * Extract the url/s from the URLTemplates.
   *   If the URLTemplates is an array of urls
   *   If the URLTemplates object has a url property
   *   If the URLTemplates is a single string
   *
   * @param {Array|String} URLTemplates - An array|string of url templates.
   */


  function extractURLsFromTemplates(URLTemplates) {
    if (Array.isArray(URLTemplates)) {
      return URLTemplates.map(function (URLTemplate) {
        return URLTemplate && URLTemplate.hasOwnProperty('url') ? URLTemplate.url : URLTemplate;
      });
    }

    return URLTemplates;
  }
  /**
   * Returns a boolean after checking if the object exists in the array.
   *   true - if the object exists, false otherwise
   *
   * @param {Object} obj - The object who existence is to be checked.
   * @param {Array} list - List of objects.
   */


  function containsTemplateObject(obj, list) {
    for (var i = 0; i < list.length; i++) {
      if (isTemplateObjectEqual(list[i], obj)) {
        return true;
      }
    }

    return false;
  }
  /**
   * Returns a boolean after comparing two Template objects.
   *   true - if the objects are equivalent, false otherwise
   *
   * @param {Object} obj1
   * @param {Object} obj2
   */


  function isTemplateObjectEqual(obj1, obj2) {
    if (obj1 && obj2) {
      var obj1Properties = Object.getOwnPropertyNames(obj1);
      var obj2Properties = Object.getOwnPropertyNames(obj2); // If number of properties is different, objects are not equivalent

      if (obj1Properties.length !== obj2Properties.length) {
        return false;
      }

      if (obj1.id !== obj2.id || obj1.url !== obj2.url) {
        return false;
      }

      return true;
    }

    return false;
  } // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent


  function encodeURIComponentRFC3986(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
      return "%".concat(c.charCodeAt(0).toString(16));
    });
  }

  function leftpad(input) {
    var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8;
    var str = String(input);

    if (str.length < len) {
      return range(0, len - str.length, false).map(function () {
        return '0';
      }).join('') + str;
    }

    return str;
  }

  function range(left, right, inclusive) {
    var result = [];
    var ascending = left < right;
    var end = !inclusive ? right : ascending ? right + 1 : right - 1;

    for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
      result.push(i);
    }

    return result;
  }

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
  }
  /**
   * Joins two arrays of objects without duplicates
   *
   * @param {Array} arr1
   * @param {Array} arr2
   *
   * @return {Array}
   */


  function joinArrayOfUniqueTemplateObjs() {
    var arr1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var arr2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var firstArr = Array.isArray(arr1) ? arr1 : [];
    var secondArr = Array.isArray(arr2) ? arr2 : [];
    var arr = firstArr.concat(secondArr);
    return arr.reduce(function (res, val) {
      if (!containsTemplateObject(val, res)) {
        res.push(val);
      }

      return res;
    }, []);
  }

  var util = {
    track: track,
    resolveURLTemplates: resolveURLTemplates,
    extractURLsFromTemplates: extractURLsFromTemplates,
    containsTemplateObject: containsTemplateObject,
    isTemplateObjectEqual: isTemplateObjectEqual,
    encodeURIComponentRFC3986: encodeURIComponentRFC3986,
    replaceUrlMacros: replaceUrlMacros,
    leftpad: leftpad,
    range: range,
    isNumeric: isNumeric,
    flatten: flatten,
    joinArrayOfUniqueTemplateObjs: joinArrayOfUniqueTemplateObjs
  };

  /**
   * This module provides support methods to the parsing classes.
   */

  /**
   * Returns the first element of the given node which nodeName matches the given name.
   * @param  {Node} node - The node to use to find a match.
   * @param  {String} name - The name to look for.
   * @return {Object|undefined}
   */

  function childByName(node, name) {
    var childNodes = node.childNodes;

    for (var childKey in childNodes) {
      var child = childNodes[childKey];

      if (child.nodeName === name) {
        return child;
      }
    }
  }
  /**
   * Returns all the elements of the given node which nodeName match the given name.
   * @param  {Node} node - The node to use to find the matches.
   * @param  {String} name - The name to look for.
   * @return {Array}
   */


  function childrenByName(node, name) {
    var children = [];
    var childNodes = node.childNodes;

    for (var childKey in childNodes) {
      var child = childNodes[childKey];

      if (child.nodeName === name) {
        children.push(child);
      }
    }

    return children;
  }
  /**
   * Converts relative vastAdTagUri.
   * @param  {String} vastAdTagUrl - The url to resolve.
   * @param  {String} originalUrl - The original url.
   * @return {String}
   */


  function resolveVastAdTagURI(vastAdTagUrl, originalUrl) {
    if (!originalUrl) {
      return vastAdTagUrl;
    }

    if (vastAdTagUrl.indexOf('//') === 0) {
      var _location = location,
          protocol = _location.protocol;
      return "".concat(protocol).concat(vastAdTagUrl);
    }

    if (vastAdTagUrl.indexOf('://') === -1) {
      // Resolve relative URLs (mainly for unit testing)
      var baseURL = originalUrl.slice(0, originalUrl.lastIndexOf('/'));
      return "".concat(baseURL, "/").concat(vastAdTagUrl);
    }

    return vastAdTagUrl;
  }
  /**
   * Converts a boolean string into a Boolean.
   * @param  {String} booleanString - The boolean string to convert.
   * @return {Boolean}
   */


  function parseBoolean(booleanString) {
    return ['true', 'TRUE', 'True', '1'].indexOf(booleanString) !== -1;
  }
  /**
   * Parses a node text (for legacy support).
   * @param  {Object} node - The node to parse the text from.
   * @return {String}
   */


  function parseNodeText(node) {
    return node && (node.textContent || node.text || '').trim();
  }
  /**
   * Copies an attribute from a node to another.
   * @param  {String} attributeName - The name of the attribute to clone.
   * @param  {Object} nodeSource - The source node to copy the attribute from.
   * @param  {Object} nodeDestination - The destination node to copy the attribute at.
   */


  function copyNodeAttribute(attributeName, nodeSource, nodeDestination) {
    var attributeValue = nodeSource.getAttribute(attributeName);

    if (attributeValue) {
      nodeDestination.setAttribute(attributeName, attributeValue);
    }
  }
  /**
   * Converts element attributes into an object, where object key is attribute name
   * and object value is attribute value
   * @param {Element} element
   * @returns {Object}
   */


  function parseAttributes(element) {
    var nodeAttributes = element.attributes;
    var attributes = {};

    for (var i = 0; i < nodeAttributes.length; i++) {
      attributes[nodeAttributes[i].nodeName] = nodeAttributes[i].nodeValue;
    }

    return attributes;
  }
  /**
   * Parses a String duration into a Number.
   * @param  {String} durationString - The dureation represented as a string.
   * @return {Number}
   */


  function parseDuration(durationString) {
    if (durationString === null || typeof durationString === 'undefined') {
      return -1;
    } // Some VAST doesn't have an HH:MM:SS duration format but instead jus the number of seconds


    if (util.isNumeric(durationString)) {
      return parseInt(durationString);
    }

    var durationComponents = durationString.split(':');

    if (durationComponents.length !== 3) {
      return -1;
    }

    var secondsAndMS = durationComponents[2].split('.');
    var seconds = parseInt(secondsAndMS[0]);

    if (secondsAndMS.length === 2) {
      seconds += parseFloat("0.".concat(secondsAndMS[1]));
    }

    var minutes = parseInt(durationComponents[1] * 60);
    var hours = parseInt(durationComponents[0] * 60 * 60);

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || minutes > 60 * 60 || seconds > 60) {
      return -1;
    }

    return hours + minutes + seconds;
  }
  /**
   * Splits an Array of ads into an Array of Arrays of ads.
   * Each subarray contains either one ad or multiple ads (an AdPod)
   * @param  {Array} ads - An Array of ads to split
   * @return {Array}
   */


  function splitVAST(ads) {
    var splittedVAST = [];
    var lastAdPod = null;
    ads.forEach(function (ad, i) {
      if (ad.sequence) {
        ad.sequence = parseInt(ad.sequence, 10);
      } // The current Ad may be the next Ad of an AdPod


      if (ad.sequence > 1) {
        var lastAd = ads[i - 1]; // check if the current Ad is exactly the next one in the AdPod

        if (lastAd && lastAd.sequence === ad.sequence - 1) {
          lastAdPod && lastAdPod.push(ad);
          return;
        } // If the ad had a sequence attribute but it was not part of a correctly formed
        // AdPod, let's remove the sequence attribute


        delete ad.sequence;
      }

      lastAdPod = [ad];
      splittedVAST.push(lastAdPod);
    });
    return splittedVAST;
  }
  /**
   * Parses the attributes and assign them to object
   * @param  {Object} attributes attribute
   * @param  {Object} verificationObject with properties which can be assigned
   */


  function assignAttributes(attributes, verificationObject) {
    if (attributes) {
      for (var attrKey in attributes) {
        var attribute = attributes[attrKey];

        if (attribute.nodeName && attribute.nodeValue && verificationObject.hasOwnProperty(attribute.nodeName)) {
          var value = attribute.nodeValue;

          if (typeof verificationObject[attribute.nodeName] === 'boolean') {
            value = parseBoolean(value);
          }

          verificationObject[attribute.nodeName] = value;
        }
      }
    }
  }
  /**
   * Merges the data between an unwrapped ad and his wrapper.
   * @param  {Ad} unwrappedAd - The 'unwrapped' Ad.
   * @param  {Ad} wrapper - The wrapper Ad.
   * @return {void}
   */


  function mergeWrapperAdData(unwrappedAd, wrapper) {
    unwrappedAd.errorURLTemplates = wrapper.errorURLTemplates.concat(unwrappedAd.errorURLTemplates);
    unwrappedAd.impressionURLTemplates = wrapper.impressionURLTemplates.concat(unwrappedAd.impressionURLTemplates);
    unwrappedAd.extensions = wrapper.extensions.concat(unwrappedAd.extensions); // values from the child wrapper will be overridden

    unwrappedAd.followAdditionalWrappers = wrapper.followAdditionalWrappers;
    unwrappedAd.allowMultipleAds = wrapper.allowMultipleAds;
    unwrappedAd.fallbackOnNoAd = wrapper.fallbackOnNoAd;
    var wrapperCompanions = (wrapper.creatives || []).filter(function (creative) {
      return creative && creative.type === 'companion';
    });
    var wrapperCompanionClickTracking = wrapperCompanions.reduce(function (result, creative) {
      (creative.variations || []).forEach(function (variation) {
        (variation.companionClickTrackingURLTemplates || []).forEach(function (companionClickTrackingURLTemplate) {
          if (!util.containsTemplateObject(companionClickTrackingURLTemplate, result)) {
            result.push(companionClickTrackingURLTemplate);
          }
        });
      });
      return result;
    }, []);
    unwrappedAd.creatives = wrapperCompanions.concat(unwrappedAd.creatives);
    var wrapperHasVideoClickTracking = wrapper.videoClickTrackingURLTemplates && wrapper.videoClickTrackingURLTemplates.length;
    var wrapperHasVideoCustomClick = wrapper.videoCustomClickURLTemplates && wrapper.videoCustomClickURLTemplates.length;
    unwrappedAd.creatives.forEach(function (creative) {
      // merge tracking events
      if (wrapper.trackingEvents && wrapper.trackingEvents[creative.type]) {
        for (var eventName in wrapper.trackingEvents[creative.type]) {
          var urls = wrapper.trackingEvents[creative.type][eventName];

          if (!Array.isArray(creative.trackingEvents[eventName])) {
            creative.trackingEvents[eventName] = [];
          }

          creative.trackingEvents[eventName] = creative.trackingEvents[eventName].concat(urls);
        }
      }

      if (creative.type === 'linear') {
        // merge video click tracking url
        if (wrapperHasVideoClickTracking) {
          creative.videoClickTrackingURLTemplates = creative.videoClickTrackingURLTemplates.concat(wrapper.videoClickTrackingURLTemplates);
        } // merge video custom click url


        if (wrapperHasVideoCustomClick) {
          creative.videoCustomClickURLTemplates = creative.videoCustomClickURLTemplates.concat(wrapper.videoCustomClickURLTemplates);
        } // VAST 2.0 support - Use Wrapper/linear/clickThrough when Inline/Linear/clickThrough is null


        if (wrapper.videoClickThroughURLTemplate && (creative.videoClickThroughURLTemplate === null || typeof creative.videoClickThroughURLTemplate === 'undefined')) {
          creative.videoClickThroughURLTemplate = wrapper.videoClickThroughURLTemplate;
        }
      } // pass wrapper companion trackers to all companions


      if (creative.type === 'companion' && wrapperCompanionClickTracking.length) {
        (creative.variations || []).forEach(function (variation) {
          variation.companionClickTrackingURLTemplates = util.joinArrayOfUniqueTemplateObjs(variation.companionClickTrackingURLTemplates, wrapperCompanionClickTracking);
        });
      }
    }); // As specified by VAST specs unwrapped ads should contains wrapper adVerification script

    if (wrapper.adVerifications) {
      unwrappedAd.adVerifications = unwrappedAd.adVerifications.concat(wrapper.adVerifications);
    }

    if (wrapper.blockedAdCategories) {
      unwrappedAd.blockedAdCategories = unwrappedAd.blockedAdCategories.concat(wrapper.blockedAdCategories);
    }
  }

  var parserUtils = {
    childByName: childByName,
    childrenByName: childrenByName,
    resolveVastAdTagURI: resolveVastAdTagURI,
    parseBoolean: parseBoolean,
    parseNodeText: parseNodeText,
    copyNodeAttribute: copyNodeAttribute,
    parseAttributes: parseAttributes,
    parseDuration: parseDuration,
    splitVAST: splitVAST,
    assignAttributes: assignAttributes,
    mergeWrapperAdData: mergeWrapperAdData
  };

  /**
   * This module provides methods to parse a VAST CompanionAd Element.
   */

  /**
   * Parses a CompanionAd.
   * @param  {Object} creativeElement - The VAST CompanionAd element to parse.
   * @param  {Object} creativeAttributes - The attributes of the CompanionAd (optional).
   * @return {Object} creative - The creative object.
   */

  function parseCreativeCompanion(creativeElement, creativeAttributes) {
    var creative = createCreativeCompanion(creativeAttributes);
    creative.required = creativeElement.getAttribute('required') || null;
    creative.variations = parserUtils.childrenByName(creativeElement, 'Companion').map(function (companionResource) {
      var companionAd = createCompanionAd(parserUtils.parseAttributes(companionResource));
      companionAd.htmlResources = parserUtils.childrenByName(companionResource, 'HTMLResource').reduce(function (urls, resource) {
        var url = parserUtils.parseNodeText(resource);
        return url ? urls.concat(url) : urls;
      }, []);
      companionAd.iframeResources = parserUtils.childrenByName(companionResource, 'IFrameResource').reduce(function (urls, resource) {
        var url = parserUtils.parseNodeText(resource);
        return url ? urls.concat(url) : urls;
      }, []);
      companionAd.staticResources = parserUtils.childrenByName(companionResource, 'StaticResource').reduce(function (urls, resource) {
        var url = parserUtils.parseNodeText(resource);
        return url ? urls.concat({
          url: url,
          creativeType: resource.getAttribute('creativeType') || null
        }) : urls;
      }, []);
      companionAd.altText = parserUtils.parseNodeText(parserUtils.childByName(companionResource, 'AltText')) || null;
      var trackingEventsElement = parserUtils.childByName(companionResource, 'TrackingEvents');

      if (trackingEventsElement) {
        parserUtils.childrenByName(trackingEventsElement, 'Tracking').forEach(function (trackingElement) {
          var eventName = trackingElement.getAttribute('event');
          var trackingURLTemplate = parserUtils.parseNodeText(trackingElement);

          if (eventName && trackingURLTemplate) {
            if (!Array.isArray(companionAd.trackingEvents[eventName])) {
              companionAd.trackingEvents[eventName] = [];
            }

            companionAd.trackingEvents[eventName].push(trackingURLTemplate);
          }
        });
      }

      companionAd.companionClickTrackingURLTemplates = parserUtils.childrenByName(companionResource, 'CompanionClickTracking').map(function (clickTrackingElement) {
        return {
          id: clickTrackingElement.getAttribute('id') || null,
          url: parserUtils.parseNodeText(clickTrackingElement)
        };
      });
      companionAd.companionClickThroughURLTemplate = parserUtils.parseNodeText(parserUtils.childByName(companionResource, 'CompanionClickThrough')) || null;
      var adParametersElement = parserUtils.childByName(companionResource, 'AdParameters');

      if (adParametersElement) {
        companionAd.adParameters = parserUtils.parseNodeText(adParametersElement);
        companionAd.xmlEncoded = adParametersElement.getAttribute('xmlEncoded') || null;
      }

      return companionAd;
    });
    return creative;
  }

  function createCreativeLinear() {
    var creativeAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _createCreative = createCreative(creativeAttributes),
        id = _createCreative.id,
        adId = _createCreative.adId,
        sequence = _createCreative.sequence,
        apiFramework = _createCreative.apiFramework;

    return {
      id: id,
      adId: adId,
      sequence: sequence,
      apiFramework: apiFramework,
      type: 'linear',
      duration: 0,
      skipDelay: null,
      mediaFiles: [],
      mezzanine: null,
      interactiveCreativeFile: null,
      closedCaptionFiles: [],
      videoClickThroughURLTemplate: null,
      videoClickTrackingURLTemplates: [],
      videoCustomClickURLTemplates: [],
      adParameters: null,
      icons: [],
      trackingEvents: {}
    };
  }
  function isCreativeLinear(ad) {
    return ad.type === 'linear';
  }

  function createClosedCaptionFile() {
    var closedCaptionAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
      type: closedCaptionAttributes.type || null,
      language: closedCaptionAttributes.language || null,
      fileURL: null
    };
  }

  function createIcon() {
    return {
      program: null,
      height: 0,
      width: 0,
      xPosition: 0,
      yPosition: 0,
      apiFramework: null,
      offset: null,
      duration: 0,
      type: null,
      staticResource: null,
      htmlResource: null,
      iframeResource: null,
      pxratio: '1',
      iconClickThroughURLTemplate: null,
      iconClickTrackingURLTemplates: [],
      iconViewTrackingURLTemplate: null
    };
  }

  function createInteractiveCreativeFile() {
    var interactiveCreativeAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
      type: interactiveCreativeAttributes.type || null,
      apiFramework: interactiveCreativeAttributes.apiFramework || null,
      variableDuration: parserUtils.parseBoolean(interactiveCreativeAttributes.variableDuration),
      fileURL: null
    };
  }

  function createMediaFile() {
    return {
      id: null,
      fileURL: null,
      fileSize: 0,
      deliveryType: 'progressive',
      mimeType: null,
      mediaType: null,
      codec: null,
      bitrate: 0,
      minBitrate: 0,
      maxBitrate: 0,
      width: 0,
      height: 0,
      apiFramework: null,
      // @deprecated in VAST 4.1. <InteractiveCreativeFile> should be used instead.
      scalable: null,
      maintainAspectRatio: null
    };
  }

  function createMezzanine() {
    return {
      id: null,
      fileURL: null,
      delivery: null,
      codec: null,
      type: null,
      width: 0,
      height: 0,
      fileSize: 0,
      mediaType: '2D'
    };
  }

  /**
   * This module provides methods to parse a VAST Linear Element.
   */

  /**
   * Parses a Linear element.
   * @param  {Object} creativeElement - The VAST Linear element to parse.
   * @param  {any} creativeAttributes - The attributes of the Linear (optional).
   * @return {Object} creative - The creativeLinear object.
   */

  function parseCreativeLinear(creativeElement, creativeAttributes) {
    var offset;
    var creative = createCreativeLinear(creativeAttributes);
    creative.duration = parserUtils.parseDuration(parserUtils.parseNodeText(parserUtils.childByName(creativeElement, 'Duration')));
    var skipOffset = creativeElement.getAttribute('skipoffset');

    if (typeof skipOffset === 'undefined' || skipOffset === null) {
      creative.skipDelay = null;
    } else if (skipOffset.charAt(skipOffset.length - 1) === '%' && creative.duration !== -1) {
      var percent = parseInt(skipOffset, 10);
      creative.skipDelay = creative.duration * (percent / 100);
    } else {
      creative.skipDelay = parserUtils.parseDuration(skipOffset);
    }

    var videoClicksElement = parserUtils.childByName(creativeElement, 'VideoClicks');

    if (videoClicksElement) {
      var videoClickThroughElement = parserUtils.childByName(videoClicksElement, 'ClickThrough');

      if (videoClickThroughElement) {
        creative.videoClickThroughURLTemplate = {
          id: videoClickThroughElement.getAttribute('id') || null,
          url: parserUtils.parseNodeText(videoClickThroughElement)
        };
      } else {
        creative.videoClickThroughURLTemplate = null;
      }

      parserUtils.childrenByName(videoClicksElement, 'ClickTracking').forEach(function (clickTrackingElement) {
        creative.videoClickTrackingURLTemplates.push({
          id: clickTrackingElement.getAttribute('id') || null,
          url: parserUtils.parseNodeText(clickTrackingElement)
        });
      });
      parserUtils.childrenByName(videoClicksElement, 'CustomClick').forEach(function (customClickElement) {
        creative.videoCustomClickURLTemplates.push({
          id: customClickElement.getAttribute('id') || null,
          url: parserUtils.parseNodeText(customClickElement)
        });
      });
    }

    var adParamsElement = parserUtils.childByName(creativeElement, 'AdParameters');

    if (adParamsElement) {
      creative.adParameters = parserUtils.parseNodeText(adParamsElement);
    }

    parserUtils.childrenByName(creativeElement, 'TrackingEvents').forEach(function (trackingEventsElement) {
      parserUtils.childrenByName(trackingEventsElement, 'Tracking').forEach(function (trackingElement) {
        var eventName = trackingElement.getAttribute('event');
        var trackingURLTemplate = parserUtils.parseNodeText(trackingElement);

        if (eventName && trackingURLTemplate) {
          if (eventName === 'progress') {
            offset = trackingElement.getAttribute('offset');

            if (!offset) {
              return;
            }

            if (offset.charAt(offset.length - 1) === '%') {
              eventName = "progress-".concat(offset);
            } else {
              eventName = "progress-".concat(Math.round(parserUtils.parseDuration(offset)));
            }
          }

          if (!Array.isArray(creative.trackingEvents[eventName])) {
            creative.trackingEvents[eventName] = [];
          }

          creative.trackingEvents[eventName].push(trackingURLTemplate);
        }
      });
    });
    parserUtils.childrenByName(creativeElement, 'MediaFiles').forEach(function (mediaFilesElement) {
      parserUtils.childrenByName(mediaFilesElement, 'MediaFile').forEach(function (mediaFileElement) {
        creative.mediaFiles.push(parseMediaFile(mediaFileElement));
      });
      var interactiveCreativeElement = parserUtils.childByName(mediaFilesElement, 'InteractiveCreativeFile');

      if (interactiveCreativeElement) {
        creative.interactiveCreativeFile = parseInteractiveCreativeFile(interactiveCreativeElement);
      }

      var closedCaptionElements = parserUtils.childByName(mediaFilesElement, 'ClosedCaptionFiles');

      if (closedCaptionElements) {
        parserUtils.childrenByName(closedCaptionElements, 'ClosedCaptionFile').forEach(function (closedCaptionElement) {
          var closedCaptionFile = createClosedCaptionFile(parserUtils.parseAttributes(closedCaptionElement));
          closedCaptionFile.fileURL = parserUtils.parseNodeText(closedCaptionElement);
          creative.closedCaptionFiles.push(closedCaptionFile);
        });
      }

      var mezzanineElement = parserUtils.childByName(mediaFilesElement, 'Mezzanine');
      var requiredAttributes = getRequiredAttributes(mezzanineElement, ['delivery', 'type', 'width', 'height']);

      if (requiredAttributes) {
        var mezzanine = createMezzanine();
        mezzanine.id = mezzanineElement.getAttribute('id');
        mezzanine.fileURL = parserUtils.parseNodeText(mezzanineElement);
        mezzanine.delivery = requiredAttributes.delivery;
        mezzanine.codec = mezzanineElement.getAttribute('codec');
        mezzanine.type = requiredAttributes.type;
        mezzanine.width = parseInt(requiredAttributes.width, 10);
        mezzanine.height = parseInt(requiredAttributes.height, 10);
        mezzanine.fileSize = parseInt(mezzanineElement.getAttribute('fileSize'), 10);
        mezzanine.mediaType = mezzanineElement.getAttribute('mediaType') || '2D';
        creative.mezzanine = mezzanine;
      }
    });
    var iconsElement = parserUtils.childByName(creativeElement, 'Icons');

    if (iconsElement) {
      parserUtils.childrenByName(iconsElement, 'Icon').forEach(function (iconElement) {
        creative.icons.push(parseIcon(iconElement));
      });
    }

    return creative;
  }
  /**
   * Parses the MediaFile element from VAST.
   * @param  {Object} mediaFileElement - The VAST MediaFile element.
   * @return {Object} - Parsed mediaFile object.
   */

  function parseMediaFile(mediaFileElement) {
    var mediaFile = createMediaFile();
    mediaFile.id = mediaFileElement.getAttribute('id');
    mediaFile.fileURL = parserUtils.parseNodeText(mediaFileElement);
    mediaFile.deliveryType = mediaFileElement.getAttribute('delivery');
    mediaFile.codec = mediaFileElement.getAttribute('codec');
    mediaFile.mimeType = mediaFileElement.getAttribute('type');
    mediaFile.mediaType = mediaFileElement.getAttribute('mediaType') || '2D';
    mediaFile.apiFramework = mediaFileElement.getAttribute('apiFramework');
    mediaFile.fileSize = parseInt(mediaFileElement.getAttribute('fileSize') || 0);
    mediaFile.bitrate = parseInt(mediaFileElement.getAttribute('bitrate') || 0);
    mediaFile.minBitrate = parseInt(mediaFileElement.getAttribute('minBitrate') || 0);
    mediaFile.maxBitrate = parseInt(mediaFileElement.getAttribute('maxBitrate') || 0);
    mediaFile.width = parseInt(mediaFileElement.getAttribute('width') || 0);
    mediaFile.height = parseInt(mediaFileElement.getAttribute('height') || 0);
    var scalable = mediaFileElement.getAttribute('scalable');

    if (scalable && typeof scalable === 'string') {
      mediaFile.scalable = parserUtils.parseBoolean(scalable);
    }

    var maintainAspectRatio = mediaFileElement.getAttribute('maintainAspectRatio');

    if (maintainAspectRatio && typeof maintainAspectRatio === 'string') {
      mediaFile.maintainAspectRatio = parserUtils.parseBoolean(maintainAspectRatio);
    }

    return mediaFile;
  }
  /**
   * Parses the InteractiveCreativeFile element from VAST MediaFiles node.
   * @param  {Object} interactiveCreativeElement - The VAST InteractiveCreativeFile element.
   * @return {Object} - Parsed interactiveCreativeFile object.
   */


  function parseInteractiveCreativeFile(interactiveCreativeElement) {
    var interactiveCreativeFile = createInteractiveCreativeFile(parserUtils.parseAttributes(interactiveCreativeElement));
    interactiveCreativeFile.fileURL = parserUtils.parseNodeText(interactiveCreativeElement);
    return interactiveCreativeFile;
  }
  /**
   * Parses the Icon element from VAST.
   * @param  {Object} iconElement - The VAST Icon element.
   * @return {Object} - Parsed icon object.
   */


  function parseIcon(iconElement) {
    var icon = createIcon();
    icon.program = iconElement.getAttribute('program');
    icon.height = parseInt(iconElement.getAttribute('height') || 0);
    icon.width = parseInt(iconElement.getAttribute('width') || 0);
    icon.xPosition = parseXPosition(iconElement.getAttribute('xPosition'));
    icon.yPosition = parseYPosition(iconElement.getAttribute('yPosition'));
    icon.apiFramework = iconElement.getAttribute('apiFramework');
    icon.pxratio = iconElement.getAttribute('pxratio') || '1';
    icon.offset = parserUtils.parseDuration(iconElement.getAttribute('offset'));
    icon.duration = parserUtils.parseDuration(iconElement.getAttribute('duration'));
    parserUtils.childrenByName(iconElement, 'HTMLResource').forEach(function (htmlElement) {
      icon.type = htmlElement.getAttribute('creativeType') || 'text/html';
      icon.htmlResource = parserUtils.parseNodeText(htmlElement);
    });
    parserUtils.childrenByName(iconElement, 'IFrameResource').forEach(function (iframeElement) {
      icon.type = iframeElement.getAttribute('creativeType') || 0;
      icon.iframeResource = parserUtils.parseNodeText(iframeElement);
    });
    parserUtils.childrenByName(iconElement, 'StaticResource').forEach(function (staticElement) {
      icon.type = staticElement.getAttribute('creativeType') || 0;
      icon.staticResource = parserUtils.parseNodeText(staticElement);
    });
    var iconClicksElement = parserUtils.childByName(iconElement, 'IconClicks');

    if (iconClicksElement) {
      icon.iconClickThroughURLTemplate = parserUtils.parseNodeText(parserUtils.childByName(iconClicksElement, 'IconClickThrough'));
      parserUtils.childrenByName(iconClicksElement, 'IconClickTracking').forEach(function (iconClickTrackingElement) {
        icon.iconClickTrackingURLTemplates.push({
          id: iconClickTrackingElement.getAttribute('id') || null,
          url: parserUtils.parseNodeText(iconClickTrackingElement)
        });
      });
    }

    icon.iconViewTrackingURLTemplate = parserUtils.parseNodeText(parserUtils.childByName(iconElement, 'IconViewTracking'));
    return icon;
  }
  /**
   * Parses an horizontal position into a String ('left' or 'right') or into a Number.
   * @param  {String} xPosition - The x position to parse.
   * @return {String|Number}
   */


  function parseXPosition(xPosition) {
    if (['left', 'right'].indexOf(xPosition) !== -1) {
      return xPosition;
    }

    return parseInt(xPosition || 0);
  }
  /**
   * Parses an vertical position into a String ('top' or 'bottom') or into a Number.
   * @param  {String} yPosition - The x position to parse.
   * @return {String|Number}
   */


  function parseYPosition(yPosition) {
    if (['top', 'bottom'].indexOf(yPosition) !== -1) {
      return yPosition;
    }

    return parseInt(yPosition || 0);
  }
  /**
   * Getting required attributes from element
   * @param  {Object} element - DOM element
   * @param  {Array} attributes - list of attributes
   * @return {Object|null} null if a least one element not present
   */


  function getRequiredAttributes(element, attributes) {
    var values = {};
    var error = false;
    attributes.forEach(function (name) {
      if (!element || !element.getAttribute(name)) {
        error = true;
      } else {
        values[name] = element.getAttribute(name);
      }
    });
    return error ? null : values;
  }

  function createCreativeNonLinear() {
    var creativeAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _createCreative = createCreative(creativeAttributes),
        id = _createCreative.id,
        adId = _createCreative.adId,
        sequence = _createCreative.sequence,
        apiFramework = _createCreative.apiFramework;

    return {
      id: id,
      adId: adId,
      sequence: sequence,
      apiFramework: apiFramework,
      type: 'nonlinear',
      variations: [],
      trackingEvents: {}
    };
  }

  function createNonLinearAd() {
    return {
      id: null,
      width: 0,
      height: 0,
      expandedWidth: 0,
      expandedHeight: 0,
      scalable: true,
      maintainAspectRatio: true,
      minSuggestedDuration: 0,
      apiFramework: 'static',
      adType: 'nonLinearAd',
      type: null,
      staticResource: null,
      htmlResource: null,
      iframeResource: null,
      nonlinearClickThroughURLTemplate: null,
      nonlinearClickTrackingURLTemplates: [],
      adParameters: null
    };
  }
  function isNonLinearAd(ad) {
    return ad.adType === 'nonLinearAd';
  }

  /**
   * This module provides methods to parse a VAST NonLinear Element.
   */

  /**
   * Parses a NonLinear element.
   * @param  {any} creativeElement - The VAST NonLinear element to parse.
   * @param  {any} creativeAttributes - The attributes of the NonLinear (optional).
   * @return {Object} creative - The CreativeNonLinear object.
   */

  function parseCreativeNonLinear(creativeElement, creativeAttributes) {
    var creative = createCreativeNonLinear(creativeAttributes);
    parserUtils.childrenByName(creativeElement, 'TrackingEvents').forEach(function (trackingEventsElement) {
      var eventName, trackingURLTemplate;
      parserUtils.childrenByName(trackingEventsElement, 'Tracking').forEach(function (trackingElement) {
        eventName = trackingElement.getAttribute('event');
        trackingURLTemplate = parserUtils.parseNodeText(trackingElement);

        if (eventName && trackingURLTemplate) {
          if (!Array.isArray(creative.trackingEvents[eventName])) {
            creative.trackingEvents[eventName] = [];
          }

          creative.trackingEvents[eventName].push(trackingURLTemplate);
        }
      });
    });
    parserUtils.childrenByName(creativeElement, 'NonLinear').forEach(function (nonlinearResource) {
      var nonlinearAd = createNonLinearAd();
      nonlinearAd.id = nonlinearResource.getAttribute('id') || null;
      nonlinearAd.width = nonlinearResource.getAttribute('width');
      nonlinearAd.height = nonlinearResource.getAttribute('height');
      nonlinearAd.expandedWidth = nonlinearResource.getAttribute('expandedWidth');
      nonlinearAd.expandedHeight = nonlinearResource.getAttribute('expandedHeight');
      nonlinearAd.scalable = parserUtils.parseBoolean(nonlinearResource.getAttribute('scalable'));
      nonlinearAd.maintainAspectRatio = parserUtils.parseBoolean(nonlinearResource.getAttribute('maintainAspectRatio'));
      nonlinearAd.minSuggestedDuration = parserUtils.parseDuration(nonlinearResource.getAttribute('minSuggestedDuration'));
      nonlinearAd.apiFramework = nonlinearResource.getAttribute('apiFramework');
      parserUtils.childrenByName(nonlinearResource, 'HTMLResource').forEach(function (htmlElement) {
        nonlinearAd.type = htmlElement.getAttribute('creativeType') || 'text/html';
        nonlinearAd.htmlResource = parserUtils.parseNodeText(htmlElement);
      });
      parserUtils.childrenByName(nonlinearResource, 'IFrameResource').forEach(function (iframeElement) {
        nonlinearAd.type = iframeElement.getAttribute('creativeType') || 0;
        nonlinearAd.iframeResource = parserUtils.parseNodeText(iframeElement);
      });
      parserUtils.childrenByName(nonlinearResource, 'StaticResource').forEach(function (staticElement) {
        nonlinearAd.type = staticElement.getAttribute('creativeType') || 0;
        nonlinearAd.staticResource = parserUtils.parseNodeText(staticElement);
      });
      var adParamsElement = parserUtils.childByName(nonlinearResource, 'AdParameters');

      if (adParamsElement) {
        nonlinearAd.adParameters = parserUtils.parseNodeText(adParamsElement);
      }

      nonlinearAd.nonlinearClickThroughURLTemplate = parserUtils.parseNodeText(parserUtils.childByName(nonlinearResource, 'NonLinearClickThrough'));
      parserUtils.childrenByName(nonlinearResource, 'NonLinearClickTracking').forEach(function (clickTrackingElement) {
        nonlinearAd.nonlinearClickTrackingURLTemplates.push({
          id: clickTrackingElement.getAttribute('id') || null,
          url: parserUtils.parseNodeText(clickTrackingElement)
        });
      });
      creative.variations.push(nonlinearAd);
    });
    return creative;
  }

  function createExtension() {
    return {
      name: null,
      value: null,
      attributes: {},
      children: []
    };
  }
  function isEmptyExtension(extension) {
    return extension.value === null && Object.keys(extension.attributes).length === 0 && extension.children.length === 0;
  }

  /**
   * Parses an array of Extension elements.
   * @param  {Node[]} extensions - The array of extensions to parse.
   * @param  {String} type - The type of extensions to parse.(Ad|Creative)
   * @return {AdExtension[]|CreativeExtension[]} - The nodes parsed to extensions
   */

  function parseExtensions(extensions) {
    var exts = [];
    extensions.forEach(function (extNode) {
      var ext = _parseExtension(extNode);

      if (ext) {
        exts.push(ext);
      }
    });
    return exts;
  }
  /**
   * Parses an extension child node
   * @param {Node} extNode - The extension node to parse
   * @return {AdExtension|CreativeExtension|null} - The node parsed to extension
   */

  function _parseExtension(extNode) {
    // Ignore comments
    if (extNode.nodeName === '#comment') return null;
    var ext = createExtension();
    var extNodeAttrs = extNode.attributes;
    var childNodes = extNode.childNodes;
    ext.name = extNode.nodeName; // Parse attributes

    if (extNode.attributes) {
      for (var extNodeAttrKey in extNodeAttrs) {
        if (extNodeAttrs.hasOwnProperty(extNodeAttrKey)) {
          var extNodeAttr = extNodeAttrs[extNodeAttrKey];

          if (extNodeAttr.nodeName && extNodeAttr.nodeValue) {
            ext.attributes[extNodeAttr.nodeName] = extNodeAttr.nodeValue;
          }
        }
      }
    } // Parse all children


    for (var childNodeKey in childNodes) {
      if (childNodes.hasOwnProperty(childNodeKey)) {
        var parsedChild = _parseExtension(childNodes[childNodeKey]);

        if (parsedChild) {
          ext.children.push(parsedChild);
        }
      }
    }
    /*
      Only parse value of Nodes with only eather no children or only a cdata or text
      to avoid useless parsing that would result to a concatenation of all children
    */


    if (ext.children.length === 0 || ext.children.length === 1 && ['#cdata-section', '#text'].indexOf(ext.children[0].name) >= 0) {
      var txt = parserUtils.parseNodeText(extNode);

      if (txt !== '') {
        ext.value = txt;
      } // Remove the children if it's a cdata or simply text to avoid useless children


      ext.children = [];
    } // Only return not empty objects to not pollute extentions


    return isEmptyExtension(ext) ? null : ext;
  }

  /**
   * Parses the creatives from the Creatives Node.
   * @param  {any} creativeNodes - The creative nodes to parse.
   * @return {Array<Creative>} - An array of Creative objects.
   */

  function parseCreatives(creativeNodes) {
    var creatives = [];
    creativeNodes.forEach(function (creativeElement) {
      var creativeAttributes = {
        id: creativeElement.getAttribute('id') || null,
        adId: parseCreativeAdIdAttribute(creativeElement),
        sequence: creativeElement.getAttribute('sequence') || null,
        apiFramework: creativeElement.getAttribute('apiFramework') || null
      };
      var universalAdId;
      var universalAdIdElement = parserUtils.childByName(creativeElement, 'UniversalAdId');

      if (universalAdIdElement) {
        universalAdId = {
          idRegistry: universalAdIdElement.getAttribute('idRegistry') || 'unknown',
          value: parserUtils.parseNodeText(universalAdIdElement)
        };
      }

      var creativeExtensions;
      var creativeExtensionsElement = parserUtils.childByName(creativeElement, 'CreativeExtensions');

      if (creativeExtensionsElement) {
        creativeExtensions = parseExtensions(parserUtils.childrenByName(creativeExtensionsElement, 'CreativeExtension'));
      }

      for (var creativeTypeElementKey in creativeElement.childNodes) {
        var creativeTypeElement = creativeElement.childNodes[creativeTypeElementKey];
        var parsedCreative = void 0;

        switch (creativeTypeElement.nodeName) {
          case 'Linear':
            parsedCreative = parseCreativeLinear(creativeTypeElement, creativeAttributes);
            break;

          case 'NonLinearAds':
            parsedCreative = parseCreativeNonLinear(creativeTypeElement, creativeAttributes);
            break;

          case 'CompanionAds':
            parsedCreative = parseCreativeCompanion(creativeTypeElement, creativeAttributes);
            break;
        }

        if (parsedCreative) {
          if (universalAdId) {
            parsedCreative.universalAdId = universalAdId;
          }

          if (creativeExtensions) {
            parsedCreative.creativeExtensions = creativeExtensions;
          }

          creatives.push(parsedCreative);
        }
      }
    });
    return creatives;
  }
  /**
   * Parses the creative adId Attribute.
   * @param  {any} creativeElement - The creative element to retrieve the adId from.
   * @return {String|null}
   */

  function parseCreativeAdIdAttribute(creativeElement) {
    return creativeElement.getAttribute('AdID') || // VAST 2 spec
    creativeElement.getAttribute('adID') || // VAST 3 spec
    creativeElement.getAttribute('adId') || // VAST 4 spec
    null;
  }

  var requiredValues = {
    Wrapper: {
      subElements: ['VASTAdTagURI', 'Impression']
    },
    BlockedAdCategories: {
      attributes: ['authority']
    },
    InLine: {
      subElements: ['AdSystem', 'AdTitle', 'Impression', 'AdServingId', 'Creatives']
    },
    Category: {
      attributes: ['authority']
    },
    Pricing: {
      attributes: ['model', 'currency']
    },
    Verification: {
      oneOfinLineResources: ['JavaScriptResource', 'ExecutableResource'],
      attributes: ['vendor']
    },
    UniversalAdId: {
      attributes: ['idRegistry']
    },
    JavaScriptResource: {
      attributes: ['apiFramework', 'browserOptional']
    },
    ExecutableResource: {
      attributes: ['apiFramework', 'type']
    },
    Tracking: {
      attributes: ['event']
    },
    Creatives: {
      subElements: ['Creative']
    },
    Creative: {
      subElements: ['UniversalAdId']
    },
    Linear: {
      subElements: ['MediaFiles', 'Duration']
    },
    MediaFiles: {
      subElements: ['MediaFile']
    },
    MediaFile: {
      attributes: ['delivery', 'type', 'width', 'height']
    },
    Mezzanine: {
      attributes: ['delivery', 'type', 'width', 'height']
    },
    NonLinear: {
      oneOfinLineResources: ['StaticResource', 'IFrameResource', 'HTMLResource'],
      attributes: ['width', 'height']
    },
    Companion: {
      oneOfinLineResources: ['StaticResource', 'IFrameResource', 'HTMLResource'],
      attributes: ['width', 'height']
    },
    StaticResource: {
      attributes: ['creativeType']
    },
    Icons: {
      subElements: ['Icon']
    },
    Icon: {
      oneOfinLineResources: ['StaticResource', 'IFrameResource', 'HTMLResource']
    }
  };

  /**
   * Verify node required values and also verify recursively all his child nodes.
   * Trigger warnings if a node required value is missing.
   * @param  {Node} node - The node element.
   * @param  {Function} emit - Emit function used to trigger Warning event.
   * @emits  VASTParser#VAST-warning
   * @param  {undefined|Boolean} [isAdInline] - Passed recursively to itself. True if the node is contained inside a inLine tag.
   */

  function verifyRequiredValues(node, emit, isAdInline) {
    if (!node || !node.nodeName) {
      return;
    }

    if (node.nodeName === 'InLine') {
      isAdInline = true;
    }

    verifyRequiredAttributes(node, emit);

    if (hasSubElements(node)) {
      verifyRequiredSubElements(node, emit, isAdInline);

      for (var i = 0; i < node.children.length; i++) {
        verifyRequiredValues(node.children[i], emit, isAdInline);
      }
    } else if (parserUtils.parseNodeText(node).length === 0) {
      emitMissingValueWarning({
        name: node.nodeName,
        parentName: node.parentNode.nodeName
      }, emit);
    }
  }
  /**
   * Verify and trigger warnings if node required attributes are not set.
   * @param  {Node} node - The node element.
   * @param  {Function} emit - Emit function used to trigger Warning event.
   * @emits  VASTParser#VAST-warning
   */


  function verifyRequiredAttributes(node, emit) {
    if (!requiredValues[node.nodeName] || !requiredValues[node.nodeName].attributes) {
      return;
    }

    var requiredAttributes = requiredValues[node.nodeName].attributes;
    var missingAttributes = requiredAttributes.filter(function (attributeName) {
      return !node.getAttribute(attributeName);
    });

    if (missingAttributes.length > 0) {
      emitMissingValueWarning({
        name: node.nodeName,
        parentName: node.parentNode.nodeName,
        attributes: missingAttributes
      }, emit);
    }
  }
  /**
   * Verify and trigger warnings if node required sub element are not set.
   * @param  {Node} node - The node element
   * @param  {Boolean} isAdInline - True if node is contained in a inline
   * @param  {Function} emit - Emit function used to trigger Warning event.
   * @emits  VASTParser#VAST-warning
   */


  function verifyRequiredSubElements(node, emit, isAdInline) {
    var required = requiredValues[node.nodeName]; // Do not verify subelement if node is a child of wrapper, but verify it if node is the Wrapper itself
    // Wrapper child have no required subElement. (Only InLine does)

    var isInWrapperButNotWrapperItself = !isAdInline && node.nodeName !== 'Wrapper';

    if (!required || isInWrapperButNotWrapperItself) {
      return;
    }

    if (required.subElements) {
      var requiredSubElements = required.subElements;
      var missingSubElements = requiredSubElements.filter(function (subElementName) {
        return !parserUtils.childByName(node, subElementName);
      });

      if (missingSubElements.length > 0) {
        emitMissingValueWarning({
          name: node.nodeName,
          parentName: node.parentNode.nodeName,
          subElements: missingSubElements
        }, emit);
      }
    } // When InLine format is used some nodes (i.e <NonLinear>, <Companion>, or <Icon>)
    // require at least one of the following resources: StaticResource, IFrameResource, HTMLResource


    if (!isAdInline || !required.oneOfinLineResources) {
      return;
    }

    var resourceFound = required.oneOfinLineResources.some(function (resource) {
      return parserUtils.childByName(node, resource);
    });

    if (!resourceFound) {
      emitMissingValueWarning({
        name: node.nodeName,
        parentName: node.parentNode.nodeName,
        oneOfResources: required.oneOfinLineResources
      }, emit);
    }
  }
  /**
   * Check if a node has sub elements.
   * @param  {Node} node - The node element.
   * @returns {Boolean}
   */


  function hasSubElements(node) {
    return node.children && node.children.length !== 0;
  }
  /**
   * Trigger Warning if a element is empty or has missing attributes/subelements/resources
   * @param  {Object} missingElement - Object containing missing elements and values
   * @param  {String} missingElement.name - The name of element containing missing values
   * @param  {String} missingElement.parentName - The parent name of element containing missing values
   * @param  {Array} missingElement.attributes - The array of missing attributes
   * @param  {Array} missingElement.subElements - The array of missing sub elements
   * @param  {Array} missingElement.oneOfResources - The array of resources in which at least one must be provided by the element
   * @param  {Function} emit - Emit function used to trigger Warning event.
   * @emits  VastParser#VAST-warning
   */


  function emitMissingValueWarning(_ref, emit) {
    var name = _ref.name,
        parentName = _ref.parentName,
        attributes = _ref.attributes,
        subElements = _ref.subElements,
        oneOfResources = _ref.oneOfResources;
    var message = "Element '".concat(name, "'");

    if (attributes) {
      message += " missing required attribute(s) '".concat(attributes.join(', '), "' ");
    } else if (subElements) {
      message += " missing required sub element(s) '".concat(subElements.join(', '), "' ");
    } else if (oneOfResources) {
      message += " must provide one of the following '".concat(oneOfResources.join(', '), "' ");
    } else {
      message += " is empty";
    }

    emit('VAST-warning', {
      message: message,
      parentElement: parentName,
      specVersion: 4.1
    });
  }

  var parserVerification = {
    verifyRequiredValues: verifyRequiredValues,
    hasSubElements: hasSubElements,
    emitMissingValueWarning: emitMissingValueWarning,
    verifyRequiredAttributes: verifyRequiredAttributes,
    verifyRequiredSubElements: verifyRequiredSubElements
  };

  /**
   * This module provides methods to parse a VAST Ad Element.
   */

  /**
   * Parses an Ad element (can either be a Wrapper or an InLine).
   * @param  {Object} adElement - The VAST Ad element to parse.
   * @param  {Function} emit - Emit function used to trigger Warning event
   * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
   * @emits  VASTParser#VAST-warning
   * @return {Object|undefined} - Object containing the ad and if it is wrapper/inline
   */

  function parseAd(adElement, emit) {
    var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        allowMultipleAds = _ref.allowMultipleAds,
        followAdditionalWrappers = _ref.followAdditionalWrappers;

    var childNodes = adElement.childNodes;

    for (var adTypeElementKey in childNodes) {
      var adTypeElement = childNodes[adTypeElementKey];

      if (['Wrapper', 'InLine'].indexOf(adTypeElement.nodeName) === -1) {
        continue;
      }

      if (adTypeElement.nodeName === 'Wrapper' && followAdditionalWrappers === false) {
        continue;
      }

      parserUtils.copyNodeAttribute('id', adElement, adTypeElement);
      parserUtils.copyNodeAttribute('sequence', adElement, adTypeElement);
      parserUtils.copyNodeAttribute('adType', adElement, adTypeElement);

      if (adTypeElement.nodeName === 'Wrapper') {
        return {
          ad: parseWrapper(adTypeElement, emit),
          type: 'WRAPPER'
        };
      } else if (adTypeElement.nodeName === 'InLine') {
        return {
          ad: parseInLine(adTypeElement, emit, {
            allowMultipleAds: allowMultipleAds
          }),
          type: 'INLINE'
        };
      }
    }
  }
  /**
   * Parses an Inline
   * @param  {Object} adElement Element - The VAST Inline element to parse.
   * @param  {Function} emit - Emit function used to trigger Warning event.
   * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
   * @emits  VASTParser#VAST-warning
   * @return {Object} ad - The ad object.
   */

  function parseInLine(adElement, emit) {
    var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        allowMultipleAds = _ref2.allowMultipleAds;

    // if allowMultipleAds is set to false by wrapper attribute
    // only the first stand-alone Ad (with no sequence values) in the
    // requested VAST response is allowed so we won't parse ads with sequence
    if (allowMultipleAds === false && adElement.getAttribute('sequence')) {
      return null;
    }

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

    var childNodes = adTypeElement.childNodes;
    var ad = createAd(parserUtils.parseAttributes(adTypeElement));

    for (var nodeKey in childNodes) {
      var node = childNodes[nodeKey];

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
          ad.creatives = parseCreatives(parserUtils.childrenByName(node, 'Creative'));
          break;

        case 'Extensions':
          {
            var extNodes = parserUtils.childrenByName(node, 'Extension');
            ad.extensions = parseExtensions(extNodes);
            /*
              OMID specify adVerifications should be in extensions for VAST < 4.0
              To avoid to put them on two different places in two different format we reparse it
              from extensions the same way than for an AdVerifications node.
            */

            if (!ad.adVerifications.length) {
              ad.adVerifications = _parseAdVerificationsFromExensions(extNodes);
            }

            break;
          }

        case 'AdVerifications':
          ad.adVerifications = _parseAdVerifications(parserUtils.childrenByName(node, 'Verification'));
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

        case 'AdServingId':
          ad.adServingId = parserUtils.parseNodeText(node);
          break;

        case 'Category':
          ad.categories.push({
            authority: node.getAttribute('authority') || null,
            value: parserUtils.parseNodeText(node)
          });
          break;

        case 'Expires':
          ad.expires = parseInt(parserUtils.parseNodeText(node), 10);
          break;

        case 'ViewableImpression':
          ad.viewableImpression = _parseViewableImpression(node);
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

        case 'BlockedAdCategories':
          ad.blockedAdCategories.push({
            authority: node.getAttribute('authority') || null,
            value: parserUtils.parseNodeText(node)
          });
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
    var ad = parseAdElement(wrapperElement, emit);
    var followAdditionalWrappersValue = wrapperElement.getAttribute('followAdditionalWrappers');
    var allowMultipleAdsValue = wrapperElement.getAttribute('allowMultipleAds');
    var fallbackOnNoAdValue = wrapperElement.getAttribute('fallbackOnNoAd');
    ad.followAdditionalWrappers = followAdditionalWrappersValue ? parserUtils.parseBoolean(followAdditionalWrappersValue) : true;
    ad.allowMultipleAds = allowMultipleAdsValue ? parserUtils.parseBoolean(allowMultipleAdsValue) : false;
    ad.fallbackOnNoAd = fallbackOnNoAdValue ? parserUtils.parseBoolean(fallbackOnNoAdValue) : null;
    var wrapperURLElement = parserUtils.childByName(wrapperElement, 'VASTAdTagURI');

    if (wrapperURLElement) {
      ad.nextWrapperURL = parserUtils.parseNodeText(wrapperURLElement);
    } else {
      wrapperURLElement = parserUtils.childByName(wrapperElement, 'VASTAdTagURL');

      if (wrapperURLElement) {
        ad.nextWrapperURL = parserUtils.parseNodeText(parserUtils.childByName(wrapperURLElement, 'URL'));
      }
    }

    ad.creatives.forEach(function (wrapperCreativeElement) {
      if (['linear', 'nonlinear'].indexOf(wrapperCreativeElement.type) !== -1) {
        // TrackingEvents Linear / NonLinear
        if (wrapperCreativeElement.trackingEvents) {
          if (!ad.trackingEvents) {
            ad.trackingEvents = {};
          }

          if (!ad.trackingEvents[wrapperCreativeElement.type]) {
            ad.trackingEvents[wrapperCreativeElement.type] = {};
          }

          var _loop = function _loop(eventName) {
            var urls = wrapperCreativeElement.trackingEvents[eventName];

            if (!Array.isArray(ad.trackingEvents[wrapperCreativeElement.type][eventName])) {
              ad.trackingEvents[wrapperCreativeElement.type][eventName] = [];
            }

            urls.forEach(function (url) {
              ad.trackingEvents[wrapperCreativeElement.type][eventName].push(url);
            });
          };

          for (var eventName in wrapperCreativeElement.trackingEvents) {
            _loop(eventName);
          }
        } // ClickTracking


        if (wrapperCreativeElement.videoClickTrackingURLTemplates) {
          if (!Array.isArray(ad.videoClickTrackingURLTemplates)) {
            ad.videoClickTrackingURLTemplates = [];
          } // tmp property to save wrapper tracking URLs until they are merged


          wrapperCreativeElement.videoClickTrackingURLTemplates.forEach(function (item) {
            ad.videoClickTrackingURLTemplates.push(item);
          });
        } // ClickThrough


        if (wrapperCreativeElement.videoClickThroughURLTemplate) {
          ad.videoClickThroughURLTemplate = wrapperCreativeElement.videoClickThroughURLTemplate;
        } // CustomClick


        if (wrapperCreativeElement.videoCustomClickURLTemplates) {
          if (!Array.isArray(ad.videoCustomClickURLTemplates)) {
            ad.videoCustomClickURLTemplates = [];
          } // tmp property to save wrapper tracking URLs until they are merged


          wrapperCreativeElement.videoCustomClickURLTemplates.forEach(function (item) {
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


  function _parseAdVerifications(verifications) {
    var ver = [];
    verifications.forEach(function (verificationNode) {
      var verification = createAdVerification();
      var childNodes = verificationNode.childNodes;
      parserUtils.assignAttributes(verificationNode.attributes, verification);

      for (var nodeKey in childNodes) {
        var node = childNodes[nodeKey];

        switch (node.nodeName) {
          case 'JavaScriptResource':
          case 'ExecutableResource':
            verification.resource = parserUtils.parseNodeText(node);
            parserUtils.assignAttributes(node.attributes, verification);
            break;

          case 'VerificationParameters':
            verification.parameters = parserUtils.parseNodeText(node);
            break;
        }
      }

      var trackingEventsElement = parserUtils.childByName(verificationNode, 'TrackingEvents');

      if (trackingEventsElement) {
        parserUtils.childrenByName(trackingEventsElement, 'Tracking').forEach(function (trackingElement) {
          var eventName = trackingElement.getAttribute('event');
          var trackingURLTemplate = parserUtils.parseNodeText(trackingElement);

          if (eventName && trackingURLTemplate) {
            if (!Array.isArray(verification.trackingEvents[eventName])) {
              verification.trackingEvents[eventName] = [];
            }

            verification.trackingEvents[eventName].push(trackingURLTemplate);
          }
        });
      }

      ver.push(verification);
    });
    return ver;
  }
  /**
   * Parses the AdVerifications Element from extension for versions < 4.0
   * @param  {Array<Node>} extensions - The array of extensions to parse.
   * @return {Array<Object>}
   */

  function _parseAdVerificationsFromExensions(extensions) {
    var adVerificationsNode = null,
        adVerifications = []; // Find the first (and only) AdVerifications node from extensions

    extensions.some(function (extension) {
      return adVerificationsNode = parserUtils.childByName(extension, 'AdVerifications');
    }); // Parse it if we get it

    if (adVerificationsNode) {
      adVerifications = _parseAdVerifications(parserUtils.childrenByName(adVerificationsNode, 'Verification'));
    }

    return adVerifications;
  }
  /**
   * Parses the ViewableImpression Element.
   * @param  {Object} viewableImpressionNode - The ViewableImpression node element.
   * @return {Object} viewableImpression - The viewableImpression object
   */

  function _parseViewableImpression(viewableImpressionNode) {
    var viewableImpression = {};
    viewableImpression.id = viewableImpressionNode.getAttribute('id') || null;
    var viewableImpressionChildNodes = viewableImpressionNode.childNodes;

    for (var viewableImpressionElementKey in viewableImpressionChildNodes) {
      var viewableImpressionElement = viewableImpressionChildNodes[viewableImpressionElementKey];
      var viewableImpressionNodeName = viewableImpressionElement.nodeName;
      var viewableImpressionNodeValue = parserUtils.parseNodeText(viewableImpressionElement);

      if (viewableImpressionNodeName !== 'Viewable' && viewableImpressionNodeName !== 'NotViewable' && viewableImpressionNodeName !== 'ViewUndetermined' || !viewableImpressionNodeValue) {
        continue;
      } else {
        var viewableImpressionNodeNameLower = viewableImpressionNodeName.toLowerCase();

        if (!Array.isArray(viewableImpression[viewableImpressionNodeNameLower])) {
          viewableImpression[viewableImpressionNodeNameLower] = [];
        }

        viewableImpression[viewableImpressionNodeNameLower].push(viewableImpressionNodeValue);
      }
    }

    return viewableImpression;
  }

  var EventEmitter = /*#__PURE__*/function () {
    function EventEmitter() {
      _classCallCheck(this, EventEmitter);

      this._handlers = [];
    }
    /**
     * Adds the event name and handler function to the end of the handlers array.
     * No checks are made to see if the handler has already been added.
     * Multiple calls passing the same combination of event name and handler will result in the handler being added,
     * and called, multiple times.
     * @param {String} event
     * @param {Function} handler
     * @returns {EventEmitter}
     */


    _createClass(EventEmitter, [{
      key: "on",
      value: function on(event, handler) {
        if (typeof handler !== 'function') {
          throw new TypeError("The handler argument must be of type Function. Received type ".concat(_typeof(handler)));
        }

        if (!event) {
          throw new TypeError("The event argument must be of type String. Received type ".concat(_typeof(event)));
        }

        this._handlers.push({
          event: event,
          handler: handler
        });

        return this;
      }
      /**
       * Adds a one-time handler function for the named event.
       * The next time event is triggered, this handler is removed and then invoked.
       * @param {String} event
       * @param {Function} handler
       * @returns {EventEmitter}
       */

    }, {
      key: "once",
      value: function once(event, handler) {
        return this.on(event, onceWrap(this, event, handler));
      }
      /**
       * Removes all instances for the specified handler from the handler array for the named event.
       * @param {String} event
       * @param {Function} handler
       * @returns {EventEmitter}
       */

    }, {
      key: "off",
      value: function off(event, handler) {
        this._handlers = this._handlers.filter(function (item) {
          return item.event !== event || item.handler !== handler;
        });
        return this;
      }
      /**
       * Synchronously calls each of the handlers registered for the named event,
       * in the order they were registered, passing the supplied arguments to each.
       * @param {String} event
       * @param  {any[]} args
       * @returns {Boolean} true if the event had handlers, false otherwise.
       */

    }, {
      key: "emit",
      value: function emit(event) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        var called = false;

        this._handlers.forEach(function (item) {
          if (item.event === '*') {
            called = true;
            item.handler.apply(item, [event].concat(args));
          }

          if (item.event === event) {
            called = true;
            item.handler.apply(item, args);
          }
        });

        return called;
      }
      /**
       * Removes all listeners, or those of the specified named event.
       * @param {String} event
       * @returns {EventEmitter}
       */

    }, {
      key: "removeAllListeners",
      value: function removeAllListeners(event) {
        if (!event) {
          this._handlers = [];
          return this;
        }

        this._handlers = this._handlers.filter(function (item) {
          return item.event !== event;
        });
        return this;
      }
      /**
       * Returns the number of listeners listening to the named event.
       * @param {String} event
       * @returns {Number}
       */

    }, {
      key: "listenerCount",
      value: function listenerCount(event) {
        return this._handlers.filter(function (item) {
          return item.event === event;
        }).length;
      }
      /**
       * Returns a copy of the array of listeners for the named event including those created by .once().
       * @param {String} event
       * @returns {Function[]}
       */

    }, {
      key: "listeners",
      value: function listeners(event) {
        return this._handlers.reduce(function (listeners, item) {
          if (item.event === event) {
            listeners.push(item.handler);
          }

          return listeners;
        }, []);
      }
      /**
       * Returns an array listing the events for which the emitter has registered handlers.
       * @returns {String[]}
       */

    }, {
      key: "eventNames",
      value: function eventNames() {
        return this._handlers.map(function (item) {
          return item.event;
        });
      }
    }]);

    return EventEmitter;
  }();

  function onceWrap(target, event, handler) {
    var state = {
      fired: false,
      wrapFn: undefined
    };

    function onceWrapper() {
      if (!state.fired) {
        target.off(event, state.wrapFn);
        state.fired = true;
        handler.bind(target).apply(void 0, arguments);
      }
    }

    state.wrapFn = onceWrapper;
    return onceWrapper;
  }

  // This mock module is loaded in stead of the original NodeURLHandler module
  // when bundling the library for environments which are not node.
  // This allows us to avoid bundling useless node components and have a smaller build.
  function get(url, options, cb) {
    cb(new Error('Please bundle the library for node to use the node urlHandler'));
  }

  var nodeURLHandler = {
    get: get
  };

  var DEFAULT_TIMEOUT = 120000;

  function xhr() {
    try {
      var request = new window.XMLHttpRequest();

      if ('withCredentials' in request) {
        // check CORS support
        return request;
      }

      return null;
    } catch (err) {
      return null;
    }
  }

  function supported() {
    return !!xhr();
  }

  function handleLoad(request, cb) {
    if (request.status === 200) {
      cb(null, request.responseXML, {
        byteLength: request.response.length,
        statusCode: request.status
      });
    } else {
      handleFail(request, cb, false);
    }
  }

  function handleFail(request, cb, isTimeout) {
    var statusCode = !isTimeout ? request.status : 408; // Request timeout

    var msg = isTimeout ? "XHRURLHandler: Request timed out after ".concat(request.timeout, " ms (").concat(statusCode, ")") : "XHRURLHandler: ".concat(request.statusText, " (").concat(statusCode, ")");
    cb(new Error(msg), null, {
      statusCode: statusCode
    });
  }

  function get$1(url, options, cb) {
    if (window.location.protocol === 'https:' && url.indexOf('http://') === 0) {
      return cb(new Error('XHRURLHandler: Cannot go from HTTPS to HTTP.'));
    }

    try {
      var request = xhr();
      request.open('GET', url);
      request.timeout = options.timeout || DEFAULT_TIMEOUT;
      request.withCredentials = options.withCredentials || false;
      request.overrideMimeType && request.overrideMimeType('text/xml');

      request.onload = function () {
        return handleLoad(request, cb);
      };

      request.onerror = function () {
        return handleFail(request, cb, false);
      };

      request.onabort = function () {
        return handleFail(request, cb, false);
      };

      request.ontimeout = function () {
        return handleFail(request, cb, true);
      };

      request.send();
    } catch (error) {
      cb(new Error('XHRURLHandler: Unexpected error'));
    }
  }

  var XHRURLHandler = {
    get: get$1,
    supported: supported
  };

  function get$2(url, options, cb) {
    // Allow skip of the options param
    if (!cb) {
      if (typeof options === 'function') {
        cb = options;
      }

      options = {};
    }

    if (typeof window === 'undefined' || window === null) {
      return nodeURLHandler.get(url, options, cb);
    } else if (XHRURLHandler.supported()) {
      return XHRURLHandler.get(url, options, cb);
    }

    return cb(new Error('Current context is not supported by any of the default URLHandlers. Please provide a custom URLHandler'));
  }

  var urlHandler = {
    get: get$2
  };

  function createVASTResponse(_ref) {
    var ads = _ref.ads,
        errorURLTemplates = _ref.errorURLTemplates,
        version = _ref.version;
    return {
      ads: ads || [],
      errorURLTemplates: errorURLTemplates || [],
      version: version || null
    };
  }

  var DEFAULT_MAX_WRAPPER_DEPTH = 10;
  var DEFAULT_EVENT_DATA = {
    ERRORCODE: 900,
    extensions: []
  };
  /**
   * This class provides methods to fetch and parse a VAST document.
   * @export
   * @class VASTParser
   * @extends EventEmitter
   */

  var VASTParser = /*#__PURE__*/function (_EventEmitter) {
    _inherits(VASTParser, _EventEmitter);

    var _super = _createSuper(VASTParser);

    /**
     * Creates an instance of VASTParser.
     * @constructor
     */
    function VASTParser() {
      var _this;

      _classCallCheck(this, VASTParser);

      _this = _super.call(this);
      _this.remainingAds = [];
      _this.parentURLs = [];
      _this.errorURLTemplates = [];
      _this.rootErrorURLTemplates = [];
      _this.maxWrapperDepth = null;
      _this.URLTemplateFilters = [];
      _this.fetchingOptions = {};
      _this.parsingOptions = {};
      return _this;
    }
    /**
     * Adds a filter function to the array of filters which are called before fetching a VAST document.
     * @param  {function} filter - The filter function to be added at the end of the array.
     * @return {void}
     */


    _createClass(VASTParser, [{
      key: "addURLTemplateFilter",
      value: function addURLTemplateFilter(filter) {
        if (typeof filter === 'function') {
          this.URLTemplateFilters.push(filter);
        }
      }
      /**
       * Removes the last element of the url templates filters array.
       * @return {void}
       */

    }, {
      key: "removeURLTemplateFilter",
      value: function removeURLTemplateFilter() {
        this.URLTemplateFilters.pop();
      }
      /**
       * Returns the number of filters of the url templates filters array.
       * @return {Number}
       */

    }, {
      key: "countURLTemplateFilters",
      value: function countURLTemplateFilters() {
        return this.URLTemplateFilters.length;
      }
      /**
       * Removes all the filter functions from the url templates filters array.
       * @return {void}
       */

    }, {
      key: "clearURLTemplateFilters",
      value: function clearURLTemplateFilters() {
        this.URLTemplateFilters = [];
      }
      /**
       * Tracks the error provided in the errorCode parameter and emits a VAST-error event for the given error.
       * @param  {Array} urlTemplates - An Array of url templates to use to make the tracking call.
       * @param  {Object} errorCode - An Object containing the error data.
       * @param  {Object} data - One (or more) Object containing additional data.
       * @emits  VASTParser#VAST-error
       * @return {void}
       */

    }, {
      key: "trackVastError",
      value: function trackVastError(urlTemplates, errorCode) {
        for (var _len = arguments.length, data = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          data[_key - 2] = arguments[_key];
        }

        this.emit('VAST-error', Object.assign.apply(Object, [{}, DEFAULT_EVENT_DATA, errorCode].concat(data)));
        util.track(urlTemplates, errorCode);
      }
      /**
       * Returns an array of errorURLTemplates for the VAST being parsed.
       * @return {Array}
       */

    }, {
      key: "getErrorURLTemplates",
      value: function getErrorURLTemplates() {
        return this.rootErrorURLTemplates.concat(this.errorURLTemplates);
      }
      /**
       * Fetches a VAST document for the given url.
       * Returns a Promise which resolves,rejects according to the result of the request.
       * @param  {String} url - The url to request the VAST document.
       * @param {Number} wrapperDepth - how many times the current url has been wrapped
       * @param {String} previousUrl - url of the previous VAST
       * @emits  VASTParser#VAST-resolving
       * @emits  VASTParser#VAST-resolved
       * @return {Promise}
       */

    }, {
      key: "fetchVAST",
      value: function fetchVAST(url) {
        var _this2 = this;

        var wrapperDepth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var previousUrl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        return new Promise(function (resolve, reject) {
          // Process url with defined filter
          _this2.URLTemplateFilters.forEach(function (filter) {
            url = filter(url);
          });

          _this2.parentURLs.push(url);

          var timeBeforeGet = Date.now();

          _this2.emit('VAST-resolving', {
            url: url,
            previousUrl: previousUrl,
            wrapperDepth: wrapperDepth,
            maxWrapperDepth: _this2.maxWrapperDepth,
            timeout: _this2.fetchingOptions.timeout
          });

          _this2.urlHandler.get(url, _this2.fetchingOptions, function (error, xml) {
            var details = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var deltaTime = Math.round(Date.now() - timeBeforeGet);
            var info = Object.assign({
              url: url,
              previousUrl: previousUrl,
              wrapperDepth: wrapperDepth,
              error: error,
              duration: deltaTime
            }, details);

            _this2.emit('VAST-resolved', info);

            if (error) {
              reject(error);
            } else {
              resolve(xml);
            }
          });
        });
      }
      /**
       * Inits the parsing properties of the class with the custom values provided as options.
       * @param {Object} options - The options to initialize a parsing sequence
       */

    }, {
      key: "initParsingStatus",
      value: function initParsingStatus() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.errorURLTemplates = [];
        this.fetchingOptions = {
          timeout: options.timeout || DEFAULT_TIMEOUT,
          withCredentials: options.withCredentials
        };
        this.maxWrapperDepth = options.wrapperLimit || DEFAULT_MAX_WRAPPER_DEPTH;
        this.parentURLs = [];
        this.parsingOptions = {
          allowMultipleAds: options.allowMultipleAds
        };
        this.remainingAds = [];
        this.rootErrorURLTemplates = [];
        this.rootURL = '';
        this.urlHandler = options.urlHandler || options.urlhandler || urlHandler;
        this.vastVersion = null;
      }
      /**
       * Resolves the next group of ads. If all is true resolves all the remaining ads.
       * @param  {Boolean} all - If true all the remaining ads are resolved
       * @return {Promise}
       */

    }, {
      key: "getRemainingAds",
      value: function getRemainingAds(all) {
        var _this3 = this;

        if (this.remainingAds.length === 0) {
          return Promise.reject(new Error('No more ads are available for the given VAST'));
        }

        var ads = all ? util.flatten(this.remainingAds) : this.remainingAds.shift();
        this.errorURLTemplates = [];
        this.parentURLs = [];
        return this.resolveAds(ads, {
          wrapperDepth: 0,
          url: this.rootURL
        }).then(function (resolvedAds) {
          return _this3.buildVASTResponse(resolvedAds);
        });
      }
      /**
       * Fetches and parses a VAST for the given url.
       * Returns a Promise which resolves with a fully parsed VASTResponse or rejects with an Error.
       * @param  {String} url - The url to request the VAST document.
       * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
       * @emits  VASTParser#VAST-resolving
       * @emits  VASTParser#VAST-resolved
       * @emits  VASTParser#VAST-warning
       * @return {Promise}
       */

    }, {
      key: "getAndParseVAST",
      value: function getAndParseVAST(url) {
        var _this4 = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        this.initParsingStatus(options);
        this.URLTemplateFilters.forEach(function (filter) {
          url = filter(url);
        });
        this.rootURL = url;
        return this.fetchVAST(url).then(function (xml) {
          options.previousUrl = url;
          options.isRootVAST = true;
          options.url = url;
          return _this4.parse(xml, options).then(function (ads) {
            return _this4.buildVASTResponse(ads);
          });
        });
      }
      /**
       * Parses the given xml Object into a VASTResponse.
       * Returns a Promise which resolves with a fully parsed VASTResponse or rejects with an Error.
       * @param  {Object} vastXml - An object representing a vast xml document.
       * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
       * @emits  VASTParser#VAST-resolving
       * @emits  VASTParser#VAST-resolved
       * @emits  VASTParser#VAST-warning
       * @return {Promise}
       */

    }, {
      key: "parseVAST",
      value: function parseVAST(vastXml) {
        var _this5 = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        this.initParsingStatus(options);
        options.isRootVAST = true;
        return this.parse(vastXml, options).then(function (ads) {
          return _this5.buildVASTResponse(ads);
        });
      }
      /**
       * Builds a VASTResponse which can be returned.
       * @param  {Array} ads - An Array of unwrapped ads
       * @return {Object}
       */

    }, {
      key: "buildVASTResponse",
      value: function buildVASTResponse(ads) {
        var response = createVASTResponse({
          ads: ads,
          errorURLTemplates: this.getErrorURLTemplates(),
          version: this.vastVersion
        });
        this.completeWrapperResolving(response);
        return response;
      }
      /**
       * Parses the given xml Object into an array of ads
       * Returns the array or throws an `Error` if an invalid VAST XML is provided
       * @param  {Object} vastXml - An object representing an xml document.
       * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
       * @emits  VASTParser#VAST-warning
       * @emits VASTParser#VAST-ad-parsed
       * @return {Array}
       * @throws {Error} `vastXml` must be a valid VAST XMLDocument
       */

    }, {
      key: "parseVastXml",
      value: function parseVastXml(vastXml, _ref) {
        var _ref$isRootVAST = _ref.isRootVAST,
            isRootVAST = _ref$isRootVAST === void 0 ? false : _ref$isRootVAST,
            _ref$url = _ref.url,
            url = _ref$url === void 0 ? null : _ref$url,
            _ref$wrapperDepth = _ref.wrapperDepth,
            wrapperDepth = _ref$wrapperDepth === void 0 ? 0 : _ref$wrapperDepth,
            allowMultipleAds = _ref.allowMultipleAds,
            followAdditionalWrappers = _ref.followAdditionalWrappers;

        // check if is a valid VAST document
        if (!vastXml || !vastXml.documentElement || vastXml.documentElement.nodeName !== 'VAST') {
          this.emit('VAST-ad-parsed', {
            type: 'ERROR',
            url: url,
            wrapperDepth: wrapperDepth
          });
          throw new Error('Invalid VAST XMLDocument');
        }

        var ads = [];
        var childNodes = vastXml.documentElement.childNodes;
        /* Only parse the version of the Root VAST for now because we don't know yet how to
         * handle some cases like multiple wrappers in the same vast
         */

        var vastVersion = vastXml.documentElement.getAttribute('version');

        if (isRootVAST) {
          if (vastVersion) this.vastVersion = vastVersion;
        } // Fill the VASTResponse object with ads and errorURLTemplates


        for (var nodeKey in childNodes) {
          var node = childNodes[nodeKey];

          if (node.nodeName === 'Error') {
            var errorURLTemplate = parserUtils.parseNodeText(node); // Distinguish root VAST url templates from ad specific ones

            isRootVAST ? this.rootErrorURLTemplates.push(errorURLTemplate) : this.errorURLTemplates.push(errorURLTemplate);
          } else if (node.nodeName === 'Ad') {
            // allowMultipleAds was introduced in VAST 3
            // for retrocompatibility set it to true
            if (this.vastVersion && parseFloat(this.vastVersion) < 3) {
              allowMultipleAds = true;
            } else if (allowMultipleAds === false && ads.length > 1) {
              // if wrapper allowMultipleAds is set to false only the first stand-alone Ad
              // (with no sequence values) in the requested VAST response is allowed
              break;
            }

            var result = parseAd(node, this.emit.bind(this), {
              allowMultipleAds: allowMultipleAds,
              followAdditionalWrappers: followAdditionalWrappers
            });

            if (result.ad) {
              ads.push(result.ad);
              this.emit('VAST-ad-parsed', {
                type: result.type,
                url: url,
                wrapperDepth: wrapperDepth,
                adIndex: ads.length - 1,
                vastVersion: vastVersion
              });
            } else {
              // VAST version of response not supported.
              this.trackVastError(this.getErrorURLTemplates(), {
                ERRORCODE: 101
              });
            }
          }
        }

        return ads;
      }
      /**
       * Parses the given xml Object into an array of unwrapped ads.
       * Returns a Promise which resolves with the array or rejects with an error according to the result of the parsing.
       * @param {Object} vastXml - An object representing an xml document.
       * @param {Object} options - An optional Object of parameters to be used in the parsing process.
       * @emits VASTParser#VAST-resolving
       * @emits VASTParser#VAST-resolved
       * @emits VASTParser#VAST-warning
       * @return {Promise}
       */

    }, {
      key: "parse",
      value: function parse(vastXml) {
        var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            _ref2$url = _ref2.url,
            url = _ref2$url === void 0 ? null : _ref2$url,
            _ref2$resolveAll = _ref2.resolveAll,
            resolveAll = _ref2$resolveAll === void 0 ? true : _ref2$resolveAll,
            _ref2$wrapperSequence = _ref2.wrapperSequence,
            wrapperSequence = _ref2$wrapperSequence === void 0 ? null : _ref2$wrapperSequence,
            _ref2$previousUrl = _ref2.previousUrl,
            previousUrl = _ref2$previousUrl === void 0 ? null : _ref2$previousUrl,
            _ref2$wrapperDepth = _ref2.wrapperDepth,
            wrapperDepth = _ref2$wrapperDepth === void 0 ? 0 : _ref2$wrapperDepth,
            _ref2$isRootVAST = _ref2.isRootVAST,
            isRootVAST = _ref2$isRootVAST === void 0 ? false : _ref2$isRootVAST,
            followAdditionalWrappers = _ref2.followAdditionalWrappers,
            allowMultipleAds = _ref2.allowMultipleAds;

        var ads = []; // allowMultipleAds was introduced in VAST 3 as wrapper attribute
        // for retrocompatibility set it to true for vast pre-version 3

        if (this.vastVersion && parseFloat(this.vastVersion) < 3 && isRootVAST) {
          allowMultipleAds = true;
        }

        try {
          ads = this.parseVastXml(vastXml, {
            isRootVAST: isRootVAST,
            url: url,
            wrapperDepth: wrapperDepth,
            allowMultipleAds: allowMultipleAds,
            followAdditionalWrappers: followAdditionalWrappers
          });
        } catch (e) {
          return Promise.reject(e);
        }
        /* Keep wrapper sequence value to not break AdPod when wrapper contain only one Ad.
        e.g,for a AdPod containing :
        - Inline with sequence=1
        - Inline with sequence=2
        - Wrapper with sequence=3 wrapping a Inline with sequence=1
        once parsed we will obtain :
        - Inline sequence 1,
        - Inline sequence 2,
        - Inline sequence 3
        */


        if (ads.length === 1 && wrapperSequence !== undefined && wrapperSequence !== null) {
          ads[0].sequence = wrapperSequence;
        } // Split the VAST in case we don't want to resolve everything at the first time


        if (resolveAll === false) {
          this.remainingAds = parserUtils.splitVAST(ads); // Remove the first element from the remaining ads array, since we're going to resolve that element

          ads = this.remainingAds.shift();
        }

        return this.resolveAds(ads, {
          wrapperDepth: wrapperDepth,
          previousUrl: previousUrl,
          url: url
        });
      }
      /**
       * Resolves an Array of ads, recursively calling itself with the remaining ads if a no ad
       * response is returned for the given array.
       * @param {Array} ads - An array of ads to resolve
       * @param {Object} options - An options Object containing resolving parameters
       * @return {Promise}
       */

    }, {
      key: "resolveAds",
      value: function resolveAds() {
        var _this6 = this;

        var ads = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        var _ref3 = arguments.length > 1 ? arguments[1] : undefined,
            wrapperDepth = _ref3.wrapperDepth,
            previousUrl = _ref3.previousUrl,
            url = _ref3.url;

        var resolveWrappersPromises = [];
        previousUrl = url;
        ads.forEach(function (ad) {
          var resolveWrappersPromise = _this6.resolveWrappers(ad, wrapperDepth, previousUrl);

          resolveWrappersPromises.push(resolveWrappersPromise);
        });
        return Promise.all(resolveWrappersPromises).then(function (unwrappedAds) {
          var resolvedAds = util.flatten(unwrappedAds);

          if (!resolvedAds && _this6.remainingAds.length > 0) {
            var remainingAdsToResolve = _this6.remainingAds.shift();

            return _this6.resolveAds(remainingAdsToResolve, {
              wrapperDepth: wrapperDepth,
              previousUrl: previousUrl,
              url: url
            });
          }

          return resolvedAds;
        });
      }
      /**
       * Resolves the wrappers for the given ad in a recursive way.
       * Returns a Promise which resolves with the unwrapped ad or rejects with an error.
       * @param {Object} ad - An ad object to be unwrapped.
       * @param {Number} wrapperDepth - The reached depth in the wrapper resolving chain.
       * @param {String} previousUrl - The previous vast url.
       * @return {Promise}
       */

    }, {
      key: "resolveWrappers",
      value: function resolveWrappers(ad, wrapperDepth, previousUrl) {
        var _this7 = this;

        return new Promise(function (resolve) {
          var _this7$parsingOptions;

          // Going one level deeper in the wrapper chain
          wrapperDepth++; // We already have a resolved VAST ad, no need to resolve wrapper

          if (!ad.nextWrapperURL) {
            delete ad.nextWrapperURL;
            return resolve(ad);
          }

          if (wrapperDepth >= _this7.maxWrapperDepth || _this7.parentURLs.indexOf(ad.nextWrapperURL) !== -1) {
            // Wrapper limit reached, as defined by the video player.
            // Too many Wrapper responses have been received with no InLine response.
            ad.errorCode = 302;
            delete ad.nextWrapperURL;
            return resolve(ad);
          } // Get full URL


          ad.nextWrapperURL = parserUtils.resolveVastAdTagURI(ad.nextWrapperURL, previousUrl);

          _this7.URLTemplateFilters.forEach(function (filter) {
            ad.nextWrapperURL = filter(ad.nextWrapperURL);
          }); // If allowMultipleAds is set inside the parameter 'option' of public method
          // override the vast value by the one provided


          var allowMultipleAds = (_this7$parsingOptions = _this7.parsingOptions.allowMultipleAds) !== null && _this7$parsingOptions !== void 0 ? _this7$parsingOptions : ad.allowMultipleAds; // sequence doesn't carry over in wrapper element

          var wrapperSequence = ad.sequence;

          _this7.fetchVAST(ad.nextWrapperURL, wrapperDepth, previousUrl).then(function (xml) {
            return _this7.parse(xml, {
              url: ad.nextWrapperURL,
              previousUrl: previousUrl,
              wrapperSequence: wrapperSequence,
              wrapperDepth: wrapperDepth,
              followAdditionalWrappers: ad.followAdditionalWrappers,
              allowMultipleAds: allowMultipleAds
            }).then(function (unwrappedAds) {
              delete ad.nextWrapperURL;

              if (unwrappedAds.length === 0) {
                // No ads returned by the wrappedResponse, discard current <Ad><Wrapper> creatives
                ad.creatives = [];
                return resolve(ad);
              }

              unwrappedAds.forEach(function (unwrappedAd) {
                if (unwrappedAd) {
                  parserUtils.mergeWrapperAdData(unwrappedAd, ad);
                }
              });
              resolve(unwrappedAds);
            });
          })["catch"](function (err) {
            // Timeout of VAST URI provided in Wrapper element, or of VAST URI provided in a subsequent Wrapper element.
            // (URI was either unavailable or reached a timeout as defined by the video player.)
            ad.errorCode = 301;
            ad.errorMessage = err.message;
            resolve(ad);
          });
        });
      }
      /**
       * Takes care of handling errors when the wrappers are resolved.
       * @param {Object} vastResponse - A resolved VASTResponse.
       */

    }, {
      key: "completeWrapperResolving",
      value: function completeWrapperResolving(vastResponse) {
        // We've to wait for all <Ad> elements to be parsed before handling error so we can:
        // - Send computed extensions data
        // - Ping all <Error> URIs defined across VAST files
        // No Ad case - The parser never bump into an <Ad> element
        if (vastResponse.ads.length === 0) {
          this.trackVastError(vastResponse.errorURLTemplates, {
            ERRORCODE: 303
          });
        } else {
          for (var index = vastResponse.ads.length - 1; index >= 0; index--) {
            // - Error encountred while parsing
            // - No Creative case - The parser has dealt with soma <Ad><Wrapper> or/and an <Ad><Inline> elements
            // but no creative was found
            var ad = vastResponse.ads[index];

            if (ad.errorCode || ad.creatives.length === 0) {
              this.trackVastError(ad.errorURLTemplates.concat(vastResponse.errorURLTemplates), {
                ERRORCODE: ad.errorCode || 303
              }, {
                ERRORMESSAGE: ad.errorMessage || ''
              }, {
                extensions: ad.extensions
              }, {
                system: ad.system
              });
              vastResponse.ads.splice(index, 1);
            }
          }
        }
      }
    }]);

    return VASTParser;
  }(EventEmitter);

  var storage = null;
  /**
   * This Object represents a default storage to be used in case no other storage is available.
   * @constant
   * @type {Object}
   */

  var DEFAULT_STORAGE = {
    data: {},
    length: 0,
    getItem: function getItem(key) {
      return this.data[key];
    },
    setItem: function setItem(key, value) {
      this.data[key] = value;
      this.length = Object.keys(this.data).length;
    },
    removeItem: function removeItem(key) {
      delete this.data[key];
      this.length = Object.keys(this.data).length;
    },
    clear: function clear() {
      this.data = {};
      this.length = 0;
    }
  };
  /**
   * This class provides an wrapper interface to the a key-value storage.
   * It uses localStorage, sessionStorage or a custom storage if none of the two is available.
   * @export
   * @class Storage
   */

  var Storage = /*#__PURE__*/function () {
    /**
     * Creates an instance of Storage.
     * @constructor
     */
    function Storage() {
      _classCallCheck(this, Storage);

      this.storage = this.initStorage();
    }
    /**
     * Provides a singleton instance of the wrapped storage.
     * @return {Object}
     */


    _createClass(Storage, [{
      key: "initStorage",
      value: function initStorage() {
        if (storage) {
          return storage;
        }

        try {
          storage = typeof window !== 'undefined' && window !== null ? window.localStorage || window.sessionStorage : null;
        } catch (storageError) {
          storage = null;
        }

        if (!storage || this.isStorageDisabled(storage)) {
          storage = DEFAULT_STORAGE;
          storage.clear();
        }

        return storage;
      }
      /**
       * Check if storage is disabled (like in certain cases with private browsing).
       * In Safari (Mac + iOS) when private browsing is ON, localStorage is read only
       * http://spin.atomicobject.com/2013/01/23/ios-private-browsing-localstorage/
       * @param {Object} testStorage - The storage to check.
       * @return {Boolean}
       */

    }, {
      key: "isStorageDisabled",
      value: function isStorageDisabled(testStorage) {
        var testValue = '__VASTStorage__';

        try {
          testStorage.setItem(testValue, testValue);

          if (testStorage.getItem(testValue) !== testValue) {
            testStorage.removeItem(testValue);
            return true;
          }
        } catch (e) {
          return true;
        }

        testStorage.removeItem(testValue);
        return false;
      }
      /**
       * Returns the value for the given key. If the key does not exist, null is returned.
       * @param  {String} key - The key to retrieve the value.
       * @return {any}
       */

    }, {
      key: "getItem",
      value: function getItem(key) {
        return this.storage.getItem(key);
      }
      /**
       * Adds or updates the value for the given key.
       * @param  {String} key - The key to modify the value.
       * @param  {any} value - The value to be associated with the key.
       * @return {any}
       */

    }, {
      key: "setItem",
      value: function setItem(key, value) {
        return this.storage.setItem(key, value);
      }
      /**
       * Removes an item for the given key.
       * @param  {String} key - The key to remove the value.
       * @return {any}
       */

    }, {
      key: "removeItem",
      value: function removeItem(key) {
        return this.storage.removeItem(key);
      }
      /**
       * Removes all the items from the storage.
       */

    }, {
      key: "clear",
      value: function clear() {
        return this.storage.clear();
      }
    }]);

    return Storage;
  }();

  /**
   * This class provides methods to fetch and parse a VAST document using VASTParser.
   * In addition it provides options to skip consecutive calls based on constraints.
   * @export
   * @class VASTClient
   */

  var VASTClient = /*#__PURE__*/function () {
    /**
     * Creates an instance of VASTClient.
     * @param  {Number} cappingFreeLunch - The number of first calls to skip.
     * @param  {Number} cappingMinimumTimeInterval - The minimum time interval between two consecutive calls.
     * @param  {Storage} customStorage - A custom storage to use instead of the default one.
     * @constructor
     */
    function VASTClient(cappingFreeLunch, cappingMinimumTimeInterval, customStorage) {
      _classCallCheck(this, VASTClient);

      this.cappingFreeLunch = cappingFreeLunch || 0;
      this.cappingMinimumTimeInterval = cappingMinimumTimeInterval || 0;
      this.defaultOptions = {
        withCredentials: false,
        timeout: 0
      };
      this.vastParser = new VASTParser();
      this.storage = customStorage || new Storage(); // Init values if not already set

      if (this.lastSuccessfulAd === undefined) {
        this.lastSuccessfulAd = 0;
      }

      if (this.totalCalls === undefined) {
        this.totalCalls = 0;
      }

      if (this.totalCallsTimeout === undefined) {
        this.totalCallsTimeout = 0;
      }
    }

    _createClass(VASTClient, [{
      key: "getParser",
      value: function getParser() {
        return this.vastParser;
      }
    }, {
      key: "hasRemainingAds",

      /**
       * Returns a boolean indicating if there are more ads to resolve for the current parsing.
       * @return {Boolean}
       */
      value: function hasRemainingAds() {
        return this.vastParser.remainingAds.length > 0;
      }
      /**
       * Resolves the next group of ads. If all is true resolves all the remaining ads.
       * @param  {Boolean} all - If true all the remaining ads are resolved
       * @return {Promise}
       */

    }, {
      key: "getNextAds",
      value: function getNextAds(all) {
        return this.vastParser.getRemainingAds(all);
      }
      /**
       * Gets a parsed VAST document for the given url, applying the skipping rules defined.
       * Returns a Promise which resolves with a fully parsed VASTResponse or rejects with an Error.
       * @param  {String} url - The url to use to fecth the VAST document.
       * @param  {Object} options - An optional Object of parameters to be applied in the process.
       * @return {Promise}
       */

    }, {
      key: "get",
      value: function get(url) {
        var _this = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var now = Date.now();
        options = Object.assign({}, this.defaultOptions, options); // By default the client resolves only the first Ad or AdPod

        if (!options.hasOwnProperty('resolveAll')) {
          options.resolveAll = false;
        } // Check totalCallsTimeout (first call + 1 hour), if older than now,
        // reset totalCalls number, by this way the client will be eligible again
        // for freelunch capping


        if (this.totalCallsTimeout < now) {
          this.totalCalls = 1;
          this.totalCallsTimeout = now + 60 * 60 * 1000;
        } else {
          this.totalCalls++;
        }

        return new Promise(function (resolve, reject) {
          if (_this.cappingFreeLunch >= _this.totalCalls) {
            return reject(new Error("VAST call canceled \u2013 FreeLunch capping not reached yet ".concat(_this.totalCalls, "/").concat(_this.cappingFreeLunch)));
          }

          var timeSinceLastCall = now - _this.lastSuccessfulAd; // Check timeSinceLastCall to be a positive number. If not, this mean the
          // previous was made in the future. We reset lastSuccessfulAd value

          if (timeSinceLastCall < 0) {
            _this.lastSuccessfulAd = 0;
          } else if (timeSinceLastCall < _this.cappingMinimumTimeInterval) {
            return reject(new Error("VAST call canceled \u2013 (".concat(_this.cappingMinimumTimeInterval, ")ms minimum interval reached")));
          }

          _this.vastParser.getAndParseVAST(url, options).then(function (response) {
            return resolve(response);
          })["catch"](function (err) {
            return reject(err);
          });
        });
      }
    }, {
      key: "lastSuccessfulAd",
      get: function get() {
        return this.storage.getItem('vast-client-last-successful-ad');
      },
      set: function set(value) {
        this.storage.setItem('vast-client-last-successful-ad', value);
      }
    }, {
      key: "totalCalls",
      get: function get() {
        return this.storage.getItem('vast-client-total-calls');
      },
      set: function set(value) {
        this.storage.setItem('vast-client-total-calls', value);
      }
    }, {
      key: "totalCallsTimeout",
      get: function get() {
        return this.storage.getItem('vast-client-total-calls-timeout');
      },
      set: function set(value) {
        this.storage.setItem('vast-client-total-calls-timeout', value);
      }
    }]);

    return VASTClient;
  }();

  /**
   * The default skip delay used in case a custom one is not provided
   * @constant
   * @type {Number}
   */

  var DEFAULT_SKIP_DELAY = -1;
  /**
   * This class provides methods to track an ad execution.
   *
   * @export
   * @class VASTTracker
   * @extends EventEmitter
   */

  var VASTTracker = /*#__PURE__*/function (_EventEmitter) {
    _inherits(VASTTracker, _EventEmitter);

    var _super = _createSuper(VASTTracker);

    /**
     * Creates an instance of VASTTracker.
     *
     * @param {VASTClient} client - An instance of VASTClient that can be updated by the tracker. [optional]
     * @param {Ad} ad - The ad to track.
     * @param {Creative} creative - The creative to track.
     * @param {Object} [variation=null] - An optional variation of the creative.
     * @constructor
     */
    function VASTTracker(client, ad, creative) {
      var _this;

      var variation = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      _classCallCheck(this, VASTTracker);

      _this = _super.call(this);
      _this.ad = ad;
      _this.creative = creative;
      _this.variation = variation;
      _this.muted = false;
      _this.impressed = false;
      _this.skippable = false;
      _this.trackingEvents = {}; // We need to keep the last percentage of the tracker in order to
      // calculate to trigger the events when the VAST duration is short

      _this.lastPercentage = 0;
      _this._alreadyTriggeredQuartiles = {}; // Tracker listeners should be notified with some events
      // no matter if there is a tracking URL or not

      _this.emitAlwaysEvents = ['creativeView', 'start', 'firstQuartile', 'midpoint', 'thirdQuartile', 'complete', 'resume', 'pause', 'rewind', 'skip', 'closeLinear', 'close']; // Duplicate the creative's trackingEvents property so we can alter it

      for (var eventName in _this.creative.trackingEvents) {
        var events = _this.creative.trackingEvents[eventName];
        _this.trackingEvents[eventName] = events.slice(0);
      } // Nonlinear and companion creatives provide some tracking information at a variation level
      // While linear creatives provided that at a creative level. That's why we need to
      // differentiate how we retrieve some tracking information.


      if (isCreativeLinear(_this.creative)) {
        _this._initLinearTracking();
      } else {
        _this._initVariationTracking();
      } // If the tracker is associated with a client we add a listener to the start event
      // to update the lastSuccessfulAd property.


      if (client) {
        _this.on('start', function () {
          client.lastSuccessfulAd = Date.now();
        });
      }

      return _this;
    }
    /**
     * Init the custom tracking options for linear creatives.
     *
     * @return {void}
     */


    _createClass(VASTTracker, [{
      key: "_initLinearTracking",
      value: function _initLinearTracking() {
        this.linear = true;
        this.skipDelay = this.creative.skipDelay;
        this.setDuration(this.creative.duration);
        this.clickThroughURLTemplate = this.creative.videoClickThroughURLTemplate;
        this.clickTrackingURLTemplates = this.creative.videoClickTrackingURLTemplates;
      }
      /**
       * Init the custom tracking options for nonlinear and companion creatives.
       * These options are provided in the variation Object.
       *
       * @return {void}
       */

    }, {
      key: "_initVariationTracking",
      value: function _initVariationTracking() {
        this.linear = false;
        this.skipDelay = DEFAULT_SKIP_DELAY; // If no variation has been provided there's nothing else to set

        if (!this.variation) {
          return;
        } // Duplicate the variation's trackingEvents property so we can alter it


        for (var eventName in this.variation.trackingEvents) {
          var events = this.variation.trackingEvents[eventName]; // If for the given eventName we already had some trackingEvents provided by the creative
          // we want to keep both the creative trackingEvents and the variation ones

          if (this.trackingEvents[eventName]) {
            this.trackingEvents[eventName] = this.trackingEvents[eventName].concat(events.slice(0));
          } else {
            this.trackingEvents[eventName] = events.slice(0);
          }
        }

        if (isNonLinearAd(this.variation)) {
          this.clickThroughURLTemplate = this.variation.nonlinearClickThroughURLTemplate;
          this.clickTrackingURLTemplates = this.variation.nonlinearClickTrackingURLTemplates;
          this.setDuration(this.variation.minSuggestedDuration);
        } else if (isCompanionAd(this.variation)) {
          this.clickThroughURLTemplate = this.variation.companionClickThroughURLTemplate;
          this.clickTrackingURLTemplates = this.variation.companionClickTrackingURLTemplates;
        }
      }
      /**
       * Sets the duration of the ad and updates the quartiles based on that.
       *
       * @param  {Number} duration - The duration of the ad.
       */

    }, {
      key: "setDuration",
      value: function setDuration(duration) {
        this.assetDuration = duration; // beware of key names, theses are also used as event names

        this.quartiles = {
          firstQuartile: Math.round(25 * this.assetDuration) / 100,
          midpoint: Math.round(50 * this.assetDuration) / 100,
          thirdQuartile: Math.round(75 * this.assetDuration) / 100
        };
      }
      /**
       * Sets the duration of the ad and updates the quartiles based on that.
       * This is required for tracking time related events.
       *
       * @param {Number} progress - Current playback time in seconds.
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       * @emits VASTTracker#start
       * @emits VASTTracker#skip-countdown
       * @emits VASTTracker#progress-[0-100]%
       * @emits VASTTracker#progress-[currentTime]
       * @emits VASTTracker#rewind
       * @emits VASTTracker#firstQuartile
       * @emits VASTTracker#midpoint
       * @emits VASTTracker#thirdQuartile
       */

    }, {
      key: "setProgress",
      value: function setProgress(progress) {
        var _this2 = this;

        var macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var skipDelay = this.skipDelay || DEFAULT_SKIP_DELAY;

        if (skipDelay !== -1 && !this.skippable) {
          if (skipDelay > progress) {
            this.emit('skip-countdown', skipDelay - progress);
          } else {
            this.skippable = true;
            this.emit('skip-countdown', 0);
          }
        }

        if (this.assetDuration > 0) {
          var percent = Math.round(progress / this.assetDuration * 100);
          var events = [];

          if (progress > 0) {
            events.push('start');

            for (var i = this.lastPercentage; i < percent; i++) {
              events.push("progress-".concat(i + 1, "%"));
            }

            events.push("progress-".concat(Math.round(progress)));

            for (var quartile in this.quartiles) {
              if (this.isQuartileReached(quartile, this.quartiles[quartile], progress)) {
                events.push(quartile);
                this._alreadyTriggeredQuartiles[quartile] = true;
              }
            }

            this.lastPercentage = percent;
          }

          events.forEach(function (eventName) {
            _this2.track(eventName, {
              macros: macros,
              once: true
            });
          });

          if (progress < this.progress) {
            this.track('rewind', {
              macros: macros
            });
          }
        }

        this.progress = progress;
      }
      /**
       * Checks if a quartile has been reached without have being triggered already.
       *
       * @param {String} quartile - Quartile name
       * @param {Number} time - Time offset, when this quartile is reached in seconds.
       * @param {Number} progress - Current progress of the ads in seconds.
       *
       * @return {Boolean}
       */

    }, {
      key: "isQuartileReached",
      value: function isQuartileReached(quartile, time, progress) {
        var quartileReached = false; // if quartile time already reached and never triggered

        if (time <= progress && !this._alreadyTriggeredQuartiles[quartile]) {
          quartileReached = true;
        }

        return quartileReached;
      }
      /**
       * Updates the mute state and calls the mute/unmute tracking URLs.
       *
       * @param {Boolean} muted - Indicates if the video is muted or not.
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       * @emits VASTTracker#mute
       * @emits VASTTracker#unmute
       */

    }, {
      key: "setMuted",
      value: function setMuted(muted) {
        var macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (this.muted !== muted) {
          this.track(muted ? 'mute' : 'unmute', {
            macros: macros
          });
        }

        this.muted = muted;
      }
      /**
       * Update the pause state and call the resume/pause tracking URLs.
       *
       * @param {Boolean} paused - Indicates if the video is paused or not.
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       * @emits VASTTracker#pause
       * @emits VASTTracker#resume
       */

    }, {
      key: "setPaused",
      value: function setPaused(paused) {
        var macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (this.paused !== paused) {
          this.track(paused ? 'pause' : 'resume', {
            macros: macros
          });
        }

        this.paused = paused;
      }
      /**
       * Updates the fullscreen state and calls the fullscreen tracking URLs.
       *
       * @param {Boolean} fullscreen - Indicates if the video is in fulscreen mode or not.
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       * @emits VASTTracker#fullscreen
       * @emits VASTTracker#exitFullscreen
       */

    }, {
      key: "setFullscreen",
      value: function setFullscreen(fullscreen) {
        var macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (this.fullscreen !== fullscreen) {
          this.track(fullscreen ? 'fullscreen' : 'exitFullscreen', {
            macros: macros
          });
        }

        this.fullscreen = fullscreen;
      }
      /**
       * Updates the expand state and calls the expand/collapse tracking URLs.
       *
       * @param {Boolean} expanded - Indicates if the video is expanded or not.
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       * @emits VASTTracker#expand
       * @emits VASTTracker#playerExpand
       * @emits VASTTracker#collapse
       * @emits VASTTracker#playerCollapse
       */

    }, {
      key: "setExpand",
      value: function setExpand(expanded) {
        var macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (this.expanded !== expanded) {
          this.track(expanded ? 'expand' : 'collapse', {
            macros: macros
          });
          this.track(expanded ? 'playerExpand' : 'playerCollapse', {
            macros: macros
          });
        }

        this.expanded = expanded;
      }
      /**
       * Must be called if you want to overwrite the <Linear> Skipoffset value.
       * This will init the skip countdown duration. Then, every time setProgress() is called,
       * it will decrease the countdown and emit a skip-countdown event with the remaining time.
       * Do not call this method if you want to keep the original Skipoffset value.
       *
       * @param {Number} duration - The time in seconds until the skip button is displayed.
       */

    }, {
      key: "setSkipDelay",
      value: function setSkipDelay(duration) {
        if (typeof duration === 'number') {
          this.skipDelay = duration;
        }
      }
      /**
       * Tracks an impression (can be called only once).
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       * @emits VASTTracker#creativeView
       */

    }, {
      key: "trackImpression",
      value: function trackImpression() {
        var macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (!this.impressed) {
          this.impressed = true;
          this.trackURLs(this.ad.impressionURLTemplates, macros);
          this.track('creativeView', {
            macros: macros
          });
        }
      }
      /**
       * Send a request to the URI provided by the VAST <Error> element.
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       * @param {Boolean} [isCustomCode=false] - Flag to allow custom values on error code.
       */

    }, {
      key: "error",
      value: function error() {
        var macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var isCustomCode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        this.trackURLs(this.ad.errorURLTemplates, macros, {
          isCustomCode: isCustomCode
        });
      }
      /**
       * Send a request to the URI provided by the VAST <Error> element.
       * If an [ERRORCODE] macro is included, it will be substitute with errorCode.
       * @deprecated
       * @param {String} errorCode - Replaces [ERRORCODE] macro. [ERRORCODE] values are listed in the VAST specification.
       * @param {Boolean} [isCustomCode=false] - Flag to allow custom values on error code.
       */

    }, {
      key: "errorWithCode",
      value: function errorWithCode(errorCode) {
        var isCustomCode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        this.error({
          ERRORCODE: errorCode
        }, isCustomCode); //eslint-disable-next-line

        console.log('The method errorWithCode is deprecated, please use vast tracker error method instead');
      }
      /**
       * Must be called when the user watched the linear creative until its end.
       * Calls the complete tracking URLs.
       *
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       * @emits VASTTracker#complete
       */

    }, {
      key: "complete",
      value: function complete() {
        var macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.track('complete', {
          macros: macros
        });
      }
      /**
       * Must be called if the ad was not and will not be played
       * This is a terminal event; no other tracking events should be sent when this is used.
       * Calls the notUsed tracking URLs.
       *
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       * @emits VASTTracker#notUsed
       */

    }, {
      key: "notUsed",
      value: function notUsed() {
        var macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.track('notUsed', {
          macros: macros
        });
        this.trackingEvents = [];
      }
      /**
       * An optional metric that can capture all other user interactions
       * under one metric such as hover-overs, or custom clicks. It should NOT replace
       * clickthrough events or other existing events like mute, unmute, pause, etc.
       * Calls the otherAdInteraction tracking URLs.
       *
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       * @emits VASTTracker#otherAdInteraction
       */

    }, {
      key: "otherAdInteraction",
      value: function otherAdInteraction() {
        var macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.track('otherAdInteraction', {
          macros: macros
        });
      }
      /**
       * Must be called if the user clicked or otherwise activated a control used to
       * pause streaming content,* which either expands the ad within the player’s
       * viewable area or “takes-over” the streaming content area by launching
       * additional portion of the ad.
       * Calls the acceptInvitation tracking URLs.
       *
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       * @emits VASTTracker#acceptInvitation
       */

    }, {
      key: "acceptInvitation",
      value: function acceptInvitation() {
        var macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.track('acceptInvitation', {
          macros: macros
        });
      }
      /**
       * Must be called if user activated a control to expand the creative.
       * Calls the adExpand tracking URLs.
       *
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       * @emits VASTTracker#adExpand
       */

    }, {
      key: "adExpand",
      value: function adExpand() {
        var macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.track('adExpand', {
          macros: macros
        });
      }
      /**
       * Must be called when the user activated a control to reduce the creative to its original dimensions.
       * Calls the adCollapse tracking URLs.
       *
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       * @emits VASTTracker#adCollapse
       */

    }, {
      key: "adCollapse",
      value: function adCollapse() {
        var macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.track('adCollapse', {
          macros: macros
        });
      }
      /**
       * Must be called if the user clicked or otherwise activated a control used to minimize the ad.
       * Calls the minimize tracking URLs.
       *
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       * @emits VASTTracker#minimize
       */

    }, {
      key: "minimize",
      value: function minimize() {
        var macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.track('minimize', {
          macros: macros
        });
      }
      /**
       * Must be called if the player did not or was not able to execute the provided
       * verification code.The [REASON] macro must be filled with reason code
       * Calls the verificationNotExecuted tracking URL of associated verification vendor.
       *
       * @param {String} vendor - An identifier for the verification vendor. The recommended format is [domain]-[useCase], to avoid name collisions. For example, "company.com-omid".
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       * @emits VASTTracker#verificationNotExecuted
       */

    }, {
      key: "verificationNotExecuted",
      value: function verificationNotExecuted(vendor) {
        var macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (!this.ad || !this.ad.adVerifications || !this.ad.adVerifications.length) {
          throw new Error('No adVerifications provided');
        }

        if (!vendor) {
          throw new Error('No vendor provided, unable to find associated verificationNotExecuted');
        }

        var vendorVerification = this.ad.adVerifications.find(function (verifications) {
          return verifications.vendor === vendor;
        });

        if (!vendorVerification) {
          throw new Error("No associated verification element found for vendor: ".concat(vendor));
        }

        var vendorTracking = vendorVerification.trackingEvents;

        if (vendorTracking && vendorTracking.verificationNotExecuted) {
          var verifsNotExecuted = vendorTracking.verificationNotExecuted;
          this.trackURLs(verifsNotExecuted, macros);
          this.emit('verificationNotExecuted', {
            trackingURLTemplates: verifsNotExecuted
          });
        }
      }
      /**
       * The time that the initial ad is displayed. This time is based on
       * the time between the impression and either the completed length of display based
       * on the agreement between transactional parties or a close, minimize, or accept
       * invitation event.
       * The time will be passed using [ADPLAYHEAD] macros for VAST 4.1
       * Calls the overlayViewDuration tracking URLs.
       *
       * @param {String} duration - The time that the initial ad is displayed.
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       * @emits VASTTracker#overlayViewDuration
       */

    }, {
      key: "overlayViewDuration",
      value: function overlayViewDuration(duration) {
        var macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        macros['ADPLAYHEAD'] = duration;
        this.track('overlayViewDuration', {
          macros: macros
        });
      }
      /**
       * Must be called when the player or the window is closed during the ad.
       * Calls the `closeLinear` (in VAST 3.0 and 4.1) and `close` tracking URLs.
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       *
       * @emits VASTTracker#closeLinear
       * @emits VASTTracker#close
       */

    }, {
      key: "close",
      value: function close() {
        var macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.track(this.linear ? 'closeLinear' : 'close', {
          macros: macros
        });
      }
      /**
       * Must be called when the skip button is clicked. Calls the skip tracking URLs.
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       *
       * @emits VASTTracker#skip
       */

    }, {
      key: "skip",
      value: function skip() {
        var macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.track('skip', {
          macros: macros
        });
      }
      /**
       * Must be called then loaded and buffered the creative’s media and assets either fully
       * or to the extent that it is ready to play the media
       * Calls the loaded tracking URLs.
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       *
       * @emits VASTTracker#loaded
       */

    }, {
      key: "load",
      value: function load() {
        var macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.track('loaded', {
          macros: macros
        });
      }
      /**
       * Must be called when the user clicks on the creative.
       * It calls the tracking URLs and emits a 'clickthrough' event with the resolved
       * clickthrough URL when done.
       *
       * @param {String} [fallbackClickThroughURL=null] - an optional clickThroughURL template that could be used as a fallback
       * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
       * @emits VASTTracker#clickthrough
       */

    }, {
      key: "click",
      value: function click() {
        var fallbackClickThroughURL = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (this.clickTrackingURLTemplates && this.clickTrackingURLTemplates.length) {
          this.trackURLs(this.clickTrackingURLTemplates, macros);
        } // Use the provided fallbackClickThroughURL as a fallback


        var clickThroughURLTemplate = this.clickThroughURLTemplate || fallbackClickThroughURL; // clone second usage of macros, which get mutated inside resolveURLTemplates

        var clonedMacros = _objectSpread2({}, macros);

        if (clickThroughURLTemplate) {
          if (this.progress) {
            clonedMacros['ADPLAYHEAD'] = this.progressFormatted();
          }

          var clickThroughURL = util.resolveURLTemplates([clickThroughURLTemplate], clonedMacros)[0];
          this.emit('clickthrough', clickThroughURL);
        }
      }
      /**
       * Calls the tracking URLs for the given eventName and emits the event.
       *
       * @param {String} eventName - The name of the event.
       * @param {Object} [macros={}] - An optional Object of parameters(vast macros) to be used in the tracking calls.
       * @param {Boolean} [once=false] - Boolean to define if the event has to be tracked only once.
       *
       */

    }, {
      key: "track",
      value: function track(eventName) {
        var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            _ref$macros = _ref.macros,
            macros = _ref$macros === void 0 ? {} : _ref$macros,
            _ref$once = _ref.once,
            once = _ref$once === void 0 ? false : _ref$once;

        // closeLinear event was introduced in VAST 3.0
        // Fallback to vast 2.0 close event if necessary
        if (eventName === 'closeLinear' && !this.trackingEvents[eventName] && this.trackingEvents['close']) {
          eventName = 'close';
        }

        var trackingURLTemplates = this.trackingEvents[eventName];
        var isAlwaysEmitEvent = this.emitAlwaysEvents.indexOf(eventName) > -1;

        if (trackingURLTemplates) {
          this.emit(eventName, {
            trackingURLTemplates: trackingURLTemplates
          });
          this.trackURLs(trackingURLTemplates, macros);
        } else if (isAlwaysEmitEvent) {
          this.emit(eventName, null);
        }

        if (once) {
          delete this.trackingEvents[eventName];

          if (isAlwaysEmitEvent) {
            this.emitAlwaysEvents.splice(this.emitAlwaysEvents.indexOf(eventName), 1);
          }
        }
      }
      /**
       * Calls the tracking urls templates with the given macros .
       *
       * @param {Array} URLTemplates - An array of tracking url templates.
       * @param {Object} [macros ={}] - An optional Object of parameters to be used in the tracking calls.
       * @param {Object} [options={}] - An optional Object of options to be used in the tracking calls.
       */

    }, {
      key: "trackURLs",
      value: function trackURLs(URLTemplates) {
        var macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        //Avoid mutating the object received in parameters.
        var givenMacros = _objectSpread2({}, macros);

        if (this.linear) {
          if (this.creative && this.creative.mediaFiles && this.creative.mediaFiles[0] && this.creative.mediaFiles[0].fileURL) {
            givenMacros['ASSETURI'] = this.creative.mediaFiles[0].fileURL;
          }

          if (this.progress) {
            givenMacros['ADPLAYHEAD'] = this.progressFormatted();
          }
        }

        if (this.creative && this.creative.universalAdId && this.creative.universalAdId.idRegistry && this.creative.universalAdId.value) {
          givenMacros['UNIVERSALADID'] = "".concat(this.creative.universalAdId.idRegistry, " ").concat(this.creative.universalAdId.value);
        }

        if (this.ad) {
          if (this.ad.sequence) {
            givenMacros['PODSEQUENCE'] = this.ad.sequence;
          }

          if (this.ad.adType) {
            givenMacros['ADTYPE'] = this.ad.adType;
          }

          if (this.ad.adServingId) {
            givenMacros['ADSERVINGID'] = this.ad.adServingId;
          }

          if (this.ad.categories && this.ad.categories.length) {
            givenMacros['ADCATEGORIES'] = this.ad.categories.map(function (categorie) {
              return categorie.value;
            }).join(',');
          }

          if (this.ad.blockedAdCategories && this.ad.blockedAdCategories.length) {
            givenMacros['BLOCKEDADCATEGORIES'] = this.ad.blockedAdCategories;
          }
        }

        util.track(URLTemplates, givenMacros, options);
      }
      /**
       * Formats time in seconds to VAST timecode (e.g. 00:00:10.000)
       *
       * @param {Number} timeInSeconds - Number in seconds
       * @return {String}
       */

    }, {
      key: "convertToTimecode",
      value: function convertToTimecode(timeInSeconds) {
        var progress = timeInSeconds * 1000;
        var hours = Math.floor(progress / (60 * 60 * 1000));
        var minutes = Math.floor(progress / (60 * 1000) % 60);
        var seconds = Math.floor(progress / 1000 % 60);
        var milliseconds = Math.floor(progress % 1000);
        return "".concat(util.leftpad(hours, 2), ":").concat(util.leftpad(minutes, 2), ":").concat(util.leftpad(seconds, 2), ".").concat(util.leftpad(milliseconds, 3));
      }
      /**
       * Formats time progress in a readable string.
       *
       * @return {String}
       */

    }, {
      key: "progressFormatted",
      value: function progressFormatted() {
        return this.convertToTimecode(this.progress);
      }
    }]);

    return VASTTracker;
  }(EventEmitter);

  exports.VASTClient = VASTClient;
  exports.VASTParser = VASTParser;
  exports.VASTTracker = VASTTracker;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
