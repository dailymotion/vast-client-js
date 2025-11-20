/**
 * Parses a String duration into a Number.
 * @param  {String} durationString - The dureation represented as a string.
 * @return {Number}
 */
export function parseDuration(durationString: string): number;
export namespace parserUtils {
    export { childByName };
    export { childrenByName };
    export { resolveVastAdTagURI };
    export { parseBoolean };
    export { parseNodeText };
    export { copyNodeAttribute };
    export { parseAttributes };
    export { parseDuration };
    export { getStandAloneAds };
    export { getSortedAdPods };
    export { assignAttributes };
    export { mergeWrapperAdData };
}
/**
 * This module provides support methods to the parsing classes.
 */
/**
 * Returns the first element of the given node which nodeName matches the given name.
 * @param  {Node} node - The node to use to find a match.
 * @param  {String} name - The name to look for.
 * @return {Object|undefined}
 */
declare function childByName(node: Node, name: string): any | undefined;
/**
 * Returns all the elements of the given node which nodeName match the given name.
 * @param  {Node} node - The node to use to find the matches.
 * @param  {String} name - The name to look for.
 * @return {Array}
 */
declare function childrenByName(node: Node, name: string): any[];
/**
 * Converts relative vastAdTagUri.
 * @param  {String} vastAdTagUrl - The url to resolve.
 * @param  {String} originalUrl - The original url.
 * @return {String}
 */
declare function resolveVastAdTagURI(vastAdTagUrl: string, originalUrl: string): string;
/**
 * Converts a boolean string into a Boolean.
 * @param  {String} booleanString - The boolean string to convert.
 * @return {Boolean}
 */
declare function parseBoolean(booleanString: string): boolean;
/**
 * Parses a node text (for legacy support).
 * @param  {Object} node - The node to parse the text from.
 * @return {String}
 */
declare function parseNodeText(node: any): string;
/**
 * Copies an attribute from a node to another.
 * @param  {String} attributeName - The name of the attribute to clone.
 * @param  {Object} nodeSource - The source node to copy the attribute from.
 * @param  {Object} nodeDestination - The destination node to copy the attribute at.
 */
declare function copyNodeAttribute(attributeName: string, nodeSource: any, nodeDestination: any): void;
/**
 * Converts element attributes into an object, where object key is attribute name
 * and object value is attribute value
 * @param {Element} element
 * @returns {Object}
 */
declare function parseAttributes(element: Element): any;
/**
 * Filters out AdPods of given ads array and returns only standalone ads without sequence attribute.
 * @param {Array} ads - An array of ad objects.
 * @returns {Array} An array of standalone ad.
 */
declare function getStandAloneAds(ads?: any[]): any[];
/**
 * Sorts and filters ads that are part of an Ad Pod.
 * @param {Array} ads - An array of ad objects.
 * @returns {Array} An array of sorted ad objects based on the sequence attribute.
 */
declare function getSortedAdPods(ads?: any[]): any[];
/**
 * Parses the attributes and assign them to object
 * @param  {Object} attributes attribute
 * @param  {Object} verificationObject with properties which can be assigned
 */
declare function assignAttributes(attributes: any, verificationObject: any): void;
/**
 * Merges the data between an unwrapped ad and his wrapper.
 * @param  {Ad} unwrappedAd - The 'unwrapped' Ad.
 * @param  {Ad} wrapper - The wrapper Ad.
 * @return {void}
 */
declare function mergeWrapperAdData(unwrappedAd: Ad, wrapper: Ad): void;
export {};
//# sourceMappingURL=parser_utils.d.ts.map