/**
 * This class provides methods to fetch and parse a VAST document using VASTParser.
 * In addition it provides options to skip consecutive calls based on constraints.
 * @export
 * @class VASTClient
 */
export class VASTClient {
    /**
     * Creates an instance of VASTClient.
     * @param  {Number} cappingFreeLunch - The number of first calls to skip.
     * @param  {Number} cappingMinimumTimeInterval - The minimum time interval between two consecutive calls.
     * @param  {Storage} customStorage - A custom storage to use instead of the default one.
     * @constructor
     */
    constructor(cappingFreeLunch?: number, cappingMinimumTimeInterval?: number, customStorage?: Storage);
    cappingFreeLunch: number;
    cappingMinimumTimeInterval: number;
    fetcher: Fetcher;
    vastParser: VASTParser;
    storage: Storage;
    set lastSuccessfulAd(value: any);
    get lastSuccessfulAd(): any;
    set totalCalls(value: any);
    get totalCalls(): any;
    set totalCallsTimeout(value: any);
    get totalCallsTimeout(): any;
    /**
     * Adds a filter function to the array of filters which are called before fetching a VAST document.
     * @param  {function} filter - The filter function to be added at the end of the array.
     * @return {void}
     */
    addURLTemplateFilter(filter: Function): void;
    /**
     * Removes the last element of the url templates filters array.
     * @return {void}
     */
    removeLastURLTemplateFilter(): void;
    /**
     * Returns the number of filters of the url templates filters array.
     * @return {Number}
     */
    countURLTemplateFilters(): number;
    /**
     * Removes all the filter functions from the url templates filters array.
     * @return {void}
     */
    clearURLTemplateFilters(): void;
    getParser(): VASTParser;
    /**
     * Returns a boolean indicating if there are more ads to resolve for the current parsing.
     * @return {Boolean}
     */
    hasRemainingAds(): boolean;
    /**
     * Resolves the next group of ads. If all is true resolves all the remaining ads.
     * @param  {Boolean} all - If true all the remaining ads are resolved
     * @return {Promise}
     */
    getNextAds(all: boolean): Promise<any>;
    /**
     * Parses the given xml Object into a VASTResponse.
     * Returns a Promise which resolves with a fully parsed VASTResponse or rejects with an Error.
     * @param {Object} xml - An object representing a vast xml document.
     * @param {Object} options - An optional Object of parameters to be used in the parsing and fetching process.
     * @returns {Promise}
     */
    parseVAST(xml: any, options?: any): Promise<any>;
    /**
     * Gets a parsed VAST document for the given url, applying the skipping rules defined.
     * Returns a Promise which resolves with a fully parsed VASTResponse or rejects with an Error.
     * @param  {String} url - The url to use to fecth the VAST document.
     * @param  {Object} options - An optional Object of parameters to be applied in the process.
     * @return {Promise}
     */
    get(url: string, options?: any): Promise<any>;
}
import { Fetcher } from './fetcher/fetcher.js';
import { VASTParser } from './parser/vast_parser';
import { Storage } from './util/storage';
//# sourceMappingURL=vast_client.d.ts.map