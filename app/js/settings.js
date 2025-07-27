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

        if (expPortfolioBtn) expPortfolioBtn.addEventListener('click', openPortfolioExport);
        if (expPortfolioCancel) expPortfolioCancel.addEventListener('click', closePortfolioExport);
        if (expPortfolioDownload) expPortfolioDownload.addEventListener('click', downloadPortfolioExport);
        if (expPortfolioModal) expPortfolioModal.addEventListener('click', e => { if (e.target === expPortfolioModal) closePortfolioExport(); });

        if (impPortfolioBtn) impPortfolioBtn.addEventListener('click', openPortfolioImport);
        if (impPortfolioCancel) impPortfolioCancel.addEventListener('click', closePortfolioImport);
        if (impPortfolioForm) impPortfolioForm.addEventListener('submit', handlePortfolioImport);
        if (impPortfolioModal) impPortfolioModal.addEventListener('click', e => { if (e.target === impPortfolioModal) closePortfolioImport(); });

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
