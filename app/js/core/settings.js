const Settings = (function() {
    'use strict';

    const STORAGE_KEY = 'pf_base_currency';
    const FONT_SCALE_KEY = 'pf_font_scale';

    function load() {
        return localStorage.getItem(STORAGE_KEY) || 'USD';
    }

    function save(value) {
        localStorage.setItem(STORAGE_KEY, value);
    }

    function getBaseCurrency() {
        return load();
    }

    function setBaseCurrency(value) {
        save(value);
    }

    function loadFontScale() {
        const v = parseFloat(localStorage.getItem(FONT_SCALE_KEY));
        return isNaN(v) ? 1 : v;
    }

    function saveFontScale(v) {
        localStorage.setItem(FONT_SCALE_KEY, String(v));
    }

    function applyFontScale(scale) {
        document.documentElement.style.setProperty('--app-font-scale', scale);
        if (window.Chart && Chart.defaults) {
            Chart.defaults.font.size = 12 * scale;
            if (Chart.instances) {
                if (typeof Chart.instances.forEach === 'function') {
                    Chart.instances.forEach(c => c.update());
                } else {
                    Object.values(Chart.instances).forEach(c => c.update());
                }
            }
        }
    }

    function populateOptions(data) {
        const select = document.getElementById('base-currency-select');
        if (!select) return;
        const stored = load();
        let codes = ['USD', 'GBP', 'EUR'];
        if (data && data.conversion_rates) {
            codes = Object.keys(data.conversion_rates);
        }
        select.innerHTML = '';
        codes.forEach(code => {
            const opt = document.createElement('option');
            opt.value = code;
            opt.textContent = code;
            select.appendChild(opt);
        });
        select.value = stored;
    }

    function init() {
        const fontBtns = document.querySelectorAll('.font-scale-btn');
        const fontReset = document.getElementById('font-scale-reset');
        const storedScale = loadFontScale();
        applyFontScale(storedScale);

        fontBtns.forEach(btn => {
            const s = parseFloat(btn.dataset.scale);
            if (s === storedScale) {
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-primary');
            }
            btn.addEventListener('click', () => {
                const scale = parseFloat(btn.dataset.scale);
                saveFontScale(scale);
                applyFontScale(scale);
                fontBtns.forEach(b => {
                    b.classList.remove('btn-primary');
                    b.classList.add('btn-secondary');
                });
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-primary');
            });
        });

        if (fontReset) {
            fontReset.addEventListener('click', () => {
                saveFontScale(1);
                applyFontScale(1);
                fontBtns.forEach(b => {
                    const s = parseFloat(b.dataset.scale);
                    b.classList.toggle('btn-primary', s === 1);
                    b.classList.toggle('btn-secondary', s !== 1);
                });
            });
        }

        const themeSelect = document.getElementById('theme-select');
        if (themeSelect && typeof ThemeManager !== 'undefined') {
            themeSelect.value = ThemeManager.getPreference();
            themeSelect.addEventListener('change', () => {
                ThemeManager.setPreference(themeSelect.value);
            });
        }

        const select = document.getElementById('base-currency-select');
        if (select) {
            select.addEventListener('change', () => {
                save(select.value);
                document.dispatchEvent(new CustomEvent('baseCurrencyChanged', { detail: select.value }));
            });
        }

        const apiKeyInput = document.getElementById('settings-finnhub-api-key');
        const apiKeyToggle = document.getElementById('settings-finnhub-api-key-toggle');
        if (apiKeyToggle && apiKeyInput) {
            apiKeyToggle.addEventListener('change', () => {
                apiKeyInput.type = apiKeyToggle.checked ? 'text' : 'password';
            });
        }

        if (apiKeyInput && typeof QuotesService !== 'undefined') {
            try { apiKeyInput.value = QuotesService.getApiKey(); } catch (e) {}
            apiKeyInput.addEventListener('input', (e) => {
                const val = (e.target.value || '').trim();
                try { QuotesService.setApiKey(val); } catch (err) {}
                document.dispatchEvent(new CustomEvent('settings:api-key-updated'));
            });
        }

        const langSelect = document.getElementById('language-select');
        if (langSelect) {
            const localeFlags = {
                en: '🇬🇧',
                es: '🇪🇸',
                fr: '🇫🇷',
                de: '🇩🇪',
                it: '🇮🇹',
                ro: '🇷🇴',
                sq: '🇦🇱'
            };
            I18n.availableLocales.forEach(l => {
                const opt = document.createElement('option');
                opt.value = l;
                const flag = localeFlags[l] || '';
                opt.textContent = flag ? `${flag} ${l}` : l;
                langSelect.appendChild(opt);
            });
            langSelect.value = I18n.getLocale();
            langSelect.addEventListener('change', () => {
                I18n.setLocale(langSelect.value);
            });
        }

        const rtlToggle = document.getElementById('rtl-toggle');
        if (rtlToggle) {
            rtlToggle.addEventListener('change', () => {
                I18n.toggleDir(rtlToggle.checked);
            });
        }

        const exportBtn = document.getElementById('export-pensions-btn');
        const importBtn = document.getElementById('import-pensions-btn');
        const exportModal = document.getElementById('export-pensions-modal');
        const exportFormat = document.getElementById('export-pensions-format');
        const exportCancel = document.getElementById('cancel-export-pensions');
        const exportDownload = document.getElementById('download-export-pensions');
        const importModal = document.getElementById('import-pensions-modal');
        const importForm = document.getElementById('import-pensions-form');
        const importFormat = document.getElementById('import-pensions-format');
        const importFile = document.getElementById('import-pensions-file');
        const importCancel = document.getElementById('cancel-import-pensions');

        const delPensionsBtn = document.getElementById('delete-pensions-btn');
        const exportSalariesBtn = document.getElementById('export-salaries-btn');
        const importSalariesBtn = document.getElementById('import-salaries-btn');
        const deleteSalariesBtn = document.getElementById('delete-salaries-btn');
        const exportSalariesModal = document.getElementById('export-salaries-modal');
        const exportSalariesFormat = document.getElementById('export-salaries-format');
        const exportSalariesCancel = document.getElementById('cancel-export-salaries');
        const exportSalariesDownload = document.getElementById('download-export-salaries');
        const importSalariesModal = document.getElementById('import-salaries-modal');
        const importSalariesForm = document.getElementById('import-salaries-form');
        const importSalariesFormat = document.getElementById('import-salaries-format');
        const importSalariesFile = document.getElementById('import-salaries-file');
        const importSalariesCancel = document.getElementById('cancel-import-salaries');

        const expPortfolioBtn = document.getElementById('export-portfolio-btn');
        const impPortfolioBtn = document.getElementById('import-portfolio-btn');
        const expPortfolioModal = document.getElementById('export-portfolio-modal');
        const expPortfolioFormat = document.getElementById('export-portfolio-format');
        const expPortfolioCancel = document.getElementById('cancel-export-portfolio');
        const expPortfolioDownload = document.getElementById('download-export-portfolio');
        const impPortfolioModal = document.getElementById('import-portfolio-modal');
        const impPortfolioForm = document.getElementById('import-portfolio-form');
        const impPortfolioFormat = document.getElementById('import-portfolio-format');
        const impPortfolioFile = document.getElementById('import-portfolio-file');
        const impPortfolioCancel = document.getElementById('cancel-import-portfolio');
        const delPortfolioBtn = document.getElementById('delete-portfolio-btn');
        const expWatchlistBtn = document.getElementById('export-watchlist-btn');
        const impWatchlistBtn = document.getElementById('import-watchlist-btn');
        const delWatchlistBtn = document.getElementById('delete-watchlist-btn');
        const expWatchlistModal = document.getElementById('export-watchlist-modal');
        const expWatchlistFormat = document.getElementById('export-watchlist-format');
        const expWatchlistCancel = document.getElementById('cancel-export-watchlist');
        const expWatchlistDownload = document.getElementById('download-export-watchlist');
        const impWatchlistModal = document.getElementById('import-watchlist-modal');
        const impWatchlistForm = document.getElementById('import-watchlist-form');
        const impWatchlistFormat = document.getElementById('import-watchlist-format');
        const impWatchlistFile = document.getElementById('import-watchlist-file');
        const impWatchlistCancel = document.getElementById('cancel-import-watchlist');
        const expStockBtn = document.getElementById('export-stock-btn');
        const impStockBtn = document.getElementById('import-stock-btn');
        const delStockBtn = document.getElementById('delete-stock-btn');
        const expStockModal = document.getElementById('export-stock-modal');
        const expStockFormat = document.getElementById('export-stock-format');
        const expStockCancel = document.getElementById('cancel-export-stock');
        const expStockDownload = document.getElementById('download-export-stock');
        const impStockModal = document.getElementById('import-stock-modal');
        const impStockForm = document.getElementById('import-stock-form');
        const impStockFormat = document.getElementById('import-stock-format');
        const impStockFile = document.getElementById('import-stock-file');
        const impStockCancel = document.getElementById('cancel-import-stock');

        function openExport() {
            exportFormat.value = 'json';
            exportModal.style.display = 'flex';
        }

        function closeExport() {
            exportModal.style.display = 'none';
        }

        function downloadExport() {
            const fmt = exportFormat.value;
            const data = PensionManager.exportData(fmt);
            const blob = new Blob([data], { type: fmt === 'json' ? 'application/json' : 'text/csv' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'pensions.' + (fmt === 'json' ? 'json' : 'csv');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            closeExport();
        }

        function openImport() {
            importFormat.value = 'json';
            if (importFile) importFile.value = '';
            if (importFile) importFile.focus();
            importModal.style.display = 'flex';
        }

        function closeImport() {
            importModal.style.display = 'none';
        }

        function handleImport(e) {
            e.preventDefault();
            const file = importFile.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function() {
                PensionManager.importData(reader.result, importFormat.value);
                closeImport();
            };
            reader.readAsText(file);
        }

        function openPortfolioExport() {
            expPortfolioFormat.value = 'json';
            expPortfolioModal.style.display = 'flex';
        }

        function closePortfolioExport() {
            expPortfolioModal.style.display = 'none';
        }

        function downloadPortfolioExport() {
            const fmt = expPortfolioFormat.value;
            const data = PortfolioManager.exportData(fmt);
            const blob = new Blob([data], { type: fmt === 'json' ? 'application/json' : 'text/csv' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'portfolio.' + (fmt === 'json' ? 'json' : 'csv');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            closePortfolioExport();
        }

        function openPortfolioImport() {
            impPortfolioFormat.value = 'json';
            if (impPortfolioFile) impPortfolioFile.value = '';
            if (impPortfolioFile) impPortfolioFile.focus();
            impPortfolioModal.style.display = 'flex';
        }

        function closePortfolioImport() {
            impPortfolioModal.style.display = 'none';
        }

        function handlePortfolioImport(e) {
            e.preventDefault();
            const file = impPortfolioFile.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function() {
                PortfolioManager.importData(reader.result, impPortfolioFormat.value);
                closePortfolioImport();
            };
            reader.readAsText(file);
        }

        function openWatchlistExport() {
            expWatchlistFormat.value = 'json';
            expWatchlistModal.style.display = 'flex';
        }

        function closeWatchlistExport() {
            expWatchlistModal.style.display = 'none';
        }

        function downloadWatchlistExport() {
            const fmt = expWatchlistFormat.value;
            const data = WatchlistManager.exportData(fmt);
            const blob = new Blob([data], { type: fmt === 'json' ? 'application/json' : 'text/csv' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'watchlist.' + (fmt === 'json' ? 'json' : 'csv');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            closeWatchlistExport();
        }

        function openWatchlistImport() {
            impWatchlistFormat.value = 'json';
            if (impWatchlistFile) impWatchlistFile.value = '';
            if (impWatchlistFile) impWatchlistFile.focus();
            impWatchlistModal.style.display = 'flex';
        }

        function closeWatchlistImport() {
            impWatchlistModal.style.display = 'none';
        }

        function handleWatchlistImport(e) {
            e.preventDefault();
            const file = impWatchlistFile.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function() {
                WatchlistManager.importData(reader.result, impWatchlistFormat.value);
                closeWatchlistImport();
            };
            reader.readAsText(file);
        }

        function openSalaryExport() {
            if (!exportSalariesFormat || !exportSalariesModal) return;
            exportSalariesFormat.value = 'json';
            exportSalariesModal.style.display = 'flex';
        }

        function closeSalaryExport() {
            if (exportSalariesModal) exportSalariesModal.style.display = 'none';
        }

        function downloadSalaryExport() {
            if (typeof SalaryCalculator === 'undefined') return;
            const fmt = exportSalariesFormat.value;
            const data = SalaryCalculator.exportData(fmt);
            const blob = new Blob([data], { type: fmt === 'json' ? 'application/json' : 'text/csv' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'salaries.' + (fmt === 'json' ? 'json' : 'csv');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            closeSalaryExport();
        }

        function openSalaryImport() {
            if (!importSalariesModal || !importSalariesFormat) return;
            importSalariesFormat.value = 'json';
            if (importSalariesFile) importSalariesFile.value = '';
            if (importSalariesFile) importSalariesFile.focus();
            importSalariesModal.style.display = 'flex';
        }

        function closeSalaryImport() {
            if (importSalariesModal) importSalariesModal.style.display = 'none';
        }

        function handleSalaryImport(e) {
            e.preventDefault();
            if (typeof SalaryCalculator === 'undefined') return;
            const file = importSalariesFile.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function() {
                SalaryCalculator.importData(reader.result, importSalariesFormat.value);
                closeSalaryImport();
            };
            reader.readAsText(file);
        }

        function openStockExport() {
            expStockFormat.value = 'json';
            expStockModal.style.display = 'flex';
        }

        function closeStockExport() {
            expStockModal.style.display = 'none';
        }

        function downloadStockExport() {
            const fmt = expStockFormat.value;
            const data = StockTracker.exportData(fmt);
            const blob = new Blob([data], { type: fmt === 'json' ? 'application/json' : 'text/csv' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'stock-data.' + (fmt === 'json' ? 'json' : 'csv');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            closeStockExport();
        }

        function openStockImport() {
            impStockFormat.value = 'json';
            if (impStockFile) impStockFile.value = '';
            if (impStockFile) impStockFile.focus();
            impStockModal.style.display = 'flex';
        }

        function closeStockImport() {
            impStockModal.style.display = 'none';
        }

        function handleStockImport(e) {
            e.preventDefault();
            const file = impStockFile.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function() {
                StockTracker.importData(reader.result, impStockFormat.value);
                closeStockImport();
            };
            reader.readAsText(file);
        }


        if (expPortfolioBtn) expPortfolioBtn.addEventListener('click', openPortfolioExport);
        if (expPortfolioCancel) expPortfolioCancel.addEventListener('click', closePortfolioExport);
        if (expPortfolioDownload) expPortfolioDownload.addEventListener('click', downloadPortfolioExport);
        if (expPortfolioModal) expPortfolioModal.addEventListener('click', e => { if (e.target === expPortfolioModal) closePortfolioExport(); });

        if (expWatchlistBtn) expWatchlistBtn.addEventListener('click', openWatchlistExport);
        if (expWatchlistCancel) expWatchlistCancel.addEventListener('click', closeWatchlistExport);
        if (expWatchlistDownload) expWatchlistDownload.addEventListener('click', downloadWatchlistExport);
        if (expWatchlistModal) expWatchlistModal.addEventListener('click', e => { if (e.target === expWatchlistModal) closeWatchlistExport(); });

        if (expStockBtn) expStockBtn.addEventListener('click', openStockExport);
        if (expStockCancel) expStockCancel.addEventListener('click', closeStockExport);
        if (expStockDownload) expStockDownload.addEventListener('click', downloadStockExport);
        if (expStockModal) expStockModal.addEventListener('click', e => { if (e.target === expStockModal) closeStockExport(); });

        if (exportSalariesBtn) exportSalariesBtn.addEventListener('click', openSalaryExport);
        if (exportSalariesCancel) exportSalariesCancel.addEventListener('click', closeSalaryExport);
        if (exportSalariesDownload) exportSalariesDownload.addEventListener('click', downloadSalaryExport);
        if (exportSalariesModal) exportSalariesModal.addEventListener('click', e => { if (e.target === exportSalariesModal) closeSalaryExport(); });

        if (impPortfolioBtn) impPortfolioBtn.addEventListener('click', openPortfolioImport);
        if (impPortfolioCancel) impPortfolioCancel.addEventListener('click', closePortfolioImport);
        if (impPortfolioForm) impPortfolioForm.addEventListener('submit', handlePortfolioImport);
        if (impPortfolioModal) impPortfolioModal.addEventListener('click', e => { if (e.target === impPortfolioModal) closePortfolioImport(); });

        if (impWatchlistBtn) impWatchlistBtn.addEventListener('click', openWatchlistImport);
        if (impWatchlistCancel) impWatchlistCancel.addEventListener('click', closeWatchlistImport);
        if (impWatchlistForm) impWatchlistForm.addEventListener('submit', handleWatchlistImport);
        if (impWatchlistModal) impWatchlistModal.addEventListener('click', e => { if (e.target === impWatchlistModal) closeWatchlistImport(); });

        if (impStockBtn) impStockBtn.addEventListener('click', openStockImport);
        if (impStockCancel) impStockCancel.addEventListener('click', closeStockImport);
        if (impStockForm) impStockForm.addEventListener('submit', handleStockImport);
        if (impStockModal) impStockModal.addEventListener('click', e => { if (e.target === impStockModal) closeStockImport(); });

        if (importSalariesBtn) importSalariesBtn.addEventListener('click', openSalaryImport);
        if (importSalariesCancel) importSalariesCancel.addEventListener('click', closeSalaryImport);
        if (importSalariesForm) importSalariesForm.addEventListener('submit', handleSalaryImport);
        if (importSalariesModal) importSalariesModal.addEventListener('click', e => { if (e.target === importSalariesModal) closeSalaryImport(); });


        if (delPensionsBtn) {
            delPensionsBtn.addEventListener('click', async () => {
                const c = await DialogManager.confirm(I18n.t('dialog.deleteAllPension'), I18n.t('dialog.delete'));
                if (c) PensionManager.deleteAllData();
            });
        }

        if (deleteSalariesBtn) {
            deleteSalariesBtn.addEventListener('click', async () => {
                const c = await DialogManager.confirm(I18n.t('dialog.deleteAllSalary'), I18n.t('dialog.delete'));
                if (c && typeof SalaryCalculator !== 'undefined') SalaryCalculator.deleteAllData();
            });
        }

        if (delPortfolioBtn) {
            delPortfolioBtn.addEventListener('click', async () => {
                const c = await DialogManager.confirm(I18n.t('dialog.deleteAllPortfolio'), I18n.t('dialog.delete'));
                if (c) PortfolioManager.deleteAllData();
            });
        }

        if (delWatchlistBtn) {
            delWatchlistBtn.addEventListener('click', async () => {
                const c = await DialogManager.confirm(I18n.t('dialog.deleteAllWatchlist'), I18n.t('dialog.delete'));
                if (c) WatchlistManager.deleteAllData();
            });
        }

        if (delStockBtn) {
            delStockBtn.addEventListener('click', async () => {
                const c = await DialogManager.confirm(I18n.t('dialog.deleteAllStock'), I18n.t('dialog.delete'));
                if (c) StockTracker.deleteAllData();
            });
        }

        if (exportBtn) exportBtn.addEventListener('click', openExport);
        if (exportCancel) exportCancel.addEventListener('click', closeExport);
        if (exportDownload) exportDownload.addEventListener('click', downloadExport);
        if (exportModal) exportModal.addEventListener('click', e => { if (e.target === exportModal) closeExport(); });

        if (importBtn) importBtn.addEventListener('click', openImport);
        if (importCancel) importCancel.addEventListener('click', closeImport);
        if (importForm) importForm.addEventListener('submit', handleImport);
        if (importModal) importModal.addEventListener('click', e => { if (e.target === importModal) closeImport(); });

        if (typeof ForexData !== 'undefined' && ForexData.getRates) {
            ForexData.getRates().then(populateOptions).catch(() => populateOptions());
        } else {
            populateOptions();
        }

        if (typeof AppVersion !== 'undefined' && AppVersion.display) {
            AppVersion.display();
        }
    }

    return { init, getBaseCurrency, setBaseCurrency };
})();
