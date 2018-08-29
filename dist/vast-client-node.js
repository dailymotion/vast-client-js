'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var events = require('events');

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

  this.attributes = {};
  this.children = [];
};

var AdExtensionChild = function AdExtensionChild() {
  classCallCheck(this, AdExtensionChild);

  this.name = null;
  this.value = null;
  this.attributes = {};
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

var Util = function () {
  function Util() {
    classCallCheck(this, Util);
  }

  createClass(Util, [{
    key: 'track',
    value: function track(URLTemplates, variables) {
      var URLs = this.resolveURLTemplates(URLTemplates, variables);

      URLs.forEach(function (URL) {
        if (typeof window !== 'undefined' && window !== null) {
          var i = new Image();
          i.src = URL;
        }
      });
    }
  }, {
    key: 'resolveURLTemplates',
    value: function resolveURLTemplates(URLTemplates) {
      var variables = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var URLs = [];

      // Encode String variables, when given
      if (variables['ASSETURI']) {
        variables['ASSETURI'] = this.encodeURIComponentRFC3986(variables['ASSETURI']);
      }
      if (variables['CONTENTPLAYHEAD']) {
        variables['CONTENTPLAYHEAD'] = this.encodeURIComponentRFC3986(variables['CONTENTPLAYHEAD']);
      }

      // Set default value for invalid ERRORCODE
      if (variables['ERRORCODE'] && !/^[0-9]{3}$/.test(variables['ERRORCODE'])) {
        variables['ERRORCODE'] = 900;
      }

      // Calc random/time based macros
      variables['CACHEBUSTING'] = this.leftpad(Math.round(Math.random() * 1.0e8).toString());
      variables['TIMESTAMP'] = this.encodeURIComponentRFC3986(new Date().toISOString());

      // RANDOM/random is not defined in VAST 3/4 as a valid macro tho it's used by some adServer (Auditude)
      variables['RANDOM'] = variables['random'] = variables['CACHEBUSTING'];

      for (var URLTemplateKey in URLTemplates) {
        var resolveURL = URLTemplates[URLTemplateKey];

        if (!resolveURL) {
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

  }, {
    key: 'encodeURIComponentRFC3986',
    value: function encodeURIComponentRFC3986(str) {
      return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
        return '%' + c.charCodeAt(0).toString(16);
      });
    }
  }, {
    key: 'leftpad',
    value: function leftpad(str) {
      if (str.length < 8) {
        return this.range(0, 8 - str.length, false).map(function (i) {
          return '0';
        }).join('') + str;
      } else {
        return str;
      }
    }
  }, {
    key: 'range',
    value: function range(left, right, inclusive) {
      var range = [];
      var ascending = left < right;
      var end = !inclusive ? right : ascending ? right + 1 : right - 1;

      for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
      }
      return range;
    }
  }, {
    key: 'isNumeric',
    value: function isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
  }, {
    key: 'flatten',
    value: function flatten(arr) {
      var _this = this;

      return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? _this.flatten(toFlatten) : toFlatten);
      }, []);
    }
  }]);
  return Util;
}();

/**
 * This class provides support methods to the parsing classes.
 * @export
 * @class ParserUtils
 */
