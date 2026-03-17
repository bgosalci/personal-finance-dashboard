const TabManager = (function() {
    let currentTab = 'portfolio'; // moved inside IIFE — no longer a global

    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');

    function switchTab(tabName) {
        // Update tab buttons
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });

        // Update content
        contents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabName) {
                content.classList.add('active');
            }
        });

        currentTab = tabName;
    }

    function getCurrentTab() {
        return currentTab;
    }

    function init() {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                switchTab(tab.dataset.tab);
            });
        });
    }

    return {
        init,
        switchTab,
        getCurrentTab
    };
})();
