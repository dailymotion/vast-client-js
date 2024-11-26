function createAd() {
  let adAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return {
    id: adAttributes.id || null,
    sequence: adAttributes.sequence || null,
    adType: adAttributes.adType || null,
    adServingId: null,
    categories: [],
    expires: null,
    viewableImpression: [],
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
  let creativeAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
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
    adSlotId: creativeAttributes.adSlotId || null,
    pxratio: creativeAttributes.pxratio || '1',
    renderingMode: creativeAttributes.renderingMode || 'default',
    staticResources: [],
    htmlResources: [],
    iframeResources: [],
    adParameters: null,
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
  let creativeAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return {
    id: creativeAttributes.id || null,
    adId: creativeAttributes.adId || null,
    sequence: creativeAttributes.sequence || null,
    apiFramework: creativeAttributes.apiFramework || null,
    universalAdIds: [],
    creativeExtensions: []
  };
}

function createCreativeCompanion() {
  let creativeAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const {
    id,
    adId,
    sequence,
    apiFramework
  } = createCreative(creativeAttributes);
  return {
    id,
    adId,
    sequence,
    apiFramework,
    type: 'companion',
    required: null,
    variations: []
  };
}

const supportedMacros = ['ADCATEGORIES', 'ADCOUNT', 'ADPLAYHEAD', 'ADSERVINGID', 'ADTYPE', 'APIFRAMEWORKS', 'APPBUNDLE', 'ASSETURI', 'BLOCKEDADCATEGORIES', 'BREAKMAXADLENGTH', 'BREAKMAXADS', 'BREAKMAXDURATION', 'BREAKMINADLENGTH', 'BREAKMINDURATION', 'BREAKPOSITION', 'CLICKPOS', 'CLICKTYPE', 'CLIENTUA', 'CONTENTID', 'CONTENTPLAYHEAD',
// @deprecated VAST 4.1
'CONTENTURI', 'DEVICEIP', 'DEVICEUA', 'DOMAIN', 'EXTENSIONS', 'GDPRCONSENT', 'IFA', 'IFATYPE', 'INVENTORYSTATE', 'LATLONG', 'LIMITADTRACKING', 'MEDIAMIME', 'MEDIAPLAYHEAD', 'OMIDPARTNER', 'PAGEURL', 'PLACEMENTTYPE', 'PLAYERCAPABILITIES', 'PLAYERSIZE', 'PLAYERSTATE', 'PODSEQUENCE', 'REGULATIONS', 'SERVERSIDE', 'SERVERUA', 'TRANSACTIONID', 'UNIVERSALADID', 'VASTVERSIONS', 'VERIFICATIONVENDORS'];

function track(URLTemplates, macros, options) {
  const URLs = resolveURLTemplates(URLTemplates, macros, options);
  URLs.forEach(URL => {
    if (typeof window !== 'undefined' && window !== null) {
      const i = new Image();
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
  let macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const resolvedURLs = [];
  const URLArray = extractURLsFromTemplates(URLTemplates);

  // Set default value for invalid ERRORCODE
  if (macros['ERRORCODE'] && !options.isCustomCode && !/^[0-9]{3}$/.test(macros['ERRORCODE'])) {
    macros['ERRORCODE'] = 900;
  }

  // Calc random/time based macros
  macros['CACHEBUSTING'] = addLeadingZeros(Math.round(Math.random() * 1.0e8));
  macros['TIMESTAMP'] = new Date().toISOString();

  // RANDOM/random is not defined in VAST 3/4 as a valid macro tho it's used by some adServer (Auditude)
  macros['RANDOM'] = macros['random'] = macros['CACHEBUSTING'];
  for (const macro in macros) {
    macros[macro] = encodeURIComponentRFC3986(macros[macro]);
  }
  for (const URLTemplateKey in URLArray) {
    const resolveURL = URLArray[URLTemplateKey];
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
  url = replaceMacrosValues(url, macros);
  // match any macros from the url that was not replaced
  const remainingMacros = url.match(/[^[\]]+(?=])/g);
  if (!remainingMacros) {
    return url;
  }
  let supportedRemainingMacros = remainingMacros.filter(macro => supportedMacros.indexOf(macro) > -1);
  if (supportedRemainingMacros.length === 0) {
    return url;
  }
  supportedRemainingMacros = supportedRemainingMacros.reduce((accumulator, macro) => {
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
  let replacedMacrosUrl = url;
  for (const key in macros) {
    const value = macros[key];
    // this will match [${key}] and %%${key}%% and replace it
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
    return URLTemplates.map(URLTemplate => {
      return URLTemplate && URLTemplate.hasOwnProperty('url') ? URLTemplate.url : URLTemplate;
    });
  }
  return URLTemplates;
}

/**
 * Filter URLTemplates elements .
 *   To be valid, urls should:
 *   - have the same protocol as the client
 *   or
 *   - be protocol-relative urls
 *
 * Returns an object with two arrays
 *    - validUrls : An array of valid URLs
 *    - invalidUrls: An array of invalid URLs
 *
 * @param {Array} URLTemplates - A Array of string/object containing urls templates.
 * @returns {Object}
 *
 */
function filterUrlTemplates(URLTemplates) {
  return URLTemplates.reduce((acc, urlTemplate) => {
    const url = urlTemplate.url || urlTemplate;
    isValidUrl(url) ? acc.validUrls.push(url) : acc.invalidUrls.push(url);
    return acc;
  }, {
    validUrls: [],
    invalidUrls: []
  });
}
function isValidUrl(url) {
  const regex = /^(https?:\/\/|\/\/)/;
  return regex.test(url);
}

/**
 * Returns a boolean after checking if the object exists in the array.
 *   true - if the object exists, false otherwise
 *
 * @param {Object} obj - The object who existence is to be checked.
 * @param {Array} list - List of objects.
 */
function containsTemplateObject(obj, list) {
  for (let i = 0; i < list.length; i++) {
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
    const obj1Properties = Object.getOwnPropertyNames(obj1);
    const obj2Properties = Object.getOwnPropertyNames(obj2);

    // If number of properties is different, objects are not equivalent
    if (obj1Properties.length !== obj2Properties.length) {
      return false;
    }
    if (obj1.id !== obj2.id || obj1.url !== obj2.url) {
      return false;
    }
    return true;
  }
  return false;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
function encodeURIComponentRFC3986(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => "%".concat(c.charCodeAt(0).toString(16)));
}

/**
 * Return a string of the input number with leading zeros defined by the length param
 *
 * @param {Number} input - number to convert
 * @param {Number} length - length of the desired string
 *
 * @return {String}
 */
function addLeadingZeros(input) {
  let length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8;
  return input.toString().padStart(length, '0');
}
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
function flatten(arr) {
  return arr.reduce((flat, toFlatten) => {
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
  let arr1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  let arr2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  const firstArr = Array.isArray(arr1) ? arr1 : [];
  const secondArr = Array.isArray(arr2) ? arr2 : [];
  const arr = firstArr.concat(secondArr);
  return arr.reduce((res, val) => {
    if (!containsTemplateObject(val, res)) {
      res.push(val);
    }
    return res;
  }, []);
}

/**
 * Check if a provided value is a valid time value according to the IAB definition
 * Check if a provided value is a valid time value according to the IAB definition: Must be a positive number or -1.
 * if not implemented by ad unit or -2 if value is unknown.
 * @param {Number} time
 *
 * @return {Boolean}
 */
function isValidTimeValue(time) {
  return Number.isFinite(time) && time >= -2;
}

/**
 * Check if we are in a browser environment
 * @returns {Boolean}
 */
function isBrowserEnvironment() {
  return typeof window !== 'undefined';
}
function formatMacrosValues(macros) {
  return typeof macros !== 'object' ? macros : JSON.stringify(macros);
}
const util = {
  track,
  resolveURLTemplates,
  extractURLsFromTemplates,
  filterUrlTemplates,
  containsTemplateObject,
  isTemplateObjectEqual,
  encodeURIComponentRFC3986,
  replaceUrlMacros,
  isNumeric,
  flatten,
  joinArrayOfUniqueTemplateObjs,
  isValidTimeValue,
  addLeadingZeros,
  isValidUrl,
  isBrowserEnvironment,
  formatMacrosValues
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
  const childNodes = Array.from(node.childNodes);
  return childNodes.find(childNode => childNode.nodeName === name);
}

/**
 * Returns all the elements of the given node which nodeName match the given name.
 * @param  {Node} node - The node to use to find the matches.
 * @param  {String} name - The name to look for.
 * @return {Array}
 */
function childrenByName(node, name) {
  const childNodes = Array.from(node.childNodes);
  return childNodes.filter(childNode => childNode.nodeName === name);
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
  if (vastAdTagUrl.startsWith('//')) {
    const {
      protocol
    } = location;
    return "".concat(protocol).concat(vastAdTagUrl);
  }
  if (!vastAdTagUrl.includes('://')) {
    // Resolve relative URLs (mainly for unit testing)
    const baseURL = originalUrl.slice(0, originalUrl.lastIndexOf('/'));
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
  return ['true', 'TRUE', 'True', '1'].includes(booleanString);
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
  const attributeValue = nodeSource.getAttribute(attributeName);
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
  const nodeAttributes = Array.from(element.attributes);
  return nodeAttributes.reduce((acc, nodeAttribute) => {
    acc[nodeAttribute.nodeName] = nodeAttribute.nodeValue;
    return acc;
  }, {});
}

/**
 * Parses a String duration into a Number.
 * @param  {String} durationString - The dureation represented as a string.
 * @return {Number}
 */
function parseDuration(durationString) {
  if (durationString === null || typeof durationString === 'undefined') {
    return -1;
  }
  // Some VAST doesn't have an HH:MM:SS duration format but instead jus the number of seconds
  if (util.isNumeric(durationString)) {
    return parseInt(durationString);
  }
  const durationComponents = durationString.split(':');
  if (durationComponents.length !== 3) {
    return -1;
  }
  const secondsAndMS = durationComponents[2].split('.');
  let seconds = parseInt(secondsAndMS[0]);
  if (secondsAndMS.length === 2) {
    seconds += parseFloat("0.".concat(secondsAndMS[1]));
  }
  const minutes = parseInt(durationComponents[1] * 60);
  const hours = parseInt(durationComponents[0] * 60 * 60);
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
  const splittedVAST = [];
  let lastAdPod = null;
  ads.forEach((ad, i) => {
    if (ad.sequence) {
      ad.sequence = parseInt(ad.sequence, 10);
    }
    // The current Ad may be the next Ad of an AdPod
    if (ad.sequence > 1) {
      const lastAd = ads[i - 1];
      // check if the current Ad is exactly the next one in the AdPod
      if (lastAd && lastAd.sequence === ad.sequence - 1) {
        lastAdPod && lastAdPod.push(ad);
        return;
      }
      // If the ad had a sequence attribute but it was not part of a correctly formed
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
    Array.from(attributes).forEach(_ref => {
      let {
        nodeName,
        nodeValue
      } = _ref;
      if (nodeName && nodeValue && verificationObject.hasOwnProperty(nodeName)) {
        let value = nodeValue;
        if (typeof verificationObject[nodeName] === 'boolean') {
          value = parseBoolean(value);
        }
        verificationObject[nodeName] = value;
      }
    });
  }
}

/**
 * Merges the data between an unwrapped ad and his wrapper.
 * @param  {Ad} unwrappedAd - The 'unwrapped' Ad.
 * @param  {Ad} wrapper - The wrapper Ad.
 * @return {void}
 */
function mergeWrapperAdData(unwrappedAd, wrapper) {
  var _wrapper$creatives;
  unwrappedAd.errorURLTemplates = wrapper.errorURLTemplates.concat(unwrappedAd.errorURLTemplates);
  unwrappedAd.impressionURLTemplates = wrapper.impressionURLTemplates.concat(unwrappedAd.impressionURLTemplates);
  unwrappedAd.extensions = wrapper.extensions.concat(unwrappedAd.extensions);
  if (wrapper.viewableImpression.length > 0) {
    unwrappedAd.viewableImpression = [...unwrappedAd.viewableImpression, ...wrapper.viewableImpression];
  }

  // values from the child wrapper will be overridden
  unwrappedAd.followAdditionalWrappers = wrapper.followAdditionalWrappers;
  unwrappedAd.allowMultipleAds = wrapper.allowMultipleAds;
  unwrappedAd.fallbackOnNoAd = wrapper.fallbackOnNoAd;
  const wrapperCompanions = (wrapper.creatives || []).filter(creative => creative && creative.type === 'companion');
  const wrapperCompanionClickTracking = wrapperCompanions.reduce((result, creative) => {
    (creative.variations || []).forEach(variation => {
      (variation.companionClickTrackingURLTemplates || []).forEach(companionClickTrackingURLTemplate => {
        if (!util.containsTemplateObject(companionClickTrackingURLTemplate, result)) {
          result.push(companionClickTrackingURLTemplate);
        }
      });
    });
    return result;
  }, []);
  unwrappedAd.creatives = wrapperCompanions.concat(unwrappedAd.creatives);
  const wrapperHasVideoClickTracking = wrapper.videoClickTrackingURLTemplates && wrapper.videoClickTrackingURLTemplates.length;
  const wrapperHasVideoCustomClick = wrapper.videoCustomClickURLTemplates && wrapper.videoCustomClickURLTemplates.length;
  unwrappedAd.creatives.forEach(creative => {
    // merge tracking events
    if (wrapper.trackingEvents && wrapper.trackingEvents[creative.type]) {
      for (const eventName in wrapper.trackingEvents[creative.type]) {
        const urls = wrapper.trackingEvents[creative.type][eventName];
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
      }

      // merge video custom click url
      if (wrapperHasVideoCustomClick) {
        creative.videoCustomClickURLTemplates = creative.videoCustomClickURLTemplates.concat(wrapper.videoCustomClickURLTemplates);
      }

      // VAST 2.0 support - Use Wrapper/linear/clickThrough when Inline/Linear/clickThrough is null
      if (wrapper.videoClickThroughURLTemplate && (creative.videoClickThroughURLTemplate === null || typeof creative.videoClickThroughURLTemplate === 'undefined')) {
        creative.videoClickThroughURLTemplate = wrapper.videoClickThroughURLTemplate;
      }
    }

    // pass wrapper companion trackers to all companions
    if (creative.type === 'companion' && wrapperCompanionClickTracking.length) {
      (creative.variations || []).forEach(variation => {
        variation.companionClickTrackingURLTemplates = util.joinArrayOfUniqueTemplateObjs(variation.companionClickTrackingURLTemplates, wrapperCompanionClickTracking);
      });
    }
  });
  if (wrapper.adVerifications) {
    // As specified by VAST specs unwrapped ads should contains wrapper adVerification script
    unwrappedAd.adVerifications = unwrappedAd.adVerifications.concat(wrapper.adVerifications);
  }
  if (wrapper.blockedAdCategories) {
    unwrappedAd.blockedAdCategories = unwrappedAd.blockedAdCategories.concat(wrapper.blockedAdCategories);
  }

  // Merge Wrapper's creatives containing icon elements
  if ((_wrapper$creatives = wrapper.creatives) !== null && _wrapper$creatives !== void 0 && _wrapper$creatives.length) {
    // As specified by VAST specs, wrapper should not contain any mediafiles
    const wrapperCreativesWithIconsNode = wrapper.creatives.filter(creative => {
      var _creative$icons;
      return ((_creative$icons = creative.icons) === null || _creative$icons === void 0 ? void 0 : _creative$icons.length) && !creative.mediaFiles.length;
    });
    if (wrapperCreativesWithIconsNode.length) {
      unwrappedAd.creatives = unwrappedAd.creatives.concat(wrapperCreativesWithIconsNode);
    }
  }
}
const parserUtils = {
  childByName,
  childrenByName,
  resolveVastAdTagURI,
  parseBoolean,
  parseNodeText,
  copyNodeAttribute,
  parseAttributes,
  parseDuration,
  splitVAST,
  assignAttributes,
  mergeWrapperAdData
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
  const creative = createCreativeCompanion(creativeAttributes);
  creative.required = creativeElement.getAttribute('required') || null;
  creative.variations = parserUtils.childrenByName(creativeElement, 'Companion').map(companionResource => {
    const companionAd = createCompanionAd(parserUtils.parseAttributes(companionResource));
    companionAd.htmlResources = parserUtils.childrenByName(companionResource, 'HTMLResource').reduce((urls, resource) => {
      const url = parserUtils.parseNodeText(resource);
      return url ? urls.concat(url) : urls;
    }, []);
    companionAd.iframeResources = parserUtils.childrenByName(companionResource, 'IFrameResource').reduce((urls, resource) => {
      const url = parserUtils.parseNodeText(resource);
      return url ? urls.concat(url) : urls;
    }, []);
    companionAd.staticResources = parserUtils.childrenByName(companionResource, 'StaticResource').reduce((urls, resource) => {
      const url = parserUtils.parseNodeText(resource);
      return url ? urls.concat({
        url,
        creativeType: resource.getAttribute('creativeType') || null
      }) : urls;
    }, []);
    companionAd.altText = parserUtils.parseNodeText(parserUtils.childByName(companionResource, 'AltText')) || null;
    const trackingEventsElement = parserUtils.childByName(companionResource, 'TrackingEvents');
    if (trackingEventsElement) {
      parserUtils.childrenByName(trackingEventsElement, 'Tracking').forEach(trackingElement => {
        const eventName = trackingElement.getAttribute('event');
        const trackingURLTemplate = parserUtils.parseNodeText(trackingElement);
        if (eventName && trackingURLTemplate) {
          if (!Array.isArray(companionAd.trackingEvents[eventName])) {
            companionAd.trackingEvents[eventName] = [];
          }
          companionAd.trackingEvents[eventName].push(trackingURLTemplate);
        }
      });
    }
    companionAd.companionClickTrackingURLTemplates = parserUtils.childrenByName(companionResource, 'CompanionClickTracking').map(clickTrackingElement => {
      return {
        id: clickTrackingElement.getAttribute('id') || null,
        url: parserUtils.parseNodeText(clickTrackingElement)
      };
    });
    companionAd.companionClickThroughURLTemplate = parserUtils.parseNodeText(parserUtils.childByName(companionResource, 'CompanionClickThrough')) || null;
    const adParametersElement = parserUtils.childByName(companionResource, 'AdParameters');
    if (adParametersElement) {
      companionAd.adParameters = {
        value: parserUtils.parseNodeText(adParametersElement),
        xmlEncoded: adParametersElement.getAttribute('xmlEncoded') || null
      };
    }
    return companionAd;
  });
  return creative;
}

function createCreativeLinear() {
  let creativeAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const {
    id,
    adId,
    sequence,
    apiFramework
  } = createCreative(creativeAttributes);
  return {
    id,
    adId,
    sequence,
    apiFramework,
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
  let closedCaptionAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
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
    iconViewTrackingURLTemplate: null,
    iconClickFallbackImages: []
  };
}

function createInteractiveCreativeFile() {
  let interactiveCreativeAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
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
  let offset;
  const creative = createCreativeLinear(creativeAttributes);
  creative.duration = parserUtils.parseDuration(parserUtils.parseNodeText(parserUtils.childByName(creativeElement, 'Duration')));
  const skipOffset = creativeElement.getAttribute('skipoffset');
  if (typeof skipOffset === 'undefined' || skipOffset === null) {
    creative.skipDelay = null;
  } else if (skipOffset.charAt(skipOffset.length - 1) === '%' && creative.duration !== -1) {
    const percent = parseInt(skipOffset, 10);
    creative.skipDelay = creative.duration * (percent / 100);
  } else {
    creative.skipDelay = parserUtils.parseDuration(skipOffset);
  }
  const videoClicksElement = parserUtils.childByName(creativeElement, 'VideoClicks');
  if (videoClicksElement) {
    const videoClickThroughElement = parserUtils.childByName(videoClicksElement, 'ClickThrough');
    if (videoClickThroughElement) {
      creative.videoClickThroughURLTemplate = {
        id: videoClickThroughElement.getAttribute('id') || null,
        url: parserUtils.parseNodeText(videoClickThroughElement)
      };
    } else {
      creative.videoClickThroughURLTemplate = null;
    }
    parserUtils.childrenByName(videoClicksElement, 'ClickTracking').forEach(clickTrackingElement => {
      creative.videoClickTrackingURLTemplates.push({
        id: clickTrackingElement.getAttribute('id') || null,
        url: parserUtils.parseNodeText(clickTrackingElement)
      });
    });
    parserUtils.childrenByName(videoClicksElement, 'CustomClick').forEach(customClickElement => {
      creative.videoCustomClickURLTemplates.push({
        id: customClickElement.getAttribute('id') || null,
        url: parserUtils.parseNodeText(customClickElement)
      });
    });
  }
  const adParamsElement = parserUtils.childByName(creativeElement, 'AdParameters');
  if (adParamsElement) {
    creative.adParameters = {
      value: parserUtils.parseNodeText(adParamsElement),
      xmlEncoded: adParamsElement.getAttribute('xmlEncoded') || null
    };
  }
  parserUtils.childrenByName(creativeElement, 'TrackingEvents').forEach(trackingEventsElement => {
    parserUtils.childrenByName(trackingEventsElement, 'Tracking').forEach(trackingElement => {
      let eventName = trackingElement.getAttribute('event');
      const trackingURLTemplate = parserUtils.parseNodeText(trackingElement);
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
  parserUtils.childrenByName(creativeElement, 'MediaFiles').forEach(mediaFilesElement => {
    parserUtils.childrenByName(mediaFilesElement, 'MediaFile').forEach(mediaFileElement => {
      creative.mediaFiles.push(parseMediaFile(mediaFileElement));
    });
    const interactiveCreativeElement = parserUtils.childByName(mediaFilesElement, 'InteractiveCreativeFile');
    if (interactiveCreativeElement) {
      creative.interactiveCreativeFile = parseInteractiveCreativeFile(interactiveCreativeElement);
    }
    const closedCaptionElements = parserUtils.childByName(mediaFilesElement, 'ClosedCaptionFiles');
    if (closedCaptionElements) {
      parserUtils.childrenByName(closedCaptionElements, 'ClosedCaptionFile').forEach(closedCaptionElement => {
        const closedCaptionFile = createClosedCaptionFile(parserUtils.parseAttributes(closedCaptionElement));
        closedCaptionFile.fileURL = parserUtils.parseNodeText(closedCaptionElement);
        creative.closedCaptionFiles.push(closedCaptionFile);
      });
    }
    const mezzanineElement = parserUtils.childByName(mediaFilesElement, 'Mezzanine');
    const requiredAttributes = getRequiredAttributes(mezzanineElement, ['delivery', 'type', 'width', 'height']);
    if (requiredAttributes) {
      const mezzanine = createMezzanine();
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
  const iconsElement = parserUtils.childByName(creativeElement, 'Icons');
  if (iconsElement) {
    parserUtils.childrenByName(iconsElement, 'Icon').forEach(iconElement => {
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
  const mediaFile = createMediaFile();
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
  const scalable = mediaFileElement.getAttribute('scalable');
  if (scalable && typeof scalable === 'string') {
    mediaFile.scalable = parserUtils.parseBoolean(scalable);
  }
  const maintainAspectRatio = mediaFileElement.getAttribute('maintainAspectRatio');
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
  const interactiveCreativeFile = createInteractiveCreativeFile(parserUtils.parseAttributes(interactiveCreativeElement));
  interactiveCreativeFile.fileURL = parserUtils.parseNodeText(interactiveCreativeElement);
  return interactiveCreativeFile;
}

/**
 * Parses the Icon element from VAST.
 * @param  {Object} iconElement - The VAST Icon element.
 * @return {Object} - Parsed icon object.
 */
function parseIcon(iconElement) {
  const icon = createIcon();
  icon.program = iconElement.getAttribute('program');
  icon.height = parseInt(iconElement.getAttribute('height') || 0);
  icon.width = parseInt(iconElement.getAttribute('width') || 0);
  icon.xPosition = parseXPosition(iconElement.getAttribute('xPosition'));
  icon.yPosition = parseYPosition(iconElement.getAttribute('yPosition'));
  icon.apiFramework = iconElement.getAttribute('apiFramework');
  icon.pxratio = iconElement.getAttribute('pxratio') || '1';
  icon.offset = parserUtils.parseDuration(iconElement.getAttribute('offset'));
  icon.duration = parserUtils.parseDuration(iconElement.getAttribute('duration'));
  parserUtils.childrenByName(iconElement, 'HTMLResource').forEach(htmlElement => {
    icon.type = htmlElement.getAttribute('creativeType') || 'text/html';
    icon.htmlResource = parserUtils.parseNodeText(htmlElement);
  });
  parserUtils.childrenByName(iconElement, 'IFrameResource').forEach(iframeElement => {
    icon.type = iframeElement.getAttribute('creativeType') || 0;
    icon.iframeResource = parserUtils.parseNodeText(iframeElement);
  });
  parserUtils.childrenByName(iconElement, 'StaticResource').forEach(staticElement => {
    icon.type = staticElement.getAttribute('creativeType') || 0;
    icon.staticResource = parserUtils.parseNodeText(staticElement);
  });
  const iconClicksElement = parserUtils.childByName(iconElement, 'IconClicks');
  if (iconClicksElement) {
    icon.iconClickThroughURLTemplate = parserUtils.parseNodeText(parserUtils.childByName(iconClicksElement, 'IconClickThrough'));
    parserUtils.childrenByName(iconClicksElement, 'IconClickTracking').forEach(iconClickTrackingElement => {
      icon.iconClickTrackingURLTemplates.push({
        id: iconClickTrackingElement.getAttribute('id') || null,
        url: parserUtils.parseNodeText(iconClickTrackingElement)
      });
    });
    const iconClickFallbackImagesElement = parserUtils.childByName(iconClicksElement, 'IconClickFallbackImages');
    if (iconClickFallbackImagesElement) {
      parserUtils.childrenByName(iconClickFallbackImagesElement, 'IconClickFallbackImage').forEach(iconClickFallbackImageElement => {
        icon.iconClickFallbackImages.push({
          url: parserUtils.parseNodeText(iconClickFallbackImageElement) || null,
          width: iconClickFallbackImageElement.getAttribute('width') || null,
          height: iconClickFallbackImageElement.getAttribute('height') || null
        });
      });
    }
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
  const values = {};
  let error = false;
  attributes.forEach(name => {
    if (!element || !element.getAttribute(name)) {
      error = true;
    } else {
      values[name] = element.getAttribute(name);
    }
  });
  return error ? null : values;
}

function createCreativeNonLinear() {
  let creativeAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const {
    id,
    adId,
    sequence,
    apiFramework
  } = createCreative(creativeAttributes);
  return {
    id,
    adId,
    sequence,
    apiFramework,
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
  const creative = createCreativeNonLinear(creativeAttributes);
  parserUtils.childrenByName(creativeElement, 'TrackingEvents').forEach(trackingEventsElement => {
    let eventName, trackingURLTemplate;
    parserUtils.childrenByName(trackingEventsElement, 'Tracking').forEach(trackingElement => {
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
  parserUtils.childrenByName(creativeElement, 'NonLinear').forEach(nonlinearResource => {
    const nonlinearAd = createNonLinearAd();
    nonlinearAd.id = nonlinearResource.getAttribute('id') || null;
    nonlinearAd.width = nonlinearResource.getAttribute('width');
    nonlinearAd.height = nonlinearResource.getAttribute('height');
    nonlinearAd.expandedWidth = nonlinearResource.getAttribute('expandedWidth');
    nonlinearAd.expandedHeight = nonlinearResource.getAttribute('expandedHeight');
    nonlinearAd.scalable = parserUtils.parseBoolean(nonlinearResource.getAttribute('scalable'));
    nonlinearAd.maintainAspectRatio = parserUtils.parseBoolean(nonlinearResource.getAttribute('maintainAspectRatio'));
    nonlinearAd.minSuggestedDuration = parserUtils.parseDuration(nonlinearResource.getAttribute('minSuggestedDuration'));
    nonlinearAd.apiFramework = nonlinearResource.getAttribute('apiFramework');
    parserUtils.childrenByName(nonlinearResource, 'HTMLResource').forEach(htmlElement => {
      nonlinearAd.type = htmlElement.getAttribute('creativeType') || 'text/html';
      nonlinearAd.htmlResource = parserUtils.parseNodeText(htmlElement);
    });
    parserUtils.childrenByName(nonlinearResource, 'IFrameResource').forEach(iframeElement => {
      nonlinearAd.type = iframeElement.getAttribute('creativeType') || 0;
      nonlinearAd.iframeResource = parserUtils.parseNodeText(iframeElement);
    });
    parserUtils.childrenByName(nonlinearResource, 'StaticResource').forEach(staticElement => {
      nonlinearAd.type = staticElement.getAttribute('creativeType') || 0;
      nonlinearAd.staticResource = parserUtils.parseNodeText(staticElement);
    });
    const adParamsElement = parserUtils.childByName(nonlinearResource, 'AdParameters');
    if (adParamsElement) {
      nonlinearAd.adParameters = {
        value: parserUtils.parseNodeText(adParamsElement),
        xmlEncoded: adParamsElement.getAttribute('xmlEncoded') || null
      };
    }
    nonlinearAd.nonlinearClickThroughURLTemplate = parserUtils.parseNodeText(parserUtils.childByName(nonlinearResource, 'NonLinearClickThrough'));
    parserUtils.childrenByName(nonlinearResource, 'NonLinearClickTracking').forEach(clickTrackingElement => {
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
 * @return {AdExtension|CreativeExtension|null} - The node parsed to extension
 */
function _parseExtension(extNode) {
  // Ignore comments
  if (extNode.nodeName === '#comment') return null;
  const ext = createExtension();
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
  if (ext.children.length === 0 || ext.children.length === 1 && ['#cdata-section', '#text'].indexOf(ext.children[0].name) >= 0) {
    const txt = parserUtils.parseNodeText(extNode);
    if (txt !== '') {
      ext.value = txt;
    }

    // Remove the children if it's a cdata or simply text to avoid useless children
    ext.children = [];
  }

  // Only return not empty objects to not pollute extentions
  return isEmptyExtension(ext) ? null : ext;
}

/**
 * Parses the creatives from the Creatives Node.
 * @param  {any} creativeNodes - The creative nodes to parse.
 * @return {Array<Creative>} - An array of Creative objects.
 */
function parseCreatives(creativeNodes) {
  const creatives = [];
  creativeNodes.forEach(creativeElement => {
    const creativeAttributes = {
      id: creativeElement.getAttribute('id') || null,
      adId: parseCreativeAdIdAttribute(creativeElement),
      sequence: creativeElement.getAttribute('sequence') || null,
      apiFramework: creativeElement.getAttribute('apiFramework') || null
    };
    const universalAdIds = [];
    const universalAdIdElements = parserUtils.childrenByName(creativeElement, 'UniversalAdId');
    universalAdIdElements.forEach(universalAdIdElement => {
      const universalAdId = {
        idRegistry: universalAdIdElement.getAttribute('idRegistry') || 'unknown',
        value: parserUtils.parseNodeText(universalAdIdElement)
      };
      universalAdIds.push(universalAdId);
    });
    let creativeExtensions;
    const creativeExtensionsElement = parserUtils.childByName(creativeElement, 'CreativeExtensions');
    if (creativeExtensionsElement) {
      creativeExtensions = parseExtensions(parserUtils.childrenByName(creativeExtensionsElement, 'CreativeExtension'));
    }
    for (const creativeTypeElementKey in creativeElement.childNodes) {
      const creativeTypeElement = creativeElement.childNodes[creativeTypeElementKey];
      let parsedCreative;
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
        if (universalAdIds) {
          parsedCreative.universalAdIds = universalAdIds;
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
  return creativeElement.getAttribute('AdID') ||
  // VAST 2 spec
  creativeElement.getAttribute('adID') ||
  // VAST 3 spec
  creativeElement.getAttribute('adId') ||
  // VAST 4 spec
  null;
}

const requiredValues = {
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
    for (let i = 0; i < node.children.length; i++) {
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
  const requiredAttributes = requiredValues[node.nodeName].attributes;
  const missingAttributes = requiredAttributes.filter(attributeName => !node.getAttribute(attributeName));
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
  const required = requiredValues[node.nodeName];
  // Do not verify subelement if node is a child of wrapper, but verify it if node is the Wrapper itself
  // Wrapper child have no required subElement. (Only InLine does)
  const isInWrapperButNotWrapperItself = !isAdInline && node.nodeName !== 'Wrapper';
  if (!required || isInWrapperButNotWrapperItself) {
    return;
  }
  if (required.subElements) {
    const requiredSubElements = required.subElements;
    const missingSubElements = requiredSubElements.filter(subElementName => !parserUtils.childByName(node, subElementName));
    if (missingSubElements.length > 0) {
      emitMissingValueWarning({
        name: node.nodeName,
        parentName: node.parentNode.nodeName,
        subElements: missingSubElements
      }, emit);
    }
  }

  // When InLine format is used some nodes (i.e <NonLinear>, <Companion>, or <Icon>)
  // require at least one of the following resources: StaticResource, IFrameResource, HTMLResource
  if (!isAdInline || !required.oneOfinLineResources) {
    return;
  }
  const resourceFound = required.oneOfinLineResources.some(resource => {
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
  let {
    name,
    parentName,
    attributes,
    subElements,
    oneOfResources
  } = _ref;
  let message = "Element '".concat(name, "'");
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
    message,
    parentElement: parentName,
    specVersion: 4.1
  });
}
const parserVerification = {
  verifyRequiredValues,
  hasSubElements,
  emitMissingValueWarning,
  verifyRequiredAttributes,
  verifyRequiredSubElements
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
  let {
    allowMultipleAds,
    followAdditionalWrappers
  } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const childNodes = Array.from(adElement.childNodes);
  const filteredChildNodes = childNodes.filter(childNode => {
    const childNodeToLowerCase = childNode.nodeName.toLowerCase();
    return childNodeToLowerCase === 'inline' || followAdditionalWrappers !== false && childNodeToLowerCase === 'wrapper';
  });
  for (const node of filteredChildNodes) {
    parserUtils.copyNodeAttribute('id', adElement, node);
    parserUtils.copyNodeAttribute('sequence', adElement, node);
    parserUtils.copyNodeAttribute('adType', adElement, node);
    if (node.nodeName === 'Wrapper') {
      return {
        ad: parseWrapper(node, emit),
        type: 'WRAPPER'
      };
    } else if (node.nodeName === 'InLine') {
      return {
        ad: parseInLine(node, emit, {
          allowMultipleAds
        }),
        type: 'INLINE'
      };
    }
    const wrongNode = node.nodeName.toLowerCase();
    const message = wrongNode === 'inline' ? "<".concat(node.nodeName, "> must be written <InLine>") : "<".concat(node.nodeName, "> must be written <Wrapper>");
    emit('VAST-warning', {
      message,
      wrongNode: node
    });
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
  let {
    allowMultipleAds
  } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
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
  let adVerificationsFromExtensions = [];
  if (emit) {
    parserVerification.verifyRequiredValues(adTypeElement, emit);
  }
  const childNodes = Array.from(adTypeElement.childNodes);
  const ad = createAd(parserUtils.parseAttributes(adTypeElement));
  childNodes.forEach(node => {
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
          const extNodes = parserUtils.childrenByName(node, 'Extension');
          ad.extensions = parseExtensions(extNodes);

          /*
            OMID specify adVerifications should be in extensions for VAST < 4.0
            To avoid to put them on two different places in two different format we reparse it
            from extensions the same way than for an AdVerifications node.
          */
          if (!ad.adVerifications.length) {
            adVerificationsFromExtensions = _parseAdVerificationsFromExtensions(extNodes);
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
        ad.viewableImpression.push(_parseViewableImpression(node));
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
        ad.survey = {
          value: parserUtils.parseNodeText(node),
          type: node.getAttribute('type') || null
        };
        break;
      case 'BlockedAdCategories':
        ad.blockedAdCategories.push({
          authority: node.getAttribute('authority') || null,
          value: parserUtils.parseNodeText(node)
        });
        break;
    }
  });
  if (adVerificationsFromExtensions.length) {
    ad.adVerifications = ad.adVerifications.concat(adVerificationsFromExtensions);
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
  const followAdditionalWrappersValue = wrapperElement.getAttribute('followAdditionalWrappers');
  const allowMultipleAdsValue = wrapperElement.getAttribute('allowMultipleAds');
  const fallbackOnNoAdValue = wrapperElement.getAttribute('fallbackOnNoAd');
  ad.followAdditionalWrappers = followAdditionalWrappersValue ? parserUtils.parseBoolean(followAdditionalWrappersValue) : true;
  ad.allowMultipleAds = allowMultipleAdsValue ? parserUtils.parseBoolean(allowMultipleAdsValue) : false;
  ad.fallbackOnNoAd = fallbackOnNoAdValue ? parserUtils.parseBoolean(fallbackOnNoAdValue) : null;
  let wrapperURLElement = parserUtils.childByName(wrapperElement, 'VASTAdTagURI');
  if (wrapperURLElement) {
    ad.nextWrapperURL = parserUtils.parseNodeText(wrapperURLElement);
  } else {
    wrapperURLElement = parserUtils.childByName(wrapperElement, 'VASTAdTagURL');
    if (wrapperURLElement) {
      ad.nextWrapperURL = parserUtils.parseNodeText(parserUtils.childByName(wrapperURLElement, 'URL'));
    }
  }
  ad.creatives.forEach(wrapperCreativeElement => {
    if (['linear', 'nonlinear'].includes(wrapperCreativeElement.type)) {
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
          if (!Array.isArray(ad.trackingEvents[wrapperCreativeElement.type][eventName])) {
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
        ad.videoClickThroughURLTemplate = wrapperCreativeElement.videoClickThroughURLTemplate;
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
function _parseAdVerifications(verifications) {
  const ver = [];
  verifications.forEach(verificationNode => {
    const verification = createAdVerification();
    const childNodes = Array.from(verificationNode.childNodes);
    parserUtils.assignAttributes(verificationNode.attributes, verification);
    childNodes.forEach(_ref => {
      let {
        nodeName,
        textContent,
        attributes
      } = _ref;
      switch (nodeName) {
        case 'JavaScriptResource':
        case 'ExecutableResource':
          verification.resource = textContent.trim();
          parserUtils.assignAttributes(attributes, verification);
          break;
        case 'VerificationParameters':
          verification.parameters = textContent.trim();
          break;
      }
    });
    const trackingEventsElement = parserUtils.childByName(verificationNode, 'TrackingEvents');
    if (trackingEventsElement) {
      parserUtils.childrenByName(trackingEventsElement, 'Tracking').forEach(trackingElement => {
        const eventName = trackingElement.getAttribute('event');
        const trackingURLTemplate = parserUtils.parseNodeText(trackingElement);
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
function _parseAdVerificationsFromExtensions(extensions) {
  let adVerificationsNode = null,
    adVerifications = [];

  // Find the first (and only) AdVerifications node from extensions
  extensions.some(extension => {
    return adVerificationsNode = parserUtils.childByName(extension, 'AdVerifications');
  });

  // Parse it if we get it
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
  const regroupNodesUrl = (urls, node) => {
    const url = parserUtils.parseNodeText(node);
    url && urls.push(url);
    return urls;
  };
  return {
    id: viewableImpressionNode.getAttribute('id') || null,
    viewable: parserUtils.childrenByName(viewableImpressionNode, 'Viewable').reduce(regroupNodesUrl, []),
    notViewable: parserUtils.childrenByName(viewableImpressionNode, 'NotViewable').reduce(regroupNodesUrl, []),
    viewUndetermined: parserUtils.childrenByName(viewableImpressionNode, 'ViewUndetermined').reduce(regroupNodesUrl, [])
  };
}

class EventEmitter {
  constructor() {
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
  on(event, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError("The handler argument must be of type Function. Received type ".concat(typeof handler));
    }
    if (!event) {
      throw new TypeError("The event argument must be of type String. Received type ".concat(typeof event));
    }
    this._handlers.push({
      event,
      handler
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
  once(event, handler) {
    return this.on(event, onceWrap(this, event, handler));
  }

  /**
   * Removes all instances for the specified handler from the handler array for the named event.
   * @param {String} event
   * @param {Function} handler
   * @returns {EventEmitter}
   */
  off(event, handler) {
    this._handlers = this._handlers.filter(item => {
      return item.event !== event || item.handler !== handler;
    });
    return this;
  }

  /**
   * Synchronously calls each of the handlers registered for the named event,
   * in the order they were registered, passing the supplied arguments to each.
   * @param {String} event
   * @param  {...any} args list of arguments that will be used by the event handler
   * @returns {Boolean} true if the event had handlers, false otherwise.
   */
  emit(event) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    let called = false;
    this._handlers.forEach(item => {
      if (item.event === '*') {
        called = true;
        item.handler(event, ...args);
      }
      if (item.event === event) {
        called = true;
        item.handler(...args);
      }
    });
    return called;
  }

  /**
   * Removes all listeners, or those of the specified named event.
   * @param {String} event
   * @returns {EventEmitter}
   */
  removeAllListeners(event) {
    if (!event) {
      this._handlers = [];
      return this;
    }
    this._handlers = this._handlers.filter(item => item.event !== event);
    return this;
  }

  /**
   * Returns the number of listeners listening to the named event.
   * @param {String} event
   * @returns {Number}
   */
  listenerCount(event) {
    return this._handlers.filter(item => item.event === event).length;
  }

  /**
   * Returns a copy of the array of listeners for the named event including those created by .once().
   * @param {String} event
   * @returns {Function[]}
   */
  listeners(event) {
    return this._handlers.reduce((listeners, item) => {
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
  eventNames() {
    return this._handlers.map(item => item.event);
  }
}
function onceWrap(target, event, handler) {
  const state = {
    fired: false,
    wrapFn: undefined
  };
  function onceWrapper() {
    if (!state.fired) {
      target.off(event, state.wrapFn);
      state.fired = true;
      handler.bind(target)(...arguments);
    }
  }
  state.wrapFn = onceWrapper;
  return onceWrapper;
}

function createVASTResponse(_ref) {
  let {
    ads,
    errorURLTemplates,
    version
  } = _ref;
  return {
    ads: ads || [],
    errorURLTemplates: errorURLTemplates || [],
    version: version || null
  };
}

/*
  We decided to put the estimated bitrate separated from classes to persist it between different instances of vast client/parser
*/

let estimatedBitrateCount = 0;
let estimatedBitrate = 0;

/**
 * Calculate average estimated bitrate from the previous values and new entries
 * @param {Number} byteLength - The length of the response in bytes.
 * @param {Number} duration - The duration of the request in ms.
 */
const updateEstimatedBitrate = (byteLength, duration) => {
  if (!byteLength || !duration || byteLength <= 0 || duration <= 0) {
    return;
  }

  // We want the bitrate in kb/s, byteLength are in bytes and duration in ms, just need to convert the byteLength because kb/s = b/ms
  const bitrate = byteLength * 8 / duration;
  estimatedBitrate = (estimatedBitrate * estimatedBitrateCount + bitrate) / ++estimatedBitrateCount;
};

const DEFAULT_MAX_WRAPPER_DEPTH = 10;
const DEFAULT_EVENT_DATA = {
  ERRORCODE: 900,
  extensions: []
};
const INVALID_VAST_ERROR = 'Invalid VAST XMLDocument';
const NON_SUPPORTED_VAST_VERSION = 'VAST response version not supported';
/**
 * This class provides methods to fetch and parse a VAST document.
 * @export
 * @class VASTParser
 * @extends EventEmitter
 */
class VASTParser extends EventEmitter {
  /**
   * Creates an instance of VASTParser.
   * @constructor
   */
  constructor() {
    let {
      fetcher
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    super();
    this.maxWrapperDepth = null;
    this.rootErrorURLTemplates = [];
    this.errorURLTemplates = [];
    this.remainingAds = [];
    this.parsingOptions = {};
    this.fetcher = fetcher || null;
  }

  /**
   * Tracks the error provided in the errorCode parameter and emits a VAST-error event for the given error.
   * @param  {Array} urlTemplates - An Array of url templates to use to make the tracking call.
   * @param  {Object} errorCode - An Object containing the error data.
   * @param  {Object} data - One (or more) Object containing additional data.
   * @emits  VASTParser#VAST-error
   * @return {void}
   */
  trackVastError(urlTemplates, errorCode) {
    for (var _len = arguments.length, data = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      data[_key - 2] = arguments[_key];
    }
    this.emit('VAST-error', Object.assign({}, DEFAULT_EVENT_DATA, errorCode, ...data));
    util.track(urlTemplates, errorCode);
  }

  /**
   * Returns an array of errorURLTemplates for the VAST being parsed.
   * @return {Array}
   */
  getErrorURLTemplates() {
    return this.rootErrorURLTemplates.concat(this.errorURLTemplates);
  }

  /**
   * Returns the estimated bitrate calculated from all previous requests
   * @returns The average of all estimated bitrates in kb/s.
   */
  getEstimatedBitrate() {
    return estimatedBitrate;
  }

  /**
   * Inits the parsing properties of the class with the custom values provided as options.
   * @param {Object} options - The options to initialize a parsing sequence
   */
  initParsingStatus() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.maxWrapperDepth = options.wrapperLimit || DEFAULT_MAX_WRAPPER_DEPTH;
    this.parsingOptions = {
      allowMultipleAds: options.allowMultipleAds
    };
    this.rootURL = '';
    this.resetParsingStatus();
    updateEstimatedBitrate(options.byteLength, options.requestDuration);
  }

  /**
   * Reset the parsing property of the class everytime a VAST is parsed
   */
  resetParsingStatus() {
    this.errorURLTemplates = [];
    this.rootErrorURLTemplates = [];
    this.vastVersion = null;
  }
  /**
   * Resolves the next group of ads. If all is true resolves all the remaining ads.
   * @param  {Boolean} all - If true all the remaining ads are resolved
   * @return {Promise}
   */
  getRemainingAds(all) {
    if (this.remainingAds.length === 0) {
      return Promise.reject(new Error('No more ads are available for the given VAST'));
    }
    const ads = all ? util.flatten(this.remainingAds) : this.remainingAds.shift();
    this.errorURLTemplates = [];
    return this.resolveAds(ads, {
      wrapperDepth: 0,
      url: this.rootURL
    }).then(resolvedAds => {
      return this.buildVASTResponse(resolvedAds);
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
  parseVAST(vastXml) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    this.initParsingStatus(options);
    options.isRootVAST = true;
    return this.parse(vastXml, options).then(ads => {
      return this.buildVASTResponse(ads);
    });
  }

  /**
   * Builds a VASTResponse which can be returned.
   * @param  {Array} ads - An Array of unwrapped ads
   * @return {Object}
   */
  buildVASTResponse(ads) {
    const response = createVASTResponse({
      ads,
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
  parseVastXml(vastXml, _ref) {
    let {
      isRootVAST = false,
      url = null,
      wrapperDepth = 0,
      allowMultipleAds,
      followAdditionalWrappers
    } = _ref;
    // check if is a valid VAST document
    if (!vastXml || !vastXml.documentElement || vastXml.documentElement.nodeName !== 'VAST') {
      var _vastXml$documentElem;
      this.emit('VAST-ad-parsed', {
        type: 'ERROR',
        url,
        wrapperDepth
      });
      // VideoAdServingTemplate node is used for VAST 1.0
      const isNonSupportedVast = (vastXml === null || vastXml === void 0 || (_vastXml$documentElem = vastXml.documentElement) === null || _vastXml$documentElem === void 0 ? void 0 : _vastXml$documentElem.nodeName) === 'VideoAdServingTemplate';
      throw new Error(isNonSupportedVast ? NON_SUPPORTED_VAST_VERSION : INVALID_VAST_ERROR);
    }
    const ads = [];
    const childNodes = vastXml.documentElement.childNodes;

    /* Only parse the version of the Root VAST for now because we don't know yet how to
     * handle some cases like multiple wrappers in the same vast
     */
    const vastVersion = vastXml.documentElement.getAttribute('version');
    if (isRootVAST) {
      if (vastVersion) this.vastVersion = vastVersion;
    }
    // Fill the VASTResponse object with ads and errorURLTemplates
    for (const nodeKey in childNodes) {
      const node = childNodes[nodeKey];
      if (node.nodeName === 'Error') {
        const errorURLTemplate = parserUtils.parseNodeText(node);

        // Distinguish root VAST url templates from ad specific ones
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
        const result = parseAd(node, this.emit.bind(this), {
          allowMultipleAds,
          followAdditionalWrappers
        });
        if (result.ad) {
          ads.push(result.ad);
          this.emit('VAST-ad-parsed', {
            type: result.type,
            url,
            wrapperDepth,
            adIndex: ads.length - 1,
            vastVersion
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
  parse(vastXml) {
    let {
      url = null,
      resolveAll = true,
      wrapperSequence = null,
      previousUrl = null,
      wrapperDepth = 0,
      isRootVAST = false,
      followAdditionalWrappers,
      allowMultipleAds
    } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let ads = [];
    // allowMultipleAds was introduced in VAST 3 as wrapper attribute
    // for retrocompatibility set it to true for vast pre-version 3
    if (this.vastVersion && parseFloat(this.vastVersion) < 3 && isRootVAST) {
      allowMultipleAds = true;
    }
    try {
      ads = this.parseVastXml(vastXml, {
        isRootVAST,
        url,
        wrapperDepth,
        allowMultipleAds,
        followAdditionalWrappers
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
    }

    // Split the VAST in case we don't want to resolve everything at the first time
    if (resolveAll === false) {
      this.remainingAds = parserUtils.splitVAST(ads);
      // Remove the first element from the remaining ads array, since we're going to resolve that element
      ads = this.remainingAds.shift();
    }
    return this.resolveAds(ads, {
      wrapperDepth,
      previousUrl,
      url
    });
  }

  /**
   * Resolves an Array of ads, recursively calling itself with the remaining ads if a no ad
   * response is returned for the given array.
   * @param {Array} ads - An array of ads to resolve
   * @param {Object} options - An options Object containing resolving parameters
   * @return {Promise}
   */
  resolveAds() {
    let ads = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    let {
      wrapperDepth,
      previousUrl,
      url
    } = arguments.length > 1 ? arguments[1] : undefined;
    const resolveWrappersPromises = [];
    previousUrl = url;
    ads.forEach(ad => {
      const resolveWrappersPromise = this.resolveWrappers(ad, wrapperDepth, previousUrl);
      resolveWrappersPromises.push(resolveWrappersPromise);
    });
    return Promise.all(resolveWrappersPromises).then(unwrappedAds => {
      return util.flatten(unwrappedAds);
    });
  }

  /**
   * Resolves the wrappers for the given ad in a recursive way.
   * Returns a Promise which resolves with the unwrapped ad or rejects with an error.
   * @param {Object} adToUnWrap - An ad object to be unwrapped.
   * @param {Number} wrapperDepth - The reached depth in the wrapper resolving chain.
   * @param {String} previousUrl - The previous vast url.
   * @return {Promise}
   */
  resolveWrappers(adToUnWrap, wrapperDepth, previousUrl) {
    // Copy ad from parameters to prevent altering given object outside of function scope
    const ad = {
      ...adToUnWrap
    };
    return new Promise(resolve => {
      var _this$parsingOptions$;
      // Going one level deeper in the wrapper chain
      wrapperDepth++;
      // We already have a resolved VAST ad, no need to resolve wrapper
      if (!ad.nextWrapperURL) {
        delete ad.nextWrapperURL;
        return resolve(ad);
      }
      if (!this.fetcher) {
        ad.VASTAdTagURI = ad.nextWrapperURL;
        delete ad.nextWrapperURL;
        return resolve(ad);
      }
      if (wrapperDepth >= this.maxWrapperDepth) {
        // Wrapper limit reached, as defined by the video player.
        // Too many Wrapper responses have been received with no InLine response.
        ad.errorCode = 302;
        delete ad.nextWrapperURL;
        return resolve(ad);
      }

      // Get full URL
      ad.nextWrapperURL = parserUtils.resolveVastAdTagURI(ad.nextWrapperURL, previousUrl);

      // If allowMultipleAds is set inside the parameter 'option' of public method
      // override the vast value by the one provided
      const allowMultipleAds = (_this$parsingOptions$ = this.parsingOptions.allowMultipleAds) !== null && _this$parsingOptions$ !== void 0 ? _this$parsingOptions$ : ad.allowMultipleAds;
      // sequence doesn't carry over in wrapper element
      const wrapperSequence = ad.sequence;
      this.fetcher.fetchVAST({
        url: ad.nextWrapperURL,
        emitter: this.emit.bind(this),
        maxWrapperDepth: this.maxWrapperDepth
      }).then(xml => {
        return this.parse(xml, {
          url: ad.nextWrapperURL,
          previousUrl,
          wrapperSequence,
          wrapperDepth,
          followAdditionalWrappers: ad.followAdditionalWrappers,
          allowMultipleAds
        }).then(unwrappedAds => {
          delete ad.nextWrapperURL;
          if (unwrappedAds.length === 0) {
            // No ads returned by the wrappedResponse, discard current <Ad><Wrapper> creatives
            ad.creatives = [];
            return resolve(ad);
          }
          unwrappedAds.forEach(unwrappedAd => {
            if (unwrappedAd) {
              parserUtils.mergeWrapperAdData(unwrappedAd, ad);
            }
          });
          resolve(unwrappedAds);
        });
      }).catch(err => {
        // Timeout of VAST URI provided in Wrapper element, or of VAST URI provided in a subsequent Wrapper element.
        // (URI was either unavailable or reached a timeout as defined by the video player)
        ad.errorCode = err.message === NON_SUPPORTED_VAST_VERSION ? 102 : 301;
        ad.errorMessage = err.message;
        resolve(ad);
      });
    });
  }

  /**
   * Takes care of handling errors when the wrappers are resolved.
   * @param {Object} vastResponse - A resolved VASTResponse.
   */
  completeWrapperResolving(vastResponse) {
    // We've to wait for all <Ad> elements to be parsed before handling error so we can:
    // - Send computed extensions data
    // - Ping all <Error> URIs defined across VAST files

    // No Ad case - The parser never bump into an <Ad> element
    if (vastResponse.ads.length === 0) {
      this.trackVastError(vastResponse.errorURLTemplates, {
        ERRORCODE: 303
      });
    } else {
      for (let index = vastResponse.ads.length - 1; index >= 0; index--) {
        // - Error encountered while parsing
        // - No Creative case - The parser has dealt with soma <Ad><Wrapper> or/and an <Ad><Inline> elements
        // but no creative was found
        const ad = vastResponse.ads[index];
        const noMediaFilesAvailable = !ad.creatives.some(creative => {
          var _creative$mediaFiles;
          return ((_creative$mediaFiles = creative.mediaFiles) === null || _creative$mediaFiles === void 0 ? void 0 : _creative$mediaFiles.length) > 0;
        });
        if ((ad.errorCode || noMediaFilesAvailable) && !ad.VASTAdTagURI) {
          // If VASTAdTagURI is in the vastResponse, it means we are dealing with a Wrapper when using parseVAST from the VASTParser.
          // In that case, we dont want to modify the vastResponse since the creatives node is not required in a wrapper.
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
}

let storage = null;

/**
 * This Object represents a default storage to be used in case no other storage is available.
 * @constant
 * @type {Object}
 */
const DEFAULT_STORAGE = {
  data: {},
  length: 0,
  getItem(key) {
    return this.data[key];
  },
  setItem(key, value) {
    this.data[key] = value;
    this.length = Object.keys(this.data).length;
  },
  removeItem(key) {
    delete this.data[key];
    this.length = Object.keys(this.data).length;
  },
  clear() {
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
class Storage {
  /**
   * Creates an instance of Storage.
   * @constructor
   */
  constructor() {
    this.storage = this.initStorage();
  }

  /**
   * Provides a singleton instance of the wrapped storage.
   * @return {Object}
   */
  initStorage() {
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
  isStorageDisabled(testStorage) {
    const testValue = '__VASTStorage__';
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
  getItem(key) {
    return this.storage.getItem(key);
  }

  /**
   * Adds or updates the value for the given key.
   * @param  {String} key - The key to modify the value.
   * @param  {any} value - The value to be associated with the key.
   * @return {any}
   */
  setItem(key, value) {
    return this.storage.setItem(key, value);
  }

  /**
   * Removes an item for the given key.
   * @param  {String} key - The key to remove the value.
   * @return {any}
   */
  removeItem(key) {
    return this.storage.removeItem(key);
  }

  /**
   * Removes all the items from the storage.
   */
  clear() {
    return this.storage.clear();
  }
}

const DEFAULT_TIMEOUT = 120000;

/**
 * Return an object containing an XML document.
 * in addition to the byteLength and the statusCode of the response.
 * @param {Object} response the response of the fetch request.
 * @returns {Object}
 */
async function handleResponse(response) {
  const textXml = await response.text();
  let parser;
  if (!util.isBrowserEnvironment()) {
    const xmlDom = await import('@xmldom/xmldom');
    parser = new xmlDom.DOMParser();
  } else {
    parser = new DOMParser();
  }
  const xml = parser.parseFromString(textXml, 'text/xml');
  return {
    xml,
    details: {
      byteLength: textXml.length,
      statusCode: response.status,
      rawXml: textXml
    }
  };
}

/**
 * Return a custom message if an error occured
 * @param {Object} response The response of fetch request
 * @returns {String | null}
 */
function handleError(response) {
  if (util.isBrowserEnvironment() && window.location.protocol === 'https:' && response.url.includes('http://')) {
    return 'URLHandler: Cannot go from HTTPS to HTTP.';
  }
  if (response.status !== 200 || !response.ok) {
    return "URLHandler: ".concat(response.statusText, " (").concat(response.status, ")");
  }
  return null;
}
async function get(url, options) {
  try {
    // fetch does not have "timeout" option, we are using AbortController
    // to abort the request if it reach the timeout.
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      throw new Error("URLHandler: Request timed out after ".concat(options.timeout || DEFAULT_TIMEOUT, " ms (408)"));
    }, options.timeout || DEFAULT_TIMEOUT);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: options.withCredentials ? 'include' : 'omit'
    }).finally(() => {
      clearTimeout(timer);
    });
    const error = handleError(response);
    if (error) {
      return {
        error: new Error(error),
        statusCode: response.status
      };
    }
    return handleResponse(response);
  } catch (error) {
    return {
      error,
      statusCode: error.name === 'AbortError' ? 408 : null
    };
  }
}
const urlHandler = {
  get
};

/**
 * This class provides a method to fetch a VAST document
 * @exports
 * @class Fetcher
 */

class Fetcher {
  constructor() {
    this.URLTemplateFilters = [];
  }

  /**
   * Inits the fetching properties of the class with the custom values provided as options
   * @param {Object} options - The options to initialize before fetching
   */
  setOptions() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.urlHandler = options.urlHandler || options.urlhandler || urlHandler;
    this.fetchingOptions = {
      timeout: options.timeout || DEFAULT_TIMEOUT,
      withCredentials: Boolean(options.withCredentials)
    };
  }

  /**
   * Adds a filter function to the array of filters which are called before fetching a VAST document.
   * @param  {function} filter - The filter function to be added at the end of the array.
   */
  addURLTemplateFilter(filter) {
    if (typeof filter === 'function') {
      this.URLTemplateFilters.push(filter);
    }
  }

  /**
   * Removes the latest URL template filter added.
   */
  removeLastURLTemplateFilter() {
    this.URLTemplateFilters.pop();
  }

  /**
   * Returns the number of URL template filters added.
   * @return {Number}
   */
  countURLTemplateFilters() {
    return this.URLTemplateFilters.length;
  }

  /**
   * Removes all the URL template filters added.
   */
  clearURLTemplateFilters() {
    this.URLTemplateFilters = [];
  }

  /**
   * Fetches a VAST document for the given url.
   * @param {Object} params
   * @param {String} params.url - The url to request the VAST document.
   * @param {Number} params.wrapperDepth - How many times the current url has been wrapped.
   * @param {(String | null)} params.previousUrl - Url of the previous VAST.
   * @param {Object} params.wrapperAd - Previously parsed ad node (Wrapper) related to this fetching.
   * @param {Number} params.maxWrapperDepth - The maximum number of Wrapper that can be fetch
   * @param {Function} params.emitter - The function used to Emit event
   * @emits  VASTParser#VAST-resolving
   * @emits  VASTParser#VAST-resolved
   * @return {Promise}
   */
  async fetchVAST(_ref) {
    var _data$details;
    let {
      url,
      maxWrapperDepth,
      emitter,
      wrapperDepth = 0,
      previousUrl = null,
      wrapperAd = null
    } = _ref;
    const timeBeforeGet = Date.now();

    // Process url with defined filter
    this.URLTemplateFilters.forEach(filter => {
      url = filter(url);
    });
    emitter('VAST-resolving', {
      url,
      previousUrl,
      wrapperDepth,
      maxWrapperDepth,
      timeout: this.fetchingOptions.timeout,
      wrapperAd
    });
    const data = await this.urlHandler.get(url, this.fetchingOptions);
    const requestDuration = Math.round(Date.now() - timeBeforeGet);
    emitter('VAST-resolved', {
      url,
      previousUrl,
      wrapperDepth,
      error: (data === null || data === void 0 ? void 0 : data.error) || null,
      duration: requestDuration,
      statusCode: (data === null || data === void 0 ? void 0 : data.statusCode) || null,
      ...(data === null || data === void 0 ? void 0 : data.details)
    });
    updateEstimatedBitrate(data === null || data === void 0 || (_data$details = data.details) === null || _data$details === void 0 ? void 0 : _data$details.byteLength, requestDuration);
    if (data.error) {
      throw new Error(data.error);
    } else {
      return data.xml;
    }
  }
}

/**
 * This class provides methods to fetch and parse a VAST document using VASTParser.
 * In addition it provides options to skip consecutive calls based on constraints.
 * @export
 * @class VASTClient
 */
class VASTClient {
  /**
   * Creates an instance of VASTClient.
   * @param  {Number} cappingFreeLunch - The number of first calls to skip.
   * @param  {Number} cappingMinimumTimeInterval - The minimum time interval between two consecutive calls.
   * @param  {Storage} customStorage - A custom storage to use instead of the default one.
   * @constructor
   */
  constructor() {
    let cappingFreeLunch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    let cappingMinimumTimeInterval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    let customStorage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Storage();
    this.cappingFreeLunch = cappingFreeLunch;
    this.cappingMinimumTimeInterval = cappingMinimumTimeInterval;
    this.fetcher = new Fetcher();
    this.vastParser = new VASTParser({
      fetcher: this.fetcher
    });
    this.storage = customStorage;
    // Init values if not already set
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

  /**
   * Adds a filter function to the array of filters which are called before fetching a VAST document.
   * @param  {function} filter - The filter function to be added at the end of the array.
   * @return {void}
   */
  addURLTemplateFilter(filter) {
    this.fetcher.addURLTemplateFilter(filter);
  }

  /**
   * Removes the last element of the url templates filters array.
   * @return {void}
   */
  removeLastURLTemplateFilter() {
    this.fetcher.removeLastURLTemplateFilter();
  }

  /**
   * Returns the number of filters of the url templates filters array.
   * @return {Number}
   */
  countURLTemplateFilters() {
    return this.fetcher.countURLTemplateFilters();
  }

  /**
   * Removes all the filter functions from the url templates filters array.
   * @return {void}
   */
  clearURLTemplateFilters() {
    this.fetcher.clearURLTemplateFilters();
  }
  getParser() {
    return this.vastParser;
  }
  get lastSuccessfulAd() {
    return this.storage.getItem('vast-client-last-successful-ad');
  }
  set lastSuccessfulAd(value) {
    this.storage.setItem('vast-client-last-successful-ad', value);
  }
  get totalCalls() {
    return this.storage.getItem('vast-client-total-calls');
  }
  set totalCalls(value) {
    this.storage.setItem('vast-client-total-calls', value);
  }
  get totalCallsTimeout() {
    return this.storage.getItem('vast-client-total-calls-timeout');
  }
  set totalCallsTimeout(value) {
    this.storage.setItem('vast-client-total-calls-timeout', value);
  }

  /**
   * Returns a boolean indicating if there are more ads to resolve for the current parsing.
   * @return {Boolean}
   */
  hasRemainingAds() {
    return this.vastParser.remainingAds.length > 0;
  }

  /**
   * Resolves the next group of ads. If all is true resolves all the remaining ads.
   * @param  {Boolean} all - If true all the remaining ads are resolved
   * @return {Promise}
   */
  getNextAds(all) {
    return this.vastParser.getRemainingAds(all);
  }

  /**
   * Parses the given xml Object into a VASTResponse.
   * Returns a Promise which resolves with a fully parsed VASTResponse or rejects with an Error.
   * @param {Object} xml - An object representing a vast xml document.
   * @param {Object} options - An optional Object of parameters to be used in the parsing and fetching process.
   * @returns {Promise}
   */
  parseVAST(xml) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    this.fetcher.setOptions(options);
    return this.vastParser.parseVAST(xml, options);
  }
  /**
   * Gets a parsed VAST document for the given url, applying the skipping rules defined.
   * Returns a Promise which resolves with a fully parsed VASTResponse or rejects with an Error.
   * @param  {String} url - The url to use to fecth the VAST document.
   * @param  {Object} options - An optional Object of parameters to be applied in the process.
   * @return {Promise}
   */
  get(url) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const now = Date.now();

    // By default the client resolves only the first Ad or AdPod
    if (!options.hasOwnProperty('resolveAll')) {
      options.resolveAll = false;
    }

    // Check totalCallsTimeout (first call + 1 hour), if older than now,
    // reset totalCalls number, by this way the client will be eligible again
    // for freelunch capping
    if (this.totalCallsTimeout < now) {
      this.totalCalls = 1;
      this.totalCallsTimeout = now + 60 * 60 * 1000;
    } else {
      this.totalCalls++;
    }
    return new Promise((resolve, reject) => {
      if (this.cappingFreeLunch >= this.totalCalls) {
        return reject(new Error("VAST call canceled \u2013 FreeLunch capping not reached yet ".concat(this.totalCalls, "/").concat(this.cappingFreeLunch)));
      }
      const timeSinceLastCall = now - this.lastSuccessfulAd;

      // Check timeSinceLastCall to be a positive number. If not, this mean the
      // previous was made in the future. We reset lastSuccessfulAd value
      if (timeSinceLastCall < 0) {
        this.lastSuccessfulAd = 0;
      } else if (timeSinceLastCall < this.cappingMinimumTimeInterval) {
        return reject(new Error("VAST call canceled \u2013 (".concat(this.cappingMinimumTimeInterval, ")ms minimum interval reached")));
      }
      this.vastParser.initParsingStatus(options);
      this.fetcher.setOptions(options);
      this.vastParser.rootURL = url;
      this.fetcher.fetchVAST({
        url,
        emitter: this.vastParser.emit.bind(this.vastParser),
        maxWrapperDepth: this.vastParser.maxWrapperDepth
      }).then(xml => {
        options.previousUrl = url;
        options.isRootVAST = true;
        options.url = url;
        return this.vastParser.parse(xml, options).then(resolvedAd => {
          const vastResponse = this.vastParser.buildVASTResponse(resolvedAd);
          resolve(vastResponse);
        });
      }).catch(err => reject(err));
    });
  }
}

/**
 * The default skip delay used in case a custom one is not provided
 * @constant
 * @type {Number}
 */
const DEFAULT_SKIP_DELAY = -1;

/**
 * This class provides methods to track an ad execution.
 *
 * @export
 * @class VASTTracker
 * @extends EventEmitter
 */
class VASTTracker extends EventEmitter {
  /**
   * Creates an instance of VASTTracker.
   *
   * @param {VASTClient} client - An instance of VASTClient that can be updated by the tracker. [optional]
   * @param {Ad} ad - The ad to track.
   * @param {Creative} creative - The creative to track.
   * @param {Object} [variation=null] - An optional variation of the creative.
   * @param {Boolean} [muted=false] - The initial muted state of the video.
   * @constructor
   */
  constructor(client, ad, creative) {
    let variation = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    let muted = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    super();
    this.ad = ad;
    this.creative = creative;
    this.variation = variation;
    this.muted = muted;
    this.impressed = false;
    this.skippable = false;
    this.trackingEvents = {};
    // We need to keep the last percentage of the tracker in order to
    // calculate to trigger the events when the VAST duration is short
    this.lastPercentage = 0;
    this._alreadyTriggeredQuartiles = {};
    // Tracker listeners should be notified with some events
    // no matter if there is a tracking URL or not
    this.emitAlwaysEvents = ['creativeView', 'start', 'firstQuartile', 'midpoint', 'thirdQuartile', 'complete', 'resume', 'pause', 'rewind', 'skip', 'closeLinear', 'close'];

    // Duplicate the creative's trackingEvents property so we can alter it
    for (const eventName in this.creative.trackingEvents) {
      const events = this.creative.trackingEvents[eventName];
      this.trackingEvents[eventName] = events.slice(0);
    }

    // Nonlinear and companion creatives provide some tracking information at a variation level
    // While linear creatives provided that at a creative level. That's why we need to
    // differentiate how we retrieve some tracking information.
    if (isCreativeLinear(this.creative)) {
      this._initLinearTracking();
    } else {
      this._initVariationTracking();
    }

    // If the tracker is associated with a client we add a listener to the start event
    // to update the lastSuccessfulAd property.
    if (client) {
      this.on('start', () => {
        client.lastSuccessfulAd = Date.now();
      });
    }
  }

  /**
   * Init the custom tracking options for linear creatives.
   *
   * @return {void}
   */
  _initLinearTracking() {
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
  _initVariationTracking() {
    this.linear = false;
    this.skipDelay = DEFAULT_SKIP_DELAY;

    // If no variation has been provided there's nothing else to set
    if (!this.variation) {
      return;
    }

    // Duplicate the variation's trackingEvents property so we can alter it
    for (const eventName in this.variation.trackingEvents) {
      const events = this.variation.trackingEvents[eventName];

      // If for the given eventName we already had some trackingEvents provided by the creative
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
  setDuration(duration) {
    // check if duration is a valid time input
    if (!util.isValidTimeValue(duration)) {
      this.emit('TRACKER-error', {
        message: "the duration provided is not valid. duration: ".concat(duration)
      });
      return;
    }
    this.assetDuration = duration;
    // beware of key names, theses are also used as event names
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
  setProgress(progress) {
    let macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let trackOnce = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    // check if progress is a valid time input
    if (!util.isValidTimeValue(progress) || typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "One given setProgress parameter has the wrong type. progress: ".concat(progress, ", macros: ").concat(util.formatMacrosValues(macros))
      });
      return;
    }
    const skipDelay = this.skipDelay || DEFAULT_SKIP_DELAY;
    if (skipDelay !== -1 && !this.skippable) {
      if (skipDelay > progress) {
        this.emit('skip-countdown', skipDelay - progress);
      } else {
        this.skippable = true;
        this.emit('skip-countdown', 0);
      }
    }
    if (this.assetDuration > 0) {
      const percent = Math.round(progress / this.assetDuration * 100);
      const events = [];
      if (progress > 0) {
        events.push('start');
        for (let i = this.lastPercentage; i < percent; i++) {
          events.push("progress-".concat(i + 1, "%"));
        }
        events.push("progress-".concat(Math.round(progress)));
        for (const quartile in this.quartiles) {
          if (this.isQuartileReached(quartile, this.quartiles[quartile], progress)) {
            events.push(quartile);
            this._alreadyTriggeredQuartiles[quartile] = true;
          }
        }
        this.lastPercentage = percent;
      }
      events.forEach(eventName => {
        this.track(eventName, {
          macros,
          once: trackOnce
        });
      });
      if (progress < this.progress) {
        this.track('rewind', {
          macros
        });
      }
    }
    this.progress = progress;
  }

  /**
   * Checks if a quartile has been reached without have being triggered already.
   *
   * @param {String} quartile - Quartile name
   * @param {Number} time - Time offset of the quartile, when this quartile is reached in seconds.
   * @param {Number} progress - Current progress of the ads in seconds.
   *
   * @return {Boolean}
   */
  isQuartileReached(quartile, time, progress) {
    let quartileReached = false;
    // if quartile time already reached and never triggered
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
  setMuted(muted) {
    let macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (typeof muted !== 'boolean' || typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "One given setMuted parameter has the wrong type. muted: ".concat(muted, ", macros: ").concat(util.formatMacrosValues(macros))
      });
      return;
    }
    if (this.muted !== muted) {
      this.track(muted ? 'mute' : 'unmute', {
        macros
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
  setPaused(paused) {
    let macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (typeof paused !== 'boolean' || typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "One given setPaused parameter has the wrong type. paused: ".concat(paused, ", macros: ").concat(util.formatMacrosValues(macros))
      });
      return;
    }
    if (this.paused !== paused) {
      this.track(paused ? 'pause' : 'resume', {
        macros
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
  setFullscreen(fullscreen) {
    let macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (typeof fullscreen !== 'boolean' || typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "One given setFullScreen parameter has the wrong type. fullscreen: ".concat(fullscreen, ", macros: ").concat(util.formatMacrosValues(macros))
      });
      return;
    }
    if (this.fullscreen !== fullscreen) {
      this.track(fullscreen ? 'fullscreen' : 'exitFullscreen', {
        macros
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
  setExpand(expanded) {
    let macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (typeof expanded !== 'boolean' || typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "One given setExpand parameter has the wrong type. expanded: ".concat(expanded, ", macros: ").concat(util.formatMacrosValues(macros))
      });
      return;
    }
    if (this.expanded !== expanded) {
      this.track(expanded ? 'expand' : 'collapse', {
        macros
      });
      this.track(expanded ? 'playerExpand' : 'playerCollapse', {
        macros
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
  setSkipDelay(duration) {
    if (!util.isValidTimeValue(duration)) {
      this.emit('TRACKER-error', {
        message: "setSkipDelay parameter does not have a valid value. duration: ".concat(duration)
      });
      return;
    }
    this.skipDelay = duration;
  }

  /**
   * Tracks an impression (can be called only once).
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#creativeView
   */
  trackImpression() {
    let macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "trackImpression parameter has the wrong type. macros: ".concat(macros)
      });
      return;
    }
    if (!this.impressed) {
      this.impressed = true;
      this.trackURLs(this.ad.impressionURLTemplates, macros);
      this.track('creativeView', {
        macros
      });
    }
  }

  /**
   * Tracks Viewable impression
   * @param {Object} [macros = {}] An optional Object containing macros and their values to be used and replaced in the tracking calls.
   */
  trackViewableImpression() {
    let macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "trackViewableImpression given macros has the wrong type. macros: ".concat(macros)
      });
      return;
    }
    this.ad.viewableImpression.forEach(impression => {
      this.trackURLs(impression.viewable, macros);
    });
  }

  /**
   * Tracks NotViewable impression
   * @param {Object} [macros = {}] An optional Object containing macros and their values to be used and replaced in the tracking calls.
   */

  trackNotViewableImpression() {
    let macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "trackNotViewableImpression given macros has the wrong type. macros: ".concat(macros)
      });
      return;
    }
    this.ad.viewableImpression.forEach(impression => {
      this.trackURLs(impression.notViewable, macros);
    });
  }

  /**
   * Tracks ViewUndetermined impression
   * @param {Object} [macros = {}] An optional Object containing macros and their values to be used and replaced in the tracking calls.
   */
  trackUndeterminedImpression() {
    let macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "trackUndeterminedImpression given macros has the wrong type. macros: ".concat(macros)
      });
      return;
    }
    this.ad.viewableImpression.forEach(impression => {
      this.trackURLs(impression.viewUndetermined, macros);
    });
  }

  /**
   * Send a request to the URI provided by the VAST <Error> element.
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @param {Boolean} [isCustomCode=false] - Flag to allow custom values on error code.
   */
  error() {
    let macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    let isCustomCode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (typeof macros !== 'object' || typeof isCustomCode !== 'boolean') {
      this.emit('TRACKER-error', {
        message: "One given error parameter has the wrong type. macros: ".concat(util.formatMacrosValues(macros), ", isCustomCode: ").concat(isCustomCode)
      });
      return;
    }
    this.trackURLs(this.ad.errorURLTemplates, macros, {
      isCustomCode
    });
  }

  /**
   * Send a request to the URI provided by the VAST <Error> element.
   * If an [ERRORCODE] macro is included, it will be substitute with errorCode.
   * @deprecated
   * @param {String} errorCode - Replaces [ERRORCODE] macro. [ERRORCODE] values are listed in the VAST specification.
   * @param {Boolean} [isCustomCode=false] - Flag to allow custom values on error code.
   */
  errorWithCode(errorCode) {
    let isCustomCode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (typeof errorCode !== 'string' || typeof isCustomCode !== 'boolean') {
      this.emit('TRACKER-error', {
        message: "One given errorWithCode parameter has the wrong type. errorCode: ".concat(errorCode, ", isCustomCode: ").concat(isCustomCode)
      });
      return;
    }
    this.error({
      ERRORCODE: errorCode
    }, isCustomCode);
    //eslint-disable-next-line
    console.log('The method errorWithCode is deprecated, please use vast tracker error method instead');
  }

  /**
   * Must be called when the user watched the linear creative until its end.
   * Calls the complete tracking URLs.
   *
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#complete
   */
  complete() {
    let macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "complete given macros has the wrong type. macros: ".concat(macros)
      });
      return;
    }
    this.track('complete', {
      macros
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
  notUsed() {
    let macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "notUsed given macros has the wrong type. macros: ".concat(macros)
      });
      return;
    }
    this.track('notUsed', {
      macros
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
  otherAdInteraction() {
    let macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "otherAdInteraction given macros has the wrong type. macros: ".concat(macros)
      });
      return;
    }
    this.track('otherAdInteraction', {
      macros
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
  acceptInvitation() {
    let macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "acceptInvitation given macros has the wrong type. macros: ".concat(macros)
      });
      return;
    }
    this.track('acceptInvitation', {
      macros
    });
  }

  /**
   * Must be called if user activated a control to expand the creative.
   * Calls the adExpand tracking URLs.
   *
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#adExpand
   */
  adExpand() {
    let macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "adExpand given macros has the wrong type. macros: ".concat(macros)
      });
      return;
    }
    this.track('adExpand', {
      macros
    });
  }

  /**
   * Must be called when the user activated a control to reduce the creative to its original dimensions.
   * Calls the adCollapse tracking URLs.
   *
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#adCollapse
   */
  adCollapse() {
    let macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "adCollapse given macros has the wrong type. macros: ".concat(macros)
      });
      return;
    }
    this.track('adCollapse', {
      macros
    });
  }

  /**
   * Must be called if the user clicked or otherwise activated a control used to minimize the ad.
   * Calls the minimize tracking URLs.
   *
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#minimize
   */
  minimize() {
    let macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "minimize given macros has the wrong type. macros: ".concat(macros)
      });
      return;
    }
    this.track('minimize', {
      macros
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
  verificationNotExecuted(vendor) {
    let macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (typeof vendor !== 'string' || typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "One given verificationNotExecuted parameter has to wrong type. vendor: ".concat(vendor, ", macros: ").concat(util.formatMacrosValues(macros))
      });
      return;
    }
    if (!this.ad || !this.ad.adVerifications || !this.ad.adVerifications.length) {
      throw new Error('No adVerifications provided');
    }
    if (!vendor) {
      throw new Error('No vendor provided, unable to find associated verificationNotExecuted');
    }
    const vendorVerification = this.ad.adVerifications.find(verifications => verifications.vendor === vendor);
    if (!vendorVerification) {
      throw new Error("No associated verification element found for vendor: ".concat(vendor));
    }
    const vendorTracking = vendorVerification.trackingEvents;
    if (vendorTracking && vendorTracking.verificationNotExecuted) {
      const verifsNotExecuted = vendorTracking.verificationNotExecuted;
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
   * @param {String} formattedDuration - The time that the initial ad is displayed.
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#overlayViewDuration
   */
  overlayViewDuration(formattedDuration) {
    let macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (typeof formattedDuration !== 'string' || typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "One given overlayViewDuration parameters has the wrong type. formattedDuration: ".concat(formattedDuration, ", macros: ").concat(util.formatMacrosValues(macros))
      });
      return;
    }
    macros['ADPLAYHEAD'] = formattedDuration;
    this.track('overlayViewDuration', {
      macros
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
  close() {
    let macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "close given macros has the wrong type. macros: ".concat(macros)
      });
      return;
    }
    this.track(this.linear ? 'closeLinear' : 'close', {
      macros
    });
  }

  /**
   * Must be called when the skip button is clicked. Calls the skip tracking URLs.
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   *
   * @emits VASTTracker#skip
   */
  skip() {
    let macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "skip given macros has the wrong type. macros: ".concat(macros)
      });
      return;
    }
    this.track('skip', {
      macros
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
  load() {
    let macros = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "load given macros has the wrong type. macros: ".concat(macros)
      });
      return;
    }
    this.track('loaded', {
      macros
    });
  }

  /**
   * Must be called when the user clicks on the creative.
   * It calls the tracking URLs and emits a 'clickthrough' event with the resolved
   * clickthrough URL when done.
   *
   * @param {?String} [fallbackClickThroughURL=null] - an optional clickThroughURL template that could be used as a fallback
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#clickthrough
   */
  click() {
    let fallbackClickThroughURL = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    let macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (fallbackClickThroughURL !== null && typeof fallbackClickThroughURL !== 'string' || typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "One given click parameter has the wrong type. fallbackClickThroughURL: ".concat(fallbackClickThroughURL, ", macros: ").concat(util.formatMacrosValues(macros))
      });
      return;
    }
    if (this.clickTrackingURLTemplates && this.clickTrackingURLTemplates.length) {
      this.trackURLs(this.clickTrackingURLTemplates, macros);
    }

    // Use the provided fallbackClickThroughURL as a fallback
    const clickThroughURLTemplate = this.clickThroughURLTemplate || fallbackClickThroughURL;
    // clone second usage of macros, which get mutated inside resolveURLTemplates
    const clonedMacros = {
      ...macros
    };
    if (clickThroughURLTemplate) {
      if (this.progress) {
        clonedMacros['ADPLAYHEAD'] = this.progressFormatted();
      }
      const clickThroughURL = util.resolveURLTemplates([clickThroughURLTemplate], clonedMacros)[0];
      this.emit('clickthrough', clickThroughURL);
    }
  }

  /**
   * Calls the tracking URLs for the given eventName and emits the event.
   *
   * @param {String} eventName - The name of the event.
   * @param {Object} options
   * @param {Object} [options.macros={}] - An optional Object of parameters(vast macros) to be used in the tracking calls.
   * @param {Boolean} [options.once=false] - Boolean to define if the event has to be tracked only once.
   *
   */
  track(eventName) {
    let {
      macros = {},
      once = false
    } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (typeof macros !== 'object') {
      this.emit('TRACKER-error', {
        message: "track given macros has the wrong type. macros: ".concat(macros)
      });
      return;
    }
    // closeLinear event was introduced in VAST 3.0
    // Fallback to vast 2.0 close event if necessary
    if (eventName === 'closeLinear' && !this.trackingEvents[eventName] && this.trackingEvents['close']) {
      eventName = 'close';
    }
    const trackingURLTemplates = this.trackingEvents[eventName];
    const isAlwaysEmitEvent = this.emitAlwaysEvents.indexOf(eventName) > -1;
    if (trackingURLTemplates) {
      this.emit(eventName, {
        trackingURLTemplates
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
  trackURLs(URLTemplates) {
    var _this$creative;
    let macros = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    const {
      validUrls,
      invalidUrls
    } = util.filterUrlTemplates(URLTemplates);
    if (invalidUrls.length) {
      this.emit('TRACKER-error', {
        message: "Provided urls are malformed. url: ".concat(invalidUrls)
      });
    }

    //Avoid mutating the object received in parameters.
    const givenMacros = {
      ...macros
    };
    if (this.linear) {
      if (this.creative && this.creative.mediaFiles && this.creative.mediaFiles[0] && this.creative.mediaFiles[0].fileURL) {
        givenMacros['ASSETURI'] = this.creative.mediaFiles[0].fileURL;
      }
      if (this.progress) {
        givenMacros['ADPLAYHEAD'] = this.progressFormatted();
      }
    }
    if ((_this$creative = this.creative) !== null && _this$creative !== void 0 && (_this$creative = _this$creative.universalAdIds) !== null && _this$creative !== void 0 && _this$creative.length) {
      givenMacros['UNIVERSALADID'] = this.creative.universalAdIds.map(universalAdId => universalAdId.idRegistry.concat(' ', universalAdId.value)).join(',');
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
        givenMacros['ADCATEGORIES'] = this.ad.categories.map(category => category.value).join(',');
      }
      if (this.ad.blockedAdCategories && this.ad.blockedAdCategories.length) {
        givenMacros['BLOCKEDADCATEGORIES'] = this.ad.blockedAdCategories.map(blockedCategorie => blockedCategorie.value).join(',');
      }
    }
    util.track(validUrls, givenMacros, options);
  }

  /**
   * Formats time in seconds to VAST timecode (e.g. 00:00:10.000)
   *
   * @param {Number} timeInSeconds - Number in seconds
   * @return {String}
   */
  convertToTimecode(timeInSeconds) {
    if (!util.isValidTimeValue(timeInSeconds)) {
      return '';
    }
    const progress = timeInSeconds * 1000;
    const hours = Math.floor(progress / (60 * 60 * 1000));
    const minutes = Math.floor(progress / (60 * 1000) % 60);
    const seconds = Math.floor(progress / 1000 % 60);
    const milliseconds = Math.floor(progress % 1000);
    return "".concat(util.addLeadingZeros(hours, 2), ":").concat(util.addLeadingZeros(minutes, 2), ":").concat(util.addLeadingZeros(seconds, 2), ".").concat(util.addLeadingZeros(milliseconds, 3));
  }

  /**
   * Formats time progress in a readable string.
   *
   * @return {String}
   */
  progressFormatted() {
    return this.convertToTimecode(this.progress);
  }
}

export { VASTClient, VASTParser, VASTTracker, parseDuration };
