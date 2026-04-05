const Settings = (function() {
    'use strict';

    const STORAGE_KEY = 'pf_base_currency';
    const FONT_SCALE_KEY = 'pf_font_scale';
    const storage = StorageUtils.getStorage();

    function load() {
        return storage.getItem(STORAGE_KEY) || 'USD';
    }

    function save(value) {
        storage.setItem(STORAGE_KEY, value);
    }

    function getBaseCurrency() {
        return load();
    }

    function setBaseCurrency(value) {
        save(value);
    }

    function loadFontScale() {
        const v = parseFloat(storage.getItem(FONT_SCALE_KEY));
        return isNaN(v) ? 1 : v;
    }

    function saveFontScale(v) {
        storage.setItem(FONT_SCALE_KEY, String(v));
    }

    const DOB_KEY = 'pf_dob';
    const RETIREMENT_AGE_KEY = 'pf_retirement_age';

    function loadDob() { return storage.getItem(DOB_KEY) || ''; }
    function saveDob(value) { storage.setItem(DOB_KEY, value); }
    function getDob() { return loadDob(); }
    function setDob(value) { saveDob(value); }

    function loadRetirementAge() {
        const v = parseInt(storage.getItem(RETIREMENT_AGE_KEY), 10);
        return isNaN(v) ? null : v;
    }
    function saveRetirementAge(v) { storage.setItem(RETIREMENT_AGE_KEY, String(v)); }
    function getRetirementAge() { return loadRetirementAge(); }
    function setRetirementAge(value) { saveRetirementAge(value); }

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
        const dobInput = document.getElementById('settings-dob');
        if (dobInput) {
            dobInput.value = loadDob();
            dobInput.addEventListener('change', e => saveDob(e.target.value));
        }
        const retAgeInput = document.getElementById('settings-retirement-age');
        if (retAgeInput) {
            const age = loadRetirementAge();
            retAgeInput.value = age !== null ? age : '';
            retAgeInput.addEventListener('input', e => {
                const parsed = parseInt(e.target.value, 10);
                if (!isNaN(parsed) && parsed > 0) saveRetirementAge(parsed);
            });
        }

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

        // Polygon.io API key (market status indicator)
        const polygonKeyInput = document.getElementById('settings-polygon-api-key');
        const polygonKeyToggle = document.getElementById('settings-polygon-api-key-toggle');
        if (polygonKeyToggle && polygonKeyInput) {
            polygonKeyToggle.addEventListener('change', () => {
                polygonKeyInput.type = polygonKeyToggle.checked ? 'text' : 'password';
            });
        }
        if (polygonKeyInput && typeof MarketStatus !== 'undefined') {
            try { polygonKeyInput.value = MarketStatus.getApiKey(); } catch (e) {}
            polygonKeyInput.addEventListener('input', (e) => {
                const val = (e.target.value || '').trim();
                try { MarketStatus.setApiKey(val); } catch (err) {}
                document.dispatchEvent(new CustomEvent('settings:api-key-updated'));
            });
        }

        // ExchangeRate-API key (forex / currency conversion)
        const exchangerateKeyInput = document.getElementById('settings-exchangerate-api-key');
        const exchangerateKeyToggle = document.getElementById('settings-exchangerate-api-key-toggle');
        if (exchangerateKeyToggle && exchangerateKeyInput) {
            exchangerateKeyToggle.addEventListener('change', () => {
                exchangerateKeyInput.type = exchangerateKeyToggle.checked ? 'text' : 'password';
            });
        }
        if (exchangerateKeyInput && typeof ForexData !== 'undefined') {
            try { exchangerateKeyInput.value = ForexData.getApiKey(); } catch (e) {}
            exchangerateKeyInput.addEventListener('input', (e) => {
                const val = (e.target.value || '').trim();
                try { ForexData.setApiKey(val); } catch (err) {}
                document.dispatchEvent(new CustomEvent('settings:api-key-updated'));
            });
        }

        // FMP API key (historical EOD stock charts)
        const fmpKeyInput = document.getElementById('settings-fmp-api-key');
        const fmpKeyToggle = document.getElementById('settings-fmp-api-key-toggle');
        if (fmpKeyToggle && fmpKeyInput) {
            fmpKeyToggle.addEventListener('change', () => {
                fmpKeyInput.type = fmpKeyToggle.checked ? 'text' : 'password';
            });
        }
        if (fmpKeyInput && typeof FmpService !== 'undefined') {
            try { fmpKeyInput.value = FmpService.getApiKey(); } catch (e) {}
            fmpKeyInput.addEventListener('input', (e) => {
                const val = (e.target.value || '').trim();
                try { FmpService.setApiKey(val); } catch (err) {}
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
        const expTradesBtn = document.getElementById('export-trades-btn');
        const impTradesBtn = document.getElementById('import-trades-btn');
        const delTradesBtn = document.getElementById('delete-trades-btn');
        const expTradesModal = document.getElementById('export-trades-modal');
        const expTradesFormat = document.getElementById('export-trades-format');
        const expTradesCancel = document.getElementById('cancel-export-trades');
        const expTradesDownload = document.getElementById('download-export-trades');
        const impTradesModal = document.getElementById('import-trades-modal');
        const impTradesForm = document.getElementById('import-trades-form');
        const impTradesFormat = document.getElementById('import-trades-format');
        const impTradesFile = document.getElementById('import-trades-file');
        const impTradesCancel = document.getElementById('cancel-import-trades');
        const expStockModal = document.getElementById('export-stock-modal');
        const expStockFormat = document.getElementById('export-stock-format');
        const expStockCancel = document.getElementById('cancel-export-stock');
        const expStockDownload = document.getElementById('download-export-stock');
        const impStockModal = document.getElementById('import-stock-modal');
        const impStockForm = document.getElementById('import-stock-form');
        const impStockFormat = document.getElementById('import-stock-format');
        const impStockFile = document.getElementById('import-stock-file');
        const impStockCancel = document.getElementById('cancel-import-stock');
        const expAllBtn     = document.getElementById('export-all-btn');
        const impAllBtn     = document.getElementById('import-all-btn');
        const impAllModal   = document.getElementById('import-all-modal');
        const impAllForm    = document.getElementById('import-all-form');
        const impAllFile    = document.getElementById('import-all-file');
        const impAllCancel  = document.getElementById('cancel-import-all');
        const expAllIncKeys = document.getElementById('export-all-include-keys');
        const expApiKeysBtn = document.getElementById('export-api-keys-btn');
        const impApiKeysBtn = document.getElementById('import-api-keys-btn');
        const delApiKeysBtn = document.getElementById('delete-api-keys-btn');
        const expApiKeysModal = document.getElementById('export-api-keys-modal');
        const expApiKeysFormat = document.getElementById('export-api-keys-format');
        const expApiKeysCancel = document.getElementById('cancel-export-api-keys');
        const expApiKeysDownload = document.getElementById('download-export-api-keys');
        const impApiKeysModal = document.getElementById('import-api-keys-modal');
        const impApiKeysForm = document.getElementById('import-api-keys-form');
        const impApiKeysFormat = document.getElementById('import-api-keys-format');
        const impApiKeysFile = document.getElementById('import-api-keys-file');
        const impApiKeysCancel = document.getElementById('cancel-import-api-keys');

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


        function downloadAllExport() {
            const includeKeys = expAllIncKeys ? expAllIncKeys.checked : true;
            const combined = { version: 1, exportedAt: new Date().toISOString() };
            try { combined.portfolio    = JSON.parse(PortfolioManager.exportData('json')); }  catch(e) { combined.portfolio = []; }
            try { combined.watchlist    = JSON.parse(WatchlistManager.exportData('json')); }  catch(e) { combined.watchlist = []; }
            try { combined.stockTracker = JSON.parse(StockTracker.exportData('json')); }      catch(e) { combined.stockTracker = {}; }
            try { combined.pension      = JSON.parse(PensionManager.exportData('json')); }    catch(e) { combined.pension = []; }
            try { if (typeof SalaryCalculator !== 'undefined') combined.salary = JSON.parse(SalaryCalculator.exportData('json')); } catch(e) { combined.salary = []; }
            try { combined.trades       = JSON.parse(OptionsJournal.exportData('json')); }    catch(e) { combined.trades = []; }
            combined.personalDetails = { dob: loadDob(), retirementAge: loadRetirementAge() };
            if (includeKeys) {
                combined.apiKeys = {
                    finnhub:      (typeof QuotesService !== 'undefined' ? QuotesService.getApiKey() : ''),
                    polygon:      (typeof MarketStatus  !== 'undefined' ? MarketStatus.getApiKey()  : ''),
                    exchangerate: (typeof ForexData     !== 'undefined' ? ForexData.getApiKey()     : ''),
                    fmp:          (typeof FmpService    !== 'undefined' ? FmpService.getApiKey()    : '')
                };
            }
            const blob = new Blob([JSON.stringify(combined, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'finance-backup-' + new Date().toISOString().slice(0, 10) + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
        }

        function openAllImport() { if (impAllFile) impAllFile.value = ''; impAllModal.style.display = 'flex'; }
        function closeAllImport() { impAllModal.style.display = 'none'; }
        function handleAllImport(e) {
            e.preventDefault();
            const file = impAllFile.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function() {
                let combined;
                try { combined = JSON.parse(reader.result); } catch(err) { return; }
                if (combined.portfolio    !== undefined) PortfolioManager.importData(JSON.stringify(combined.portfolio), 'json');
                if (combined.watchlist    !== undefined) WatchlistManager.importData(JSON.stringify(combined.watchlist), 'json');
                if (combined.stockTracker !== undefined) StockTracker.importData(JSON.stringify(combined.stockTracker), 'json');
                if (combined.pension      !== undefined) PensionManager.importData(JSON.stringify(combined.pension), 'json');
                if (combined.salary       !== undefined && typeof SalaryCalculator !== 'undefined') SalaryCalculator.importData(JSON.stringify(combined.salary), 'json');
                if (combined.trades       !== undefined) OptionsJournal.importData(JSON.stringify(combined.trades), 'json');
                if (combined.personalDetails !== undefined) {
                    const pd = combined.personalDetails;
                    if (pd.dob           !== undefined) { saveDob(pd.dob);                          if (dobInput)    dobInput.value    = pd.dob; }
                    if (pd.retirementAge !== undefined && pd.retirementAge !== null) { saveRetirementAge(pd.retirementAge); if (retAgeInput) retAgeInput.value = pd.retirementAge; }
                }
                if (combined.apiKeys) {
                    const k = combined.apiKeys;
                    if (k.finnhub      !== undefined && typeof QuotesService !== 'undefined') { QuotesService.setApiKey(k.finnhub);      if (apiKeyInput)          apiKeyInput.value          = k.finnhub; }
                    if (k.polygon      !== undefined && typeof MarketStatus  !== 'undefined') { MarketStatus.setApiKey(k.polygon);       if (polygonKeyInput)      polygonKeyInput.value      = k.polygon; }
                    if (k.exchangerate !== undefined && typeof ForexData     !== 'undefined') { ForexData.setApiKey(k.exchangerate);     if (exchangerateKeyInput) exchangerateKeyInput.value = k.exchangerate; }
                    if (k.fmp          !== undefined && typeof FmpService    !== 'undefined') { FmpService.setApiKey(k.fmp);             if (fmpKeyInput)          fmpKeyInput.value          = k.fmp; }
                }
                closeAllImport();
            };
            reader.readAsText(file);
        }

        function openApiKeysExport() { expApiKeysFormat.value = 'json'; expApiKeysModal.style.display = 'flex'; }
        function closeApiKeysExport() { expApiKeysModal.style.display = 'none'; }
        function downloadApiKeysExport() {
            const fmt = expApiKeysFormat.value;
            const keys = {
                finnhub: (typeof QuotesService !== 'undefined' ? QuotesService.getApiKey() : ''),
                polygon: (typeof MarketStatus !== 'undefined' ? MarketStatus.getApiKey() : ''),
                exchangerate: (typeof ForexData !== 'undefined' ? ForexData.getApiKey() : ''),
                fmp: (typeof FmpService !== 'undefined' ? FmpService.getApiKey() : '')
            };
            let data;
            if (fmt === 'csv') {
                function escCsv(v) {
                    if (v === undefined || v === null) return '';
                    const s = String(v).replace(/"/g, '""');
                    return /[",\n]/.test(s) ? '"' + s + '"' : s;
                }
                data = 'provider,key\n' + Object.entries(keys).map(([k, v]) => `${k},${escCsv(v)}`).join('\n');
            } else {
                data = JSON.stringify(keys, null, 2);
            }
            const blob = new Blob([data], { type: fmt === 'json' ? 'application/json' : 'text/csv' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'api-keys.' + (fmt === 'json' ? 'json' : 'csv');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            closeApiKeysExport();
        }
        function openApiKeysImport() { impApiKeysFormat.value = 'json'; if (impApiKeysFile) impApiKeysFile.value = ''; impApiKeysModal.style.display = 'flex'; }
        function closeApiKeysImport() { impApiKeysModal.style.display = 'none'; }
        function handleApiKeysImport(e) {
            e.preventDefault();
            const file = impApiKeysFile.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function() {
                let keys = {};
                if (impApiKeysFormat.value === 'csv') {
                    reader.result.split('\n').slice(1).forEach(line => {
                        const idx = line.indexOf(',');
                        if (idx > -1) keys[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
                    });
                } else {
                    try { keys = JSON.parse(reader.result); } catch (err) { return; }
                }
                if (keys.finnhub !== undefined && typeof QuotesService !== 'undefined') { QuotesService.setApiKey(keys.finnhub); if (apiKeyInput) apiKeyInput.value = keys.finnhub; }
                if (keys.polygon !== undefined && typeof MarketStatus !== 'undefined') { MarketStatus.setApiKey(keys.polygon); if (polygonKeyInput) polygonKeyInput.value = keys.polygon; }
                if (keys.exchangerate !== undefined && typeof ForexData !== 'undefined') { ForexData.setApiKey(keys.exchangerate); if (exchangerateKeyInput) exchangerateKeyInput.value = keys.exchangerate; }
                if (keys.fmp !== undefined && typeof FmpService !== 'undefined') { FmpService.setApiKey(keys.fmp); if (fmpKeyInput) fmpKeyInput.value = keys.fmp; }
                closeApiKeysImport();
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

        function openTradesExport() { expTradesFormat.value = 'json'; expTradesModal.style.display = 'flex'; }
        function closeTradesExport() { expTradesModal.style.display = 'none'; }
        function downloadTradesExport() {
            const fmt = expTradesFormat.value;
            const data = OptionsJournal.exportData(fmt);
            const blob = new Blob([data], { type: fmt === 'json' ? 'application/json' : 'text/csv' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'trades-journal.' + (fmt === 'json' ? 'json' : 'csv');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            closeTradesExport();
        }
        function openTradesImport() { impTradesFormat.value = 'json'; if (impTradesFile) impTradesFile.value = ''; impTradesModal.style.display = 'flex'; }
        function closeTradesImport() { impTradesModal.style.display = 'none'; }
        function handleTradesImport(e) {
            e.preventDefault();
            const file = impTradesFile.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function() { OptionsJournal.importData(reader.result, impTradesFormat.value); closeTradesImport(); };
            reader.readAsText(file);
        }

        if (expTradesBtn) expTradesBtn.addEventListener('click', openTradesExport);
        if (expTradesCancel) expTradesCancel.addEventListener('click', closeTradesExport);
        if (expTradesDownload) expTradesDownload.addEventListener('click', downloadTradesExport);
        if (expTradesModal) expTradesModal.addEventListener('click', e => { if (e.target === expTradesModal) closeTradesExport(); });
        if (impTradesBtn) impTradesBtn.addEventListener('click', openTradesImport);
        if (impTradesCancel) impTradesCancel.addEventListener('click', closeTradesImport);
        if (impTradesForm) impTradesForm.addEventListener('submit', handleTradesImport);
        if (impTradesModal) impTradesModal.addEventListener('click', e => { if (e.target === impTradesModal) closeTradesImport(); });
        if (delTradesBtn) {
            delTradesBtn.addEventListener('click', async () => {
                const c = await DialogManager.confirm('Delete all trades journal data? This cannot be undone.', 'Delete');
                if (c) OptionsJournal.deleteAllData();
            });
        }

        if (expAllBtn) expAllBtn.addEventListener('click', downloadAllExport);
        if (impAllBtn) impAllBtn.addEventListener('click', openAllImport);
        if (impAllCancel) impAllCancel.addEventListener('click', closeAllImport);
        if (impAllForm) impAllForm.addEventListener('submit', handleAllImport);
        if (impAllModal) impAllModal.addEventListener('click', e => { if (e.target === impAllModal) closeAllImport(); });

        if (expApiKeysBtn) expApiKeysBtn.addEventListener('click', openApiKeysExport);
        if (expApiKeysCancel) expApiKeysCancel.addEventListener('click', closeApiKeysExport);
        if (expApiKeysDownload) expApiKeysDownload.addEventListener('click', downloadApiKeysExport);
        if (expApiKeysModal) expApiKeysModal.addEventListener('click', e => { if (e.target === expApiKeysModal) closeApiKeysExport(); });
        if (impApiKeysBtn) impApiKeysBtn.addEventListener('click', openApiKeysImport);
        if (impApiKeysCancel) impApiKeysCancel.addEventListener('click', closeApiKeysImport);
        if (impApiKeysForm) impApiKeysForm.addEventListener('submit', handleApiKeysImport);
        if (impApiKeysModal) impApiKeysModal.addEventListener('click', e => { if (e.target === impApiKeysModal) closeApiKeysImport(); });
        if (delApiKeysBtn) {
            delApiKeysBtn.addEventListener('click', async () => {
                const c = await DialogManager.confirm('Clear all API keys? This cannot be undone.', 'Delete');
                if (!c) return;
                if (typeof QuotesService !== 'undefined') { QuotesService.setApiKey(''); if (apiKeyInput) apiKeyInput.value = ''; }
                if (typeof MarketStatus !== 'undefined') { MarketStatus.setApiKey(''); if (polygonKeyInput) polygonKeyInput.value = ''; }
                if (typeof ForexData !== 'undefined') { ForexData.setApiKey(''); if (exchangerateKeyInput) exchangerateKeyInput.value = ''; }
                if (typeof FmpService !== 'undefined') { FmpService.setApiKey(''); if (fmpKeyInput) fmpKeyInput.value = ''; }
            });
        }

        if (typeof ForexData !== 'undefined' && ForexData.getRates) {
            ForexData.getRates().then(populateOptions).catch(() => populateOptions());
        } else {
            populateOptions();
        }

        if (typeof AppVersion !== 'undefined' && AppVersion.display) {
            AppVersion.display();
        }
    }

    return { init, getBaseCurrency, setBaseCurrency, getDob, setDob, getRetirementAge, setRetirementAge };
})();
