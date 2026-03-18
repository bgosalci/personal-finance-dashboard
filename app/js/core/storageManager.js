(function(global){
  'use strict';

  // VERSION bump to 2: replaced fragile `~`-delimited RLE with null-byte sentinel.
  // Existing v1 data (stored as `~`-delimited base64+RLE) will be migrated away
  // (cleared) on first load, as the old format was susceptible to data corruption
  // when JSON values contained the `~` character.
  const VERSION = 2;
  const STORAGE_VERSION_KEY = 'pf_storage_version';
  const POSITIONS_KEY = 'pf_positions_v1';
  const SNAPSHOTS_KEY = 'pf_snapshots_v1';
  const SAVE_DEBOUNCE_MS = 100;

  let positions = null;
  let snapshots = null;
  let saveTimer = null;

  // RLE using \x00 (null byte) as sentinel — safe because JSON.stringify never
  // emits raw null bytes (they would be encoded as \u0000 inside strings).
  // Format: \x00<count>\x00<char>  e.g. "AAA" → "\x003\x00A"
  function rleEncode(str) {
    return str.replace(/(.)\1{1,}/g, (m, c) => '\x00' + m.length + '\x00' + c);
  }
  function rleDecode(str) {
    return str.replace(/\x00(\d+)\x00(.)/g, (_, n, c) => c.repeat(parseInt(n, 10)));
  }

  function compress(obj) {
    const json = JSON.stringify(obj);
    return btoa(rleEncode(json));
  }
  function decompress(data) {
    const decoded = atob(data);
    const json = rleDecode(decoded);
    return JSON.parse(json);
  }

  const storage = StorageUtils.getStorage();

  function ensureLoaded() {
    if (positions && snapshots) return;
    positions = [];
    snapshots = [];
    try {
      const ver = parseInt(storage.getItem(STORAGE_VERSION_KEY), 10);
      if (ver && ver !== VERSION) {
        migrate(ver);
        return;
      }
      const posStr = storage.getItem(POSITIONS_KEY);
      const snapStr = storage.getItem(SNAPSHOTS_KEY);
      if (posStr) {
        try { positions = decompress(posStr); } catch (e) { positions = []; }
      }
      if (snapStr) {
        try { snapshots = decompress(snapStr); } catch (e) { snapshots = []; }
      }
    } catch (e) {
      positions = [];
      snapshots = [];
    }
  }

  function migrate(oldVersion) {
    // Attempt to decode v1 tilde-delimited RLE and re-save in v2 format.
    // If decoding fails (corrupted data), data is cleared.
    try {
      const posStr = storage.getItem(POSITIONS_KEY);
      const snapStr = storage.getItem(SNAPSHOTS_KEY);
      if (posStr) {
        const json = atob(posStr).replace(/([^~])~(\d+)~/g, (_, c, n) => c.repeat(parseInt(n, 10)));
        positions = JSON.parse(json);
      }
      if (snapStr) {
        const json = atob(snapStr).replace(/([^~])~(\d+)~/g, (_, c, n) => c.repeat(parseInt(n, 10)));
        snapshots = JSON.parse(json);
      }
    } catch (e) {
      positions = [];
      snapshots = [];
    }
    storage.removeItem(POSITIONS_KEY);
    storage.removeItem(SNAPSHOTS_KEY);
    storage.setItem(STORAGE_VERSION_KEY, VERSION);
    save(); // persist migrated data in v2 format
  }

  function queueSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(save, SAVE_DEBOUNCE_MS);
  }

  function save() {
    try {
      storage.setItem(STORAGE_VERSION_KEY, VERSION);
      storage.setItem(POSITIONS_KEY, compress(positions));
      storage.setItem(SNAPSHOTS_KEY, compress(snapshots));
    } catch (e) {
      if (e && e.name === 'QuotaExceededError') {
        // Remove oldest snapshot to free space
        snapshots.shift();
        try { storage.setItem(SNAPSHOTS_KEY, compress(snapshots)); } catch (err) {}
      }
    }
  }

  function validate(pos) {
    if (!pos) return null;
    const id = pos.id || 'pos_' + Math.random().toString(36).slice(2, 10);
    const symbol = String(pos.symbol || '').trim().toUpperCase();
    const quantity = parseFloat(pos.quantity);
    const price = parseFloat(pos.purchase_price_per_share);
    const date = pos.purchase_date || new Date().toISOString().split('T')[0];
    if (!symbol || isNaN(quantity) || quantity <= 0 || isNaN(price) || price <= 0) return null;
    return {
      id, symbol, quantity, purchase_price_per_share: price,
      purchase_date: date,
      total_investment: parseFloat((price * quantity).toFixed(2))
    };
  }

  function addPortfolioPosition(position) {
    ensureLoaded();
    const val = validate(position);
    if (!val) return false;
    positions.push(val);
    queueSave();
    return true;
  }

  function getPortfolioPositions() {
    ensureLoaded();
    return positions.slice(); // return a copy to prevent external mutation
  }

  function updatePosition(id, updates) {
    ensureLoaded();
    const idx = positions.findIndex(p => p.id === id);
    if (idx === -1) return false;
    const updated = validate(Object.assign({}, positions[idx], updates, { id }));
    if (!updated) return false;
    positions[idx] = updated;
    queueSave();
    return true;
  }

  function deletePosition(id) {
    ensureLoaded();
    const idx = positions.findIndex(p => p.id === id);
    if (idx === -1) return false;
    positions.splice(idx, 1);
    queueSave();
    return true;
  }

  function createPortfolioSnapshot() {
    ensureLoaded();
    const snapshot_date = new Date().toISOString().split('T')[0];
    const total_portfolio_value = positions.reduce((s, p) => s + p.quantity * p.purchase_price_per_share, 0);
    const total_invested = positions.reduce((s, p) => s + p.total_investment, 0);
    const gain_loss = total_portfolio_value - total_invested;
    const gain_loss_percentage = total_invested ? (gain_loss / total_invested) * 100 : 0;
    const snap = {
      snapshot_date,
      total_portfolio_value: parseFloat(total_portfolio_value.toFixed(2)),
      total_invested: parseFloat(total_invested.toFixed(2)),
      gain_loss: parseFloat(gain_loss.toFixed(2)),
      gain_loss_percentage: parseFloat(gain_loss_percentage.toFixed(2)),
      positions_snapshot: JSON.parse(JSON.stringify(positions))
    };
    snapshots.push(snap);
    queueSave();
    return snap;
  }

  function getPortfolioSnapshots() {
    ensureLoaded();
    return snapshots.slice(); // return a copy to prevent external mutation
  }

  function getSnapshotsByDateRange(startDate, endDate) {
    ensureLoaded();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return snapshots.filter(s => {
      const d = new Date(s.snapshot_date).getTime();
      return d >= start && d <= end;
    });
  }

  global.StorageManager = {
    addPortfolioPosition,
    getPortfolioPositions,
    updatePosition,
    deletePosition,
    createPortfolioSnapshot,
    getPortfolioSnapshots,
    getSnapshotsByDateRange
  };
})(typeof window !== 'undefined' ? window : global);
