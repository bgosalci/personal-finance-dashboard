const ThemeManager = (function() {
    'use strict';

    const STORAGE_KEY = 'pf_theme';
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function load() {
        return localStorage.getItem(STORAGE_KEY) || 'system';
    }

    function save(pref) {
        localStorage.setItem(STORAGE_KEY, pref);
    }

    function apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    function systemTheme() {
        return mediaQuery.matches ? 'dark' : 'light';
    }

    function update() {
        const pref = load();
        apply(pref === 'system' ? systemTheme() : pref);
    }

    function init() {
        update();
        mediaQuery.addEventListener('change', () => {
            if (load() === 'system') {
                apply(systemTheme());
            }
        });
    }

    function setPreference(pref) {
        save(pref);
        update();
    }

    return { init, setPreference, getPreference: load };
})();
