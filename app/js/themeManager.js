const ThemeManager = (function() {
    'use strict';

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    function init() {
        apply(mediaQuery.matches ? 'dark' : 'light');
        mediaQuery.addEventListener('change', (e) => {
            apply(e.matches ? 'dark' : 'light');
        });
    }

    return { init };
})();
