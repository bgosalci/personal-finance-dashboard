const DateUtils = (function() {
    'use strict';
    function formatDate(dateStr) {
        return I18n.formatDate(dateStr);
    }
    return { formatDate };
})();
