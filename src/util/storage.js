let storage = null;

export class Storage {
  constructor() {
    this.storage = this.initStorage();
  }

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
        const testValue = '__VASTUtil__';
        store.setItem(testValue, testValue);
        if (store.getItem(testValue) !== testValue) {
          return true;
        }
      } catch (e) {
        return true;
      }
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

  getItem(key) {
    return this.storage.getItem(key);
  }

  setItem(key, value) {
    return this.storage.setItem(key, value);
  }

  removeItem(key) {
    return this.storage.removeItem(key);
  }

  clear() {
    return this.storage.clear();
  }
}
