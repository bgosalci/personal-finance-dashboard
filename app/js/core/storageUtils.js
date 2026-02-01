const StorageUtils = (function() {
    'use strict';

    function isLocalStorageAvailable() {
        try {
            const test = '__storage_test__';
            window.localStorage.setItem(test, test);
            window.localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    const memoryStorage = (function() {
        const store = {};
        return {
            getItem(key) {
                return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
            },
            setItem(key, value) {
                store[key] = String(value);
            },
            removeItem(key) {
                delete store[key];
            }
        };
    })();

    function getStorage() {
        return isLocalStorageAvailable() ? window.localStorage : memoryStorage;
    }

    return { isLocalStorageAvailable, getStorage };
})();
