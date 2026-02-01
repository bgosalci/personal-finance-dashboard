// Portfolio Storage Module
const PortfolioStorage = (function() {
    const POSITIONS_KEY = 'portfolio_positions';
    const SNAPSHOTS_KEY = 'portfolio_snapshots';
    const LEGACY_KEY = 'portfolioData';
    let portfolioPositions = [];
    let portfolioSnapshots = [];

    function generateId() {
        return 'pos_' + Math.random().toString(36).substring(2, 11);
    }

    function load() {
        const p = localStorage.getItem(POSITIONS_KEY);
        if (p) {
            try {
                portfolioPositions = JSON.parse(p) || [];
            } catch (e) {
                portfolioPositions = [];
            }
        }
        const s = localStorage.getItem(SNAPSHOTS_KEY);
        if (s) {
            try {
                portfolioSnapshots = JSON.parse(s) || [];
            } catch (e) {
                portfolioSnapshots = [];
            }
        }
        migrateLegacyData();
    }

    function save() {
        localStorage.setItem(POSITIONS_KEY, JSON.stringify(portfolioPositions));
        localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(portfolioSnapshots));
    }

    function migrateLegacyData() {
        const legacy = localStorage.getItem(LEGACY_KEY);
        if (!legacy) return;
        try {
            const old = JSON.parse(legacy) || [];
            old.forEach(item => {
                addPosition({
                    symbol: item.ticker,
                    purchase_price_per_share: item.purchasePrice || item.avgPrice,
                    quantity: item.quantity,
                    purchase_date: new Date().toISOString().split('T')[0]
                });
            });
            localStorage.removeItem(LEGACY_KEY);
        } catch (e) {
            // ignore malformed legacy data
        }
    }

    function validatePosition(pos) {
        if (!pos) return null;
        const symbol = String(pos.symbol || '').trim().toUpperCase();
        const quantity = parseFloat(pos.quantity);
        const price = parseFloat(pos.purchase_price_per_share);
        const date = pos.purchase_date || new Date().toISOString().split('T')[0];
        if (!symbol || isNaN(quantity) || quantity <= 0 || isNaN(price) || price <= 0) {
            return null;
        }
        return {
            id: pos.id || generateId(),
            symbol,
            purchase_date: date,
            purchase_price_per_share: price,
            quantity,
            total_investment: parseFloat((price * quantity).toFixed(2))
        };
    }

    function addPosition(pos) {
        const validated = validatePosition(pos);
        if (!validated) return false;
        portfolioPositions.push(validated);
        save();
        return true;
    }

    function createSnapshot(dateStr) {
        const snapshot_date = dateStr || new Date().toISOString().split('T')[0];
        const total_portfolio_value = portfolioPositions.reduce((sum, p) => sum + p.quantity * p.purchase_price_per_share, 0);
        const total_invested = portfolioPositions.reduce((sum, p) => sum + p.total_investment, 0);
        const gain_loss = total_portfolio_value - total_invested;
        const gain_loss_percentage = total_invested ? (gain_loss / total_invested) * 100 : 0;
        portfolioSnapshots.push({
            snapshot_date,
            total_portfolio_value: parseFloat(total_portfolio_value.toFixed(2)),
            total_invested: parseFloat(total_invested.toFixed(2)),
            gain_loss: parseFloat(gain_loss.toFixed(2)),
            gain_loss_percentage: parseFloat(gain_loss_percentage.toFixed(2)),
            positions_snapshot: JSON.parse(JSON.stringify(portfolioPositions))
        });
        save();
        checkQuota();
        return portfolioSnapshots[portfolioSnapshots.length - 1];
    }

    function getUsage() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            if (key && value) total += key.length + value.length;
        }
        return total;
    }

    function checkQuota() {
        const limit = 5 * 1024 * 1024;
        let usage = getUsage();
        if (usage > limit * 0.9) {
            while (usage > limit * 0.9 && portfolioSnapshots.length > 0) {
                portfolioSnapshots.shift();
                usage = getUsage();
            }
            save();
        }
    }

    function exportData() {
        return JSON.stringify({ portfolioPositions, portfolioSnapshots });
    }

    function init() {
        load();
    }

    return { init, addPosition, createSnapshot, exportData, portfolioPositions, portfolioSnapshots, save };
})();
