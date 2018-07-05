import { Util } from '../util/util';

/**
 * This class provides support methods to the parsing classes.
 * @export
 * @class ParserUtils
 */
export class ParserUtils {
  /**
   * Creates an instance of ParserUtils.
   */
  constructor() {
    this.util = new Util();
  }

  /**
   * Returns the first element of the given node which nodeName matches the given name.
   * @param  {Object} node - The node to use to find a match.
   * @param  {String} name - The name to look for.
   * @return {Object}
   */
  childByName(node, name) {
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
  childrenByName(node, name) {
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
  resolveVastAdTagURI(vastAdTagUrl, originalUrl) {
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
  parseBoolean(booleanString) {
    return ['true', 'TRUE', '1'].includes(booleanString);
  }

  /**
   * Parses a node text (for legacy support).
   * @param  {Object} node - The node to parse the text from.
   * @return {String}
   */
  parseNodeText(node) {
    return node && (node.textContent || node.text || '').trim();
  }

  /**
   * Copies an attribute from a node to another.
   * @param  {String} attributeName - The name of the attribute to clone.
   * @param  {Object} nodeSource - The source node to copy the attribute from.
   * @param  {Object} nodeDestination - The destination node to copy the attribute at.
   */
  copyNodeAttribute(attributeName, nodeSource, nodeDestination) {
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
  parseDuration(durationString) {
    if (durationString == null) {
      return -1;
    }
    // Some VAST doesn't have an HH:MM:SS duration format but instead jus the number of seconds
    if (this.util.isNumeric(durationString)) {
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
  splitVAST(ads) {
    const splittedVAST = [];
    let adPod = [];
    let isAdPod = false;
    let adPodSequence = null;

    ads.forEach(ad => {
      // Check if we are at the beginning of a new AdPod
      if (ad.sequence === 1) {
        // Check if we were already in the middle of an AdPod
        // If so push the previous AdPod to the splittedVAST
        if (isAdPod) {
          splittedVAST.push(adPod);
        }
        // Clean up and start storing the new AdPod
        adPod = [];
        adPod.push(ad);
        adPodSequence = 1;
      } else {
        // Check if we were already in the middle of an AdPod
        if (isAdPod) {
          // Check if the current ad is the next ad of the AdPod
          if (ad.sequence === adPodSequence + 1) {
            adPod.push(ad);
            adPodSequence = ad.sequence;
          } else {
            // If the current ad is not the next in the AdPod and not the first of an AdPod,
            // push the previous AdPod and the current ad to the splittedVAST and clean up
            splittedVAST.push(adPod);
            splittedVAST.push([ad]);
            isAdPod = false;
            adPodSequence = null;
            adPod = [];
          }
        } else {
          splittedVAST.push([ad]);
          isAdPod = false;
          adPodSequence = null;
          adPod = [];
        }
      }
    });

    return splittedVAST;
  }
}
