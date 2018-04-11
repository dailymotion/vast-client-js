import { Util } from '../util/util';

export class ParserUtils {
  constructor() {
    this.util = new Util();
  }

  childByName(node, name) {
    const childNodes = node.childNodes;

    for (let childKey in childNodes) {
      const child = childNodes[childKey];

      if (child.nodeName === name) {
        return child;
      }
    }
  }

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

  parseBoolean(booleanString) {
    return ['true', 'TRUE', '1'].includes(booleanString);
  }

  // Parsing node text for legacy support
  parseNodeText(node) {
    return node && (node.textContent || node.text || '').trim();
  }

  copyNodeAttribute(attributeName, nodeSource, nodeDestination) {
    const attributeValue = nodeSource.getAttribute(attributeName);
    if (attributeValue) {
      nodeDestination.setAttribute(attributeName, attributeValue);
    }
  }

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
}
