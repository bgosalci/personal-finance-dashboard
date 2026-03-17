/**
 * @file services.test.js
 * New test coverage for previously untested modules:
 *   - ThemeManager
 *   - ForexData
 *   - ColorService
 *   - TabManager
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const vm = require('vm');

const i18nCode = fs.readFileSync(path.resolve(__dirname, '../app/js/core/i18n.js'), 'utf8');
const storageUtilsCode = fs.readFileSync(path.resolve(__dirname, '../app/js/core/storageUtils.js'), 'utf8');

// ─── ThemeManager ────────────────────────────────────────────────────────────

describe('ThemeManager', () => {
    function loadTheme(initialPref) {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' });
        const { window } = dom;
        if (initialPref) window.localStorage.setItem('pf_theme', initialPref);
        // Stub matchMedia (not available in jsdom)
        window.matchMedia = query => ({
            matches: query.includes('dark') ? false : false,
            addEventListener: () => {},
            removeEventListener: () => {}
        });
        const context = vm.createContext(window);
        const code = fs.readFileSync(path.resolve(__dirname, '../app/js/core/themeManager.js'), 'utf8');
        vm.runInContext(code, context);
        return { context, window };
    }

    test('defaults to "system" when no preference is stored', () => {
        const { context } = loadTheme();
        const pref = vm.runInContext('ThemeManager.getPreference()', context);
        expect(pref).toBe('system');
    });

    test('setPreference persists to localStorage', () => {
        const { context, window } = loadTheme();
        vm.runInContext('ThemeManager.setPreference("dark")', context);
        expect(window.localStorage.getItem('pf_theme')).toBe('dark');
    });

    test('setPreference updates data-theme attribute', () => {
        const { context, window } = loadTheme();
        vm.runInContext('ThemeManager.setPreference("light")', context);
        expect(window.document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    test('getPreference returns last saved value', () => {
        const { context } = loadTheme('dark');
        const pref = vm.runInContext('ThemeManager.getPreference()', context);
        expect(pref).toBe('dark');
    });
});

// ─── ColorService ────────────────────────────────────────────────────────────

describe('ColorService', () => {
    function loadColorService() {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' });
        const context = vm.createContext(dom.window);
        const code = fs.readFileSync(path.resolve(__dirname, '../app/js/services/colorService.js'), 'utf8');
        vm.runInContext(code, context);
        return { context, window: dom.window };
    }

    test('getColorForKey returns a non-empty string', () => {
        const { context } = loadColorService();
        const color = vm.runInContext('ColorService.getColorForKey("AAPL")', context);
        expect(typeof color).toBe('string');
        expect(color.length).toBeGreaterThan(0);
    });

    test('same key always returns the same color', () => {
        const { context } = loadColorService();
        const c1 = vm.runInContext('ColorService.getColorForKey("MSFT")', context);
        const c2 = vm.runInContext('ColorService.getColorForKey("MSFT")', context);
        expect(c1).toBe(c2);
    });

    test('different keys return different colors (first 10 use palette)', () => {
        const { context } = loadColorService();
        vm.runInContext('ColorService.reset()', context);
        const colors = ['A','B','C','D','E'].map(k =>
            vm.runInContext(`ColorService.getColorForKey("${k}")`, context)
        );
        const unique = new Set(colors);
        expect(unique.size).toBe(colors.length);
    });

    test('reset clears the color map', () => {
        const { context } = loadColorService();
        const before = vm.runInContext('ColorService.getColorForKey("X")', context);
        vm.runInContext('ColorService.reset()', context);
        const after = vm.runInContext('ColorService.getColorForKey("X")', context);
        // After reset, X should be assigned the first palette slot again (same value)
        expect(after).toBe(before);
    });

    test('returns fallback color for null/empty key', () => {
        const { context } = loadColorService();
        const color = vm.runInContext('ColorService.getColorForKey("")', context);
        expect(color).toBe('#999');
    });
});

// ─── TabManager ──────────────────────────────────────────────────────────────

describe('TabManager', () => {
    function loadTabManager() {
        const html = `<!DOCTYPE html><html><body>
            <nav>
                <button class="nav-tab" data-tab="portfolio">Portfolio</button>
                <button class="nav-tab" data-tab="watchlist">Watchlist</button>
            </nav>
            <div id="portfolio" class="tab-content active"></div>
            <div id="watchlist" class="tab-content"></div>
        </body></html>`;
        const dom = new JSDOM(html, { url: 'http://localhost' });
        const context = vm.createContext(dom.window);
        const code = fs.readFileSync(path.resolve(__dirname, '../app/js/core/tabManager.js'), 'utf8');
        vm.runInContext(code, context);
        vm.runInContext('TabManager.init()', context);
        return { context, window: dom.window };
    }

    test('getCurrentTab defaults to "portfolio"', () => {
        const { context } = loadTabManager();
        const tab = vm.runInContext('TabManager.getCurrentTab()', context);
        expect(tab).toBe('portfolio');
    });

    test('switchTab changes the active tab', () => {
        const { context } = loadTabManager();
        vm.runInContext('TabManager.switchTab("watchlist")', context);
        const tab = vm.runInContext('TabManager.getCurrentTab()', context);
        expect(tab).toBe('watchlist');
    });

    test('switchTab updates active class on buttons', () => {
        const { context, window } = loadTabManager();
        vm.runInContext('TabManager.switchTab("watchlist")', context);
        const portfolioBtn = window.document.querySelector('[data-tab="portfolio"]');
        const watchlistBtn = window.document.querySelector('[data-tab="watchlist"]');
        expect(portfolioBtn.classList.contains('active')).toBe(false);
        expect(watchlistBtn.classList.contains('active')).toBe(true);
    });

    test('switchTab shows the correct content panel', () => {
        const { context, window } = loadTabManager();
        vm.runInContext('TabManager.switchTab("watchlist")', context);
        expect(window.document.getElementById('portfolio').classList.contains('active')).toBe(false);
        expect(window.document.getElementById('watchlist').classList.contains('active')).toBe(true);
    });

    test('currentTab is NOT accessible as a global (fixed leak)', () => {
        const { context } = loadTabManager();
        const isGlobal = vm.runInContext('typeof currentTab', context);
        expect(isGlobal).toBe('undefined');
    });
});

// ─── ForexData ────────────────────────────────────────────────────────────────

describe('ForexData', () => {
    function loadForexData(fetchImpl) {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' });
        const { window } = dom;
        if (fetchImpl) window.fetch = fetchImpl;
        const context = vm.createContext(window);
        const code = fs.readFileSync(path.resolve(__dirname, '../app/js/services/forexData.js'), 'utf8');
        vm.runInContext(code, context);
        return { context, window };
    }

    test('getApiKey returns empty string when no key is set', () => {
        const { context } = loadForexData();
        const key = vm.runInContext('ForexData.getApiKey()', context);
        expect(key).toBe('');
    });

    test('setApiKey persists the key to localStorage', () => {
        const { context, window } = loadForexData();
        vm.runInContext('ForexData.setApiKey("test-key-123")', context);
        expect(window.localStorage.getItem('pf_api_key_exchangerate')).toBe('test-key-123');
    });

    test('getApiKey reads back saved key', () => {
        const { context } = loadForexData();
        vm.runInContext('ForexData.setApiKey("abc")', context);
        const key = vm.runInContext('ForexData.getApiKey()', context);
        expect(key).toBe('abc');
    });

    test('getRates uses cached data when still valid', async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            json: () => Promise.resolve({
                conversion_rates: { GBP: 0.79, EUR: 0.92 },
                time_next_update_utc: new Date(Date.now() + 86400000).toUTCString()
            })
        });
        const { context } = loadForexData(fetchMock);
        vm.runInContext('ForexData.setApiKey("key")', context);
        await vm.runInContext('ForexData.getRates()', context);
        await vm.runInContext('ForexData.getRates()', context);
        // Should only fetch once — second call uses cache
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    test('fetchRates is skipped when no API key is configured', async () => {
        const fetchMock = jest.fn();
        const { context } = loadForexData(fetchMock);
        await vm.runInContext('ForexData.getRates()', context);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
