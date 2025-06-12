export namespace parserVerification {
    export { verifyRequiredValues };
    export { hasSubElements };
    export { emitMissingValueWarning };
    export { verifyRequiredAttributes };
    export { verifyRequiredSubElements };
}
/**
 * Verify node required values and also verify recursively all his child nodes.
 * Trigger warnings if a node required value is missing.
 * @param  {Node} node - The node element.
 * @param  {Function} emit - Emit function used to trigger Warning event.
 * @emits  VASTParser#VAST-warning
 * @param  {undefined|Boolean} [isAdInline] - Passed recursively to itself. True if the node is contained inside a inLine tag.
 */
declare function verifyRequiredValues(node: Node, emit: Function, isAdInline?: undefined | boolean): void;
/**
 * Check if a node has sub elements.
 * @param  {Node} node - The node element.
 * @returns {Boolean}
 */
declare function hasSubElements(node: Node): boolean;
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
declare function emitMissingValueWarning({ name, parentName, attributes, subElements, oneOfResources }: {
    name: string;
    parentName: string;
    attributes: any[];
    subElements: any[];
    oneOfResources: any[];
}, emit: Function): void;
/**
 * Verify and trigger warnings if node required attributes are not set.
 * @param  {Node} node - The node element.
 * @param  {Function} emit - Emit function used to trigger Warning event.
 * @emits  VASTParser#VAST-warning
 */
declare function verifyRequiredAttributes(node: Node, emit: Function): void;
/**
 * Verify and trigger warnings if node required sub element are not set.
 * @param  {Node} node - The node element
 * @param  {Boolean} isAdInline - True if node is contained in a inline
 * @param  {Function} emit - Emit function used to trigger Warning event.
 * @emits  VASTParser#VAST-warning
 */
declare function verifyRequiredSubElements(node: Node, emit: Function, isAdInline: boolean): void;
export {};
//# sourceMappingURL=parser_verification.d.ts.map