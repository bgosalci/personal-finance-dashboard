const ColorService = (function() {
    const LS_KEY = 'pf_color_map_v1';
    const PALETTE = ['#4e79a7','#f28e2b','#e15759','#76b7b2','#59a14f','#edc948','#b07aa1','#ff9da7','#9c755f','#bab0ab'];
    function loadMap() {
        try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch (e) { return {}; }
    }
    function saveMap(map) {
        try { localStorage.setItem(LS_KEY, JSON.stringify(map)); } catch (e) {}
    }
    function hsl(i) {
        const hue = (i * 47) % 360;
        return 'hsl(' + hue + ' 70% 50%)';
    }
    let map = loadMap();
    function getColorForKey(key) {
        if (!key) return '#999';
        if (map[key]) return map[key];
        const index = Object.keys(map).length;
        const color = index < PALETTE.length ? PALETTE[index] : hsl(index);
        map[key] = color;
        saveMap(map);
        return color;
    }
    function reset() {
        map = {};
        saveMap(map);
    }
    return { getColorForKey, reset };
})();
