/**
 * This class provides an wrapper interface to the a key-value storage.
 * It uses localStorage, sessionStorage or a custom storage if none of the two is available.
 * @export
 * @class Storage
 */
export class Storage {
    storage: any;
    /**
     * Provides a singleton instance of the wrapped storage.
     * @return {Object}
     */
    initStorage(): any;
    /**
     * Check if storage is disabled (like in certain cases with private browsing).
     * In Safari (Mac + iOS) when private browsing is ON, localStorage is read only
     * http://spin.atomicobject.com/2013/01/23/ios-private-browsing-localstorage/
     * @param {Object} testStorage - The storage to check.
     * @return {Boolean}
     */
    isStorageDisabled(testStorage: any): boolean;
    /**
     * Returns the value for the given key. If the key does not exist, null is returned.
     * @param  {String} key - The key to retrieve the value.
     * @return {any}
     */
    getItem(key: string): any;
    /**
     * Adds or updates the value for the given key.
     * @param  {String} key - The key to modify the value.
     * @param  {any} value - The value to be associated with the key.
     * @return {any}
     */
    setItem(key: string, value: any): any;
    /**
     * Removes an item for the given key.
     * @param  {String} key - The key to remove the value.
     * @return {any}
     */
    removeItem(key: string): any;
    /**
     * Removes all the items from the storage.
     */
    clear(): any;
}
//# sourceMappingURL=storage.d.ts.map