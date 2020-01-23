var VAST = (function (exports) {
  'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var Ad = function Ad() {
    classCallCheck(this, Ad);

    this.id = null;
    this.sequence = null;
    this.system = null;
    this.title = null;
    this.description = null;
    this.advertiser = null;
    this.pricing = null;
    this.survey = null;
    this.errorURLTemplates = [];
    this.impressionURLTemplates = [];
    this.creatives = [];
    this.extensions = [];
  };

  var AdExtension = function AdExtension() {
    classCallCheck(this, AdExtension);

    this.name = null;
    this.value = null;
    this.attributes = {};
    this.children = [];
  };

  var CompanionAd = function CompanionAd() {
    classCallCheck(this, CompanionAd);

    this.id = null;
    this.width = 0;
    this.height = 0;
    this.type = null;
    this.staticResource = null;
    this.htmlResource = null;
    this.iframeResource = null;
    this.altText = null;
    this.companionClickThroughURLTemplate = null;
    this.companionClickTrackingURLTemplates = [];
    this.trackingEvents = {};
  };

  var Creative = function Creative() {
    var creativeAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, Creative);

    this.id = creativeAttributes.id || null;
    this.adId = creativeAttributes.adId || null;
    this.sequence = creativeAttributes.sequence || null;
    this.apiFramework = creativeAttributes.apiFramework || null;
    this.trackingEvents = {};
  };

  var CreativeCompanion = function (_Creative) {
    inherits(CreativeCompanion, _Creative);

    function CreativeCompanion() {
      var creativeAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      classCallCheck(this, CreativeCompanion);

      var _this = possibleConstructorReturn(this, (CreativeCompanion.__proto__ || Object.getPrototypeOf(CreativeCompanion)).call(this, creativeAttributes));

      _this.type = 'companion';
      _this.variations = [];
      return _this;
    }

    return CreativeCompanion;
  }(Creative);

  function track(URLTemplates, variables, options) {
    var URLs = resolveURLTemplates(URLTemplates, variables, options);

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
   * @param {Object} [variables={}] - An optional Object of parameters to be used in the tracking calls.
   * @param {Object} [options={}] - An optional Object of options to be used in the tracking calls.
   */
  function resolveURLTemplates(URLTemplates) {
    var variables = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var URLs = [];

    // Encode String variables, when given
    if (variables['ASSETURI']) {
      variables['ASSETURI'] = encodeURIComponentRFC3986(variables['ASSETURI']);
    }
    if (variables['CONTENTPLAYHEAD']) {
      variables['CONTENTPLAYHEAD'] = encodeURIComponentRFC3986(variables['CONTENTPLAYHEAD']);
    }

    // Set default value for invalid ERRORCODE
    if (variables['ERRORCODE'] && !options.isCustomCode && !/^[0-9]{3}$/.test(variables['ERRORCODE'])) {
      variables['ERRORCODE'] = 900;
    }

    // Calc random/time based macros
    variables['CACHEBUSTING'] = leftpad(Math.round(Math.random() * 1.0e8).toString());
    variables['TIMESTAMP'] = encodeURIComponentRFC3986(new Date().toISOString());

    // RANDOM/random is not defined in VAST 3/4 as a valid macro tho it's used by some adServer (Auditude)
    variables['RANDOM'] = variables['random'] = variables['CACHEBUSTING'];

    for (var URLTemplateKey in URLTemplates) {
      var resolveURL = URLTemplates[URLTemplateKey];

      if (typeof resolveURL !== 'string') {
        continue;
      }

      for (var key in variables) {
        var value = variables[key];
        var macro1 = '[' + key + ']';
        var macro2 = '%%' + key + '%%';
        resolveURL = resolveURL.replace(macro1, value);
        resolveURL = resolveURL.replace(macro2, value);
      }
      URLs.push(resolveURL);
    }

    return URLs;
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
  function encodeURIComponentRFC3986(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
  }

  function leftpad(str) {
    if (str.length < 8) {
      return range(0, 8 - str.length, false).map(function () {
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

  var util = {
    track: track,
    resolveURLTemplates: resolveURLTemplates,
    encodeURIComponentRFC3986: encodeURIComponentRFC3986,
    leftpad: leftpad,
    range: range,
    isNumeric: isNumeric,
    flatten: flatten
  };

  /**
   * This module provides support methods to the parsing classes.
   */

  /**
   * Returns the first element of the given node which nodeName matches the given name.
   * @param  {Object} node - The node to use to find a match.
   * @param  {String} name - The name to look for.
   * @return {Object}
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
   * @param  {any} node - The node to use to find the matches.
   * @param  {any} name - The name to look for.
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

      return '' + protocol + vastAdTagUrl;
    }

    if (vastAdTagUrl.indexOf('://') === -1) {
      // Resolve relative URLs (mainly for unit testing)
      var baseURL = originalUrl.slice(0, originalUrl.lastIndexOf('/'));
      return baseURL + '/' + vastAdTagUrl;
    }

    return vastAdTagUrl;
  }

  /**
   * Converts a boolean string into a Boolean.
   * @param  {String} booleanString - The boolean string to convert.
   * @return {Boolean}
   */
  function parseBoolean(booleanString) {
    return ['true', 'TRUE', '1'].indexOf(booleanString) !== -1;
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

    var durationComponents = durationString.split(':');
    if (durationComponents.length !== 3) {
      return -1;
    }

    var secondsAndMS = durationComponents[2].split('.');
    var seconds = parseInt(secondsAndMS[0]);
    if (secondsAndMS.length === 2) {
      seconds += parseFloat('0.' + secondsAndMS[1]);
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
      }
      // The current Ad may be the next Ad of an AdPod
      if (ad.sequence > 1) {
        var lastAd = ads[i - 1];
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
   * Merges the data between an unwrapped ad and his wrapper.
   * @param  {Ad} unwrappedAd - The 'unwrapped' Ad.
   * @param  {Ad} wrapper - The wrapper Ad.
   * @return {void}
   */
  function mergeWrapperAdData(unwrappedAd, wrapper) {
    unwrappedAd.errorURLTemplates = wrapper.errorURLTemplates.concat(unwrappedAd.errorURLTemplates);
    unwrappedAd.impressionURLTemplates = wrapper.impressionURLTemplates.concat(unwrappedAd.impressionURLTemplates);
    unwrappedAd.extensions = wrapper.extensions.concat(unwrappedAd.extensions);

    unwrappedAd.creatives.forEach(function (creative) {
      if (wrapper.trackingEvents && wrapper.trackingEvents[creative.type]) {
        for (var eventName in wrapper.trackingEvents[creative.type]) {
          var urls = wrapper.trackingEvents[creative.type][eventName];
          if (!Array.isArray(creative.trackingEvents[eventName])) {
            creative.trackingEvents[eventName] = [];
          }
          creative.trackingEvents[eventName] = creative.trackingEvents[eventName].concat(urls);
        }
      }
    });

    if (wrapper.videoClickTrackingURLTemplates && wrapper.videoClickTrackingURLTemplates.length) {
      unwrappedAd.creatives.forEach(function (creative) {
        if (creative.type === 'linear') {
          creative.videoClickTrackingURLTemplates = creative.videoClickTrackingURLTemplates.concat(wrapper.videoClickTrackingURLTemplates);
        }
      });
    }

    if (wrapper.videoCustomClickURLTemplates && wrapper.videoCustomClickURLTemplates.length) {
      unwrappedAd.creatives.forEach(function (creative) {
        if (creative.type === 'linear') {
          creative.videoCustomClickURLTemplates = creative.videoCustomClickURLTemplates.concat(wrapper.videoCustomClickURLTemplates);
        }
      });
    }

    // VAST 2.0 support - Use Wrapper/linear/clickThrough when Inline/Linear/clickThrough is null
    if (wrapper.videoClickThroughURLTemplate) {
      unwrappedAd.creatives.forEach(function (creative) {
        if (creative.type === 'linear' && (creative.videoClickThroughURLTemplate === null || typeof creative.videoClickThroughURLTemplate === 'undefined')) {
          creative.videoClickThroughURLTemplate = wrapper.videoClickThroughURLTemplate;
        }
      });
    }
  }

  var parserUtils = {
    childByName: childByName,
    childrenByName: childrenByName,
    resolveVastAdTagURI: resolveVastAdTagURI,
    parseBoolean: parseBoolean,
    parseNodeText: parseNodeText,
    copyNodeAttribute: copyNodeAttribute,
    parseDuration: parseDuration,
    splitVAST: splitVAST,
    mergeWrapperAdData: mergeWrapperAdData
  };

  /**
   * This module provides methods to parse a VAST CompanionAd Element.
   */

  /**
   * Parses a CompanionAd.
   * @param  {Object} creativeElement - The VAST CompanionAd element to parse.
   * @param  {Object} creativeAttributes - The attributes of the CompanionAd (optional).
   * @return {CreativeCompanion}
   */
  function parseCreativeCompanion(creativeElement, creativeAttributes) {
    var creative = new CreativeCompanion(creativeAttributes);

    parserUtils.childrenByName(creativeElement, 'Companion').forEach(function (companionResource) {
      var companionAd = new CompanionAd();
      companionAd.id = companionResource.getAttribute('id') || null;
      companionAd.width = companionResource.getAttribute('width');
      companionAd.height = companionResource.getAttribute('height');
      companionAd.companionClickTrackingURLTemplates = [];

      parserUtils.childrenByName(companionResource, 'HTMLResource').forEach(function (htmlElement) {
        companionAd.type = htmlElement.getAttribute('creativeType') || 'text/html';
        companionAd.htmlResource = parserUtils.parseNodeText(htmlElement);
      });

      parserUtils.childrenByName(companionResource, 'IFrameResource').forEach(function (iframeElement) {
        companionAd.type = iframeElement.getAttribute('creativeType') || 0;
        companionAd.iframeResource = parserUtils.parseNodeText(iframeElement);
      });

      parserUtils.childrenByName(companionResource, 'StaticResource').forEach(function (staticElement) {
        companionAd.type = staticElement.getAttribute('creativeType') || 0;

        parserUtils.childrenByName(companionResource, 'AltText').forEach(function (child) {
          companionAd.altText = parserUtils.parseNodeText(child);
        });

        companionAd.staticResource = parserUtils.parseNodeText(staticElement);
      });

      parserUtils.childrenByName(companionResource, 'TrackingEvents').forEach(function (trackingEventsElement) {
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
      });

      parserUtils.childrenByName(companionResource, 'CompanionClickTracking').forEach(function (clickTrackingElement) {
        companionAd.companionClickTrackingURLTemplates.push(parserUtils.parseNodeText(clickTrackingElement));
      });

      companionAd.companionClickThroughURLTemplate = parserUtils.parseNodeText(parserUtils.childByName(companionResource, 'CompanionClickThrough'));
      companionAd.companionClickTrackingURLTemplate = parserUtils.parseNodeText(parserUtils.childByName(companionResource, 'CompanionClickTracking'));
      creative.variations.push(companionAd);
    });

    return creative;
  }

  var CreativeLinear = function (_Creative) {
    inherits(CreativeLinear, _Creative);

    function CreativeLinear() {
      var creativeAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      classCallCheck(this, CreativeLinear);

      var _this = possibleConstructorReturn(this, (CreativeLinear.__proto__ || Object.getPrototypeOf(CreativeLinear)).call(this, creativeAttributes));

      _this.type = 'linear';
      _this.duration = 0;
      _this.skipDelay = null;
      _this.mediaFiles = [];
      _this.videoClickThroughURLTemplate = null;
      _this.videoClickTrackingURLTemplates = [];
      _this.videoCustomClickURLTemplates = [];
      _this.adParameters = null;
      _this.icons = [];
      return _this;
    }

    return CreativeLinear;
  }(Creative);

  var Icon = function Icon() {
    classCallCheck(this, Icon);

    this.program = null;
    this.height = 0;
    this.width = 0;
    this.xPosition = 0;
    this.yPosition = 0;
    this.apiFramework = null;
    this.offset = null;
    this.duration = 0;
    this.type = null;
    this.staticResource = null;
    this.htmlResource = null;
    this.iframeResource = null;
    this.iconClickThroughURLTemplate = null;
    this.iconClickTrackingURLTemplates = [];
    this.iconViewTrackingURLTemplate = null;
  };

  var MediaFile = function MediaFile() {
    classCallCheck(this, MediaFile);

    this.id = null;
    this.fileURL = null;
    this.deliveryType = 'progressive';
    this.mimeType = null;
    this.codec = null;
    this.bitrate = 0;
    this.minBitrate = 0;
    this.maxBitrate = 0;
    this.width = 0;
    this.height = 0;
    this.apiFramework = null;
    this.scalable = null;
    this.maintainAspectRatio = null;
  };

  /**
   * This module provides methods to parse a VAST Linear Element.
   */

  /**
   * Parses a Linear element.
   * @param  {Object} creativeElement - The VAST Linear element to parse.
   * @param  {any} creativeAttributes - The attributes of the Linear (optional).
   * @return {CreativeLinear}
   */
  function parseCreativeLinear(creativeElement, creativeAttributes) {
    var offset = void 0;
    var creative = new CreativeLinear(creativeAttributes);

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
      creative.videoClickThroughURLTemplate = parserUtils.parseNodeText(parserUtils.childByName(videoClicksElement, 'ClickThrough'));

      parserUtils.childrenByName(videoClicksElement, 'ClickTracking').forEach(function (clickTrackingElement) {
        creative.videoClickTrackingURLTemplates.push(parserUtils.parseNodeText(clickTrackingElement));
      });

      parserUtils.childrenByName(videoClicksElement, 'CustomClick').forEach(function (customClickElement) {
        creative.videoCustomClickURLTemplates.push(parserUtils.parseNodeText(customClickElement));
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
              eventName = 'progress-' + offset;
            } else {
              eventName = 'progress-' + Math.round(parserUtils.parseDuration(offset));
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
        var mediaFile = new MediaFile();
        mediaFile.id = mediaFileElement.getAttribute('id');
        mediaFile.fileURL = parserUtils.parseNodeText(mediaFileElement);
        mediaFile.deliveryType = mediaFileElement.getAttribute('delivery');
        mediaFile.codec = mediaFileElement.getAttribute('codec');
        mediaFile.mimeType = mediaFileElement.getAttribute('type');
        mediaFile.apiFramework = mediaFileElement.getAttribute('apiFramework');
        mediaFile.bitrate = parseInt(mediaFileElement.getAttribute('bitrate') || 0);
        mediaFile.minBitrate = parseInt(mediaFileElement.getAttribute('minBitrate') || 0);
        mediaFile.maxBitrate = parseInt(mediaFileElement.getAttribute('maxBitrate') || 0);
        mediaFile.width = parseInt(mediaFileElement.getAttribute('width') || 0);
        mediaFile.height = parseInt(mediaFileElement.getAttribute('height') || 0);

        var scalable = mediaFileElement.getAttribute('scalable');
        if (scalable && typeof scalable === 'string') {
          scalable = scalable.toLowerCase();
          if (scalable === 'true') {
            mediaFile.scalable = true;
          } else if (scalable === 'false') {
            mediaFile.scalable = false;
          }
        }

        var maintainAspectRatio = mediaFileElement.getAttribute('maintainAspectRatio');
        if (maintainAspectRatio && typeof maintainAspectRatio === 'string') {
          maintainAspectRatio = maintainAspectRatio.toLowerCase();
          if (maintainAspectRatio === 'true') {
            mediaFile.maintainAspectRatio = true;
          } else if (maintainAspectRatio === 'false') {
            mediaFile.maintainAspectRatio = false;
          }
        }

        creative.mediaFiles.push(mediaFile);
      });
    });

    var iconsElement = parserUtils.childByName(creativeElement, 'Icons');
    if (iconsElement) {
      parserUtils.childrenByName(iconsElement, 'Icon').forEach(function (iconElement) {
        var icon = new Icon();
        icon.program = iconElement.getAttribute('program');
        icon.height = parseInt(iconElement.getAttribute('height') || 0);
        icon.width = parseInt(iconElement.getAttribute('width') || 0);
        icon.xPosition = parseXPosition(iconElement.getAttribute('xPosition'));
        icon.yPosition = parseYPosition(iconElement.getAttribute('yPosition'));
        icon.apiFramework = iconElement.getAttribute('apiFramework');
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
            icon.iconClickTrackingURLTemplates.push(parserUtils.parseNodeText(iconClickTrackingElement));
          });
        }

        icon.iconViewTrackingURLTemplate = parserUtils.parseNodeText(parserUtils.childByName(iconElement, 'IconViewTracking'));

        creative.icons.push(icon);
      });
    }

    return creative;
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

  var CreativeNonLinear = function (_Creative) {
    inherits(CreativeNonLinear, _Creative);

    function CreativeNonLinear() {
      var creativeAttributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      classCallCheck(this, CreativeNonLinear);

      var _this = possibleConstructorReturn(this, (CreativeNonLinear.__proto__ || Object.getPrototypeOf(CreativeNonLinear)).call(this, creativeAttributes));

      _this.type = 'nonlinear';
      _this.variations = [];
      return _this;
    }

    return CreativeNonLinear;
  }(Creative);

  var NonLinearAd = function NonLinearAd() {
    classCallCheck(this, NonLinearAd);

    this.id = null;
    this.width = 0;
    this.height = 0;
    this.expandedWidth = 0;
    this.expandedHeight = 0;
    this.scalable = true;
    this.maintainAspectRatio = true;
    this.minSuggestedDuration = 0;
    this.apiFramework = 'static';
    this.type = null;
    this.staticResource = null;
    this.htmlResource = null;
    this.iframeResource = null;
    this.nonlinearClickThroughURLTemplate = null;
    this.nonlinearClickTrackingURLTemplates = [];
    this.adParameters = null;
  };

  /**
   * This module provides methods to parse a VAST NonLinear Element.
   */

  /**
   * Parses a NonLinear element.
   * @param  {any} creativeElement - The VAST NonLinear element to parse.
   * @param  {any} creativeAttributes - The attributes of the NonLinear (optional).
   * @return {CreativeNonLinear}
   */
  function parseCreativeNonLinear(creativeElement, creativeAttributes) {
    var creative = new CreativeNonLinear(creativeAttributes);

    parserUtils.childrenByName(creativeElement, 'TrackingEvents').forEach(function (trackingEventsElement) {
      var eventName = void 0,
          trackingURLTemplate = void 0;
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
      var nonlinearAd = new NonLinearAd();
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
        nonlinearAd.nonlinearClickTrackingURLTemplates.push(parserUtils.parseNodeText(clickTrackingElement));
      });

      creative.variations.push(nonlinearAd);
    });

    return creative;
  }

  /**
   * This module provides methods to parse a VAST Ad Element.
   */

  /**
   * Parses an Ad element (can either be a Wrapper or an InLine).
   * @param  {Object} adElement - The VAST Ad element to parse.
   * @return {Ad}
   */
  function parseAd(adElement) {
    var childNodes = adElement.childNodes;

    for (var adTypeElementKey in childNodes) {
      var adTypeElement = childNodes[adTypeElementKey];

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
    var childNodes = inLineElement.childNodes;
    var ad = new Ad();
    ad.id = inLineElement.getAttribute('id') || null;
    ad.sequence = inLineElement.getAttribute('sequence') || null;

    for (var nodeKey in childNodes) {
      var node = childNodes[nodeKey];

      switch (node.nodeName) {
        case 'Error':
          ad.errorURLTemplates.push(parserUtils.parseNodeText(node));
          break;

        case 'Impression':
          ad.impressionURLTemplates.push(parserUtils.parseNodeText(node));
          break;

        case 'Creatives':
          parserUtils.childrenByName(node, 'Creative').forEach(function (creativeElement) {
            var creativeAttributes = {
              id: creativeElement.getAttribute('id') || null,
              adId: parseCreativeAdIdAttribute(creativeElement),
              sequence: creativeElement.getAttribute('sequence') || null,
              apiFramework: creativeElement.getAttribute('apiFramework') || null
            };

            for (var creativeTypeElementKey in creativeElement.childNodes) {
              var creativeTypeElement = creativeElement.childNodes[creativeTypeElementKey];
              var parsedCreative = void 0;

              switch (creativeTypeElement.nodeName) {
                case 'Linear':
                  parsedCreative = parseCreativeLinear(creativeTypeElement, creativeAttributes);
                  if (parsedCreative) {
                    ad.creatives.push(parsedCreative);
                  }
                  break;
                case 'NonLinearAds':
                  parsedCreative = parseCreativeNonLinear(creativeTypeElement, creativeAttributes);
                  if (parsedCreative) {
                    ad.creatives.push(parsedCreative);
                  }
                  break;
                case 'CompanionAds':
                  parsedCreative = parseCreativeCompanion(creativeTypeElement, creativeAttributes);
                  if (parsedCreative) {
                    ad.creatives.push(parsedCreative);
                  }
                  break;
              }
            }
          });
          break;

        case 'Extensions':
          parseExtensions(ad.extensions, parserUtils.childrenByName(node, 'Extension'));
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
    var ad = parseInLine(wrapperElement);
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
        }
        // ClickTracking
        if (wrapperCreativeElement.videoClickTrackingURLTemplates) {
          if (!Array.isArray(ad.videoClickTrackingURLTemplates)) {
            ad.videoClickTrackingURLTemplates = [];
          } // tmp property to save wrapper tracking URLs until they are merged
          wrapperCreativeElement.videoClickTrackingURLTemplates.forEach(function (item) {
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
   * Parses an array of Extension elements.
   * @param  {Array} collection - The array used to store the parsed extensions.
   * @param  {Array} extensions - The array of extensions to parse.
   */
  function parseExtensions(collection, extensions) {
    extensions.forEach(function (extNode) {
      var ext = new AdExtension();

      ext.name = extNode.nodeName;
      ext.value = parserUtils.parseNodeText(extNode);

      var extNodeAttrs = extNode.attributes;

      if (extNodeAttrs) {
        for (var extNodeAttrKey in extNodeAttrs) {
          var extNodeAttr = extNodeAttrs[extNodeAttrKey];

          if (extNodeAttr.nodeName && extNodeAttr.nodeValue) {
            ext.attributes[extNodeAttr.nodeName] = extNodeAttr.nodeValue;
          }
        }
      }

      var childNodes = [];

      for (var childNodeKey in extNode.childNodes) {
        var childNode = extNode.childNodes[childNodeKey];

        var value = parserUtils.parseNodeText(childNode);

        // ignore comments / empty value
        if (childNode && childNode.nodeName !== '#cdata-section' && childNode.nodeName !== '#comment' && value !== '') {
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
    return creativeElement.getAttribute('AdID') || // VAST 2 spec
    creativeElement.getAttribute('adID') || // VAST 3 spec
    creativeElement.getAttribute('adId') || // VAST 4 spec
    null;
  }

  var domain;

  // This constructor is used to store event handlers. Instantiating this is
  // faster than explicitly calling `Object.create(null)` to get a "clean" empty
  // object (tested with v8 v4.9).
  function EventHandlers() {}
  EventHandlers.prototype = Object.create(null);

  function EventEmitter() {
    EventEmitter.init.call(this);
  }

  // nodejs oddity
  // require('events') === require('events').EventEmitter
  EventEmitter.EventEmitter = EventEmitter;

  EventEmitter.usingDomains = false;

  EventEmitter.prototype.domain = undefined;
  EventEmitter.prototype._events = undefined;
  EventEmitter.prototype._maxListeners = undefined;

  // By default EventEmitters will print a warning if more than 10 listeners are
  // added to it. This is a useful default which helps finding memory leaks.
  EventEmitter.defaultMaxListeners = 10;

  EventEmitter.init = function() {
    this.domain = null;
    if (EventEmitter.usingDomains) {
      // if there is an active domain, then attach to it.
      if (domain.active && !(this instanceof domain.Domain)) {
        this.domain = domain.active;
      }
    }

    if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
      this._events = new EventHandlers();
      this._eventsCount = 0;
    }

    this._maxListeners = this._maxListeners || undefined;
  };

  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.
  EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || isNaN(n))
      throw new TypeError('"n" argument must be a positive number');
    this._maxListeners = n;
    return this;
  };

  function $getMaxListeners(that) {
    if (that._maxListeners === undefined)
      return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
  }

  EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
    return $getMaxListeners(this);
  };

  // These standalone emit* functions are used to optimize calling of event
  // handlers for fast cases because emit() itself often has a variable number of
  // arguments and can be deoptimized because of that. These functions always have
  // the same number of arguments and thus do not get deoptimized, so the code
  // inside them can execute faster.
  function emitNone(handler, isFn, self) {
    if (isFn)
      handler.call(self);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self);
    }
  }
  function emitOne(handler, isFn, self, arg1) {
    if (isFn)
      handler.call(self, arg1);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1);
    }
  }
  function emitTwo(handler, isFn, self, arg1, arg2) {
    if (isFn)
      handler.call(self, arg1, arg2);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1, arg2);
    }
  }
  function emitThree(handler, isFn, self, arg1, arg2, arg3) {
    if (isFn)
      handler.call(self, arg1, arg2, arg3);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1, arg2, arg3);
    }
  }

  function emitMany(handler, isFn, self, args) {
    if (isFn)
      handler.apply(self, args);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].apply(self, args);
    }
  }

  EventEmitter.prototype.emit = function emit(type) {
    var er, handler, len, args, i, events, domain;
    var needDomainExit = false;
    var doError = (type === 'error');

    events = this._events;
    if (events)
      doError = (doError && events.error == null);
    else if (!doError)
      return false;

    domain = this.domain;

    // If there is no 'error' event listener then throw.
    if (doError) {
      er = arguments[1];
      if (domain) {
        if (!er)
          er = new Error('Uncaught, unspecified "error" event');
        er.domainEmitter = this;
        er.domain = domain;
        er.domainThrown = false;
        domain.emit('error', er);
      } else if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
      return false;
    }

    handler = events[type];

    if (!handler)
      return false;

    var isFn = typeof handler === 'function';
    len = arguments.length;
    switch (len) {
      // fast cases
      case 1:
        emitNone(handler, isFn, this);
        break;
      case 2:
        emitOne(handler, isFn, this, arguments[1]);
        break;
      case 3:
        emitTwo(handler, isFn, this, arguments[1], arguments[2]);
        break;
      case 4:
        emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
        break;
      // slower
      default:
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        emitMany(handler, isFn, this, args);
    }

    if (needDomainExit)
      domain.exit();

    return true;
  };

  function _addListener(target, type, listener, prepend) {
    var m;
    var events;
    var existing;

    if (typeof listener !== 'function')
      throw new TypeError('"listener" argument must be a function');

    events = target._events;
    if (!events) {
      events = target._events = new EventHandlers();
      target._eventsCount = 0;
    } else {
      // To avoid recursion in the case that type === "newListener"! Before
      // adding it to the listeners, first emit "newListener".
      if (events.newListener) {
        target.emit('newListener', type,
                    listener.listener ? listener.listener : listener);

        // Re-assign `events` because a newListener handler could have caused the
        // this._events to be assigned to a new object
        events = target._events;
      }
      existing = events[type];
    }

    if (!existing) {
      // Optimize the case of one listener. Don't need the extra array object.
      existing = events[type] = listener;
      ++target._eventsCount;
    } else {
      if (typeof existing === 'function') {
        // Adding the second element, need to change to array.
        existing = events[type] = prepend ? [listener, existing] :
                                            [existing, listener];
      } else {
        // If we've already got an array, just append.
        if (prepend) {
          existing.unshift(listener);
        } else {
          existing.push(listener);
        }
      }

      // Check for listener leak
      if (!existing.warned) {
        m = $getMaxListeners(target);
        if (m && m > 0 && existing.length > m) {
          existing.warned = true;
          var w = new Error('Possible EventEmitter memory leak detected. ' +
                              existing.length + ' ' + type + ' listeners added. ' +
                              'Use emitter.setMaxListeners() to increase limit');
          w.name = 'MaxListenersExceededWarning';
          w.emitter = target;
          w.type = type;
          w.count = existing.length;
          emitWarning(w);
        }
      }
    }

    return target;
  }
  function emitWarning(e) {
    typeof console.warn === 'function' ? console.warn(e) : console.log(e);
  }
  EventEmitter.prototype.addListener = function addListener(type, listener) {
    return _addListener(this, type, listener, false);
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener;

  EventEmitter.prototype.prependListener =
      function prependListener(type, listener) {
        return _addListener(this, type, listener, true);
      };

  function _onceWrap(target, type, listener) {
    var fired = false;
    function g() {
      target.removeListener(type, g);
      if (!fired) {
        fired = true;
        listener.apply(target, arguments);
      }
    }
    g.listener = listener;
    return g;
  }

  EventEmitter.prototype.once = function once(type, listener) {
    if (typeof listener !== 'function')
      throw new TypeError('"listener" argument must be a function');
    this.on(type, _onceWrap(this, type, listener));
    return this;
  };

  EventEmitter.prototype.prependOnceListener =
      function prependOnceListener(type, listener) {
        if (typeof listener !== 'function')
          throw new TypeError('"listener" argument must be a function');
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
      };

  // emits a 'removeListener' event iff the listener was removed
  EventEmitter.prototype.removeListener =
      function removeListener(type, listener) {
        var list, events, position, i, originalListener;

        if (typeof listener !== 'function')
          throw new TypeError('"listener" argument must be a function');

        events = this._events;
        if (!events)
          return this;

        list = events[type];
        if (!list)
          return this;

        if (list === listener || (list.listener && list.listener === listener)) {
          if (--this._eventsCount === 0)
            this._events = new EventHandlers();
          else {
            delete events[type];
            if (events.removeListener)
              this.emit('removeListener', type, list.listener || listener);
          }
        } else if (typeof list !== 'function') {
          position = -1;

          for (i = list.length; i-- > 0;) {
            if (list[i] === listener ||
                (list[i].listener && list[i].listener === listener)) {
              originalListener = list[i].listener;
              position = i;
              break;
            }
          }

          if (position < 0)
            return this;

          if (list.length === 1) {
            list[0] = undefined;
            if (--this._eventsCount === 0) {
              this._events = new EventHandlers();
              return this;
            } else {
              delete events[type];
            }
          } else {
            spliceOne(list, position);
          }

          if (events.removeListener)
            this.emit('removeListener', type, originalListener || listener);
        }

        return this;
      };

  EventEmitter.prototype.removeAllListeners =
      function removeAllListeners(type) {
        var listeners, events;

        events = this._events;
        if (!events)
          return this;

        // not listening for removeListener, no need to emit
        if (!events.removeListener) {
          if (arguments.length === 0) {
            this._events = new EventHandlers();
            this._eventsCount = 0;
          } else if (events[type]) {
            if (--this._eventsCount === 0)
              this._events = new EventHandlers();
            else
              delete events[type];
          }
          return this;
        }

        // emit removeListener for all listeners on all events
        if (arguments.length === 0) {
          var keys = Object.keys(events);
          for (var i = 0, key; i < keys.length; ++i) {
            key = keys[i];
            if (key === 'removeListener') continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners('removeListener');
          this._events = new EventHandlers();
          this._eventsCount = 0;
          return this;
        }

        listeners = events[type];

        if (typeof listeners === 'function') {
          this.removeListener(type, listeners);
        } else if (listeners) {
          // LIFO order
          do {
            this.removeListener(type, listeners[listeners.length - 1]);
          } while (listeners[0]);
        }

        return this;
      };

  EventEmitter.prototype.listeners = function listeners(type) {
    var evlistener;
    var ret;
    var events = this._events;

    if (!events)
      ret = [];
    else {
      evlistener = events[type];
      if (!evlistener)
        ret = [];
      else if (typeof evlistener === 'function')
        ret = [evlistener.listener || evlistener];
      else
        ret = unwrapListeners(evlistener);
    }

    return ret;
  };

  EventEmitter.listenerCount = function(emitter, type) {
    if (typeof emitter.listenerCount === 'function') {
      return emitter.listenerCount(type);
    } else {
      return listenerCount.call(emitter, type);
    }
  };

  EventEmitter.prototype.listenerCount = listenerCount;
  function listenerCount(type) {
    var events = this._events;

    if (events) {
      var evlistener = events[type];

      if (typeof evlistener === 'function') {
        return 1;
      } else if (evlistener) {
        return evlistener.length;
      }
    }

    return 0;
  }

  EventEmitter.prototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
  };

  // About 1.5x faster than the two-arg version of Array#splice().
  function spliceOne(list, index) {
    for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
      list[i] = list[k];
    list.pop();
  }

  function arrayClone(arr, i) {
    var copy = new Array(i);
    while (i--)
      copy[i] = arr[i];
    return copy;
  }

  function unwrapListeners(arr) {
    var ret = new Array(arr.length);
    for (var i = 0; i < ret.length; ++i) {
      ret[i] = arr[i].listener || arr[i];
    }
    return ret;
  }

  function xdr() {
    var request = void 0;
    if (window.XDomainRequest) {
      // eslint-disable-next-line no-undef
      request = new XDomainRequest();
    }
    return request;
  }

  function supported() {
    return !!xdr();
  }

  function get$1(url, options, cb) {
    var xmlDocument = typeof window.ActiveXObject === 'function' ? new window.ActiveXObject('Microsoft.XMLDOM') : undefined;

    if (xmlDocument) {
      xmlDocument.async = false;
    } else {
      return cb(new Error('FlashURLHandler: Microsoft.XMLDOM format not supported'));
    }

    var request = xdr();
    request.open('GET', url);
    request.timeout = options.timeout || 0;
    request.withCredentials = options.withCredentials || false;
    request.send();
    request.onprogress = function () {};

    request.onload = function () {
      xmlDocument.loadXML(request.responseText);
      cb(null, xmlDocument);
    };
  }

  var flashURLHandler = {
    get: get$1,
    supported: supported
  };

  // This mock module is loaded in stead of the original NodeURLHandler module
  // when bundling the library for environments which are not node.
  // This allows us to avoid bundling useless node components and have a smaller build.
  function get$2(url, options, cb) {
    cb(new Error('Please bundle the library for node to use the node urlHandler'));
  }

  var nodeURLHandler = {
    get: get$2
  };

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

  function supported$1() {
    return !!xhr();
  }

  function get$3(url, options, cb) {
    if (window.location.protocol === 'https:' && url.indexOf('http://') === 0) {
      return cb(new Error('XHRURLHandler: Cannot go from HTTPS to HTTP.'));
    }

    try {
      var request = xhr();

      request.open('GET', url);
      request.timeout = options.timeout || 0;
      request.withCredentials = options.withCredentials || false;
      request.overrideMimeType && request.overrideMimeType('text/xml');
      request.onreadystatechange = function () {
        if (request.readyState === 4) {
          if (request.status === 200) {
            cb(null, request.responseXML);
          } else {
            cb(new Error('XHRURLHandler: ' + request.statusText));
          }
        }
      };
      request.send();
    } catch (error) {
      cb(new Error('XHRURLHandler: Unexpected error'));
    }
  }

  var XHRURLHandler = {
    get: get$3,
    supported: supported$1
  };

  function get$4(url, options, cb) {
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
    } else if (flashURLHandler.supported()) {
      return flashURLHandler.get(url, options, cb);
    }
    return cb(new Error('Current context is not supported by any of the default URLHandlers. Please provide a custom URLHandler'));
  }

  var urlHandler = {
    get: get$4
  };

  var VASTResponse = function VASTResponse() {
    classCallCheck(this, VASTResponse);

    this.ads = [];
    this.errorURLTemplates = [];
    this.version = null;
  };

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
  var VASTParser = function (_EventEmitter) {
    inherits(VASTParser, _EventEmitter);

    /**
     * Creates an instance of VASTParser.
     * @constructor
     */
    function VASTParser() {
      classCallCheck(this, VASTParser);

      var _this = possibleConstructorReturn(this, (VASTParser.__proto__ || Object.getPrototypeOf(VASTParser)).call(this));

      _this.remainingAds = [];
      _this.parentURLs = [];
      _this.errorURLTemplates = [];
      _this.rootErrorURLTemplates = [];
      _this.maxWrapperDepth = null;
      _this.URLTemplateFilters = [];
      _this.fetchingOptions = {};
      return _this;
    }

    /**
     * Adds a filter function to the array of filters which are called before fetching a VAST document.
     * @param  {function} filter - The filter function to be added at the end of the array.
     * @return {void}
     */


    createClass(VASTParser, [{
      key: 'addURLTemplateFilter',
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
      key: 'removeURLTemplateFilter',
      value: function removeURLTemplateFilter() {
        this.URLTemplateFilters.pop();
      }

      /**
       * Returns the number of filters of the url templates filters array.
       * @return {Number}
       */

    }, {
      key: 'countURLTemplateFilters',
      value: function countURLTemplateFilters() {
        return this.URLTemplateFilters.length;
      }

      /**
       * Removes all the filter functions from the url templates filters array.
       * @return {void}
       */

    }, {
      key: 'clearURLTemplateFilters',
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
      key: 'trackVastError',
      value: function trackVastError(urlTemplates, errorCode) {
        for (var _len = arguments.length, data = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
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
      key: 'getErrorURLTemplates',
      value: function getErrorURLTemplates() {
        return this.rootErrorURLTemplates.concat(this.errorURLTemplates);
      }

      /**
       * Fetches a VAST document for the given url.
       * Returns a Promise which resolves,rejects according to the result of the request.
       * @param  {String} url - The url to request the VAST document.
       * @param {Number} wrapperDepth - how many times the current url has been wrapped
       * @param {String} originalUrl - url of original wrapper
       * @emits  VASTParser#VAST-resolving
       * @emits  VASTParser#VAST-resolved
       * @return {Promise}
       */

    }, {
      key: 'fetchVAST',
      value: function fetchVAST(url, wrapperDepth, originalUrl) {
        var _this2 = this;

        return new Promise(function (resolve, reject) {
          // Process url with defined filter
          _this2.URLTemplateFilters.forEach(function (filter) {
            url = filter(url);
          });

          _this2.parentURLs.push(url);
          _this2.emit('VAST-resolving', { url: url, wrapperDepth: wrapperDepth, originalUrl: originalUrl });

          _this2.urlHandler.get(url, _this2.fetchingOptions, function (err, xml) {
            _this2.emit('VAST-resolved', { url: url, error: err });

            if (err) {
              reject(err);
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
      key: 'initParsingStatus',
      value: function initParsingStatus() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        this.rootURL = '';
        this.remainingAds = [];
        this.parentURLs = [];
        this.errorURLTemplates = [];
        this.rootErrorURLTemplates = [];
        this.maxWrapperDepth = options.wrapperLimit || DEFAULT_MAX_WRAPPER_DEPTH;
        this.fetchingOptions = {
          timeout: options.timeout,
          withCredentials: options.withCredentials
        };

        this.urlHandler = options.urlHandler || options.urlhandler || urlHandler;
        this.vastVersion = null;
      }

      /**
       * Resolves the next group of ads. If all is true resolves all the remaining ads.
       * @param  {Boolean} all - If true all the remaining ads are resolved
       * @return {Promise}
       */

    }, {
      key: 'getRemainingAds',
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
          originalUrl: this.rootURL
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
       * @return {Promise}
       */

    }, {
      key: 'getAndParseVAST',
      value: function getAndParseVAST(url) {
        var _this4 = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        this.initParsingStatus(options);
        this.rootURL = url;

        return this.fetchVAST(url).then(function (xml) {
          options.originalUrl = url;
          options.isRootVAST = true;

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
       * @return {Promise}
       */

    }, {
      key: 'parseVAST',
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
       * @return {VASTResponse}
       */

    }, {
      key: 'buildVASTResponse',
      value: function buildVASTResponse(ads) {
        var response = new VASTResponse();
        response.ads = ads;
        response.errorURLTemplates = this.getErrorURLTemplates();
        response.version = this.vastVersion;
        this.completeWrapperResolving(response);

        return response;
      }

      /**
       * Parses the given xml Object into an array of ads
       * Returns the array or throws an `Error` if an invalid VAST XML is provided
       * @param  {Object} vastXml - An object representing an xml document.
       * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
       * @return {Array}
       * @throws {Error} `vastXml` must be a valid VAST XMLDocument
       */

    }, {
      key: 'parseVastXml',
      value: function parseVastXml(vastXml, _ref) {
        var _ref$isRootVAST = _ref.isRootVAST,
            isRootVAST = _ref$isRootVAST === undefined ? false : _ref$isRootVAST;

        // check if is a valid VAST document
        if (!vastXml || !vastXml.documentElement || vastXml.documentElement.nodeName !== 'VAST') {
          throw new Error('Invalid VAST XMLDocument');
        }

        var ads = [];
        var childNodes = vastXml.documentElement.childNodes;

        /* Only parse the version of the Root VAST for now because we don't know yet how to
           handle some cases like multiple wrappers in the same vast
        */
        if (isRootVAST) {
          var vastVersion = vastXml.documentElement.getAttribute('version');
          if (vastVersion) this.vastVersion = vastVersion;
        }

        // Fill the VASTResponse object with ads and errorURLTemplates
        for (var nodeKey in childNodes) {
          var node = childNodes[nodeKey];

          if (node.nodeName === 'Error') {
            var errorURLTemplate = parserUtils.parseNodeText(node);

            // Distinguish root VAST url templates from ad specific ones
            isRootVAST ? this.rootErrorURLTemplates.push(errorURLTemplate) : this.errorURLTemplates.push(errorURLTemplate);
          }

          if (node.nodeName === 'Ad') {
            var ad = parseAd(node);

            if (ad) {
              ads.push(ad);
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
       * @param  {Object} vastXml - An object representing an xml document.
       * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
       * @emits  VASTParser#VAST-resolving
       * @emits  VASTParser#VAST-resolved
       * @return {Promise}
       */

    }, {
      key: 'parse',
      value: function parse(vastXml, _ref2) {
        var _ref2$resolveAll = _ref2.resolveAll,
            resolveAll = _ref2$resolveAll === undefined ? true : _ref2$resolveAll,
            _ref2$wrapperSequence = _ref2.wrapperSequence,
            wrapperSequence = _ref2$wrapperSequence === undefined ? null : _ref2$wrapperSequence,
            _ref2$originalUrl = _ref2.originalUrl,
            originalUrl = _ref2$originalUrl === undefined ? null : _ref2$originalUrl,
            _ref2$wrapperDepth = _ref2.wrapperDepth,
            wrapperDepth = _ref2$wrapperDepth === undefined ? 0 : _ref2$wrapperDepth,
            _ref2$isRootVAST = _ref2.isRootVAST,
            isRootVAST = _ref2$isRootVAST === undefined ? false : _ref2$isRootVAST;

        var ads = [];
        try {
          ads = this.parseVastXml(vastXml, { isRootVAST: isRootVAST });
        } catch (e) {
          return Promise.reject(e);
        }

        var adsCount = ads.length;
        var lastAddedAd = ads[adsCount - 1];
        // if in child nodes we have only one ads
        // and wrapperSequence is defined
        // and this ads doesn't already have sequence
        if (adsCount === 1 && wrapperSequence !== undefined && wrapperSequence !== null && lastAddedAd && !lastAddedAd.sequence) {
          lastAddedAd.sequence = wrapperSequence;
        }

        // Split the VAST in case we don't want to resolve everything at the first time
        if (resolveAll === false) {
          this.remainingAds = parserUtils.splitVAST(ads);
          // Remove the first element from the remaining ads array, since we're going to resolve that element
          ads = this.remainingAds.shift();
        }

        return this.resolveAds(ads, { wrapperDepth: wrapperDepth, originalUrl: originalUrl });
      }

      /**
       * Resolves an Array of ads, recursively calling itself with the remaining ads if a no ad
       * response is returned for the given array.
       * @param {Array} ads - An array of ads to resolve
       * @param {Object} options - An options Object containing resolving parameters
       * @return {Promise}
       */

    }, {
      key: 'resolveAds',
      value: function resolveAds() {
        var _this6 = this;

        var ads = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var _ref3 = arguments[1];
        var wrapperDepth = _ref3.wrapperDepth,
            originalUrl = _ref3.originalUrl;

        var resolveWrappersPromises = [];

        ads.forEach(function (ad) {
          var resolveWrappersPromise = _this6.resolveWrappers(ad, wrapperDepth, originalUrl);

          resolveWrappersPromises.push(resolveWrappersPromise);
        });

        return Promise.all(resolveWrappersPromises).then(function (unwrappedAds) {
          var resolvedAds = util.flatten(unwrappedAds);

          if (!resolvedAds && _this6.remainingAds.length > 0) {
            var remainingAdsToResolve = _this6.remainingAds.shift();

            return _this6.resolveAds(remainingAdsToResolve, {
              wrapperDepth: wrapperDepth,
              originalUrl: originalUrl
            });
          }

          return resolvedAds;
        });
      }

      /**
       * Resolves the wrappers for the given ad in a recursive way.
       * Returns a Promise which resolves with the unwrapped ad or rejects with an error.
       * @param  {Ad} ad - An ad to be unwrapped.
       * @param  {Number} wrapperDepth - The reached depth in the wrapper resolving chain.
       * @param  {String} originalUrl - The original vast url.
       * @return {Promise}
       */

    }, {
      key: 'resolveWrappers',
      value: function resolveWrappers(ad, wrapperDepth, originalUrl) {
        var _this7 = this;

        return new Promise(function (resolve) {
          // Going one level deeper in the wrapper chain
          wrapperDepth++;
          // We already have a resolved VAST ad, no need to resolve wrapper
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
          }

          // Get full URL
          ad.nextWrapperURL = parserUtils.resolveVastAdTagURI(ad.nextWrapperURL, originalUrl);

          // sequence doesn't carry over in wrapper element
          var wrapperSequence = ad.sequence;
          originalUrl = ad.nextWrapperURL;

          _this7.fetchVAST(ad.nextWrapperURL, wrapperDepth, originalUrl).then(function (xml) {
            return _this7.parse(xml, {
              originalUrl: originalUrl,
              wrapperSequence: wrapperSequence,
              wrapperDepth: wrapperDepth
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
          }).catch(function (err) {
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
       * @param {VASTResponse} vastResponse - A resolved VASTResponse.
       */

    }, {
      key: 'completeWrapperResolving',
      value: function completeWrapperResolving(vastResponse) {
        // We've to wait for all <Ad> elements to be parsed before handling error so we can:
        // - Send computed extensions data
        // - Ping all <Error> URIs defined across VAST files

        // No Ad case - The parser never bump into an <Ad> element
        if (vastResponse.ads.length === 0) {
          this.trackVastError(vastResponse.errorURLTemplates, { ERRORCODE: 303 });
        } else {
          for (var index = vastResponse.ads.length - 1; index >= 0; index--) {
            // - Error encountred while parsing
            // - No Creative case - The parser has dealt with soma <Ad><Wrapper> or/and an <Ad><Inline> elements
            // but no creative was found
            var ad = vastResponse.ads[index];
            if (ad.errorCode || ad.creatives.length === 0) {
              this.trackVastError(ad.errorURLTemplates.concat(vastResponse.errorURLTemplates), { ERRORCODE: ad.errorCode || 303 }, { ERRORMESSAGE: ad.errorMessage || '' }, { extensions: ad.extensions }, { system: ad.system });
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
  var Storage = function () {
    /**
     * Creates an instance of Storage.
     * @constructor
     */
    function Storage() {
      classCallCheck(this, Storage);

      this.storage = this.initStorage();
    }

    /**
     * Provides a singleton instance of the wrapped storage.
     * @return {Object}
     */


    createClass(Storage, [{
      key: 'initStorage',
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
      key: 'isStorageDisabled',
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
      key: 'getItem',
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
      key: 'setItem',
      value: function setItem(key, value) {
        return this.storage.setItem(key, value);
      }

      /**
       * Removes an item for the given key.
       * @param  {String} key - The key to remove the value.
       * @return {any}
       */

    }, {
      key: 'removeItem',
      value: function removeItem(key) {
        return this.storage.removeItem(key);
      }

      /**
       * Removes all the items from the storage.
       */

    }, {
      key: 'clear',
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
  var VASTClient = function () {
    /**
     * Creates an instance of VASTClient.
     * @param  {Number} cappingFreeLunch - The number of first calls to skip.
     * @param  {Number} cappingMinimumTimeInterval - The minimum time interval between two consecutive calls.
     * @param  {Storage} customStorage - A custom storage to use instead of the default one.
     * @constructor
     */
    function VASTClient(cappingFreeLunch, cappingMinimumTimeInterval, customStorage) {
      classCallCheck(this, VASTClient);

      this.cappingFreeLunch = cappingFreeLunch || 0;
      this.cappingMinimumTimeInterval = cappingMinimumTimeInterval || 0;
      this.defaultOptions = {
        withCredentials: false,
        timeout: 0
      };
      this.vastParser = new VASTParser();
      this.storage = customStorage || new Storage();

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

    createClass(VASTClient, [{
      key: 'getParser',
      value: function getParser() {
        return this.vastParser;
      }
    }, {
      key: 'hasRemainingAds',


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
      key: 'getNextAds',
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
      key: 'get',
      value: function get$$1(url) {
        var _this = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var now = Date.now();
        options = Object.assign({}, this.defaultOptions, options);

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

        return new Promise(function (resolve, reject) {
          if (_this.cappingFreeLunch >= _this.totalCalls) {
            return reject(new Error('VAST call canceled \u2013 FreeLunch capping not reached yet ' + _this.totalCalls + '/' + _this.cappingFreeLunch));
          }

          var timeSinceLastCall = now - _this.lastSuccessfulAd;

          // Check timeSinceLastCall to be a positive number. If not, this mean the
          // previous was made in the future. We reset lastSuccessfulAd value
          if (timeSinceLastCall < 0) {
            _this.lastSuccessfulAd = 0;
          } else if (timeSinceLastCall < _this.cappingMinimumTimeInterval) {
            return reject(new Error('VAST call canceled \u2013 (' + _this.cappingMinimumTimeInterval + ')ms minimum interval reached'));
          }

          _this.vastParser.getAndParseVAST(url, options).then(function (response) {
            return resolve(response);
          }).catch(function (err) {
            return reject(err);
          });
        });
      }
    }, {
      key: 'lastSuccessfulAd',
      get: function get$$1() {
        return this.storage.getItem('vast-client-last-successful-ad');
      },
      set: function set$$1(value) {
        this.storage.setItem('vast-client-last-successful-ad', value);
      }
    }, {
      key: 'totalCalls',
      get: function get$$1() {
        return this.storage.getItem('vast-client-total-calls');
      },
      set: function set$$1(value) {
        this.storage.setItem('vast-client-total-calls', value);
      }
    }, {
      key: 'totalCallsTimeout',
      get: function get$$1() {
        return this.storage.getItem('vast-client-total-calls-timeout');
      },
      set: function set$$1(value) {
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
  var VASTTracker = function (_EventEmitter) {
    inherits(VASTTracker, _EventEmitter);

    /**
     * Creates an instance of VASTTracker.
     *
     * @param {VASTClient} client - An instance of VASTClient that can be updated by the tracker. [optional]
     * @param {Ad} ad - The ad to track.
     * @param {Creative} creative - The creative to track.
     * @param {CompanionAd|NonLinearAd} [variation=null] - An optional variation of the creative.
     * @constructor
     */
    function VASTTracker(client, ad, creative) {
      var variation = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      classCallCheck(this, VASTTracker);

      var _this = possibleConstructorReturn(this, (VASTTracker.__proto__ || Object.getPrototypeOf(VASTTracker)).call(this));

      _this.ad = ad;
      _this.creative = creative;
      _this.variation = variation;
      _this.muted = false;
      _this.impressed = false;
      _this.skippable = false;
      _this.trackingEvents = {};
      // We need to save the already triggered quartiles, in order to not trigger them again
      _this._alreadyTriggeredQuartiles = {};
      // Tracker listeners should be notified with some events
      // no matter if there is a tracking URL or not
      _this.emitAlwaysEvents = ['creativeView', 'start', 'firstQuartile', 'midpoint', 'thirdQuartile', 'complete', 'resume', 'pause', 'rewind', 'skip', 'closeLinear', 'close'];

      // Duplicate the creative's trackingEvents property so we can alter it
      for (var eventName in _this.creative.trackingEvents) {
        var events = _this.creative.trackingEvents[eventName];
        _this.trackingEvents[eventName] = events.slice(0);
      }

      // Nonlinear and companion creatives provide some tracking information at a variation level
      // While linear creatives provided that at a creative level. That's why we need to
      // differentiate how we retrieve some tracking information.
      if (_this.creative instanceof CreativeLinear) {
        _this._initLinearTracking();
      } else {
        _this._initVariationTracking();
      }

      // If the tracker is associated with a client we add a listener to the start event
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


    createClass(VASTTracker, [{
      key: '_initLinearTracking',
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
      key: '_initVariationTracking',
      value: function _initVariationTracking() {
        this.linear = false;
        this.skipDelay = DEFAULT_SKIP_DELAY;

        // If no variation has been provided there's nothing else to set
        if (!this.variation) {
          return;
        }

        // Duplicate the variation's trackingEvents property so we can alter it
        for (var eventName in this.variation.trackingEvents) {
          var events = this.variation.trackingEvents[eventName];

          // If for the given eventName we already had some trackingEvents provided by the creative
          // we want to keep both the creative trackingEvents and the variation ones
          if (this.trackingEvents[eventName]) {
            this.trackingEvents[eventName] = this.trackingEvents[eventName].concat(events.slice(0));
          } else {
            this.trackingEvents[eventName] = events.slice(0);
          }
        }

        if (this.variation instanceof NonLinearAd) {
          this.clickThroughURLTemplate = this.variation.nonlinearClickThroughURLTemplate;
          this.clickTrackingURLTemplates = this.variation.nonlinearClickTrackingURLTemplates;
          this.setDuration(this.variation.minSuggestedDuration);
        } else if (this.variation instanceof CompanionAd) {
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
      key: 'setDuration',
      value: function setDuration(duration) {
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
      key: 'setProgress',
      value: function setProgress(progress) {
        var _this2 = this;

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
          var events = [];

          if (progress > 0) {
            var percent = Math.round(progress / this.assetDuration * 100);

            events.push('start');
            events.push('progress-' + percent + '%');
            events.push('progress-' + Math.round(progress));

            for (var quartile in this.quartiles) {
              if (this.isQuartileReached(quartile, this.quartiles[quartile], progress)) {
                events.push(quartile);
                this._alreadyTriggeredQuartiles[quartile] = true;
              }
            }
          }

          events.forEach(function (eventName) {
            _this2.track(eventName, true);
          });

          if (progress < this.progress) {
            this.track('rewind');
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
      key: 'isQuartileReached',
      value: function isQuartileReached(quartile, time, progress) {
        var quartileReached = false;
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
       * @emits VASTTracker#mute
       * @emits VASTTracker#unmute
       */

    }, {
      key: 'setMuted',
      value: function setMuted(muted) {
        if (this.muted !== muted) {
          this.track(muted ? 'mute' : 'unmute');
        }
        this.muted = muted;
      }

      /**
       * Update the pause state and call the resume/pause tracking URLs.
       *
       * @param {Boolean} paused - Indicates if the video is paused or not.
       * @emits VASTTracker#pause
       * @emits VASTTracker#resume
       */

    }, {
      key: 'setPaused',
      value: function setPaused(paused) {
        if (this.paused !== paused) {
          this.track(paused ? 'pause' : 'resume');
        }
        this.paused = paused;
      }

      /**
       * Updates the fullscreen state and calls the fullscreen tracking URLs.
       *
       * @param {Boolean} fullscreen - Indicates if the video is in fulscreen mode or not.
       * @emits VASTTracker#fullscreen
       * @emits VASTTracker#exitFullscreen
       */

    }, {
      key: 'setFullscreen',
      value: function setFullscreen(fullscreen) {
        if (this.fullscreen !== fullscreen) {
          this.track(fullscreen ? 'fullscreen' : 'exitFullscreen');
        }
        this.fullscreen = fullscreen;
      }

      /**
       * Updates the expand state and calls the expand/collapse tracking URLs.
       *
       * @param {Boolean} expanded - Indicates if the video is expanded or not.
       * @emits VASTTracker#expand
       * @emits VASTTracker#collapse
       */

    }, {
      key: 'setExpand',
      value: function setExpand(expanded) {
        if (this.expanded !== expanded) {
          this.track(expanded ? 'expand' : 'collapse');
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
      key: 'setSkipDelay',
      value: function setSkipDelay(duration) {
        if (typeof duration === 'number') {
          this.skipDelay = duration;
        }
      }

      /**
       * Tracks an impression (can be called only once).
       *
       * @emits VASTTracker#creativeView
       */

    }, {
      key: 'trackImpression',
      value: function trackImpression() {
        if (!this.impressed) {
          this.impressed = true;
          this.trackURLs(this.ad.impressionURLTemplates);
          this.track('creativeView');
        }
      }

      /**
       * Send a request to the URI provided by the VAST <Error> element.
       * If an [ERRORCODE] macro is included, it will be substitute with errorCode.
       *
       * @param {String} errorCode - Replaces [ERRORCODE] macro. [ERRORCODE] values are listed in the VAST specification.
       * @param {Boolean} [isCustomCode=false] - Flag to allow custom values on error code.
       */

    }, {
      key: 'errorWithCode',
      value: function errorWithCode(errorCode) {
        var isCustomCode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        this.trackURLs(this.ad.errorURLTemplates, { ERRORCODE: errorCode }, { isCustomCode: isCustomCode });
      }

      /**
       * Must be called when the user watched the linear creative until its end.
       * Calls the complete tracking URLs.
       *
       * @emits VASTTracker#complete
       */

    }, {
      key: 'complete',
      value: function complete() {
        this.track('complete');
      }

      /**
       * Must be called when the player or the window is closed during the ad.
       * Calls the `closeLinear` (in VAST 3.0) and `close` tracking URLs.
       *
       * @emits VASTTracker#closeLinear
       * @emits VASTTracker#close
       */

    }, {
      key: 'close',
      value: function close() {
        this.track(this.linear ? 'closeLinear' : 'close');
      }

      /**
       * Must be called when the skip button is clicked. Calls the skip tracking URLs.
       *
       * @emits VASTTracker#skip
       */

    }, {
      key: 'skip',
      value: function skip() {
        this.track('skip');
      }

      /**
       * Must be called when the user clicks on the creative.
       * It calls the tracking URLs and emits a 'clickthrough' event with the resolved
       * clickthrough URL when done.
       *
       * @param {String} [fallbackClickThroughURL=null] - an optional clickThroughURL template that could be used as a fallback
       * @emits VASTTracker#clickthrough
       */

    }, {
      key: 'click',
      value: function click() {
        var fallbackClickThroughURL = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        if (this.clickTrackingURLTemplates && this.clickTrackingURLTemplates.length) {
          this.trackURLs(this.clickTrackingURLTemplates);
        }

        // Use the provided fallbackClickThroughURL as a fallback
        var clickThroughURLTemplate = this.clickThroughURLTemplate || fallbackClickThroughURL;

        if (clickThroughURLTemplate) {
          var variables = this.linear ? { CONTENTPLAYHEAD: this.progressFormatted() } : {};
          var clickThroughURL = util.resolveURLTemplates([clickThroughURLTemplate], variables)[0];

          this.emit('clickthrough', clickThroughURL);
        }
      }

      /**
       * Calls the tracking URLs for the given eventName and emits the event.
       *
       * @param {String} eventName - The name of the event.
       * @param {Boolean} [once=false] - Boolean to define if the event has to be tracked only once.
       */

    }, {
      key: 'track',
      value: function track(eventName) {
        var once = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        // closeLinear event was introduced in VAST 3.0
        // Fallback to vast 2.0 close event if necessary
        if (eventName === 'closeLinear' && !this.trackingEvents[eventName] && this.trackingEvents['close']) {
          eventName = 'close';
        }

        var trackingURLTemplates = this.trackingEvents[eventName];
        var isAlwaysEmitEvent = this.emitAlwaysEvents.indexOf(eventName) > -1;

        if (trackingURLTemplates) {
          this.emit(eventName, '');
          this.trackURLs(trackingURLTemplates);
        } else if (isAlwaysEmitEvent) {
          this.emit(eventName, '');
        }

        if (once) {
          delete this.trackingEvents[eventName];
          if (isAlwaysEmitEvent) {
            this.emitAlwaysEvents.splice(this.emitAlwaysEvents.indexOf(eventName), 1);
          }
        }
      }

      /**
       * Calls the tracking urls templates with the given variables.
       *
       * @param {Array} URLTemplates - An array of tracking url templates.
       * @param {Object} [variables={}] - An optional Object of parameters to be used in the tracking calls.
       * @param {Object} [options={}] - An optional Object of options to be used in the tracking calls.
       */

    }, {
      key: 'trackURLs',
      value: function trackURLs(URLTemplates) {
        var variables = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (this.linear) {
          if (this.creative && this.creative.mediaFiles && this.creative.mediaFiles[0] && this.creative.mediaFiles[0].fileURL) {
            variables['ASSETURI'] = this.creative.mediaFiles[0].fileURL;
          }
          variables['CONTENTPLAYHEAD'] = this.progressFormatted();
        }

        util.track(URLTemplates, variables, options);
      }

      /**
       * Formats time progress in a readable string.
       *
       * @return {String}
       */

    }, {
      key: 'progressFormatted',
      value: function progressFormatted() {
        var seconds = parseInt(this.progress);
        var h = seconds / (60 * 60);
        if (h.length < 2) {
          h = '0' + h;
        }
        var m = seconds / 60 % 60;
        if (m.length < 2) {
          m = '0' + m;
        }
        var s = seconds % 60;
        if (s.length < 2) {
          s = '0' + m;
        }
        var ms = parseInt((this.progress - seconds) * 100);
        return h + ':' + m + ':' + s + '.' + ms;
      }
    }]);
    return VASTTracker;
  }(EventEmitter);

  exports.VASTClient = VASTClient;
  exports.VASTParser = VASTParser;
  exports.VASTTracker = VASTTracker;

  return exports;

}({}));
