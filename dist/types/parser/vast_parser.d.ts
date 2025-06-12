/**
 * This class provides methods to fetch and parse a VAST document.
 * @export
 * @class VASTParser
 * @extends EventEmitter
 */
export class VASTParser extends EventEmitter {
    /**
     * Creates an instance of VASTParser.
     * @constructor
     */
    constructor({ fetcher }?: {});
    maxWrapperDepth: any;
    rootErrorURLTemplates: any[];
    errorURLTemplates: any[];
    remainingAds: any[];
    parsingOptions: {};
    fetcher: any;
    /**
     * Tracks the error provided in the errorCode parameter and emits a VAST-error event for the given error.
     * @param  {Array} urlTemplates - An Array of url templates to use to make the tracking call.
     * @param  {Object} errorCode - An Object containing the error data.
     * @param  {Object} data - One (or more) Object containing additional data.
     * @emits  VASTParser#VAST-error
     * @return {void}
     */
    trackVastError(urlTemplates: any[], errorCode: any, ...data: any): void;
    /**
     * Returns an array of errorURLTemplates for the VAST being parsed.
     * @return {Array}
     */
    getErrorURLTemplates(): any[];
    /**
     * Returns the estimated bitrate calculated from all previous requests
     * @returns The average of all estimated bitrates in kb/s.
     */
    getEstimatedBitrate(): number;
    /**
     * Inits the parsing properties of the class with the custom values provided as options.
     * @param {Object} options - The options to initialize a parsing sequence
     */
    initParsingStatus(options?: any): void;
    rootURL: string;
    /**
     * Reset the parsing property of the class everytime a VAST is parsed
     */
    resetParsingStatus(): void;
    vastVersion: any;
    /**
     * Resolves the next group of ads. If all is true resolves all the remaining ads.
     * @param  {Boolean} all - If true all the remaining ads are resolved
     * @return {Promise}
     */
    getRemainingAds(all: boolean): Promise<any>;
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
    parseVAST(vastXml: any, options?: any): Promise<any>;
    /**
     * Builds a VASTResponse which can be returned.
     * @param  {Array} ads - An Array of unwrapped ads
     * @return {Object}
     */
    buildVASTResponse(ads: any[]): any;
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
    parseVastXml(vastXml: any, { isRootVAST, url, wrapperDepth, allowMultipleAds, followAdditionalWrappers, }: any): any[];
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
    parse(vastXml: any, { url, resolveAll, wrapperSequence, previousUrl, wrapperDepth, isRootVAST, followAdditionalWrappers, allowMultipleAds, }?: any): Promise<any>;
    /**
     * Resolves an Array of ads, recursively calling itself with the remaining ads if a no ad
     * response is returned for the given array.
     * @param {Array} ads - An array of ads to resolve
     * @param {Object} options - An options Object containing resolving parameters
     * @return {Promise}
     */
    resolveAds(ads: any[], { wrapperDepth, previousUrl, url }: any): Promise<any>;
    /**
     * Resolves the wrappers for the given ad in a recursive way.
     * Returns a Promise which resolves with the unwrapped ad or rejects with an error.
     * @param {Object} adToUnWrap - An ad object to be unwrapped.
     * @param {Number} wrapperDepth - The reached depth in the wrapper resolving chain.
     * @param {String} previousUrl - The previous vast url.
     * @return {Promise}
     */
    resolveWrappers(adToUnWrap: any, wrapperDepth: number, previousUrl: string): Promise<any>;
    /**
     * Takes care of handling errors when the wrappers are resolved.
     * @param {Object} vastResponse - A resolved VASTResponse.
     */
    completeWrapperResolving(vastResponse: any): void;
}
import { EventEmitter } from '../util/event_emitter';
//# sourceMappingURL=vast_parser.d.ts.map