// Market Status Indicator
const MarketStatus = (function() {
    // Uses Polygon.io to check current US market status
    const API_KEY = 'hQmiS4FP5wJQrg8rX3gTMane2digQcLF';
    const ledEl = document.getElementById('market-led');
    const sessionEl = document.getElementById('market-session');
    const earlyLedEl = document.getElementById('early-led');
    const earlySessionEl = document.getElementById('early-session');
    const afterLedEl = document.getElementById('after-led');
    const afterSessionEl = document.getElementById('after-session');
    let timer = null;

    async function update() {
        if (!ledEl) return;
        try {
            const url = `https://api.polygon.io/v1/marketstatus/now?apiKey=${API_KEY}`;
            const res = await fetch(url);
            const data = await res.json();
            const isOpen = data && data.market === 'open';
            const earlyOpen = data && data.earlyHours === true;
            const afterOpen = data && data.afterHours === true;
            ledEl.classList.toggle('led-green', isOpen);
            ledEl.classList.toggle('led-red', !isOpen);
            if (earlyLedEl) {
                earlyLedEl.classList.toggle('led-green', earlyOpen);
                earlyLedEl.classList.toggle('led-red', !earlyOpen);
            }
            if (afterLedEl) {
                afterLedEl.classList.toggle('led-green', afterOpen);
                afterLedEl.classList.toggle('led-red', !afterOpen);
            }
            if (sessionEl) {
                if (data && data.market) {
                    sessionEl.textContent = data.market;
                    sessionEl.style.display = 'inline';
                } else {
                    sessionEl.textContent = '';
                    sessionEl.style.display = 'none';
                }
            }
            if (earlySessionEl) {
                earlySessionEl.textContent = earlyOpen ? 'open' : 'closed';
            }
            if (afterSessionEl) {
                afterSessionEl.textContent = afterOpen ? 'open' : 'closed';
            }
        } catch (e) {
            // ignore errors
        }
    }

    function start() {
        update();
        timer = setInterval(update, 300000); // 5 minutes
    }

    function init() {
        start();
    }

    return { init };
})();