var ParserUtils = function () {
  /**
   * Creates an instance of ParserUtils.
   */
  function ParserUtils() {
    classCallCheck(this, ParserUtils);

    this.util = new Util();
  }

  /**
   * Returns the first element of the given node which nodeName matches the given name.
   * @param  {Object} node - The node to use to find a match.
   * @param  {String} name - The name to look for.
   * @return {Object}
   */


  createClass(ParserUtils, [{
    key: 'childByName',
    value: function childByName(node, name) {
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

  }, {
    key: 'childrenByName',
    value: function childrenByName(node, name) {
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

  }, {
    key: 'resolveVastAdTagURI',
    value: function resolveVastAdTagURI(vastAdTagUrl, originalUrl) {
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

  }, {
    key: 'parseBoolean',
    value: function parseBoolean(booleanString) {
      return ['true', 'TRUE', '1'].indexOf(booleanString) !== -1;
    }

    /**
     * Parses a node text (for legacy support).
     * @param  {Object} node - The node to parse the text from.
     * @return {String}
     */

  }, {
    key: 'parseNodeText',
    value: function parseNodeText(node) {
      return node && (node.textContent || node.text || '').trim();
    }

    /**
     * Copies an attribute from a node to another.
     * @param  {String} attributeName - The name of the attribute to clone.
     * @param  {Object} nodeSource - The source node to copy the attribute from.
     * @param  {Object} nodeDestination - The destination node to copy the attribute at.
     */

  }, {
    key: 'copyNodeAttribute',
    value: function copyNodeAttribute(attributeName, nodeSource, nodeDestination) {
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

  }, {
    key: 'parseDuration',
    value: function parseDuration(durationString) {
      if (durationString == null) {
        return -1;
      }
      // Some VAST doesn't have an HH:MM:SS duration format but instead jus the number of seconds
      if (this.util.isNumeric(durationString)) {
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

  }, {
    key: 'splitVAST',
    value: function splitVAST(ads) {
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
  }]);
  return ParserUtils;
}();

/**
 * This class provides methods to parse a VAST CompanionAd Element.
 * @export
 * @class CreativeCompanionParser
 */
var CreativeCompanionParser = function () {
  /**
   * Creates an instance of CreativeCompanionParser.
   */
  function CreativeCompanionParser() {
    classCallCheck(this, CreativeCompanionParser);

    this.parserUtils = new ParserUtils();
  }

  /**
   * Parses a CompanionAd.
   * @param  {Object} creativeElement - The VAST CompanionAd element to parse.
   * @param  {Object} creativeAttributes - The attributes of the CompanionAd (optional).
   * @return {CreativeCompanion}
   */


  createClass(CreativeCompanionParser, [{
    key: 'parse',
    value: function parse(creativeElement, creativeAttributes) {
      var _this = this;

      var creative = new CreativeCompanion(creativeAttributes);

      this.parserUtils.childrenByName(creativeElement, 'Companion').forEach(function (companionResource) {
        var companionAd = new CompanionAd();
        companionAd.id = companionResource.getAttribute('id') || null;
        companionAd.width = companionResource.getAttribute('width');
        companionAd.height = companionResource.getAttribute('height');
        companionAd.companionClickTrackingURLTemplates = [];

        _this.parserUtils.childrenByName(companionResource, 'HTMLResource').forEach(function (htmlElement) {
          companionAd.type = htmlElement.getAttribute('creativeType') || 'text/html';
          companionAd.htmlResource = _this.parserUtils.parseNodeText(htmlElement);
        });

        _this.parserUtils.childrenByName(companionResource, 'IFrameResource').forEach(function (iframeElement) {
          companionAd.type = iframeElement.getAttribute('creativeType') || 0;
          companionAd.iframeResource = _this.parserUtils.parseNodeText(iframeElement);
        });

        _this.parserUtils.childrenByName(companionResource, 'StaticResource').forEach(function (staticElement) {
          companionAd.type = staticElement.getAttribute('creativeType') || 0;

          _this.parserUtils.childrenByName(companionResource, 'AltText').forEach(function (child) {
            companionAd.altText = _this.parserUtils.parseNodeText(child);
          });

          companionAd.staticResource = _this.parserUtils.parseNodeText(staticElement);
        });

        _this.parserUtils.childrenByName(companionResource, 'TrackingEvents').forEach(function (trackingEventsElement) {
          _this.parserUtils.childrenByName(trackingEventsElement, 'Tracking').forEach(function (trackingElement) {
            var eventName = trackingElement.getAttribute('event');
            var trackingURLTemplate = _this.parserUtils.parseNodeText(trackingElement);
            if (eventName && trackingURLTemplate) {
              if (companionAd.trackingEvents[eventName] == null) {
                companionAd.trackingEvents[eventName] = [];
              }
              companionAd.trackingEvents[eventName].push(trackingURLTemplate);
            }
          });
        });

        _this.parserUtils.childrenByName(companionResource, 'CompanionClickTracking').forEach(function (clickTrackingElement) {
          companionAd.companionClickTrackingURLTemplates.push(_this.parserUtils.parseNodeText(clickTrackingElement));
        });

        companionAd.companionClickThroughURLTemplate = _this.parserUtils.parseNodeText(_this.parserUtils.childByName(companionResource, 'CompanionClickThrough'));
        companionAd.companionClickTrackingURLTemplate = _this.parserUtils.parseNodeText(_this.parserUtils.childByName(companionResource, 'CompanionClickTracking'));
        creative.variations.push(companionAd);
      });

      return creative;
    }
  }]);
  return CreativeCompanionParser;
}();

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
 * This class provides methods to parse a VAST Linear Element.
 * @export
 * @class CreativeLinearParser
 */
var CreativeLinearParser = function () {
  /**
   * Creates an instance of CreativeLinearParser.
   */
  function CreativeLinearParser() {
    classCallCheck(this, CreativeLinearParser);

    this.parserUtils = new ParserUtils();
  }

  /**
   * Parses a Linear element.
   * @param  {Object} creativeElement - The VAST Linear element to parse.
   * @param  {any} creativeAttributes - The attributes of the Linear (optional).
   * @return {CreativeLinear}
   */


  createClass(CreativeLinearParser, [{
    key: 'parse',
    value: function parse(creativeElement, creativeAttributes) {
      var _this = this;

      var offset = void 0;
      var creative = new CreativeLinear(creativeAttributes);

      creative.duration = this.parserUtils.parseDuration(this.parserUtils.parseNodeText(this.parserUtils.childByName(creativeElement, 'Duration')));
      var skipOffset = creativeElement.getAttribute('skipoffset');

      if (skipOffset == null) {
        creative.skipDelay = null;
      } else if (skipOffset.charAt(skipOffset.length - 1) === '%' && creative.duration !== -1) {
        var percent = parseInt(skipOffset, 10);
        creative.skipDelay = creative.duration * (percent / 100);
      } else {
        creative.skipDelay = this.parserUtils.parseDuration(skipOffset);
      }

      var videoClicksElement = this.parserUtils.childByName(creativeElement, 'VideoClicks');
      if (videoClicksElement) {
        creative.videoClickThroughURLTemplate = this.parserUtils.parseNodeText(this.parserUtils.childByName(videoClicksElement, 'ClickThrough'));

        this.parserUtils.childrenByName(videoClicksElement, 'ClickTracking').forEach(function (clickTrackingElement) {
          creative.videoClickTrackingURLTemplates.push(_this.parserUtils.parseNodeText(clickTrackingElement));
        });

        this.parserUtils.childrenByName(videoClicksElement, 'CustomClick').forEach(function (customClickElement) {
          creative.videoCustomClickURLTemplates.push(_this.parserUtils.parseNodeText(customClickElement));
        });
      }

      var adParamsElement = this.parserUtils.childByName(creativeElement, 'AdParameters');
      if (adParamsElement) {
        creative.adParameters = this.parserUtils.parseNodeText(adParamsElement);
      }

      this.parserUtils.childrenByName(creativeElement, 'TrackingEvents').forEach(function (trackingEventsElement) {
        _this.parserUtils.childrenByName(trackingEventsElement, 'Tracking').forEach(function (trackingElement) {
          var eventName = trackingElement.getAttribute('event');
          var trackingURLTemplate = _this.parserUtils.parseNodeText(trackingElement);
          if (eventName && trackingURLTemplate) {
            if (eventName === 'progress') {
              offset = trackingElement.getAttribute('offset');
              if (!offset) {
                return;
              }
              if (offset.charAt(offset.length - 1) === '%') {
                eventName = 'progress-' + offset;
              } else {
                eventName = 'progress-' + Math.round(_this.parserUtils.parseDuration(offset));
              }
            }

            if (creative.trackingEvents[eventName] == null) {
              creative.trackingEvents[eventName] = [];
            }
            creative.trackingEvents[eventName].push(trackingURLTemplate);
          }
        });
      });

      this.parserUtils.childrenByName(creativeElement, 'MediaFiles').forEach(function (mediaFilesElement) {
        _this.parserUtils.childrenByName(mediaFilesElement, 'MediaFile').forEach(function (mediaFileElement) {
          var mediaFile = new MediaFile();
          mediaFile.id = mediaFileElement.getAttribute('id');
          mediaFile.fileURL = _this.parserUtils.parseNodeText(mediaFileElement);
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

      var iconsElement = this.parserUtils.childByName(creativeElement, 'Icons');
      if (iconsElement) {
        this.parserUtils.childrenByName(iconsElement, 'Icon').forEach(function (iconElement) {
          var icon = new Icon();
          icon.program = iconElement.getAttribute('program');
          icon.height = parseInt(iconElement.getAttribute('height') || 0);
          icon.width = parseInt(iconElement.getAttribute('width') || 0);
          icon.xPosition = _this.parseXPosition(iconElement.getAttribute('xPosition'));
          icon.yPosition = _this.parseYPosition(iconElement.getAttribute('yPosition'));
          icon.apiFramework = iconElement.getAttribute('apiFramework');
          icon.offset = _this.parserUtils.parseDuration(iconElement.getAttribute('offset'));
          icon.duration = _this.parserUtils.parseDuration(iconElement.getAttribute('duration'));

          _this.parserUtils.childrenByName(iconElement, 'HTMLResource').forEach(function (htmlElement) {
            icon.type = htmlElement.getAttribute('creativeType') || 'text/html';
            icon.htmlResource = _this.parserUtils.parseNodeText(htmlElement);
          });

          _this.parserUtils.childrenByName(iconElement, 'IFrameResource').forEach(function (iframeElement) {
            icon.type = iframeElement.getAttribute('creativeType') || 0;
            icon.iframeResource = _this.parserUtils.parseNodeText(iframeElement);
          });

          _this.parserUtils.childrenByName(iconElement, 'StaticResource').forEach(function (staticElement) {
            icon.type = staticElement.getAttribute('creativeType') || 0;
            icon.staticResource = _this.parserUtils.parseNodeText(staticElement);
          });

          var iconClicksElement = _this.parserUtils.childByName(iconElement, 'IconClicks');
          if (iconClicksElement) {
            icon.iconClickThroughURLTemplate = _this.parserUtils.parseNodeText(_this.parserUtils.childByName(iconClicksElement, 'IconClickThrough'));
            _this.parserUtils.childrenByName(iconClicksElement, 'IconClickTracking').forEach(function (iconClickTrackingElement) {
              icon.iconClickTrackingURLTemplates.push(_this.parserUtils.parseNodeText(iconClickTrackingElement));
            });
          }

          icon.iconViewTrackingURLTemplate = _this.parserUtils.parseNodeText(_this.parserUtils.childByName(iconElement, 'IconViewTracking'));

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

  }, {
    key: 'parseXPosition',
    value: function parseXPosition(xPosition) {
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

  }, {
    key: 'parseYPosition',
    value: function parseYPosition(yPosition) {
      if (['top', 'bottom'].indexOf(yPosition) !== -1) {
        return yPosition;
      }

      return parseInt(yPosition || 0);
    }
  }]);
  return CreativeLinearParser;
}();

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
 * This class provides methods to parse a VAST NonLinear Element.
 * @export
 * @class CreativeNonLinearParser
 */
var CreativeNonLinearParser = function () {
  /**
   * Creates an instance of CreativeNonLinearParser.
   */
  function CreativeNonLinearParser() {
    classCallCheck(this, CreativeNonLinearParser);

    this.parserUtils = new ParserUtils();
  }

  /**
   * Parses a NonLinear element.
   * @param  {any} creativeElement - The VAST NonLinear element to parse.
   * @param  {any} creativeAttributes - The attributes of the NonLinear (optional).
   * @return {CreativeNonLinear}
   */


  createClass(CreativeNonLinearParser, [{
    key: 'parse',
    value: function parse(creativeElement, creativeAttributes) {
      var _this = this;

      var creative = new CreativeNonLinear(creativeAttributes);

      this.parserUtils.childrenByName(creativeElement, 'TrackingEvents').forEach(function (trackingEventsElement) {
        var eventName = void 0,
            trackingURLTemplate = void 0;
        _this.parserUtils.childrenByName(trackingEventsElement, 'Tracking').forEach(function (trackingElement) {
          eventName = trackingElement.getAttribute('event');
          trackingURLTemplate = _this.parserUtils.parseNodeText(trackingElement);

          if (eventName && trackingURLTemplate) {
            if (creative.trackingEvents[eventName] == null) {
              creative.trackingEvents[eventName] = [];
            }
            creative.trackingEvents[eventName].push(trackingURLTemplate);
          }
        });
      });

      this.parserUtils.childrenByName(creativeElement, 'NonLinear').forEach(function (nonlinearResource) {
        var nonlinearAd = new NonLinearAd();
        nonlinearAd.id = nonlinearResource.getAttribute('id') || null;
        nonlinearAd.width = nonlinearResource.getAttribute('width');
        nonlinearAd.height = nonlinearResource.getAttribute('height');
        nonlinearAd.expandedWidth = nonlinearResource.getAttribute('expandedWidth');
        nonlinearAd.expandedHeight = nonlinearResource.getAttribute('expandedHeight');
        nonlinearAd.scalable = _this.parserUtils.parseBoolean(nonlinearResource.getAttribute('scalable'));
        nonlinearAd.maintainAspectRatio = _this.parserUtils.parseBoolean(nonlinearResource.getAttribute('maintainAspectRatio'));
        nonlinearAd.minSuggestedDuration = _this.parserUtils.parseDuration(nonlinearResource.getAttribute('minSuggestedDuration'));
        nonlinearAd.apiFramework = nonlinearResource.getAttribute('apiFramework');

        _this.parserUtils.childrenByName(nonlinearResource, 'HTMLResource').forEach(function (htmlElement) {
          nonlinearAd.type = htmlElement.getAttribute('creativeType') || 'text/html';
          nonlinearAd.htmlResource = _this.parserUtils.parseNodeText(htmlElement);
        });

        _this.parserUtils.childrenByName(nonlinearResource, 'IFrameResource').forEach(function (iframeElement) {
          nonlinearAd.type = iframeElement.getAttribute('creativeType') || 0;
          nonlinearAd.iframeResource = _this.parserUtils.parseNodeText(iframeElement);
        });

        _this.parserUtils.childrenByName(nonlinearResource, 'StaticResource').forEach(function (staticElement) {
          nonlinearAd.type = staticElement.getAttribute('creativeType') || 0;
          nonlinearAd.staticResource = _this.parserUtils.parseNodeText(staticElement);
        });

        var adParamsElement = _this.parserUtils.childByName(nonlinearResource, 'AdParameters');
        if (adParamsElement) {
          nonlinearAd.adParameters = _this.parserUtils.parseNodeText(adParamsElement);
        }

        nonlinearAd.nonlinearClickThroughURLTemplate = _this.parserUtils.parseNodeText(_this.parserUtils.childByName(nonlinearResource, 'NonLinearClickThrough'));
        _this.parserUtils.childrenByName(nonlinearResource, 'NonLinearClickTracking').forEach(function (clickTrackingElement) {
          nonlinearAd.nonlinearClickTrackingURLTemplates.push(_this.parserUtils.parseNodeText(clickTrackingElement));
        });

        creative.variations.push(nonlinearAd);
      });

      return creative;
    }
  }]);
  return CreativeNonLinearParser;
}();

/**
 * This class provides methods to parse a VAST Ad Element.
 * @export
 * @class AdParser
 */
var AdParser = function () {
  /**
   * Creates an instance of AdParser.
   */
  function AdParser() {
    classCallCheck(this, AdParser);

    this.creativeCompanionParser = new CreativeCompanionParser();
    this.creativeNonLinearParser = new CreativeNonLinearParser();
    this.creativeLinearParser = new CreativeLinearParser();
    this.parserUtils = new ParserUtils();
  }

  /**
   * Parses an Ad element (can either be a Wrapper or an InLine).
   * @param  {Object} adElement - The VAST Ad element to parse.
   * @return {Ad}
   */


  createClass(AdParser, [{
    key: 'parse',
    value: function parse(adElement) {
      var childNodes = adElement.childNodes;

      for (var adTypeElementKey in childNodes) {
        var adTypeElement = childNodes[adTypeElementKey];

        if (['Wrapper', 'InLine'].indexOf(adTypeElement.nodeName) === -1) {
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

    /**
     * Parses an Inline element.
     * @param  {Object} inLineElement - The VAST Inline element to parse.
     * @return {Ad}
     */

  }, {
    key: 'parseInLine',
    value: function parseInLine(inLineElement) {
      var _this = this;

      var childNodes = inLineElement.childNodes;
      var ad = new Ad();
      ad.id = inLineElement.getAttribute('id') || null;
      ad.sequence = inLineElement.getAttribute('sequence') || null;

      for (var nodeKey in childNodes) {
        var node = childNodes[nodeKey];

        switch (node.nodeName) {
          case 'Error':
            ad.errorURLTemplates.push(this.parserUtils.parseNodeText(node));
            break;

          case 'Impression':
            ad.impressionURLTemplates.push(this.parserUtils.parseNodeText(node));
            break;

          case 'Creatives':
            this.parserUtils.childrenByName(node, 'Creative').forEach(function (creativeElement) {
              var creativeAttributes = {
                id: creativeElement.getAttribute('id') || null,
                adId: _this.parseCreativeAdIdAttribute(creativeElement),
                sequence: creativeElement.getAttribute('sequence') || null,
                apiFramework: creativeElement.getAttribute('apiFramework') || null
              };

              for (var creativeTypeElementKey in creativeElement.childNodes) {
                var creativeTypeElement = creativeElement.childNodes[creativeTypeElementKey];

                switch (creativeTypeElement.nodeName) {
                  case 'Linear':
                    var creativeLinear = _this.creativeLinearParser.parse(creativeTypeElement, creativeAttributes);
                    if (creativeLinear) {
                      ad.creatives.push(creativeLinear);
                    }
                    break;
                  case 'NonLinearAds':
                    var creativeNonLinear = _this.creativeNonLinearParser.parse(creativeTypeElement, creativeAttributes);
                    if (creativeNonLinear) {
                      ad.creatives.push(creativeNonLinear);
                    }
                    break;
                  case 'CompanionAds':
                    var creativeCompanion = _this.creativeCompanionParser.parse(creativeTypeElement, creativeAttributes);
                    if (creativeCompanion) {
                      ad.creatives.push(creativeCompanion);
                    }
                    break;
                }
              }
            });
            break;

          case 'Extensions':
            this.parseExtensions(ad.extensions, this.parserUtils.childrenByName(node, 'Extension'));
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

    /**
     * Parses a Wrapper element without resolving the wrapped urls.
     * @param  {Object} wrapperElement - The VAST Wrapper element to be parsed.
     * @return {Ad}
     */

  }, {
    key: 'parseWrapper',
    value: function parseWrapper(wrapperElement) {
      var ad = this.parseInLine(wrapperElement);
      var wrapperURLElement = this.parserUtils.childByName(wrapperElement, 'VASTAdTagURI');

      if (wrapperURLElement) {
        ad.nextWrapperURL = this.parserUtils.parseNodeText(wrapperURLElement);
      } else {
        wrapperURLElement = this.parserUtils.childByName(wrapperElement, 'VASTAdTagURL');

        if (wrapperURLElement) {
          ad.nextWrapperURL = this.parserUtils.parseNodeText(this.parserUtils.childByName(wrapperURLElement, 'URL'));
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
              if (!ad.trackingEvents[wrapperCreativeElement.type][eventName]) {
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
            if (!ad.videoClickTrackingURLTemplates) {
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
            if (!ad.videoCustomClickURLTemplates) {
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

  }, {
    key: 'parseExtensions',
    value: function parseExtensions(collection, extensions) {
      var _this2 = this;

      extensions.forEach(function (extNode) {
        var ext = new AdExtension();
        var extNodeAttrs = extNode.attributes;
        var childNodes = extNode.childNodes;

        if (extNode.attributes) {
          for (var extNodeAttrKey in extNodeAttrs) {
            var extNodeAttr = extNodeAttrs[extNodeAttrKey];

            if (extNodeAttr.nodeName && extNodeAttr.nodeValue) {
              ext.attributes[extNodeAttr.nodeName] = extNodeAttr.nodeValue;
            }
          }
        }

        for (var childNodeKey in childNodes) {
          var childNode = childNodes[childNodeKey];
          var txt = _this2.parserUtils.parseNodeText(childNode);

          // ignore comments / empty value
          if (childNode.nodeName !== '#comment' && txt !== '') {
            var extChild = new AdExtensionChild();
            extChild.name = childNode.nodeName;
            extChild.value = txt;

            if (childNode.attributes) {
              var childNodeAttributes = childNode.attributes;

              for (var extChildNodeAttrKey in childNodeAttributes) {
                var extChildNodeAttr = childNodeAttributes[extChildNodeAttrKey];

                extChild.attributes[extChildNodeAttr.nodeName] = extChildNodeAttr.nodeValue;
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

  }, {
    key: 'parseCreativeAdIdAttribute',
    value: function parseCreativeAdIdAttribute(creativeElement) {
      return creativeElement.getAttribute('AdID') || // VAST 2 spec
      creativeElement.getAttribute('adID') || // VAST 3 spec
      creativeElement.getAttribute('adId') || // VAST 4 spec
      null;
    }
  }]);
  return AdParser;
}();

var FlashURLHandler = function () {
  function FlashURLHandler() {
    classCallCheck(this, FlashURLHandler);
  }

  createClass(FlashURLHandler, [{
    key: 'xdr',
    value: function xdr() {
      var xdr = void 0;
      if (window.XDomainRequest) {
        xdr = new XDomainRequest();
      }
      return xdr;
    }
  }, {
    key: 'supported',
    value: function supported() {
      return !!this.xdr();
    }
  }, {
    key: 'get',
    value: function get$$1(url, options, cb) {
      var xmlDocument = typeof window.ActiveXObject === 'function' ? new window.ActiveXObject('Microsoft.XMLDOM') : undefined;

      if (xmlDocument) {
        xmlDocument.async = false;
      } else {
        return cb(new Error('FlashURLHandler: Microsoft.XMLDOM format not supported'));
      }

      var xdr = this.xdr();
      xdr.open('GET', url);
      xdr.timeout = options.timeout || 0;
      xdr.withCredentials = options.withCredentials || false;
      xdr.send();
      xdr.onprogress = function () {};

      xdr.onload = function () {
        xmlDocument.loadXML(xdr.responseText);
        cb(null, xmlDocument);
      };
    }
  }]);
  return FlashURLHandler;
}();

var uri = require('url');
var fs = require('fs');
var http = require('http');
var https = require('https');
var DOMParser = require('xmldom').DOMParser;

var NodeURLHandler = function () {
  function NodeURLHandler() {
    classCallCheck(this, NodeURLHandler);
  }

  createClass(NodeURLHandler, [{
    key: 'get',
    value: function get$$1(url, options, cb) {
      url = uri.parse(url);
      var httpModule = url.protocol === 'https:' ? https : http;
      if (url.protocol === 'file:') {
        fs.readFile(url.pathname, 'utf8', function (err, data) {
          if (err) {
            return cb(err);
          }
          var xml = new DOMParser().parseFromString(data);
          cb(null, xml);
        });
      } else {
        var timing = void 0;
        var data = '';

        var timeout_wrapper = function timeout_wrapper(req) {
          return function () {
            return req.abort();
          };
        };

        var req = httpModule.get(url.href, function (res) {
          res.on('data', function (chunk) {
            var timing = void 0;
            data += chunk;
            clearTimeout(timing);
            timing = setTimeout(_fn, options.timeout || 120000);
          });
          res.on('end', function () {
            clearTimeout(timing);
            var xml = new DOMParser().parseFromString(data);
            cb(null, xml);
          });
        });

        req.on('error', function (err) {
          clearTimeout(timing);
          cb(err);
        });

        var _fn = timeout_wrapper(req);
        timing = setTimeout(_fn, options.timeout || 120000);
      }
    }
  }]);
  return NodeURLHandler;
}();

var XHRURLHandler = function () {
  function XHRURLHandler() {
    classCallCheck(this, XHRURLHandler);
  }

  createClass(XHRURLHandler, [{
    key: 'xhr',
    value: function xhr() {
      try {
        var xhr = new window.XMLHttpRequest();
        if ('withCredentials' in xhr) {
          // check CORS support
          return xhr;
        }
        return null;
      } catch (err) {
        console.log('Error in XHRURLHandler support check:', err);
        return null;
      }
    }
  }, {
    key: 'supported',
    value: function supported() {
      return !!this.xhr();
    }
  }, {
    key: 'get',
    value: function get$$1(url, options, cb) {
      if (window.location.protocol === 'https:' && url.indexOf('http://') === 0) {
        return cb(new Error('XHRURLHandler: Cannot go from HTTPS to HTTP.'));
      }

      try {
        var xhr = this.xhr();
        xhr.open('GET', url);
        xhr.timeout = options.timeout || 0;
        xhr.withCredentials = options.withCredentials || false;
        xhr.overrideMimeType && xhr.overrideMimeType('text/xml');
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              cb(null, xhr.responseXML);
            } else {
              cb(new Error('XHRURLHandler: ' + xhr.statusText));
            }
          }
        };
        xhr.send();
      } catch (error) {
        cb(new Error('XHRURLHandler: Unexpected error'));
      }
    }
  }]);
  return XHRURLHandler;
}();

var URLHandler = function () {
  function URLHandler() {
    classCallCheck(this, URLHandler);

    this.flash = new FlashURLHandler();
    this.node = new NodeURLHandler();
    this.xhr = new XHRURLHandler();
  }

  createClass(URLHandler, [{
    key: 'get',
    value: function get$$1(url, options, cb) {
      // Allow skip of the options param
      if (!cb) {
        if (typeof options === 'function') {
          cb = options;
        }
        options = {};
      }

      if (options.urlhandler && options.urlhandler.supported()) {
        // explicitly supply your own URLHandler object
        return options.urlhandler.get(url, options, cb);
      } else if (typeof window === 'undefined' || window === null) {
        return this.node.get(url, options, cb);
      } else if (this.xhr.supported()) {
        return this.xhr.get(url, options, cb);
      } else if (this.flash.supported()) {
        return this.flash.get(url, options, cb);
      } else {
        return cb(new Error('Current context is not supported by any of the default URLHandlers. Please provide a custom URLHandler'));
      }
    }
  }]);
  return URLHandler;
}();

var VASTResponse = function VASTResponse() {
  classCallCheck(this, VASTResponse);

  this.ads = [];
  this.errorURLTemplates = [];
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

    _this.parserUtils = new ParserUtils();
    _this.adParser = new AdParser();
    _this.util = new Util();
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

      this.emit('VAST-error', Object.assign.apply(Object, [DEFAULT_EVENT_DATA, errorCode].concat(data)));
      this.util.track(urlTemplates, errorCode);
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
     * @emits  VASTParser#VAST-resolving
     * @emits  VASTParser#VAST-resolved
     * @return {Promise}
     */

  }, {
    key: 'fetchVAST',
    value: function fetchVAST(url) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        // Process url with defined filter
        _this2.URLTemplateFilters.forEach(function (filter) {
          url = filter(url);
        });

        _this2.parentURLs.push(url);
        _this2.emit('VAST-resolving', { url: url });

        _this2.urlHandler.get(url, _this2.fetchingOptions, function (err, xml) {
          _this2.emit('VAST-resolved', { url: url });

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

      this.urlHandler = options.urlhandler || new URLHandler();
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

      return new Promise(function (resolve, reject) {
        if (_this3.remainingAds.length === 0) {
          return reject(new Error('No more ads are available for the given VAST'));
        }

        var ads = all ? _this3.util.flatten(_this3.remainingAds) : _this3.remainingAds.shift();
        _this3.errorURLTemplates = [];
        _this3.parentURLs = [];

        _this3.resolveAds(ads, { wrapperDepth: 0, originalUrl: _this3.rootURL }).then(function (resolvedAds) {
          var response = _this3.buildVASTResponse(resolvedAds);

          resolve(response);
        }).catch(function (err) {
          return reject(err);
        });
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

      return new Promise(function (resolve, reject) {
        _this4.fetchVAST(url).then(function (xml) {
          options.originalUrl = url;
          options.isRootVAST = true;

          _this4.parse(xml, options).then(function (ads) {
            var response = _this4.buildVASTResponse(ads);

            resolve(response);
          }).catch(function (err) {
            return reject(err);
          });
        }).catch(function (err) {
          return reject(err);
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

      return new Promise(function (resolve, reject) {
        options.isRootVAST = true;

        _this5.parse(vastXml, options).then(function (ads) {
          var response = _this5.buildVASTResponse(ads);

          resolve(response);
        }).catch(function (err) {
          return reject(err);
        });
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
      this.completeWrapperResolving(response);

      return response;
    }

    /**
     * Parses the given xml Object into an array of ads
     * Returns a Promise which resolves with the array or rejects with an error according to the result of the parsing.
     * @param  {Object} vastXml - An object representing an xml document.
     * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
     * @emits  VASTParser#VAST-resolving
     * @emits  VASTParser#VAST-resolved
     * @return {Promise}
     */

  }, {
    key: 'parse',
    value: function parse(vastXml, _ref) {
      var _this6 = this;

      var _ref$resolveAll = _ref.resolveAll,
          resolveAll = _ref$resolveAll === undefined ? true : _ref$resolveAll,
          _ref$wrapperSequence = _ref.wrapperSequence,
          wrapperSequence = _ref$wrapperSequence === undefined ? null : _ref$wrapperSequence,
          _ref$originalUrl = _ref.originalUrl,
          originalUrl = _ref$originalUrl === undefined ? null : _ref$originalUrl,
          _ref$wrapperDepth = _ref.wrapperDepth,
          wrapperDepth = _ref$wrapperDepth === undefined ? 0 : _ref$wrapperDepth,
          _ref$isRootVAST = _ref.isRootVAST,
          isRootVAST = _ref$isRootVAST === undefined ? false : _ref$isRootVAST;

      return new Promise(function (resolve, reject) {
        // check if is a valid VAST document
        if (!vastXml || !vastXml.documentElement || vastXml.documentElement.nodeName !== 'VAST') {
          return reject(new Error('Invalid VAST XMLDocument'));
        }

        var ads = [];
        var childNodes = vastXml.documentElement.childNodes;

        // Fill the VASTResponse object with ads and errorURLTemplates
        for (var nodeKey in childNodes) {
          var node = childNodes[nodeKey];

          if (node.nodeName === 'Error') {
            var errorURLTemplate = _this6.parserUtils.parseNodeText(node);

            // Distinguish root VAST url templates from ad specific ones
            isRootVAST ? _this6.rootErrorURLTemplates.push(errorURLTemplate) : _this6.errorURLTemplates.push(errorURLTemplate);
          }

          if (node.nodeName === 'Ad') {
            var ad = _this6.adParser.parse(node);

            if (ad) {
              ads.push(ad);
            } else {
              // VAST version of response not supported.
              _this6.trackVastError(_this6.getErrorURLTemplates(), {
                ERRORCODE: 101
              });
            }
          }
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
          _this6.remainingAds = _this6.parserUtils.splitVAST(ads);
          // Remove the first element from the remaining ads array, since we're going to resolve that element
          ads = _this6.remainingAds.shift();
        }

        _this6.resolveAds(ads, { resolveAll: resolveAll, wrapperDepth: wrapperDepth, originalUrl: originalUrl }).then(function (res) {
          return resolve(res);
        }).catch(function (err) {
          return reject(err);
        });
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
    key: 'resolveAds',
    value: function resolveAds() {
      var _this7 = this;

      var ads = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var _ref2 = arguments[1];
      var wrapperDepth = _ref2.wrapperDepth,
          originalUrl = _ref2.originalUrl;

      return new Promise(function (resolve, reject) {
        var resolveWrappersPromises = [];

        ads.forEach(function (ad) {
          var resolveWrappersPromise = _this7.resolveWrappers(ad, wrapperDepth, originalUrl);

          resolveWrappersPromises.push(resolveWrappersPromise);
        });

        resolve(Promise.all(resolveWrappersPromises).then(function (unwrappedAds) {
          return _this7.util.flatten(unwrappedAds);
        }));
      }).then(function (resolvedAds) {
        if (!resolvedAds && _this7.remainingAds.length > 0) {
          var _ads = _this7.remainingAds.shift();

          return _this7.resolveAds(_ads, {
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
      var _this8 = this;

      return new Promise(function (resolve, reject) {
        // Going one level deeper in the wrapper chain
        wrapperDepth++;
        // We already have a resolved VAST ad, no need to resolve wrapper
        if (!ad.nextWrapperURL) {
          delete ad.nextWrapperURL;
          return resolve(ad);
        }

        if (wrapperDepth >= _this8.maxWrapperDepth || _this8.parentURLs.indexOf(ad.nextWrapperURL) !== -1) {
          // Wrapper limit reached, as defined by the video player.
          // Too many Wrapper responses have been received with no InLine response.
          ad.errorCode = 302;
          delete ad.nextWrapperURL;
          return resolve(ad);
        }

        // Get full URL
        ad.nextWrapperURL = _this8.parserUtils.resolveVastAdTagURI(ad.nextWrapperURL, originalUrl);

        // sequence doesn't carry over in wrapper element
        var wrapperSequence = ad.sequence;
        originalUrl = ad.nextWrapperURL;

        _this8.fetchVAST(ad.nextWrapperURL).then(function (xml) {
          _this8.parse(xml, { originalUrl: originalUrl, wrapperSequence: wrapperSequence, wrapperDepth: wrapperDepth }).then(function (unwrappedAds) {
            delete ad.nextWrapperURL;
            if (unwrappedAds.length === 0) {
              // No ads returned by the wrappedResponse, discard current <Ad><Wrapper> creatives
              ad.creatives = [];
              return resolve(ad);
            }

            unwrappedAds.forEach(function (unwrappedAd) {
              if (unwrappedAd) {
                _this8.mergeWrapperAdData(unwrappedAd, ad);
              }
            });

            resolve(unwrappedAds);
          }).catch(function (err) {
            // Timeout of VAST URI provided in Wrapper element, or of VAST URI provided in a subsequent Wrapper element.
            // (URI was either unavailable or reached a timeout as defined by the video player.)
            ad.errorCode = 301;
            ad.errorMessage = err.message;

            resolve(ad);
          });
        }).catch(function (err) {
          return reject(err);
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

    /**
     * Merges the data between an unwrapped ad and his wrapper.
     * @param  {Ad} unwrappedAd - The 'unwrapped' Ad.
     * @param  {Ad} wrapper - The wrapper Ad.
     * @return {void}
     */

  }, {
    key: 'mergeWrapperAdData',
    value: function mergeWrapperAdData(unwrappedAd, wrapper) {
      unwrappedAd.errorURLTemplates = wrapper.errorURLTemplates.concat(unwrappedAd.errorURLTemplates);
      unwrappedAd.impressionURLTemplates = wrapper.impressionURLTemplates.concat(unwrappedAd.impressionURLTemplates);
      unwrappedAd.extensions = wrapper.extensions.concat(unwrappedAd.extensions);

      unwrappedAd.creatives.forEach(function (creative) {
        if (wrapper.trackingEvents && wrapper.trackingEvents[creative.type]) {
          for (var eventName in wrapper.trackingEvents[creative.type]) {
            var urls = wrapper.trackingEvents[creative.type][eventName];
            if (!creative.trackingEvents[eventName]) {
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
          if (creative.type === 'linear' && creative.videoClickThroughURLTemplate == null) {
            creative.videoClickThroughURLTemplate = wrapper.videoClickThroughURLTemplate;
          }
        });
      }
    }
  }]);
  return VASTParser;
}(events.EventEmitter);

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
    delete data[key];
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
     * @param {Object} storage - The storage to check.
     * @return {Boolean}
     */

  }, {
    key: 'isStorageDisabled',
    value: function isStorageDisabled(storage) {
      var testValue = '__VASTStorage__';

      try {
        storage.setItem(testValue, testValue);
        if (storage.getItem(testValue) !== testValue) {
          storage.removeItem(testValue);
          return true;
        }
      } catch (e) {
        return true;
      }
      storage.removeItem(testValue);
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
    this.util = new Util();
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
      options = Object.assign(this.defaultOptions, options);

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
        // previous was made in the future. We reset lastSuccessfullAd value
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
    _this.util = new Util();
    _this.muted = false;
    _this.impressed = false;
    _this.skippable = false;
    _this.skipDelayDefault = -1;
    _this.trackingEvents = {};
    // Tracker listeners should be notified with some events
    // no matter if there is a tracking URL or not
    _this.emitAlwaysEvents = ['creativeView', 'start', 'firstQuartile', 'midpoint', 'thirdQuartile', 'complete', 'resume', 'pause', 'rewind', 'skip', 'closeLinear', 'close'];
    // Have to save already triggered quartile, to not trigger again
    _this._alreadyTriggeredQuartiles = {};
    // Duplicate the creative's trackingEvents property so we can alter it
    for (var eventName in _this.creative.trackingEvents) {
      var events$$1 = _this.creative.trackingEvents[eventName];
      _this.trackingEvents[eventName] = events$$1.slice(0);
    }
    if (_this.creative instanceof CreativeLinear) {
      _this.setDuration(_this.creative.duration);

      _this.skipDelay = _this.creative.skipDelay;
      _this.linear = true;
      _this.clickThroughURLTemplate = _this.creative.videoClickThroughURLTemplate;
      _this.clickTrackingURLTemplates = _this.creative.videoClickTrackingURLTemplates;
      // Nonlinear and Companion
    } else {
      _this.skipDelay = -1;
      _this.linear = false;
      // Used variation has been specified
      if (_this.variation) {
        if (_this.variation instanceof NonLinearAd) {
          _this.clickThroughURLTemplate = _this.variation.nonlinearClickThroughURLTemplate;
          _this.clickTrackingURLTemplates = _this.variation.nonlinearClickTrackingURLTemplates;
        } else if (_this.variation instanceof CompanionAd) {
          _this.clickThroughURLTemplate = _this.variation.companionClickThroughURLTemplate;
          _this.clickTrackingURLTemplates = _this.variation.companionClickTrackingURLTemplates;
        }
      }
    }

    // If the tracker is associated with a client we add a listener to the start event
    // to update the lastSuccessfulAd property.
    if (client) {
      _this.on('start', function () {
        client.lastSuccessfullAd = Date.now();
      });
    }
    return _this;
  }

  /**
   * Sets the duration of the ad and updates the quartiles based on that.
   *
   * @param  {Number} duration - The duration of the ad.
   */


  createClass(VASTTracker, [{
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

      var skipDelay = this.skipDelay || this.skipDelayDefault;

      if (skipDelay !== -1 && !this.skippable) {
        if (skipDelay > progress) {
          this.emit('skip-countdown', skipDelay - progress);
        } else {
          this.skippable = true;
          this.emit('skip-countdown', 0);
        }
      }

      if (this.linear && this.assetDuration > 0) {
        var events$$1 = [];

        if (progress > 0) {
          var percent = Math.round(progress / this.assetDuration * 100);

          events$$1.push('start');
          events$$1.push('progress-' + percent + '%');
          events$$1.push('progress-' + Math.round(progress));

          for (var quartile in this.quartiles) {
            if (this.isQuartileReached(quartile, this.quartiles[quartile], progress)) {
              events$$1.push(quartile);
              this._alreadyTriggeredQuartiles[quartile] = true;
            }
          }
        }

        events$$1.forEach(function (eventName) {
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
     */

  }, {
    key: 'errorWithCode',
    value: function errorWithCode(errorCode) {
      this.trackURLs(this.ad.errorURLTemplates, { ERRORCODE: errorCode });
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
      this.trackingEvents = [];
    }

    /**
     * Must be called when the user clicks on the creative.
     * It calls the tracking URLs and emits a 'clickthrough' event with the resolved
     * clickthrough URL when done.
     *
     * @emits VASTTracker#clickthrough
     */

  }, {
    key: 'click',
    value: function click() {
      if (this.clickTrackingURLTemplates && this.clickTrackingURLTemplates.length) {
        this.trackURLs(this.clickTrackingURLTemplates);
      }

      if (this.clickThroughURLTemplate) {
        var variables = this.linear ? { CONTENTPLAYHEAD: this.progressFormatted() } : {};
        var clickThroughURL = this.util.resolveURLTemplates([this.clickThroughURLTemplate], variables)[0];

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
     */

  }, {
    key: 'trackURLs',
    value: function trackURLs(URLTemplates) {
      var variables = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (this.linear) {
        if (this.creative && this.creative.mediaFiles && this.creative.mediaFiles[0] && this.creative.mediaFiles[0].fileURL) {
          variables['ASSETURI'] = this.creative.mediaFiles[0].fileURL;
        }
        variables['CONTENTPLAYHEAD'] = this.progressFormatted();
      }

      this.util.track(URLTemplates, variables);
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
}(events.EventEmitter);

exports.VASTClient = VASTClient;
exports.VASTParser = VASTParser;
exports.VASTTracker = VASTTracker;
