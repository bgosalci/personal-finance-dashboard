// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    ThemeManager.init();
    await I18n.init();
    I18n.initDir();
    FinancialDashboard.init();
    MarketStatus.init();
    PriceUpdater.init();
    ForexData.init();

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
