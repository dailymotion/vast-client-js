import { Util } from '../util/util';

const util = new Util();

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
  const childNodes = node.childNodes;

  for (let childKey in childNodes) {
    const child = childNodes[childKey];

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
  const children = [];
  const childNodes = node.childNodes;

  for (let childKey in childNodes) {
    const child = childNodes[childKey];

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
    const { protocol } = location;
    return `${protocol}${vastAdTagUrl}`;
  }

  if (vastAdTagUrl.indexOf('://') === -1) {
    // Resolve relative URLs (mainly for unit testing)
    const baseURL = originalUrl.slice(0, originalUrl.lastIndexOf('/'));
    return `${baseURL}/${vastAdTagUrl}`;
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
  const attributeValue = nodeSource.getAttribute(attributeName);
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
  if (durationString == null) {
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
    seconds += parseFloat(`0.${secondsAndMS[1]}`);
  }

  const minutes = parseInt(durationComponents[1] * 60);
  const hours = parseInt(durationComponents[0] * 60 * 60);

  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    isNaN(seconds) ||
    minutes > 60 * 60 ||
    seconds > 60
  ) {
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
 * Merges the data between an unwrapped ad and his wrapper.
 * @param  {Ad} unwrappedAd - The 'unwrapped' Ad.
 * @param  {Ad} wrapper - The wrapper Ad.
 * @return {void}
 */
function mergeWrapperAdData(unwrappedAd, wrapper) {
  unwrappedAd.errorURLTemplates = wrapper.errorURLTemplates.concat(
    unwrappedAd.errorURLTemplates
  );
  unwrappedAd.impressionURLTemplates = wrapper.impressionURLTemplates.concat(
    unwrappedAd.impressionURLTemplates
  );
  unwrappedAd.extensions = wrapper.extensions.concat(unwrappedAd.extensions);

  unwrappedAd.creatives.forEach(creative => {
    if (wrapper.trackingEvents && wrapper.trackingEvents[creative.type]) {
      for (let eventName in wrapper.trackingEvents[creative.type]) {
        const urls = wrapper.trackingEvents[creative.type][eventName];
        if (!creative.trackingEvents[eventName]) {
          creative.trackingEvents[eventName] = [];
        }
        creative.trackingEvents[eventName] = creative.trackingEvents[
          eventName
        ].concat(urls);
      }
    }
  });

  if (
    wrapper.videoClickTrackingURLTemplates &&
    wrapper.videoClickTrackingURLTemplates.length
  ) {
    unwrappedAd.creatives.forEach(creative => {
      if (creative.type === 'linear') {
        creative.videoClickTrackingURLTemplates = creative.videoClickTrackingURLTemplates.concat(
          wrapper.videoClickTrackingURLTemplates
        );
      }
    });
  }

  if (
    wrapper.videoCustomClickURLTemplates &&
    wrapper.videoCustomClickURLTemplates.length
  ) {
    unwrappedAd.creatives.forEach(creative => {
      if (creative.type === 'linear') {
        creative.videoCustomClickURLTemplates = creative.videoCustomClickURLTemplates.concat(
          wrapper.videoCustomClickURLTemplates
        );
      }
    });
  }

  // VAST 2.0 support - Use Wrapper/linear/clickThrough when Inline/Linear/clickThrough is null
  if (wrapper.videoClickThroughURLTemplate) {
    unwrappedAd.creatives.forEach(creative => {
      if (
        creative.type === 'linear' &&
        creative.videoClickThroughURLTemplate == null
      ) {
        creative.videoClickThroughURLTemplate =
          wrapper.videoClickThroughURLTemplate;
      }
    });
  }
}

export const parserUtils = {
  childByName,
  childrenByName,
  resolveVastAdTagURI,
  parseBoolean,
  parseNodeText,
  copyNodeAttribute,
  parseDuration,
  splitVAST,
  mergeWrapperAdData
};
