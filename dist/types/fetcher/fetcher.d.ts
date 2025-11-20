/**
 * This class provides a method to fetch a VAST document
 * @exports
 * @class Fetcher
 */
export class Fetcher {
    URLTemplateFilters: any[];
    /**
     * Inits the fetching properties of the class with the custom values provided as options
     * @param {Object} options - The options to initialize before fetching
     */
    setOptions(options?: any): void;
    urlHandler: any;
    fetchingOptions: any;
    /**
     * Adds a filter function to the array of filters which are called before fetching a VAST document.
     * @param  {function} filter - The filter function to be added at the end of the array.
     */
    addURLTemplateFilter(filter: Function): void;
    /**
     * Removes the latest URL template filter added.
     */
    removeLastURLTemplateFilter(): void;
    /**
     * Returns the number of URL template filters added.
     * @return {Number}
     */
    countURLTemplateFilters(): number;
    /**
     * Removes all the URL template filters added.
     */
    clearURLTemplateFilters(): void;
    /**
     * Fetches a VAST document for the given url.
     * @param {Object} params
     * @param {String} params.url - The url to request the VAST document.
     * @param {Number} params.wrapperDepth - How many times the current url has been wrapped.
     * @param {(String | null)} params.previousUrl - Url of the previous VAST.
     * @param {Object} params.wrapperAd - Previously parsed ad node (Wrapper) related to this fetching.
     * @param {Number} params.maxWrapperDepth - The maximum number of Wrapper that can be fetch
     * @param {Function} params.emitter - The function used to Emit event
     * @emits  VASTParser#VAST-resolving
     * @emits  VASTParser#VAST-resolved
     * @return {Promise}
     */
    fetchVAST({ url, maxWrapperDepth, emitter, wrapperDepth, previousUrl, wrapperAd, }: {
        url: string;
        wrapperDepth: number;
        previousUrl: (string | null);
        wrapperAd: any;
        maxWrapperDepth: number;
        emitter: Function;
    }): Promise<any>;
}
//# sourceMappingURL=fetcher.d.ts.map