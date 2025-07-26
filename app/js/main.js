// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    FinancialDashboard.init();
    MarketStatus.init();

    const header = document.querySelector('.header');
    const nav = document.querySelector('.nav-tabs');

    function updateNavOffset() {
        if (header && nav) {
            nav.style.top = header.offsetHeight + 'px';
        }
    }

    updateNavOffset();
    window.addEventListener('resize', updateNavOffset);
});
