const DateUtils = (function() {
    'use strict';
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        if (!y || !m || !d) return dateStr;
        return `${d}/${m}/${y}`;
    }
    return { formatDate };
})();
