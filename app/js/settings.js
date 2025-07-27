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
        if (!select) return;
        select.addEventListener('change', () => {
            save(select.value);
        });

        const exportBtn = document.getElementById('export-pensions-btn');
        const importBtn = document.getElementById('import-pensions-btn');
        const exportModal = document.getElementById('export-pensions-modal');
        const exportFormat = document.getElementById('export-pensions-format');
        const exportCancel = document.getElementById('cancel-export-pensions');
        const exportDownload = document.getElementById('download-export-pensions');
        const importModal = document.getElementById('import-pensions-modal');
        const importForm = document.getElementById('import-pensions-form');
        const importFormat = document.getElementById('import-pensions-format');
        const importText = document.getElementById('import-pensions-text');
        const importCancel = document.getElementById('cancel-import-pensions');

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
            importText.value = '';
            importModal.style.display = 'flex';
            importText.focus();
        }

        function closeImport() {
            importModal.style.display = 'none';
        }

        function handleImport(e) {
            e.preventDefault();
            PensionManager.importData(importText.value, importFormat.value);
            closeImport();
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
    }

    return { init, getBaseCurrency, setBaseCurrency };
})();
