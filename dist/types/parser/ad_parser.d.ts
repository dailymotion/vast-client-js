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
export function parseAd(adElement: any, emit: Function, { allowMultipleAds, followAdditionalWrappers }?: any): any | undefined;
/**
 * Parses the AdVerifications Element.
 * @param  {Array} verifications - The array of verifications to parse.
 * @return {Array<Object>}
 */
export function _parseAdVerifications(verifications: any[]): Array<any>;
/**
 * Parses the AdVerifications Element from extension for versions < 4.0
 * @param  {Array<Node>} extensions - The array of extensions to parse.
 * @return {Array<Object>}
 */
export function _parseAdVerificationsFromExtensions(extensions: Array<Node>): Array<any>;
/**
 * Parses the ViewableImpression Element.
 * @param  {Object} viewableImpressionNode - The ViewableImpression node element.
 * @return {Object} viewableImpression - The viewableImpression object
 */
export function _parseViewableImpression(viewableImpressionNode: any): any;
//# sourceMappingURL=ad_parser.d.ts.map