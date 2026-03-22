// Shared utility functions used across multiple modules.
const Utils = (function() {
    'use strict';

    /**
     * Formats a numeric input string with thousands separators and up to 2 decimal places.
     * @param {string} value - Raw input string
     * @param {boolean} [pad=false] - Pad decimal part to 2 digits on blur
     * @returns {string} Formatted string
     */
    function formatInputValue(value, pad = false) {
        const clean = value.replace(/[^0-9.]/g, '');
        if (clean === '') return '';
        const [intPart, decPart] = clean.split('.');
        const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        if (decPart !== undefined) {
            if (decPart === '') {
                return `${formattedInt}.`;
            }
            const decimals = decPart.slice(0, 2);
            return pad ? `${formattedInt}.${decimals.padEnd(2, '0')}` : `${formattedInt}.${decimals}`;
        }
        return formattedInt;
    }

    /**
     * Show a non-blocking toast notification.
     * @param {string} message - Text to display
     * @param {'error'|'warning'|'info'|'success'} [type='error'] - Visual style
     */
    function showToast(message, type = 'error') {
        if (typeof document === 'undefined') return;
        const toast = document.createElement('div');
        toast.className = `pf-toast pf-toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.textContent = message;
        document.body.appendChild(toast);
        // Trigger CSS transition on next paint
        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('pf-toast-visible'));
        });
        setTimeout(() => {
            toast.classList.remove('pf-toast-visible');
            const fallback = setTimeout(() => toast.remove(), 500);
            toast.addEventListener('transitionend', () => {
                clearTimeout(fallback);
                toast.remove();
            }, { once: true });
        }, 4000);
    }

    return { formatInputValue, showToast };
})();

if (typeof module !== 'undefined') module.exports = Utils;
