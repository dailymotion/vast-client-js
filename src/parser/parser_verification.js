import { requiredValues } from '../util/requiredValues';
import { parserUtils } from './parser_utils';

/**
 * Verify and trigger warnings if a node required value is not set.
 * @param  {Node} node - The node element.
 * @param  {Function} emit - Emit function used to trigger Warning event.
 * @param  {Boolean} [isAdInline] - True if node is contained inside a InLine node.
 *
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
    for (const nodeKey in node.children) {
      verifyRequiredValues(node.children[nodeKey], emit, isAdInline);
    }
  } else if (parserUtils.parseNodeText(node).length === 0) {
    emitMissingValueWarning({ node }, emit);
    return;
  }

  return;
}

/**
 * Verify and trigger warnings if node required attributes are not set.
 * @param  {Node} node - The node element.
 * @param  {Function} emit - Emit function used to trigger Warning event.
 */
function verifyRequiredAttributes(node, emit) {
  if (!requiredValues[node.nodeName]) {
    return;
  }
  const requiredAttributes = requiredValues[node.nodeName].attributes;
  for (const attributeKey in requiredAttributes) {
    const attributeName = requiredAttributes[attributeKey];
    const attribute = node.getAttribute(attributeName);
    if (!attribute) {
      emitMissingValueWarning(
        { node, name: attributeName, type: 'attribute' },
        emit
      );
    }
  }
}

/**
 * Verify and trigger warnings if node required sub element are not set.
 * @param  {Node} node - The node element
 * @param  {Boolean} isAdInline - True if node is contained in a inline
 * @param  {Function} emit - Emit function used to trigger Warning event.
 */
function verifyRequiredSubElements(node, emit, isAdInline) {
  const required = requiredValues[node.nodeName];
  if (!required) {
    return;
  }
  const requiredSubElements = required.subElements;

  for (const subElementKey in requiredSubElements) {
    const subElementName = requiredSubElements[subElementKey];
    const subElement = parserUtils.childByName(node, subElementName);
    if (!subElement) {
      emitMissingValueWarning(
        { node, name: subElementName, type: 'sub element' },
        emit
      );
    }
  }

  // When InLine format is used some node require at least one resource (i.e <NonLinear>, <Companion>, or <Icon>)
  if (!isAdInline || !required.inLineRessources) {
    return;
  }

  let ressourceFound = false;
  for (const ressourceKey in required.inLineRessources) {
    const ressource = required.inLineRessources[ressourceKey];
    if (parserUtils.childByName(node, ressource)) {
      ressourceFound = true;
      break;
    }
  }
  if (!ressourceFound) {
    emitMissingValueWarning(
      {
        node,
        name: `${required.inLineRessources.join(' or ')}`,
        type: 'sub element'
      },
      emit
    );
  }
}

/**
 * Check if a node is sub elements.
 * @param  {Node} node - The node element.
 * @returns {Boolean}
 */
function hasSubElements(node) {
  if (
    !node.children ||
    node.children.length === 0 ||
    (node.children.length === 1 &&
      ['#text', '#cdata-section'].indexOf(node.children[0].nodeName) >= 0)
  ) {
    return false;
  }
  return true;
}

/**
 * Trigger Warning for if a node is empty or has missing attributes/subelements
 * @param  {Object} missingElement - Object containing the node with empty value, or with missing attribute/subElement name and type
 * @param  {Function} emit - Emit function used to trigger Warning event.
 * @emits  VastParser#VAST-warning
 */
function emitMissingValueWarning(missingElement, emit) {
  let message = `Element '${missingElement.node.nodeName}'`;

  if (missingElement.name) {
    message += ` missing required ${missingElement.type} '${
      missingElement.name
    }' `;
  } else {
    message += ' is empty';
  }

  const warning = {
    message,
    parentElement: missingElement.node.parentElement.nodeName,
    specVersion: 4.1
  };

  emit('VAST-warning', warning);
}

export const parserVerification = {
  verifyRequiredValues,
  emitMissingValueWarning
};
