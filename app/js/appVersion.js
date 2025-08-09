const AppVersion = (function() {
    'use strict';
    const VERSION = '1.2.1';
    function get() {
        return VERSION;
    }
    function display() {
        const el = document.getElementById('app-version');
        if (el) el.textContent = VERSION;
    }
    return { get, display };
})();
