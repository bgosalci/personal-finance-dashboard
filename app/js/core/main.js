// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    ThemeManager.init();
    await I18n.init();
    I18n.initDir();
    try { FinancialDashboard.init(); } catch(e) { console.error('[FinancialDashboard] init failed:', e); }
    try { OptionsJournal.init(); } catch(e) { console.error('[OptionsJournal] init failed:', e); }
    MarketStatus.init();
    PriceUpdater.init();
    ForexData.init();

});
