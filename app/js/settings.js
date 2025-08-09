const Settings = (function() {
    'use strict';

    const STORAGE_KEY = 'pf_base_currency';

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
        const select = document.getElementById('base-currency-select');
        if (select) {
            select.addEventListener('change', () => {
                save(select.value);
                document.dispatchEvent(new CustomEvent('baseCurrencyChanged', { detail: select.value }));
            });
        }

        const langSelect = document.getElementById('language-select');
        if (langSelect) {
            I18n.availableLocales.forEach(l => {
                const opt = document.createElement('option');
                opt.value = l;
                opt.textContent = l;
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

        const exportLangBtn = document.getElementById('export-lang-btn');
        const importLangBtn = document.getElementById('import-lang-btn');
        const importLangFile = document.getElementById('import-lang-file');
        const editLocaleBtn = document.getElementById('edit-current-locale-btn');
        const editLocaleFileBtn = document.getElementById('edit-locale-file-btn');
        const localeModal = document.getElementById('locale-editor-modal');
        const localeForm = document.getElementById('locale-editor-form');
        const localeBody = document.getElementById('locale-editor-body');
        const localeCancel = document.getElementById('cancel-locale-editor');
        const localeSelectGroup = document.getElementById('locale-editor-select-group');
        const localeSelect = document.getElementById('locale-editor-select');

        if (exportLangBtn) {
            exportLangBtn.addEventListener('click', () => {
                const data = I18n.exportLocale();
                const blob = new Blob([data], { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'locale-' + I18n.getCurrentLocale() + '.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(a.href);
            });
        }

        if (importLangBtn && importLangFile) {
            importLangBtn.addEventListener('click', () => importLangFile.click());
            importLangFile.addEventListener('change', () => {
                const file = importLangFile.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    I18n.importLocale(reader.result);
                };
                reader.readAsText(file);
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
        const editLabelsBtn = document.getElementById('edit-portfolio-labels-btn');
        const labelsModal = document.getElementById('portfolio-labels-modal');
        const labelsForm = document.getElementById('portfolio-labels-form');
        const labelsBody = document.getElementById('portfolio-labels-body');
        const labelsCancel = document.getElementById('cancel-portfolio-labels');
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

        function openLabels() {
            const labels = PortfolioColumns.getLabels();
            labelsBody.innerHTML = '';
            Object.keys(PortfolioColumns.DEFAULT_LABELS).forEach(key => {
                const tr = document.createElement('tr');
                const tdCur = document.createElement('td');
                tdCur.textContent = labels[key];
                const tdNew = document.createElement('td');
                const group = document.createElement('div');
                group.className = 'form-group';
                const input = document.createElement('input');
                input.type = 'text';
                input.id = 'label-input-' + key;
                input.value = labels[key];
                group.appendChild(input);
                tdNew.appendChild(group);
                tr.appendChild(tdCur);
                tr.appendChild(tdNew);
                labelsBody.appendChild(tr);
            });
            labelsModal.style.display = 'flex';
            const firstInput = labelsBody.querySelector('input');
            if (firstInput) firstInput.focus();
        }

        function closeLabels() {
            labelsModal.style.display = 'none';
        }

        function saveLabels(e) {
            e.preventDefault();
            const newLabels = {};
            Object.keys(PortfolioColumns.DEFAULT_LABELS).forEach(key => {
                const input = document.getElementById('label-input-' + key);
                newLabels[key] = input.value.trim() || PortfolioColumns.DEFAULT_LABELS[key];
            });
            PortfolioColumns.setLabels(newLabels);
            closeLabels();
        }

        function flattenTranslations(obj, prefix = '') {
            const res = [];
            Object.keys(obj).forEach(k => {
                const val = obj[k];
                const path = prefix ? prefix + '.' + k : k;
                if (val && typeof val === 'object') {
                    res.push(...flattenTranslations(val, path));
                } else {
                    const last = path.lastIndexOf('.');
                    const section = last === -1 ? '' : path.slice(0, last);
                    const key = last === -1 ? path : path.slice(last + 1);
                    res.push({ section, key, value: val });
                }
            });
            return res;
        }

        async function openLocaleEditor(locale, allowSelect) {
            const data = await I18n.getLocaleData(locale);
            if (!data) return;
            localeBody.innerHTML = '';
            flattenTranslations(data).forEach(item => {
                const tr = document.createElement('tr');
                const tdSec = document.createElement('td');
                tdSec.textContent = item.section;
                const tdKey = document.createElement('td');
                tdKey.textContent = item.key;
                const tdVal = document.createElement('td');
                tdVal.textContent = item.value;
                const tdInput = document.createElement('td');
                const group = document.createElement('div');
                group.className = 'form-group';
                const input = document.createElement('input');
                input.type = 'text';
                input.value = item.value;
                input.dataset.section = item.section;
                input.dataset.key = item.key;
                group.appendChild(input);
                tdInput.appendChild(group);
                tr.appendChild(tdSec);
                tr.appendChild(tdKey);
                tr.appendChild(tdVal);
                tr.appendChild(tdInput);
                localeBody.appendChild(tr);
            });

            if (allowSelect) {
                localeSelectGroup.style.display = '';
                localeSelect.innerHTML = '';
                I18n.availableLocales.forEach(l => {
                    const opt = document.createElement('option');
                    opt.value = l;
                    opt.textContent = l;
                    localeSelect.appendChild(opt);
                });
                localeSelect.value = locale;
                localeSelect.disabled = false;
            } else {
                localeSelectGroup.style.display = 'none';
                localeSelect.value = locale;
            }

            localeModal.style.display = 'flex';
            const firstInput = localeBody.querySelector('input');
            if (firstInput) firstInput.focus();
        }

        function closeLocaleEditor() {
            localeModal.style.display = 'none';
        }

        async function saveLocaleChanges(e) {
            e.preventDefault();
            const locale = localeSelect.value;
            const data = await I18n.getLocaleData(locale) || {};
            const inputs = localeBody.querySelectorAll('input');
            inputs.forEach(input => {
                const section = input.dataset.section;
                const key = input.dataset.key;
                let target = data;
                if (section) {
                    section.split('.').forEach(part => {
                        if (!target[part]) target[part] = {};
                        target = target[part];
                    });
                }
                target[key] = input.value;
            });
            I18n.saveLocaleData(locale, data);
            closeLocaleEditor();
        }

        if (editLocaleBtn) editLocaleBtn.addEventListener('click', () => openLocaleEditor(I18n.getCurrentLocale(), false));
        if (editLocaleFileBtn) editLocaleFileBtn.addEventListener('click', () => openLocaleEditor(I18n.getCurrentLocale(), true));
        if (localeCancel) localeCancel.addEventListener('click', closeLocaleEditor);
        if (localeForm) localeForm.addEventListener('submit', saveLocaleChanges);
        if (localeModal) localeModal.addEventListener('click', e => { if (e.target === localeModal) closeLocaleEditor(); });
        if (localeSelect) localeSelect.addEventListener('change', () => openLocaleEditor(localeSelect.value, true));

        if (expPortfolioBtn) expPortfolioBtn.addEventListener('click', openPortfolioExport);
        if (expPortfolioCancel) expPortfolioCancel.addEventListener('click', closePortfolioExport);
        if (expPortfolioDownload) expPortfolioDownload.addEventListener('click', downloadPortfolioExport);
        if (expPortfolioModal) expPortfolioModal.addEventListener('click', e => { if (e.target === expPortfolioModal) closePortfolioExport(); });

        if (expStockBtn) expStockBtn.addEventListener('click', openStockExport);
        if (expStockCancel) expStockCancel.addEventListener('click', closeStockExport);
        if (expStockDownload) expStockDownload.addEventListener('click', downloadStockExport);
        if (expStockModal) expStockModal.addEventListener('click', e => { if (e.target === expStockModal) closeStockExport(); });

        if (impPortfolioBtn) impPortfolioBtn.addEventListener('click', openPortfolioImport);
        if (impPortfolioCancel) impPortfolioCancel.addEventListener('click', closePortfolioImport);
        if (impPortfolioForm) impPortfolioForm.addEventListener('submit', handlePortfolioImport);
        if (impPortfolioModal) impPortfolioModal.addEventListener('click', e => { if (e.target === impPortfolioModal) closePortfolioImport(); });

        if (impStockBtn) impStockBtn.addEventListener('click', openStockImport);
        if (impStockCancel) impStockCancel.addEventListener('click', closeStockImport);
        if (impStockForm) impStockForm.addEventListener('submit', handleStockImport);
        if (impStockModal) impStockModal.addEventListener('click', e => { if (e.target === impStockModal) closeStockImport(); });

        if (editLabelsBtn) editLabelsBtn.addEventListener('click', openLabels);
        if (labelsCancel) labelsCancel.addEventListener('click', closeLabels);
        if (labelsForm) labelsForm.addEventListener('submit', saveLabels);
        if (labelsModal) labelsModal.addEventListener('click', e => { if (e.target === labelsModal) closeLabels(); });

        if (delPensionsBtn) {
            delPensionsBtn.addEventListener('click', async () => {
                const c = await DialogManager.confirm('Delete all pension data?', 'Delete');
                if (c) PensionManager.deleteAllData();
            });
        }

        if (delPortfolioBtn) {
            delPortfolioBtn.addEventListener('click', async () => {
                const c = await DialogManager.confirm('Delete all portfolio data?', 'Delete');
                if (c) PortfolioManager.deleteAllData();
            });
        }

        if (delStockBtn) {
            delStockBtn.addEventListener('click', async () => {
                const c = await DialogManager.confirm('Delete all stock tracker data?', 'Delete');
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
