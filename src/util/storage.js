let storage = null;

/**
 * This class provides an wrapper interface to the a key-value storage.
 * It uses localStorage, sessionStorage or a custom storage if none of the two is available.
 * @export
 * @class Storage
 */
export class Storage {
  /**
   * Creates an instance of Storage.
   * @constructor
   */
  constructor() {
    this.storage = this.initStorage();
  }

  /**
   * Provides a singleton instance of the wrapped storage.
   * @return {Object}
   */
  initStorage() {
    if (storage != null) {
      return storage;
    }

    try {
      storage =
        typeof window !== 'undefined' && window !== null
          ? window.localStorage || window.sessionStorage
          : null;
    } catch (storageError) {
      storage = null;
    }

    // In Safari (Mac + iOS) when private browsing is ON,
    // localStorage is read only
    // http://spin.atomicobject.com/2013/01/23/ios-private-browsing-localstorage/
    const isDisabled = function(store) {
      try {
        const testValue = '__VASTStorage__';
        store.setItem(testValue, testValue);
        if (store.getItem(testValue) !== testValue) {
          store.removeItem(testValue);
          return true;
        }
      } catch (e) {
        return true;
      }
      store.removeItem(testValue);
      return false;
    };

    if (storage == null || isDisabled(storage)) {
      let data = {};
      storage = {
        length: 0,
        getItem(key) {
          return data[key];
        },
        setItem(key, value) {
          data[key] = value;
          this.length = Object.keys(data).length;
        },
        removeItem(key) {
          delete data[key];
          this.length = Object.keys(data).length;
        },
        clear() {
          data = {};
          this.length = 0;
        }
      };
    }

    return storage;
  }

  /**
   * Returns the value for the given key. If the key does not exist, null is returned.
   * @param  {String} key - The key to retrieve the value.
   * @return {any}
   */
  getItem(key) {
    return this.storage.getItem(key);
  }

  /**
   * Adds or updates the value for the given key.
   * @param  {String} key - The key to modify the value.
   * @param  {any} value - The value to be associated with the key.
   * @return {any}
   */
  setItem(key, value) {
    return this.storage.setItem(key, value);
  }

  /**
   * Removes an item for the given key.
   * @param  {String} key - The key to remove the value.
   * @return {any}
   */
  removeItem(key) {
    return this.storage.removeItem(key);
  }

  /**
   * Removes all the items from the storage.
   */
  clear() {
    return this.storage.clear();
  }
}
