/* ══════════════════════════════════════════════════════════════════════
   TREND SCANNER  — Gosalci Trend v1.0
   Full-featured technical chart scanner embedded as a dashboard tab.
   Component spec: gosalci-trend-spec.docx
══════════════════════════════════════════════════════════════════════ */
const TrendScanner = (function () {
  'use strict';

  /* ── Storage ─────────────────────────────────────���───────────────── */
  const storage = StorageUtils.getStorage();
  const SETTINGS_KEY = 'gosalci_ts';

  /* ── roundRect polyfill (older Safari) ─────────────────────────── */
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      this.moveTo(x + r, y); this.lineTo(x + w - r, y); this.quadraticCurveTo(x + w, y, x + w, y + r);
      this.lineTo(x + w, y + h - r); this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      this.lineTo(x + r, y + h); this.quadraticCurveTo(x, y + h, x, y + h - r);
      this.lineTo(x, y + r); this.quadraticCurveTo(x, y, x + r, y); this.closePath();
    };
  }

  /* ── DOM helpers ────────────────────────────────��────────────────── */
  const el = id => document.getElementById('ts-' + id);
  let tsApp; // set in init()
  const qa = sel => (tsApp || document).querySelectorAll(sel);
  const qs = sel => (tsApp || document).querySelector(sel);

  /* ── State ───────────────────────────────────────────────────────── */
  let canvas, ctx;
  let rawData = [], dispData = [];
  let maLines = [
    { id: 1, type: 'EMA', period: 9,   color: '#ffd700', visible: true, data: [] },
    { id: 2, type: 'MA',  period: 20,  color: '#4db8ff', visible: true, data: [] },
    { id: 3, type: 'MA',  period: 50,  color: '#ff79c6', visible: true, data: [] },
    { id: 4, type: 'MA',  period: 100, color: '#ffb347', visible: true, data: [] },
    { id: 5, type: 'MA',  period: 200, color: '#b87bff', visible: true, data: [] },
  ];
  let maNextId = 6;
  let indColors = { macdLine: '#4db8ff', signalLine: '#ffd700', histPos: '#00d9a3', histNeg: '#ff3d5a', rsiLine: '#b87bff' };
  let panels = [
    { id: 'price',  label: 'PRICE',  ratio: 0.52, visible: true },
    { id: 'volume', label: 'VOLUME', ratio: 0.12, visible: true },
    { id: 'macd',   label: 'MACD',   ratio: 0.18, visible: true },
    { id: 'rsi',    label: 'RSI',    ratio: 0.18, visible: true },
  ];
  let dEMA9 = [], dMA20 = [], dMA50 = [], dMA100 = [], dMA200 = [], dSigs = [];
  let dMACD = { line: [], signal: [], hist: [] }, dRSI = [];
  let srLevels = [];
  let candleMode = 'D', periodDays = 252, barsVisible = 252, viewEnd = 0;
  let hoveredLocal = -1, hoveredY = -1;
  let showSR = true, showTrend = true, showTooltip = true;
  let rangeMode = false, rangeStep = 0, rangeP1 = null, rangeP2 = null, rangeDraft = null;
  let _pricePanel = null;
  let dragMode = '', dragStartX = 0, dragStartY = 0, dragStartVE = 0;
  let dragDivIdx = -1, dragDivRatios = [], dragDivTotalPx = 0;
  let dpr = 1, resizeTimer;

  const CPAD = 24;
  const PAD  = { L: 74, R: 18, T: 4, B: 4 };
  const VGAP = 5;
  const DIV_HIT = 6;
  const MIN_PANEL_H = 40;
  const DAYS_PER_BAR = { D: 1, W: 5, M: 21 };

  /* ── Theme colours ───────────────────────────────────────────────── */
  function getC() {
    const rootTheme = document.documentElement.dataset.theme;
    const dark = rootTheme === 'dark'
      || (!rootTheme && (window.matchMedia('(prefers-color-scheme: dark)').matches
                      || !window.matchMedia('(prefers-color-scheme: light)').matches));
    const bull  = dark ? '#00d9a3' : '#00a878';
    const bear  = dark ? '#ff3d5a' : '#e0293c';
    const ema9  = dark ? '#ffd700' : '#b58800';
    const ma20  = dark ? '#4db8ff' : '#1a7acc';
    const ma50  = dark ? '#ff79c6' : '#c0336c';
    const ma100 = dark ? '#ffb347' : '#cc7700';
    const ma200 = dark ? '#b87bff' : '#7044cc';
    return {
      bg:    dark ? '#07090f' : '#ffffff',
      panel: dark ? '#0b0f1c' : '#ffffff',
      border:dark ? '#1a2540' : '#c8d3e8',
      muted: dark ? '#2a3a5c' : '#a0b0cc',
      text:  dark ? '#6882aa' : '#5570a0',
      bright:dark ? '#aac4e8' : '#2a4070',
      white: dark ? '#ddeeff' : '#0d1f3c',
      bull, bear, ema9, ma20, ma50, ma100, ma200,
      entry: dark ? '#00ff88' : '#00a878',
      exit:  dark ? '#ff3366' : '#e0293c',
      volBull: dark ? 'rgba(0,217,163,.28)' : 'rgba(0,168,120,.22)',
      volBear: dark ? 'rgba(255,61,90,.28)'  : 'rgba(224,41,60,.22)',
      grid:  dark ? '#10192e' : '#e2e8f4',
      crosshair: dark ? 'rgba(100,140,210,.4)' : 'rgba(60,100,180,.35)',
      macdLine:   indColors.macdLine,
      signalLine: indColors.signalLine,
      histPos: dark ? 'rgba(0,217,163,.55)' : 'rgba(0,168,120,.50)',
      histNeg: dark ? 'rgba(255,61,90,.55)'  : 'rgba(224,41,60,.50)',
      rsiLine: indColors.rsiLine,
      srMajR: bear, srMajS: bull,
      srMinR: dark ? 'rgba(255,61,90,.48)'  : 'rgba(224,41,60,.38)',
      srMinS: dark ? 'rgba(0,217,163,.48)'  : 'rgba(0,168,120,.38)',
      trendUp: dark ? 'rgba(0,255,136,.9)'  : 'rgba(0,168,120,.9)',
      trendDn: dark ? 'rgba(255,148,0,.9)'  : 'rgba(204,100,0,.9)',
    };
  }
  let C = {};

  /* ── Canvas ──────────────────────────────────────────────────────── */
  function resizeCanvas(cb) {
    if (!canvas || !tsApp) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Set #ts-app height first, then read canvas dimensions after reflow
    const top = tsApp.getBoundingClientRect().top;
    if (top >= 0) {
      tsApp.style.height = Math.max(window.innerHeight - top, 480) + 'px';
    }
    // rAF lets the browser reflow before we read the canvas wrapper size
    requestAnimationFrame(() => {
      const r = canvas.parentElement.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      canvas.width  = Math.round(r.width  * dpr);
      canvas.height = Math.round(r.height * dpr);
      canvas.style.width  = r.width  + 'px';
      canvas.style.height = r.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (typeof cb === 'function') cb();
    });
  }
  const lw = () => canvas ? canvas.width / dpr : 0;
  const lh = () => canvas ? canvas.height / dpr : 0;

  /* ── Aggregation ─────────────────────────────────────────────────── */
  function aggregateWeekly(d) {
    const m = {};
    d.forEach(b => {
      const dt = new Date(b.date + 'T00:00:00'), dy = dt.getDay();
      const mn = new Date(dt); mn.setDate(dt.getDate() - (dy === 0 ? 6 : dy - 1));
      const k = mn.toISOString().slice(0, 10);
      if (!m[k]) m[k] = { date: k, open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume };
      else { m[k].high = Math.max(m[k].high, b.high); m[k].low = Math.min(m[k].low, b.low); m[k].close = b.close; m[k].volume += b.volume; }
    });
    return Object.values(m).sort((a, b) => a.date < b.date ? -1 : 1);
  }
  function aggregateMonthly(d) {
    const m = {};
    d.forEach(b => {
      const k = b.date.slice(0, 7);
      if (!m[k]) m[k] = { date: b.date, open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume };
      else { m[k].high = Math.max(m[k].high, b.high); m[k].low = Math.min(m[k].low, b.low); m[k].close = b.close; m[k].volume += b.volume; }
    });
    return Object.values(m).sort((a, b) => a.date < b.date ? -1 : 1);
  }
  function buildDisplayData() {
    dispData = candleMode === 'W' ? aggregateWeekly(rawData) : candleMode === 'M' ? aggregateMonthly(rawData) : rawData.slice();
  }

  /* ── Indicators ──────────────────────────────────────────────────── */
  function calcSMA(d, p) {
    const o = new Array(d.length).fill(null); let s = 0;
    for (let i = 0; i < d.length; i++) { s += d[i].close; if (i >= p) s -= d[i - p].close; if (i >= p - 1) o[i] = s / p; }
    return o;
  }
  function calcEMA(d, p) {
    const k = 2 / (p + 1), o = new Array(d.length).fill(null);
    if (d.length < p) return o;
    let s = 0; for (let i = 0; i < p; i++) s += d[i].close; o[p - 1] = s / p;
    for (let i = p; i < d.length; i++) o[i] = d[i].close * k + o[i - 1] * (1 - k);
    return o;
  }
  function calcEMAArr(arr, p) {
    const k = 2 / (p + 1), o = new Array(arr.length).fill(null);
    let s = 0, cnt = 0, seed = -1;
    for (let i = 0; i < arr.length; i++) { if (arr[i] === null) continue; s += arr[i]; cnt++; if (cnt === p) { o[i] = s / p; seed = i; break; } }
    for (let i = seed + 1; i < arr.length; i++) o[i] = (arr[i] !== null && o[i - 1] !== null) ? arr[i] * k + o[i - 1] * (1 - k) : o[i - 1];
    return o;
  }
  function calcMACD() {
    const e12 = calcEMA(dispData, 12), e26 = calcEMA(dispData, 26);
    const line = dispData.map((_, i) => e12[i] !== null && e26[i] !== null ? e12[i] - e26[i] : null);
    const sig = calcEMAArr(line, 9);
    return { line, signal: sig, hist: line.map((v, i) => v !== null && sig[i] !== null ? v - sig[i] : null) };
  }
  function calcRSI(period = 14) {
    const o = new Array(dispData.length).fill(null);
    if (dispData.length < period + 1) return o;
    let ag = 0, al = 0;
    for (let i = 1; i <= period; i++) { const d = dispData[i].close - dispData[i - 1].close; d > 0 ? ag += d : al += -d; }
    ag /= period; al /= period;
    o[period] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
    for (let i = period + 1; i < dispData.length; i++) {
      const d = dispData[i].close - dispData[i - 1].close;
      ag = (ag * (period - 1) + Math.max(d, 0)) / period;
      al = (al * (period - 1) + Math.max(-d, 0)) / period;
      o[i] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
    }
    return o;
  }
  function recalcIndicators() {
    maLines.forEach(m => { m.data = m.type === 'EMA' ? calcEMA(dispData, m.period) : calcSMA(dispData, m.period); });
    const _e9   = maLines.find(m => m.type === 'EMA' && m.period === 9);
    const _m20  = maLines.find(m => m.type === 'MA'  && m.period === 20);
    const _m50  = maLines.find(m => m.type === 'MA'  && m.period === 50);
    const _m100 = maLines.find(m => m.type === 'MA'  && m.period === 100);
    const _m200 = maLines.find(m => m.type === 'MA'  && m.period === 200);
    dEMA9  = _e9   ? _e9.data   : calcEMA(dispData, 9);
    dMA20  = _m20  ? _m20.data  : calcSMA(dispData, 20);
    dMA50  = _m50  ? _m50.data  : calcSMA(dispData, 50);
    dMA100 = _m100 ? _m100.data : calcSMA(dispData, 100);
    dMA200 = _m200 ? _m200.data : calcSMA(dispData, 200);
    dSigs = detectSignals(); dMACD = calcMACD(); dRSI = calcRSI(14);
    computeSRLevels();
  }

  /* ── Signals ─────────────────────────────────────────────────────── */
  function detectSignals() {
    const s = new Array(dispData.length).fill(null);
    for (let i = 1; i < dispData.length; i++) {
      const pC = dispData[i - 1].close, cC = dispData[i].close;
      const p50 = dMA50[i - 1], c50 = dMA50[i], p200 = dMA200[i - 1], c200 = dMA200[i];
      const pE9 = dEMA9[i - 1], cE9 = dEMA9[i], pM20 = dMA20[i - 1], cM20 = dMA20[i];
      if (c50 === null || c200 === null) continue;
      if (p50 !== null && p200 !== null && p50 <= p200 && c50 > c200) { s[i] = { type: 'entry', reason: 'Golden Cross', strength: 3 }; continue; }
      if (p50 !== null && p200 !== null && p50 >= p200 && c50 < c200) { s[i] = { type: 'exit',  reason: 'Death Cross',  strength: 3 }; continue; }
      if (cE9 === null || pE9 === null || cM20 === null || pM20 === null) continue;
      const bull = c50 > c200, bear = c50 < c200;
      if (pE9 <= pM20 && cE9 > cM20 && bull) { s[i] = { type: 'entry', reason: 'EMA9\xd7MA20\u2191', strength: 2 }; continue; }
      if (pE9 >= pM20 && cE9 < cM20 && bear) { s[i] = { type: 'exit',  reason: 'EMA9\xd7MA20\u2193', strength: 2 }; continue; }
      if (p50 !== null && pC < p50 && cC > c50 && bull) { s[i] = { type: 'entry', reason: 'MA50 Reclaim',   strength: 1 }; continue; }
      if (p50 !== null && pC > p50 && cC < c50 && bear) { s[i] = { type: 'exit',  reason: 'MA50 Breakdown', strength: 1 }; }
    }
    return s;
  }

  /* ── Support & Resistance ────────────────────────────────────────── */
  function computeSRLevels() {
    if (dispData.length < 10) { srLevels = []; return; }
    const len = dispData.length, currentPrice = dispData[len - 1].close;
    const lb = Math.max(4, Math.round(len * 0.018));
    const pivots = [];
    for (let i = lb; i < len - lb; i++) {
      const hi = dispData[i].high, lo = dispData[i].low;
      let isH = true, isL = true;
      for (let j = i - lb; j <= i + lb; j++) {
        if (j === i) continue;
        if (dispData[j].high >= hi) isH = false;
        if (dispData[j].low  <= lo) isL = false;
      }
      if (isH) pivots.push({ p: hi, i });
      if (isL) pivots.push({ p: lo, i });
    }
    if (!pivots.length) { srLevels = []; return; }
    pivots.sort((a, b) => a.p - b.p);
    const used = new Set(), clusters = [];
    for (let i = 0; i < pivots.length; i++) {
      if (used.has(i)) continue;
      const g = [pivots[i]]; used.add(i);
      for (let j = i + 1; j < pivots.length; j++) {
        if (used.has(j)) continue;
        if ((pivots[j].p - pivots[i].p) / pivots[i].p < 0.015) { g.push(pivots[j]); used.add(j); }
      }
      if (g.length < 2) continue;
      const avg = g.reduce((s, x) => s + x.p, 0) / g.length;
      const type = avg < currentPrice ? 'S' : 'R';
      clusters.push({ price: avg, type, touches: g.length, major: g.length >= 3 });
    }
    srLevels = clusters.sort((a, b) => {
      if (a.type === 'R' && b.type === 'R') return a.price - b.price;
      if (a.type === 'S' && b.type === 'S') return b.price - a.price;
      return a.type === 'R' ? -1 : 1;
    });
  }

  /* ── Trend Lines ─────────────────────────────────────────────────── */
  function computeTrendLines(vs, ve, N) {
    if (N < 12) return [];
    const lb = Math.max(3, Math.round(N * 0.06));
    const highs = [], lows = [];
    for (let i = vs + lb; i < ve - lb; i++) {
      const hi = dispData[i].high, lo = dispData[i].low;
      let isH = true, isL = true;
      for (let j = i - lb; j <= i + lb; j++) {
        if (j === i) continue;
        if (dispData[j].high >= hi) isH = false;
        if (dispData[j].low  <= lo) isL = false;
      }
      if (isH) highs.push({ price: hi, idx: i });
      if (isL) lows.push({ price: lo, idx: i });
    }
    const lines = [];
    if (lows.length >= 2) {
      const p2 = lows[lows.length - 1];
      for (let i = lows.length - 2; i >= 0; i--) { if (lows[i].price < p2.price) { lines.push({ kind: 'up', p1: lows[i], p2 }); break; } }
    }
    if (highs.length >= 2) {
      const p2 = highs[highs.length - 1];
      for (let i = highs.length - 2; i >= 0; i--) { if (highs[i].price > p2.price) { lines.push({ kind: 'dn', p1: highs[i], p2 }); break; } }
    }
    return lines;
  }

  /* ── View helpers ────────────────────────────────────────────────── */
  const getVE = () => viewEnd > 0 ? viewEnd : dispData.length;
  const getVS = () => Math.max(0, getVE() - barsVisible);
  const getN  = () => getVE() - getVS();
  function applyPeriod(reset = true) {
    barsVisible = Math.max(5, Math.min(Math.round(periodDays / DAYS_PER_BAR[candleMode]), dispData.length));
    if (reset) viewEnd = dispData.length;
  }
  function canvasToRangePoint(mx, my) {
    if (!_pricePanel) return null;
    const N = getN(), bW = (lw() - PAD.L - PAD.R - CPAD * 2) / N;
    const li = Math.floor((mx - PAD.L - CPAD) / bW);
    if (li < 0 || li >= N) return null;
    const gi = getVS() + li;
    if (gi < 0 || gi >= dispData.length) return null;
    const { top, height, yMin, yMax } = _pricePanel;
    const price = yMax - ((my - top) / height) * (yMax - yMin);
    return { barIdx: gi, price, localIdx: li };
  }
  function zoom(factor, pivotFrac = 1.0) {
    if (!dispData.length) return;
    const vs = getVS(), ve = getVE(), N = ve - vs;
    const newN = Math.min(Math.max(Math.round(N * factor), 5), dispData.length);
    const pivot = vs + pivotFrac * N;
    let nvs = Math.round(pivot - pivotFrac * newN), nve = nvs + newN;
    if (nve > dispData.length) { nve = dispData.length; nvs = nve - newN; }
    if (nvs < 0) { nvs = 0; nve = Math.min(newN, dispData.length); }
    barsVisible = nve - nvs; viewEnd = nve; drawChart();
  }

  /* ── Panel layout ────────────────────────────────────────────────── */
  const getVisPanels = () => panels.filter(p => p.visible);
  function getPanelLayout() {
    const H = lh(), vis = getVisPanels(); if (!vis.length) return [];
    const totalGap = (vis.length - 1) * VGAP, totalH = H - PAD.T - PAD.B - totalGap;
    const sumR = vis.reduce((s, p) => s + p.ratio, 0);
    let top = PAD.T;
    return vis.map(p => {
      const h = Math.max(MIN_PANEL_H, Math.round((p.ratio / sumR) * totalH));
      const r = { id: p.id, label: p.label, top, height: h }; top += h + VGAP; return r;
    });
  }

  /* ── Grid ────────────────────────────────────────────────────────── */
  function niceGrid(min, max, n = 7) {
    const range = max - min; if (range <= 0) return [min, max];
    const raw = range / n, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map(s => s * mag).find(s => s >= raw) || mag * 10;
    const ticks = []; for (let t = Math.ceil(min / step) * step; t <= max + 1e-9; t += step) ticks.push(+t.toPrecision(10));
    return ticks;
  }

  /* ── Draw helpers ────────────────────────────────────────────────── */
  function drawLine(arr, vs, N, toX, toY, color, width = 1.2) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); let f = true;
    for (let li = 0; li < N; li++) { const v = arr[vs + li]; if (v === null) { f = true; continue; } const x = toX(li), y = toY(v); f ? (ctx.moveTo(x, y), f = false) : ctx.lineTo(x, y); }
    ctx.stroke();
  }
  function hline(y, x0, x1, color, width = 1, dash = []) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.setLineDash([]);
  }
  function pLabel(txt, x, y, color = C.muted, bold = false) {
    ctx.font = (bold ? 'bold ' : '') + '9px Space Mono,monospace'; ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.fillText(txt, x, y);
  }
  function yLabel(txt, x, y) {
    ctx.font = '10px Space Mono,monospace'; ctx.fillStyle = C.text; ctx.textAlign = 'right'; ctx.fillText(txt, x, y);
  }

  /* ── Draw S/R levels ─────────────────────────────────────────────── */
  function drawSRLevels(pl, yMin, yMax, toY, W) {
    if (!showSR || !srLevels.length) return;
    const x0 = PAD.L, x1 = W - PAD.R;
    const sorted = [...srLevels].sort((a, b) => b.touches - a.touches).slice(0, 12);
    sorted.forEach(lvl => {
      if (lvl.price < yMin * 0.97 || lvl.price > yMax * 1.03) return;
      const y = toY(lvl.price);
      if (y < pl.top - 1 || y > pl.top + pl.height + 1) return;
      const isR = lvl.type === 'R';
      if (lvl.major) {
        const bh = Math.max(3, pl.height * 0.006);
        ctx.fillStyle = isR ? 'rgba(255,61,90,.06)' : 'rgba(0,217,163,.06)';
        ctx.fillRect(x0, y - bh, x1 - x0, bh * 2);
      }
      const lineColor = isR ? (lvl.major ? C.srMajR : C.srMinR) : (lvl.major ? C.srMajS : C.srMinS);
      hline(y, x0, x1, lineColor, lvl.major ? 2 : 1, lvl.major ? [] : [6, 4]);
      const pStr = lvl.price >= 100 ? lvl.price.toFixed(2) : lvl.price < 1 ? lvl.price.toFixed(4) : lvl.price.toFixed(3);
      const tag = lvl.major ? (isR ? '\u25b2R' : '\u25bcS') : (isR ? 'R' : 'S');
      const tagW = lvl.major ? 28 : 20;
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = isR ? (lvl.major ? 'rgba(255,61,90,.22)' : 'rgba(255,61,90,.12)') : (lvl.major ? 'rgba(0,217,163,.22)' : 'rgba(0,217,163,.12)');
      ctx.fillRect(x0 + 4, y - 8, tagW, 16);
      ctx.font = (lvl.major ? 'bold ' : '') + '8px Space Mono,monospace';
      ctx.fillStyle = lineColor; ctx.textAlign = 'center';
      ctx.fillText(tag, x0 + 4 + tagW / 2, y + 3);
      ctx.font = (lvl.major ? 'bold ' : '') + '9px Space Mono,monospace';
      ctx.fillStyle = lineColor; ctx.textAlign = 'right';
      ctx.fillText(pStr, x1 - 5, y - 2);
      ctx.globalAlpha = 1;
    });
  }

  /* ── Draw trend lines ────────────────────────────────────────────── */
  function drawTrendLines(pl, vs, ve, N, toX, toY, W) {
    if (!showTrend) return;
    const lines = computeTrendLines(vs, ve, N); if (!lines.length) return;
    ctx.save();
    ctx.beginPath(); ctx.rect(PAD.L, pl.top, W - PAD.L - PAD.R, pl.height); ctx.clip();
    lines.forEach(ln => {
      const { kind, p1, p2 } = ln;
      const slope = (p2.price - p1.price) / (p2.idx - p1.idx);
      const color = kind === 'up' ? C.trendUp : C.trendDn;
      const extR = ve - 1 + Math.round(N * 0.25);
      const priceAtExtR = p1.price + slope * (extR - p1.idx);
      const priceAtVS   = p1.price + slope * (vs   - p1.idx);
      ctx.strokeStyle = kind === 'up' ? 'rgba(0,255,136,.2)' : 'rgba(255,148,0,.2)';
      ctx.lineWidth = 6; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(toX(vs - vs), toY(priceAtVS)); ctx.lineTo(toX(extR - vs), toY(priceAtExtR)); ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(toX(vs - vs), toY(priceAtVS)); ctx.lineTo(toX(extR - vs), toY(priceAtExtR)); ctx.stroke();
      [p1, p2].forEach(pt => {
        const px = toX(pt.idx - vs), py = toY(pt.price);
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.fill();
        ctx.strokeStyle = 'rgba(7,9,15,.6)'; ctx.lineWidth = 1; ctx.stroke();
      });
      ctx.strokeStyle = kind === 'up' ? 'rgba(0,255,136,.4)' : 'rgba(255,148,0,.4)';
      ctx.lineWidth = 1.2; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.moveTo(toX(p2.idx - vs), toY(p2.price)); ctx.lineTo(toX(extR - vs), toY(priceAtExtR)); ctx.stroke(); ctx.setLineDash([]);
    });
    ctx.restore();
  }

  /* ── Price panel ─────────────────────────────────────────────────── */
  function drawPricePanel(pl, vs, ve, N, toX, barW, candleW, W) {
    const { top, height } = pl;
    let minP = Infinity, maxP = -Infinity;
    for (let i = vs; i < ve; i++) {
      minP = Math.min(minP, dispData[i].low); maxP = Math.max(maxP, dispData[i].high);
      maLines.filter(m => m.visible).forEach(m => { const v = m.data[i]; if (v !== null && v !== undefined) { minP = Math.min(minP, v); maxP = Math.max(maxP, v); } });
    }
    const pPad = (maxP - minP) * 0.10, yMin = minP - pPad, yMax = maxP + pPad;
    const toY = p => top + height - ((p - yMin) / (yMax - yMin)) * height;
    const yT = niceGrid(yMin, yMax, 7);
    yT.forEach(t => { if (t < yMin || t > yMax) return; hline(toY(t), PAD.L, W - PAD.R, C.grid, 1); });
    drawSRLevels(pl, yMin, yMax, toY, W);
    drawTrendLines(pl, vs, ve, N, toX, toY, W);
    [...maLines].reverse().filter(m => m.visible).forEach(m => {
      const w = m.period >= 100 ? 1.5 : m.period >= 50 ? 1.4 : 1.2;
      drawLine(m.data, vs, N, toX, toY, m.color, w);
    });
    for (let li = 0; li < N; li++) {
      const d = dispData[vs + li], x = toX(li), bull = d.close >= d.open, col = bull ? C.bull : C.bear;
      const bT = toY(Math.max(d.open, d.close)), bB = toY(Math.min(d.open, d.close)), bH = Math.max(1, bB - bT);
      ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, candleW * 0.10);
      ctx.beginPath(); ctx.moveTo(x, toY(d.high)); ctx.lineTo(x, toY(d.low)); ctx.stroke();
      ctx.lineWidth = 1; ctx.fillStyle = col; ctx.fillRect(x - candleW / 2, bT, candleW, bH);
    }
    ctx.setLineDash([3, 4]);
    for (let li = 0; li < N; li++) {
      const sig = dSigs[vs + li]; if (!sig || sig.strength !== 3) continue;
      ctx.strokeStyle = sig.type === 'entry' ? 'rgba(0,255,136,.15)' : 'rgba(255,51,102,.15)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(toX(li), top); ctx.lineTo(toX(li), top + height); ctx.stroke();
    }
    ctx.setLineDash([]);
    for (let li = 0; li < N; li++) {
      const sig = dSigs[vs + li]; if (!sig) continue;
      const d = dispData[vs + li], x = toX(li), sz = sig.strength === 3 ? 9 : sig.strength === 2 ? 6 : 4;
      ctx.globalAlpha = sig.strength === 1 ? 0.65 : 1;
      if (sig.type === 'entry') {
        const base = Math.min(top + height - 3, toY(d.low) + sz * 2);
        ctx.fillStyle = C.entry; ctx.beginPath(); ctx.moveTo(x, base - sz * 1.1); ctx.lineTo(x - sz * .7, base + sz * .4); ctx.lineTo(x + sz * .7, base + sz * .4); ctx.closePath(); ctx.fill();
        if (sig.strength === 3) { ctx.font = 'bold 8px Space Mono,monospace'; ctx.fillStyle = C.entry; ctx.textAlign = 'center'; ctx.fillText('GX', x, base + sz * .4 + 8); }
      } else {
        const base = Math.max(top + 3, toY(d.high) - sz * 2);
        ctx.fillStyle = C.exit; ctx.beginPath(); ctx.moveTo(x, base + sz * 1.1); ctx.lineTo(x - sz * .7, base - sz * .4); ctx.lineTo(x + sz * .7, base - sz * .4); ctx.closePath(); ctx.fill();
        if (sig.strength === 3) { ctx.font = 'bold 8px Space Mono,monospace'; ctx.fillStyle = C.exit; ctx.textAlign = 'center'; ctx.fillText('DX', x, base - sz * .4 - 2); }
      }
      ctx.globalAlpha = 1;
    }
    yT.forEach(t => { if (t < yMin || t > yMax) return; const l = t >= 1000 ? t.toFixed(0) : t < 10 ? t.toFixed(3) : t.toFixed(2); yLabel(l, PAD.L - 7, toY(t) + 3.5); });
    if (hoveredLocal >= 0 && hoveredLocal < N) {
      const d = dispData[vs + hoveredLocal], y = toY(d.close);
      ctx.fillStyle = d.close >= d.open ? C.bull : C.bear; ctx.fillRect(0, y - 8, PAD.L - 9, 16);
      ctx.fillStyle = '#000'; ctx.textAlign = 'right'; ctx.font = 'bold 9px Space Mono,monospace'; ctx.fillText(d.close.toFixed(2), PAD.L - 11, y + 3.5);
    }
    hline(top, PAD.L, W - PAD.R, C.border, 1);
    ctx.strokeStyle = C.border; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(PAD.L, top); ctx.lineTo(PAD.L, top + height); ctx.stroke();
    _pricePanel = { top, height, yMin, yMax };
  }

  /* ── Volume panel ────────────────────────────────────────────────── */
  function drawVolumePanel(pl, vs, ve, N, toX, barW, candleW, W) {
    const { top, height } = pl;
    let maxVol = 0; for (let i = vs; i < ve; i++) maxVol = Math.max(maxVol, dispData[i].volume);
    const toY = v => top + height - (v / maxVol) * height;
    hline(top, PAD.L, W - PAD.R, C.border, 1);
    ctx.strokeStyle = C.border; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(PAD.L, top); ctx.lineTo(PAD.L, top + height); ctx.stroke();
    for (let li = 0; li < N; li++) {
      const d = dispData[vs + li], x = toX(li);
      ctx.fillStyle = d.close >= d.open ? C.volBull : C.volBear;
      ctx.fillRect(x - candleW / 2, toY(d.volume), candleW, top + height - toY(d.volume));
    }
    const mv = maxVol >= 1e9 ? (maxVol / 1e9).toFixed(1) + 'B' : maxVol >= 1e6 ? (maxVol / 1e6).toFixed(1) + 'M' : (maxVol / 1e3).toFixed(0) + 'K';
    yLabel(mv, PAD.L - 7, top + 11);
    pLabel('VOLUME', PAD.L + CPAD, top + 11);
  }

  /* ── MACD panel ──────────────────────────────────────────────────── */
  function drawMACDPanel(pl, vs, ve, N, toX, barW, candleW, W) {
    const { top, height } = pl;
    let minM = Infinity, maxM = -Infinity;
    for (let i = vs; i < ve; i++) { [dMACD.line[i], dMACD.signal[i], dMACD.hist[i]].forEach(v => { if (v !== null) { minM = Math.min(minM, v); maxM = Math.max(maxM, v); } }); }
    if (!isFinite(minM)) { hline(top, PAD.L, W - PAD.R, C.border, 1); return; }
    const ext = Math.max(Math.abs(minM), Math.abs(maxM)) * 1.15;
    const toY = v => top + height - ((v + ext) / (2 * ext)) * height, zeroY = toY(0);
    hline(top, PAD.L, W - PAD.R, C.border, 1);
    ctx.strokeStyle = C.border; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(PAD.L, top); ctx.lineTo(PAD.L, top + height); ctx.stroke();
    hline(zeroY, PAD.L, W - PAD.R, C.muted, 1);
    for (let li = 0; li < N; li++) {
      const v = dMACD.hist[vs + li]; if (v === null) continue;
      const x = toX(li);
      ctx.fillStyle = v >= 0 ? indColors.histPos + '99' : indColors.histNeg + '99';
      v >= 0 ? ctx.fillRect(x - candleW / 2, toY(v), candleW, zeroY - toY(v)) : ctx.fillRect(x - candleW / 2, zeroY, candleW, toY(v) - zeroY);
    }
    drawLine(dMACD.line,   vs, N, toX, toY, indColors.macdLine,   1.2);
    drawLine(dMACD.signal, vs, N, toX, toY, indColors.signalLine, 1.1);
    yLabel(ext >= 1 ? ext.toFixed(2) : ext.toFixed(3), PAD.L - 7, top + 10);
    yLabel('0', PAD.L - 7, zeroY + 4);
    yLabel((-ext >= 1 ? (-ext).toFixed(2) : (-ext).toFixed(3)), PAD.L - 7, top + height - 2);
    const lM = dMACD.line[ve - 1], lS = dMACD.signal[ve - 1];
    pLabel(`MACD 12/26/9   M:${lM !== null ? lM.toFixed(3) : '\u2014'}  S:${lS !== null ? lS.toFixed(3) : '\u2014'}`, PAD.L + CPAD, top + 11);
  }

  /* ── RSI panel ───────────────────────────────────────────────────── */
  function drawRSIPanel(pl, vs, ve, N, toX, W) {
    const { top, height } = pl;
    const toY = v => top + height - (v / 100) * height;
    hline(top, PAD.L, W - PAD.R, C.border, 1);
    ctx.strokeStyle = C.border; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(PAD.L, top); ctx.lineTo(PAD.L, top + height); ctx.stroke();
    ctx.fillStyle = 'rgba(255,61,90,.05)'; ctx.fillRect(PAD.L, top, W - PAD.L - PAD.R, toY(70) - top);
    ctx.fillStyle = 'rgba(0,217,163,.05)'; ctx.fillRect(PAD.L, toY(30), W - PAD.L - PAD.R, top + height - toY(30));
    [[70, 'rgba(255,61,90,.45)', [4, 4]], [50, C.muted, []], [30, 'rgba(0,217,163,.45)', [4, 4]]].forEach(([l, c, d]) => {
      hline(toY(l), PAD.L, W - PAD.R, c, 1, d); yLabel(l.toString(), PAD.L - 7, toY(l) + 3.5);
    });
    ctx.save(); ctx.beginPath(); ctx.rect(PAD.L, top, W - PAD.L - PAD.R, toY(70) - top); ctx.clip();
    ctx.beginPath(); let f = true;
    for (let li = 0; li < N; li++) { const v = dRSI[vs + li]; if (v === null) { f = true; continue; } const x = toX(li), y = toY(v); f ? (ctx.moveTo(x, y), f = false) : ctx.lineTo(x, y); }
    ctx.lineTo(toX(N - 1), top); ctx.lineTo(toX(0), top); ctx.closePath(); ctx.fillStyle = 'rgba(255,61,90,.06)'; ctx.fill(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(PAD.L, toY(30), W - PAD.L - PAD.R, top + height - toY(30)); ctx.clip();
    ctx.beginPath(); f = true;
    for (let li = 0; li < N; li++) { const v = dRSI[vs + li]; if (v === null) { f = true; continue; } const x = toX(li), y = toY(v); f ? (ctx.moveTo(x, y), f = false) : ctx.lineTo(x, y); }
    ctx.lineTo(toX(N - 1), top + height); ctx.lineTo(toX(0), top + height); ctx.closePath(); ctx.fillStyle = 'rgba(0,217,163,.06)'; ctx.fill(); ctx.restore();
    drawLine(dRSI, vs, N, toX, toY, indColors.rsiLine, 1.3);
    const lr = dRSI[ve - 1];
    const rc = lr !== null ? (lr > 70 ? C.bear : lr < 30 ? C.bull : indColors.rsiLine) : C.muted;
    pLabel(`RSI 14   ${lr !== null ? lr.toFixed(1) : '\u2014'}`, PAD.L + CPAD, top + 11, rc, true);
  }

  /* ── Dividers ────────────────────────────────────────────────────── */
  function drawDividers(layout, W) {
    for (let i = 0; i < layout.length - 1; i++) {
      const divY = layout[i].top + layout[i].height + VGAP / 2;
      ctx.fillStyle = C.muted;
      for (let dx = -12; dx <= 12; dx += 6) { ctx.beginPath(); ctx.arc(W / 2 + dx, divY, 1.5, 0, Math.PI * 2); ctx.fill(); }
    }
  }

  /* ── Range tool ──────────────────────────────────────────────────── */
  function drawRangeTool(layout, toX, W) {
    const p1 = rangeP1, p2 = rangeP2 || rangeDraft;
    if (!p1 || !p2) return;
    const pp = _pricePanel; if (!pp) return;
    const vs = getVS();
    const x1 = toX(p1.barIdx - vs), x2 = toX(p2.barIdx - vs);
    const toY = price => pp.top + pp.height - ((price - pp.yMin) / (pp.yMax - pp.yMin)) * pp.height;
    const y1 = toY(p1.price), y2 = toY(p2.price);
    const xL = Math.min(x1, x2), xR = Math.max(x1, x2);
    const yT = Math.min(y1, y2), yB = Math.max(y1, y2);
    const priceDiff = p2.price - p1.price, pct = (priceDiff / p1.price * 100);
    const bars = Math.abs(p2.barIdx - p1.barIdx), up = priceDiff >= 0;
    const col = up ? C.bull : C.bear;
    ctx.save();
    ctx.fillStyle = up ? 'rgba(0,217,163,.07)' : 'rgba(255,61,90,.07)';
    ctx.fillRect(xL, yT, xR - xL, yB - yT);
    ctx.strokeStyle = up ? 'rgba(0,217,163,.35)' : 'rgba(255,61,90,.35)'; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.strokeRect(xL, yT, xR - xL, yB - yT);
    ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    [x1, x2].forEach(x => { ctx.beginPath(); ctx.moveTo(x, pp.top); ctx.lineTo(x, pp.top + pp.height); ctx.stroke(); });
    ctx.setLineDash([]);
    ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
    [x1, x2].forEach((x, i) => {
      const y = i === 0 ? y1 : y2;
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 1; ctx.stroke();
    });
    const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
    const sign = up ? '+' : '';
    const lines = [
      `${sign}${priceDiff.toFixed(2)}  (${sign}${pct.toFixed(2)}%)`,
      `${bars} bar${bars !== 1 ? 's' : ''}  \xb7  ${p1.price.toFixed(2)} \u2192 ${p2.price.toFixed(2)}`
    ];
    ctx.font = 'bold 10px Space Mono,monospace';
    const maxW = Math.max(...lines.map(l => ctx.measureText(l).width));
    const boxW = maxW + 20, boxH = 38, boxX = midX - boxW / 2, boxY = midY - boxH / 2;
    const bx = Math.min(Math.max(boxX, PAD.L + 4), W - PAD.R - boxW - 4);
    const by = Math.min(Math.max(boxY, pp.top + 4), pp.top + pp.height - boxH - 4);
    ctx.fillStyle = C.panel; ctx.strokeStyle = col; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(bx, by, boxW, boxH, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.font = 'bold 10px Space Mono,monospace';
    ctx.fillText(lines[0], bx + boxW / 2, by + 14);
    ctx.fillStyle = C.text; ctx.font = '9px Space Mono,monospace';
    ctx.fillText(lines[1], bx + boxW / 2, by + 28);
    ctx.restore();
  }

  /* ── Main draw ───────────────────────────────────────────────────── */
  function drawChart() {
    if (!canvas || !ctx) return;
    C = getC();
    if (!dispData.length) return;
    const W = lw(), H = lh();
    const vs = getVS(), ve = getVE(), N = ve - vs; if (N <= 0) return;
    const innerW = W - PAD.L - PAD.R, drawW = innerW - CPAD * 2;
    const barW = drawW / N, candleW = Math.max(1, Math.min(barW * 0.70, barW - 1));
    const toX = li => PAD.L + CPAD + (li + 0.5) * barW;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    const layout = getPanelLayout();
    layout.forEach(pl => {
      switch (pl.id) {
        case 'price':  drawPricePanel(pl, vs, ve, N, toX, barW, candleW, W); break;
        case 'volume': drawVolumePanel(pl, vs, ve, N, toX, barW, candleW, W); break;
        case 'macd':   drawMACDPanel(pl, vs, ve, N, toX, barW, candleW, W); break;
        case 'rsi':    drawRSIPanel(pl, vs, ve, N, toX, W); break;
      }
    });
    if (candleMode === 'D') {
      const firstPl = layout[0], lastPl = layout[layout.length - 1];
      const totalTop = firstPl.top, totalBottom = lastPl.top + lastPl.height;
      ctx.save(); ctx.strokeStyle = 'rgba(140,160,220,.32)'; ctx.lineWidth = 1.5; ctx.setLineDash([2, 4]);
      for (let li = 0; li < N; li++) {
        const d = dispData[vs + li], dt = new Date(d.date + 'T00:00:00');
        if (dt.getDay() === 5) { const x = toX(li); ctx.beginPath(); ctx.moveTo(x, totalTop); ctx.lineTo(x, totalBottom); ctx.stroke(); }
      }
      ctx.setLineDash([]); ctx.restore();
    }
    const lastPl = layout[layout.length - 1];
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const yBase  = lastPl.top + lastPl.height;
    const step   = Math.max(1, Math.floor(N / 9));
    ctx.textAlign = 'center';
    for (let li = 0; li < N; li += step) {
      const d = dispData[vs + li], p = d.date.split('-'), dt = new Date(d.date + 'T00:00:00'), x = toX(li);
      if (candleMode === 'M') {
        ctx.fillStyle = C.text; ctx.font = '9px Space Mono,monospace';
        ctx.fillText(MONTHS[+p[1] - 1] + " '" + p[0].slice(2), x, yBase + 13);
      } else {
        ctx.fillStyle = C.text; ctx.font = '9px Space Mono,monospace';
        ctx.fillText(p[2] + '/' + p[1] + '/' + p[0], x, yBase + 11);
        ctx.fillStyle = C.muted; ctx.font = 'bold 9px Space Mono,monospace';
        ctx.fillText(DAYS[dt.getDay()], x, yBase + 22);
      }
    }
    const mLabel = { D: 'DAILY', W: 'WEEKLY', M: 'MONTHLY' }[candleMode];
    ctx.font = '9px Space Mono,monospace'; ctx.textAlign = 'right'; ctx.fillStyle = C.muted;
    ctx.fillText(`${mLabel} \xb7 ${N} bars \xb7 ${dispData[vs].date} \u2192 ${dispData[ve - 1].date}`, W - PAD.R, lastPl.top + lastPl.height + 14);
    if (hoveredLocal >= 0 && hoveredLocal < N) {
      const x = toX(hoveredLocal);
      ctx.strokeStyle = C.crosshair; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      layout.forEach(pl => { ctx.beginPath(); ctx.moveTo(x, pl.top); ctx.lineTo(x, pl.top + pl.height); ctx.stroke(); });
      if (hoveredY >= 0) {
        const hovPl = layout.find(p => hoveredY >= p.top && hoveredY <= p.top + p.height);
        if (hovPl) { ctx.beginPath(); ctx.moveTo(PAD.L, hoveredY); ctx.lineTo(W - PAD.R, hoveredY); ctx.stroke(); }
      }
      ctx.setLineDash([]);
    }
    drawRangeTool(layout, toX, W);
    drawDividers(layout, W);
    updateDateBar();
  }

  /* ── Tooltip ─────────────────────────────────────────────────────── */
  function updateTooltip(li, mx, my) {
    const tooltip = el('tooltip');
    if (!showTooltip) { tooltip.style.display = 'none'; return; }
    if (li < 0 || !dispData.length) { tooltip.style.display = 'none'; return; }
    const gi = getVS() + li, d = dispData[gi]; if (!d) { tooltip.style.display = 'none'; return; }
    const fmt = v => v === null ? '\u2014' : Math.abs(v) >= 1000 ? v.toFixed(2) : Math.abs(v) < 0.01 ? v.toFixed(4) : v.toFixed(2);
    const vol = d.volume >= 1e6 ? (d.volume / 1e6).toFixed(1) + 'M' : (d.volume / 1e3).toFixed(0) + 'K';
    const trend = dMA50[gi] !== null && dMA200[gi] !== null
      ? `<span style="color:${dMA50[gi] > dMA200[gi] ? C.bull : C.bear}">${dMA50[gi] > dMA200[gi] ? '\u25b2 BULL' : '\u25bc BEAR'}</span>` : '\u2014';
    const sig = dSigs[gi], lr = dRSI[gi], lM = dMACD.line[gi], lS = dMACD.signal[gi], lH = dMACD.hist[gi];
    const rc = lr !== null ? (lr > 70 ? C.bear : lr < 30 ? C.bull : indColors.rsiLine) : C.muted;
    let nearSR = '';
    if (srLevels.length) {
      const near = srLevels.reduce((best, lvl) => Math.abs(lvl.price - d.close) < Math.abs(best.price - d.close) ? lvl : best);
      const pct = ((d.close - near.price) / near.price * 100).toFixed(1);
      const col = near.type === 'R' ? C.srMajR : C.srMajS;
      nearSR = `<div style="margin-top:3px;font-size:9px;color:${col}">${near.major ? '\u2605' : '\u25cb'} ${near.type === 'R' ? 'Resistance' : 'Support'} @ ${near.price >= 100 ? near.price.toFixed(2) : near.price.toFixed(3)} (${pct}%)</div>`;
    }
    tooltip.innerHTML = `
      <div style="color:var(--ts-text);font-size:9px;margin-bottom:3px">${d.date} &nbsp; ${trend}</div>
      <div style="color:${d.close >= d.open ? C.bull : C.bear};margin-bottom:2px">O <span style="color:var(--ts-white)">${fmt(d.open)}</span> H <span style="color:${C.bull}">${fmt(d.high)}</span> L <span style="color:${C.bear}">${fmt(d.low)}</span> C <span style="color:var(--ts-white);font-weight:700">${fmt(d.close)}</span></div>
      <div style="color:var(--ts-text);font-size:10px;margin-bottom:2px">Vol <span style="color:var(--ts-bright)">${vol}</span></div>
      <div style="font-size:10px;color:var(--ts-text)">${maLines.filter(m => m.visible).map(m => `<span style="color:${m.color}">${m.type}${m.period}&nbsp;${fmt(m.data[gi])}</span>`).join('&nbsp; ')}</div>
      <div style="margin-top:3px;padding-top:3px;border-top:1px solid var(--ts-border);font-size:10px;color:var(--ts-text)">
        MACD&nbsp;<span style="color:${indColors.macdLine}">${fmt(lM)}</span> Sig&nbsp;<span style="color:${indColors.signalLine}">${fmt(lS)}</span> H&nbsp;<span style="color:${lH !== null && lH >= 0 ? C.bull : C.bear}">${fmt(lH)}</span><br>
        RSI&nbsp;<span style="color:${rc};font-weight:700">${lr !== null ? lr.toFixed(1) : '\u2014'}</span>
      </div>${sig ? `<div style="margin-top:4px;padding-top:4px;border-top:1px solid var(--ts-border);color:${sig.type === 'entry' ? C.entry : C.exit}">${sig.type === 'entry' ? '\u25b2' : '\u25bc'} ${sig.reason}</div>` : ''}${nearSR}`;
    tooltip.style.display = 'block';
    const W = lw(), tw = tooltip.offsetWidth + 16, th = tooltip.offsetHeight + 16;
    tooltip.style.left = (mx + 14 + tw > W ? mx - tw : mx + 14) + 'px';
    tooltip.style.top  = (my + 10 + th > lh() ? my - th : my + 10) + 'px';
  }

  /* ── Divider hit-test ────────────────────────────────────────────── */
  function getDividerAt(y) {
    const layout = getPanelLayout();
    for (let i = 0; i < layout.length - 1; i++) {
      const divY = layout[i].top + layout[i].height + VGAP / 2;
      if (Math.abs(y - divY) <= DIV_HIT) return { idx: i, layout };
    }
    return null;
  }

  /* ── Panel overlay chips ─────────────────────────────────────────── */
  function renderPanelOverlays() {
    const wrapper = el('chart-wrapper'); if (!wrapper) return;
    wrapper.querySelectorAll('.po-chip').forEach(e => e.remove());
    const layout = getPanelLayout(); if (!layout.length) return;
    panels.filter(p => !p.visible).forEach((p, hi) => {
      const pi = panels.indexOf(p);
      const chip = document.createElement('div'); chip.className = 'po-chip';
      chip.style.top = '8px'; chip.style.right = (6 + hi * 90) + 'px'; chip.style.opacity = '0.5';
      chip.innerHTML = `<div class="po-dot" style="background:var(--ts-muted)" title="Show ${p.label}" data-pi="${pi}"></div><span class="po-name">${p.label}</span>`;
      chip.querySelector('.po-dot').addEventListener('click', () => { panels[pi].visible = true; renderPanelOverlays(); saveSettings(); drawChart(); });
      wrapper.appendChild(chip);
    });
    layout.forEach(pl => {
      const pi = panels.findIndex(p => p.id === pl.id), p = panels[pi], locked = p.id === 'price';
      const chip = document.createElement('div'); chip.className = 'po-chip';
      if (locked) chip.setAttribute('data-locked', '');
      chip.style.top = (pl.top + 6) + 'px'; chip.style.right = '6px';
      const vis = panels.filter(x => x.visible), viIdx = vis.indexOf(p);
      const canUp = viIdx > 0, canDn = viIdx < vis.length - 1;
      chip.innerHTML = `
        <div class="po-dot" title="${locked ? 'Always visible' : 'Hide ' + p.label}" data-pi="${pi}"></div>
        <span class="po-name">${p.label}</span>
        ${canUp ? `<button class="po-arr" title="Move up"   data-pi="${pi}" data-d="-1">\u2191</button>` : '<span style="width:10px"></span>'}
        ${canDn ? `<button class="po-arr" title="Move down" data-pi="${pi}" data-d="1">\u2193</button>`  : '<span style="width:10px"></span>'}`;
      if (!locked) {
        chip.querySelector('.po-dot').addEventListener('click', () => { panels[pi].visible = false; renderPanelOverlays(); saveSettings(); drawChart(); });
      }
      chip.querySelectorAll('.po-arr').forEach(arr => arr.addEventListener('click', e => {
        e.stopPropagation();
        const idx = parseInt(arr.dataset.pi), dir = parseInt(arr.dataset.d), ni = idx + dir;
        if (ni < 0 || ni >= panels.length) return;
        [panels[idx], panels[ni]] = [panels[ni], panels[idx]];
        renderPanelOverlays(); saveSettings(); drawChart();
      }));
      wrapper.appendChild(chip);
    });
  }

  /* ── MA manager ──────────────────────────────────────────────────── */
  const IND_DEFS = [
    { key: 'macdLine',   label: 'MACD LINE' },
    { key: 'signalLine', label: 'SIGNAL' },
    { key: 'histPos',    label: 'HIST +' },
    { key: 'histNeg',    label: 'HIST \u2212' },
    { key: 'rsiLine',    label: 'RSI LINE' },
  ];
  function renderIndRows() {
    const rows = el('ind-rows'); if (!rows) return;
    rows.innerHTML = '';
    IND_DEFS.forEach(({ key, label }) => {
      const row = document.createElement('div'); row.className = 'ind-row';
      row.innerHTML = `<span class="ind-label">${label}</span><label class="ind-color" style="background:${indColors[key]}" title="Pick colour"><input type="color" value="${indColors[key].slice(0, 7)}" data-key="${key}"></label>`;
      rows.appendChild(row);
    });
    rows.querySelectorAll('input[type=color]').forEach(inp => inp.addEventListener('input', () => {
      indColors[inp.dataset.key] = inp.value;
      inp.parentElement.style.background = inp.value;
      saveSettings(); drawChart();
    }));
  }
  function renderMaPanel() {
    const rows = el('ma-rows'); if (!rows) return;
    rows.innerHTML = '';
    maLines.forEach((m, mi) => {
      const row = document.createElement('div'); row.className = 'ma-row';
      row.innerHTML = `
        <label class="ma-color" style="background:${m.color}" title="Pick colour"><input type="color" value="${m.color}" data-mi="${mi}"></label>
        <button class="ma-type${m.type === 'EMA' ? ' ema' : ''}" data-mi="${mi}">${m.type}</button>
        <input class="ma-period" type="number" value="${m.period}" min="1" max="500" data-mi="${mi}">
        <button class="ma-eye${m.visible ? '' : ' hidden'}" data-mi="${mi}" title="Toggle">${m.visible ? '\ud83d\udc41' : '\u25cb'}</button>
        <button class="ma-del" data-mi="${mi}" title="Remove">\u2715</button>`;
      rows.appendChild(row);
    });
    rows.querySelectorAll('input[type=color]').forEach(inp => inp.addEventListener('input', () => {
      const mi = parseInt(inp.dataset.mi); maLines[mi].color = inp.value;
      inp.parentElement.style.background = inp.value;
      saveSettings(); updateLegendMas(); drawChart();
    }));
    rows.querySelectorAll('.ma-type').forEach(btn => btn.addEventListener('click', () => {
      const mi = parseInt(btn.dataset.mi); maLines[mi].type = maLines[mi].type === 'EMA' ? 'MA' : 'EMA';
      btn.textContent = maLines[mi].type; btn.classList.toggle('ema', maLines[mi].type === 'EMA');
      recalcIndicators(); saveSettings(); updateLegendMas(); drawChart();
    }));
    rows.querySelectorAll('.ma-period').forEach(inp => inp.addEventListener('change', () => {
      const mi = parseInt(inp.dataset.mi), p = Math.max(1, Math.min(500, parseInt(inp.value) || 1));
      inp.value = p; maLines[mi].period = p;
      recalcIndicators(); saveSettings(); updateLegendMas(); drawChart();
    }));
    rows.querySelectorAll('.ma-eye').forEach(btn => btn.addEventListener('click', () => {
      const mi = parseInt(btn.dataset.mi); maLines[mi].visible = !maLines[mi].visible;
      btn.textContent = maLines[mi].visible ? '\ud83d\udc41' : '\u25cb';
      btn.classList.toggle('hidden', !maLines[mi].visible);
      saveSettings(); updateLegendMas(); drawChart();
    }));
    rows.querySelectorAll('.ma-del').forEach(btn => btn.addEventListener('click', () => {
      const mi = parseInt(btn.dataset.mi); maLines.splice(mi, 1);
      recalcIndicators(); saveSettings(); renderMaPanel(); updateLegendMas(); drawChart();
    }));
    renderIndRows();
  }
  function updateLegendMas() {
    const legendMas = el('legend-mas'); if (!legendMas) return;
    legendMas.innerHTML = maLines.filter(m => m.visible).map(m =>
      `<div class="li"><div class="li-line" style="background:${m.color}"></div>${m.type}${m.period}</div>`
    ).join('');
  }

  /* ── Date bar ────────────────────────────────────────────────────── */
  const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function fmtDate(isoDate) {
    const p = isoDate.split('-'); const dt = new Date(isoDate + 'T00:00:00');
    return p[2] + '/' + p[1] + '/' + p[0] + ' ' + DAYS_FULL[dt.getDay()];
  }
  function updateDateBar() {
    if (!dispData.length) return;
    const vs = getVS(), ve = getVE();
    const from = el('date-from'), to = el('date-to'), mode = el('date-mode');
    if (from) from.textContent = fmtDate(dispData[vs].date);
    if (to)   to.textContent   = fmtDate(dispData[ve - 1].date);
    if (mode) mode.textContent = { D: 'DAILY', W: 'WEEKLY', M: 'MONTHLY' }[candleMode] + ' \xb7 ' + (ve - vs) + ' bars';
  }
  function updateHoveredDate(li) {
    const hovered = el('date-hovered'); if (!hovered) return;
    if (li < 0 || !dispData.length) { hovered.textContent = ''; return; }
    const gi = getVS() + li, d = dispData[gi]; if (!d) { hovered.textContent = ''; return; }
    const sig = dSigs[gi];
    const sigStr = sig ? (sig.type === 'entry' ? ' \u25b2 ' : ' \u25bc ') + sig.reason : '';
    hovered.textContent = fmtDate(d.date) + sigStr;
    hovered.style.color = sig ? (sig.type === 'entry' ? 'var(--ts-entry)' : 'var(--ts-exit)') : 'var(--ts-bright)';
  }

  /* ── Load ticker ─────────────────────────────────────────────────── */
  async function loadTicker() {
    if (!el('ticker-input')) return;
    const ticker = el('ticker-input').value.trim().toUpperCase(); if (!ticker) return;
    const apiKey = FmpService.getApiKey();
    if (!apiKey) {
      el('status-msg').textContent = '\u26a0 Set your FMP API key in Settings';
      return;
    }
    const loadBtn = el('load-btn'), statusMsg = el('status-msg'), loader = el('loader'), emptyState = el('empty-state');
    loadBtn.disabled = true; loader.style.display = 'flex'; emptyState.style.display = 'none';
    statusMsg.textContent = 'Fetching\u2026';
    el('price-val').textContent = ''; el('price-chg').textContent = '';
    el('trend-badge').style.display = 'none';
    hoveredLocal = -1; hoveredY = -1;
    try {
      const toDate = new Date(), fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 2200);
      const data = await FmpService.fetchHistoricalEOD(ticker, fromDate.toISOString().slice(0, 10), toDate.toISOString().slice(0, 10));
      const raw = Array.isArray(data) ? data : (data.historical || []);
      if (raw.length < 10) throw new Error(`No data for "${ticker}"`);
      rawData = raw.slice()
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
        .map(d => ({
          date: d.date, open: +d.open, high: +d.high, low: +d.low, close: +d.close, volume: +d.volume
        }));
      // Reset candle mode to D on new ticker load
      candleMode = 'D';
      qa('.cbtn').forEach(b => b.classList.remove('active'));
      const dBtn = qs('.cbtn[data-m="D"]'); if (dBtn) dBtn.classList.add('active');
      buildDisplayData(); recalcIndicators(); applyPeriod(true);
      const last = dispData[dispData.length - 1], prev = dispData[dispData.length - 2] || last;
      const chg = last.close - prev.close, chgP = chg / prev.close * 100;
      el('price-val').textContent = '$' + last.close.toFixed(2);
      const chgEl = el('price-chg');
      chgEl.textContent = `${chg >= 0 ? '+' : ''}${chg.toFixed(2)} (${chgP.toFixed(2)}%)`;
      chgEl.style.color = chg >= 0 ? C.bull : C.bear;
      const m50 = dMA50[dispData.length - 1], m200 = dMA200[dispData.length - 1];
      const badge = el('trend-badge'); badge.style.display = 'block';
      if (m50 !== null && m200 !== null) { badge.className = m50 > m200 ? 'bull' : 'bear'; badge.textContent = m50 > m200 ? '\u25b2 BULL TREND' : '\u25bc BEAR TREND'; }
      const srMaj = srLevels.filter(l => l.major).length, srMin = srLevels.filter(l => !l.major).length;
      statusMsg.textContent = `${ticker} \xb7 ${rawData.length} bars \xb7 ${dSigs.filter(Boolean).length} signals \xb7 ${srMaj} major S/R \xb7 ${srMin} minor S/R`;
      buildPanelControls(); updateLegendMas(); saveSettings(); resizeCanvas(drawChart);
    } catch (err) {
      statusMsg.textContent = '\u26a0 ' + err.message;
      emptyState.style.display = 'flex';
      emptyState.innerHTML = `<div class="ei">\u26a0</div><div class="em">${err.message}</div><div class="es">Check ticker or connectivity</div>`;
    } finally {
      loadBtn.disabled = false; loader.style.display = 'none';
    }
  }

  /* ── Settings ────────────────────────────────────────────────────── */
  function saveSettings() {
    try {
      const data = {
        maLines:    maLines.map(m => ({ id: m.id, type: m.type, period: m.period, color: m.color, visible: m.visible })),
        maNextId,
        panels:     panels.map(p => ({ id: p.id, label: p.label, ratio: p.ratio, visible: p.visible })),
        lastTicker: el('ticker-input') ? el('ticker-input').value.trim().toUpperCase() || '' : '',
        periodDays, candleMode, showSR, showTrend, showTooltip,
        indColors: { ...indColors },
      };
      storage.setItem(SETTINGS_KEY, JSON.stringify(data));
    } catch (e) { /* storage full or unavailable */ }
  }
  function loadSettings() {
    try {
      const raw = storage.getItem(SETTINGS_KEY); if (!raw) return;
      const s = JSON.parse(raw);
      if (Array.isArray(s.maLines) && s.maLines.length) { maLines = s.maLines.map(m => ({ ...m, data: [] })); if (s.maNextId) maNextId = s.maNextId; }
      if (Array.isArray(s.panels) && s.panels.length) {
        const ordered = [];
        s.panels.forEach(sp => { const found = panels.find(p => p.id === sp.id); if (found) { found.ratio = sp.ratio; found.visible = sp.visible; ordered.push(found); } });
        panels.forEach(p => { if (!ordered.find(o => o.id === p.id)) ordered.push(p); });
        panels = ordered;
      }
      if (s.lastTicker && el('ticker-input')) el('ticker-input').value = s.lastTicker;
      if (s.periodDays) {
        periodDays = s.periodDays;
        qa('.pbtn').forEach(b => b.classList.remove('active'));
        const pb = qs(`.pbtn[data-p="${periodDays}"]`); if (pb) pb.classList.add('active');
      }
      if (s.candleMode) {
        candleMode = s.candleMode;
        qa('.cbtn').forEach(b => b.classList.remove('active'));
        const cb = qs(`.cbtn[data-m="${candleMode}"]`); if (cb) cb.classList.add('active');
      }
      if (s.showSR !== undefined)      { showSR = s.showSR;           const b = el('btn-sr');      if (b) b.classList.toggle('active', showSR); }
      if (s.showTrend !== undefined)    { showTrend = s.showTrend;     const b = el('btn-trend');   if (b) b.classList.toggle('active', showTrend); }
      if (s.showTooltip !== undefined)  { showTooltip = s.showTooltip; const b = el('btn-tooltip'); if (b) b.classList.toggle('active', showTooltip); }
      if (s.indColors) Object.assign(indColors, s.indColors);
    } catch (e) { /* corrupted storage — use defaults */ }
  }

  function buildPanelControls() { renderPanelOverlays(); }
  function isTabActive() { return document.getElementById('trend-scanner')?.classList.contains('active'); }

  /* ── init ────────────────────────────────────────────────────────── */
  function init() {
    const tab = document.getElementById('trend-scanner');
    if (!tab) return;

    /* Inject HTML */
    tab.innerHTML = `
<div id="ts-app">
  <div id="ts-toolbar">
    <input id="ts-ticker-input" type="text" value="AAPL" placeholder="TICKER" maxlength="8" spellcheck="false">
    <button id="ts-load-btn">ANALYSE</button>
    <div class="ts-vdiv"></div>
    <div class="ts-btn-group">
      <button class="pbtn" data-p="21">1M</button>
      <button class="pbtn" data-p="63">3M</button>
      <button class="pbtn" data-p="126">6M</button>
      <button class="pbtn active" data-p="252">1Y</button>
      <button class="pbtn" data-p="504">2Y</button>
      <button class="pbtn" data-p="756">3Y</button>
      <button class="pbtn" data-p="1260">5Y</button>
    </div>
    <div class="ts-vdiv"></div>
    <div class="ts-btn-group">
      <button class="cbtn active" data-m="D">D</button>
      <button class="cbtn" data-m="W">W</button>
      <button class="cbtn" data-m="M">M</button>
    </div>
    <div class="ts-vdiv"></div>
    <div class="ts-btn-group">
      <button class="zbtn" id="ts-zoom-in">+</button>
      <button class="zbtn" id="ts-zoom-out">\u2212</button>
      <button class="zbtn" id="ts-zoom-reset">\u229f</button>
    </div>
    <div class="ts-vdiv"></div>
    <div class="ts-btn-group">
      <button class="dbtn" id="ts-btn-ma" title="MA/EMA manager">MA</button>
      <button class="dbtn active" id="ts-btn-sr" title="Support &amp; Resistance levels">S/R</button>
      <button class="dbtn active" id="ts-btn-trend" title="Trend lines">TREND</button>
      <button class="dbtn active" id="ts-btn-tooltip" title="Toggle tooltip (T)">INFO</button>
      <button class="dbtn" id="ts-btn-range" title="Range tool (R)">RANGE</button>
      <button class="dbtn" id="ts-btn-range-clear" title="Clear range (Esc)">&#10005;</button>
    </div>
    <div class="ts-vdiv"></div>
    <div id="ts-trend-badge"></div>
    <span id="ts-status-msg">Enter a ticker and press ANALYSE</span>
    <div id="ts-price-box">
      <span id="ts-price-val"></span>
      <span id="ts-price-chg"></span>
    </div>
  </div>

  <div id="ts-chart-wrapper">
    <canvas id="ts-canvas"></canvas>
    <div id="ts-legend">
      <span id="ts-legend-mas" style="display:contents"></span>
      <div class="li-sep"></div>
      <div class="li"><div class="li-tri-up"></div>ENTRY</div>
      <div class="li"><div class="li-tri-dn"></div>EXIT</div>
      <div class="li-sep"></div>
      <div class="li"><div class="li-line" style="background:var(--ts-sr-maj-r);height:1.5px"></div>MAJ-R</div>
      <div class="li"><div class="li-line" style="background:var(--ts-sr-maj-s);height:1.5px"></div>MAJ-S</div>
      <div class="li"><div class="li-line" style="border-top:1px dashed var(--ts-sr-maj-r);height:0;opacity:.55"></div>MIN-R</div>
      <div class="li"><div class="li-line" style="border-top:1px dashed var(--ts-sr-maj-s);height:0;opacity:.55"></div>MIN-S</div>
      <div class="li-sep"></div>
      <div class="li"><div class="li-line" style="background:var(--ts-entry)"></div>UP TL</div>
      <div class="li"><div class="li-line" style="background:#ff8c00"></div>DN TL</div>
    </div>
    <div id="ts-ma-panel">
      <div id="ts-ma-panel-title">MA / EMA LINES <button id="ts-ma-panel-close">&#10005;</button></div>
      <div id="ts-ma-rows"></div>
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--ts-border)">
        <div style="font-size:9px;color:var(--ts-muted);letter-spacing:.08em;margin-bottom:8px">INDICATOR COLOURS</div>
        <div id="ts-ind-rows"></div>
      </div>
      <div class="ma-add-row">
        <input id="ts-ma-add-period" type="number" value="21" min="1" max="500">
        <button id="ts-ma-add-type" data-t="MA">MA</button>
        <button id="ts-ma-add-btn">+ ADD</button>
      </div>
    </div>
    <div id="ts-tooltip"></div>
    <div id="ts-empty-state">
      <div class="ei">\u25c8</div>
      <div class="em">Enter a ticker symbol and press ANALYSE</div>
      <div class="es">EMA9 \xb7 MA20 \xb7 MA50 \xb7 MA100 \xb7 MA200 \xb7 MACD \xb7 RSI \xb7 S/R \xb7 Trend</div>
    </div>
    <div id="ts-loader"><div class="ts-spin"></div></div>
  </div>

  <div id="ts-date-bar">
    <span id="ts-date-mode"></span>
    <div id="ts-date-range-wrap">
      <span id="ts-date-from">\u2014</span>
      <span id="ts-date-sep">\u2192</span>
      <span id="ts-date-to">\u2014</span>
    </div>
    <div id="ts-date-hovered-wrap">
      <span id="ts-date-hovered"></span>
    </div>
  </div>
</div>`;

    /* Wire DOM refs */
    tsApp  = document.getElementById('ts-app');
    canvas = el('canvas');
    ctx    = canvas.getContext('2d');
    C = getC();

    /* Restore settings */
    loadSettings();
    buildPanelControls();
    updateLegendMas();
    resizeCanvas();

    /* ── Toolbar events ── */
    el('load-btn').addEventListener('click', loadTicker);
    el('ticker-input').addEventListener('keydown', e => { if (e.key === 'Enter') loadTicker(); });

    qa('.pbtn').forEach(btn => btn.addEventListener('click', () => {
      qa('.pbtn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active'); periodDays = parseInt(btn.dataset.p); applyPeriod(true); saveSettings(); drawChart();
    }));
    qa('.cbtn').forEach(btn => btn.addEventListener('click', () => {
      if (!rawData.length) return;
      qa('.cbtn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active'); candleMode = btn.dataset.m;
      buildDisplayData(); recalcIndicators(); applyPeriod(true); saveSettings(); drawChart();
    }));

    el('zoom-in').addEventListener('click',    () => zoom(1 / 1.35, 1.0));
    el('zoom-out').addEventListener('click',   () => zoom(1.35, 1.0));
    el('zoom-reset').addEventListener('click', () => { applyPeriod(true); drawChart(); });

    el('btn-sr').addEventListener('click', function () { showSR = !showSR; this.classList.toggle('active', showSR); saveSettings(); drawChart(); });
    el('btn-trend').addEventListener('click', function () { showTrend = !showTrend; this.classList.toggle('active', showTrend); saveSettings(); drawChart(); });
    el('btn-tooltip').addEventListener('click', function () {
      showTooltip = !showTooltip; this.classList.toggle('active', showTooltip);
      if (!showTooltip) el('tooltip').style.display = 'none';
      saveSettings();
    });
    el('btn-range').addEventListener('click', function () {
      rangeMode = !rangeMode; this.classList.toggle('active', rangeMode);
      if (!rangeMode) { rangeStep = 0; rangeP1 = null; rangeP2 = null; rangeDraft = null; el('btn-range-clear').classList.remove('visible'); }
      drawChart();
    });
    el('btn-range-clear').addEventListener('click', () => {
      rangeStep = 0; rangeP1 = null; rangeP2 = null; rangeDraft = null;
      el('btn-range-clear').classList.remove('visible'); drawChart();
    });

    /* MA panel */
    el('btn-ma').addEventListener('click', function () {
      const panel = el('ma-panel');
      const rect = this.getBoundingClientRect();
      const wrapper = el('chart-wrapper').getBoundingClientRect();
      panel.style.top = '8px';
      panel.style.left = Math.max(4, rect.left - wrapper.left) + 'px';
      panel.classList.toggle('open');
      if (panel.classList.contains('open')) renderMaPanel();
    });
    el('ma-panel-close').addEventListener('click', () => el('ma-panel').classList.remove('open'));
    const addTypeBtn = el('ma-add-type');
    addTypeBtn.addEventListener('click', () => {
      const next = addTypeBtn.dataset.t === 'MA' ? 'EMA' : 'MA';
      addTypeBtn.dataset.t = next; addTypeBtn.textContent = next;
    });
    el('ma-add-btn').addEventListener('click', () => {
      const p = Math.max(1, Math.min(500, parseInt(el('ma-add-period').value) || 21));
      const t = el('ma-add-type').dataset.t;
      const palette = ['#00e5ff','#ff6b6b','#a8ff78','#ff9f43','#54a0ff','#5f27cd','#ff9ff3','#ffeaa7'];
      const used = new Set(maLines.map(m => m.color));
      const col = palette.find(c => !used.has(c)) || '#ffffff';
      maLines.push({ id: maNextId++, type: t, period: p, color: col, visible: true, data: [] });
      recalcIndicators(); saveSettings(); renderMaPanel(); updateLegendMas(); drawChart();
    });

    /* ── Canvas mouse events ── */
    canvas.addEventListener('wheel', e => {
      e.preventDefault(); if (!dispData.length) return;
      const rect = canvas.getBoundingClientRect();
      const pf = Math.max(0, Math.min(1, (e.clientX - rect.left - PAD.L - CPAD) / (lw() - PAD.L - PAD.R - CPAD * 2)));
      zoom(e.deltaY > 0 ? 1.18 : 1 / 1.18, pf);
    }, { passive: false });

    canvas.addEventListener('mousedown', e => {
      if (!dispData.length) return;
      const rect = canvas.getBoundingClientRect(), my = e.clientY - rect.top;
      dragStartX = e.clientX;
      const hit = getDividerAt(my);
      if (hit) {
        dragMode = 'divider'; dragDivIdx = hit.idx; dragStartY = e.clientY;
        const vis = getVisPanels(); dragDivRatios = vis.map(p => p.ratio);
        dragDivTotalPx = lh() - PAD.T - PAD.B - (vis.length - 1) * VGAP;
      } else { dragMode = 'pan'; dragStartX = e.clientX; dragStartVE = getVE(); canvas.style.cursor = 'grabbing'; }
    });

    canvas.addEventListener('mouseleave', () => {
      if (!dragMode) { hoveredLocal = -1; hoveredY = -1; el('tooltip').style.display = 'none'; updateHoveredDate(-1); drawChart(); }
    });

    /* ── Window-level mouse events (needed for drag outside canvas) ── */
    window.addEventListener('mousemove', e => {
      if (!canvas) return;
      if (!isTabActive()) return;
      const rect = canvas.getBoundingClientRect(), mx = e.clientX - rect.left, my = e.clientY - rect.top;
      if (dragMode === 'divider') {
        const deltaY = e.clientY - dragStartY, vis = getVisPanels();
        if (dragDivIdx < 0 || dragDivIdx >= vis.length - 1) return;
        const sumR = dragDivRatios.reduce((s, r) => s + r, 0), rPerPx = sumR / dragDivTotalPx;
        const dr = deltaY * rPerPx, nA = dragDivRatios[dragDivIdx] + dr, nB = dragDivRatios[dragDivIdx + 1] - dr;
        const minR = MIN_PANEL_H * rPerPx; if (nA < minR || nB < minR) return;
        vis[dragDivIdx].ratio = nA; vis[dragDivIdx + 1].ratio = nB; renderPanelOverlays(); drawChart(); return;
      }
      if (dragMode === 'pan') {
        const bW = (lw() - PAD.L - PAD.R - CPAD * 2) / barsVisible;
        const delta = Math.round((e.clientX - dragStartX) / bW);
        viewEnd = Math.min(Math.max(dragStartVE - delta, barsVisible), dispData.length);
        hoveredLocal = -1; hoveredY = -1; el('tooltip').style.display = 'none'; updateDateBar(); drawChart(); return;
      }
      if (mx < PAD.L || mx > lw() - PAD.R) { hoveredLocal = -1; hoveredY = -1; el('tooltip').style.display = 'none'; drawChart(); return; }
      const hit = getDividerAt(my); canvas.style.cursor = hit ? 'ns-resize' : 'crosshair';
      const N = getN(), bW = (lw() - PAD.L - PAD.R - CPAD * 2) / N;
      const li = Math.floor((mx - PAD.L - CPAD) / bW);
      if (li >= 0 && li < N) {
        hoveredLocal = li; hoveredY = my; updateTooltip(li, mx, my); updateHoveredDate(li);
        if (rangeMode && rangeStep === 1 && _pricePanel) { rangeDraft = canvasToRangePoint(mx, my); drawChart(); return; }
      } else { hoveredLocal = -1; hoveredY = -1; el('tooltip').style.display = 'none'; updateHoveredDate(-1); }
      drawChart();
    });

    window.addEventListener('mouseup', e => {
      if (!canvas) return;
      if (dragMode === 'divider') saveSettings();
      const wasPan = dragMode === 'pan';
      const moved = Math.abs(e.clientX - dragStartX) > 4;
      dragMode = ''; dragDivIdx = -1; canvas.style.cursor = 'crosshair';
      if (rangeMode && wasPan && !moved && _pricePanel) {
        const rect = canvas.getBoundingClientRect();
        const pt = canvasToRangePoint(e.clientX - rect.left, e.clientY - rect.top);
        if (pt) {
          if (rangeStep === 0 || rangeStep === 2) { rangeP1 = pt; rangeP2 = null; rangeDraft = null; rangeStep = 1; }
          else if (rangeStep === 1) { rangeP2 = pt; rangeDraft = null; rangeStep = 2; el('btn-range-clear').classList.add('visible'); }
          drawChart();
        }
      }
    });

    /* ── Keyboard shortcuts ── */
    document.addEventListener('keydown', e => {
      if (!isTabActive()) return;
      if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
      if ((e.key === 'Escape' || e.key === 'Delete') && rangeP1) {
        rangeStep = 0; rangeP1 = null; rangeP2 = null; rangeDraft = null;
        el('btn-range-clear').classList.remove('visible'); drawChart();
      }
      if (e.key === 'r' || e.key === 'R') el('btn-range').click();
      if (e.key === 't' || e.key === 'T') el('btn-tooltip').click();
    });

    /* ── Tab activation: strip .content padding, resize + redraw ── */
    const contentEl = document.querySelector('.content');
    function enterFullscreen() { if (contentEl) contentEl.style.cssText = 'padding:0;overflow:hidden'; }
    function exitFullscreen()  { if (contentEl) contentEl.style.cssText = ''; }
    document.querySelector('[data-tab="trend-scanner"]')?.addEventListener('click', () => {
      enterFullscreen();
      setTimeout(() => { resizeCanvas(() => { renderPanelOverlays(); if (dispData.length) drawChart(); }); }, 60);
    });
    document.querySelectorAll('.nav-tab:not([data-tab="trend-scanner"])').forEach(btn =>
      btn.addEventListener('click', exitFullscreen)
    );

    /* ── Window resize (only when tab is visible) ── */
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!isTabActive()) return;
        resizeCanvas(() => { renderPanelOverlays(); if (dispData.length) drawChart(); });
      }, 80);
    });

    /* ── Theme change ── */
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      C = getC(); if (dispData.length && isTabActive()) drawChart();
    });
    document.addEventListener('themeChanged', () => {
      C = getC(); if (dispData.length && isTabActive()) drawChart();
    });

    /* ── Auto-load last ticker if API key is available ── */
    const savedTicker = el('ticker-input').value;
    if (savedTicker && FmpService.getApiKey()) {
      loadTicker();
    }

    /* ── If trend scanner is the landing tab, apply fullscreen immediately ── */
    if (isTabActive()) enterFullscreen();
  }

  return { init };
})();
