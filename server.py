import os
import time
import threading
import yfinance as yf
from flask import Flask, jsonify, request, send_from_directory

APP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')

app = Flask(__name__, static_folder=None)

# In-memory cache for options data (keyed by (symbol, expiry))
_cache = {}
_cache_lock = threading.Lock()
CACHE_TTL = 300  # 5 minutes

# In-flight sentinels: while a fetch is in progress for a key, other
# threads wait on the Event rather than issuing a duplicate yfinance call.
_in_flight = {}  # cache_key -> threading.Event


def _fetch_options(symbol, requested_expiry):
    """Fetch options data from yfinance with up to 3 retries on rate-limit errors."""
    last_err = None
    for wait in [0, 1, 2]:
        if wait:
            time.sleep(wait)
        try:
            ticker = yf.Ticker(symbol)

            # Last closing price
            hist = ticker.history(period='5d')
            if hist.empty:
                raise LookupError('Ticker not found or no price data available')
            price = round(float(hist['Close'].iloc[-1]), 2)

            # Available expirations
            expirations = list(ticker.options)
            if not expirations:
                raise LookupError('No options available for this ticker')

            expiry = requested_expiry if requested_expiry in expirations else expirations[0]

            # Options chain
            chain = ticker.option_chain(expiry)
            calls = chain.calls.reset_index(drop=True)
            puts  = chain.puts.reset_index(drop=True)

            if calls.empty or puts.empty:
                raise LookupError('Empty options chain for this expiry')

            # ATM strike — closest to current price
            atm_idx    = (calls['strike'] - price).abs().idxmin()
            atm_strike = float(calls.loc[atm_idx, 'strike'])

            call_row = calls[calls['strike'] == atm_strike].iloc[0]
            put_row  = puts[puts['strike'] == atm_strike].iloc[0]

            def mid(row):
                bid = float(row.get('bid', 0) or 0)
                ask = float(row.get('ask', 0) or 0)
                if bid > 0 and ask > 0:
                    return round((bid + ask) / 2, 2)
                return round(float(row.get('lastPrice', 0) or 0), 2)

            currency = (ticker.info or {}).get('currency', 'USD') or 'USD'

            # Full chain: sorted list of {strike, call, put} for all strikes
            all_strikes = sorted(set(calls['strike'].tolist()) | set(puts['strike'].tolist()))
            chain_data = []
            for s in all_strikes:
                c_rows = calls[calls['strike'] == s]
                p_rows = puts[puts['strike'] == s]
                chain_data.append({
                    'strike': float(s),
                    'call':   mid(c_rows.iloc[0]) if not c_rows.empty else None,
                    'put':    mid(p_rows.iloc[0]) if not p_rows.empty else None,
                })

            return {
                'price':       price,
                'strike':      atm_strike,
                'call':        mid(call_row),
                'put':         mid(put_row),
                'expiry':      expiry,
                'expirations': expirations,
                'currency':    currency,
                'chain':       chain_data,
            }
        except LookupError:
            raise
        except Exception as e:
            last_err = e
    raise last_err


_quote_cache = {}
_quote_cache_lock = threading.Lock()
_quote_in_flight = {}  # symbol -> threading.Event (same sentinel pattern as /api/options)
QUOTE_CACHE_TTL = 60  # 1 minute


@app.route('/api/quote')
def quote():
    # Issue #4 fix: normalise case so VUSA.L and vusa.l share the same cache slot
    symbol = request.args.get('ticker', '').strip().upper()
    if not symbol:
        return jsonify({'error': 'ticker parameter is required'}), 400

    # Issue #2 fix: in-flight sentinel prevents duplicate concurrent yfinance calls
    while True:
        with _quote_cache_lock:
            cached = _quote_cache.get(symbol)
            if cached and time.time() - cached['ts'] < QUOTE_CACHE_TTL:
                return jsonify(cached['data'])

            # Another thread is already fetching — wait for it
            if symbol in _quote_in_flight:
                event = _quote_in_flight[symbol]
            else:
                event = threading.Event()
                _quote_in_flight[symbol] = event
                break  # we are the designated fetcher

        event.wait(timeout=30)

    # Only one thread reaches here per symbol at a time
    try:
        t = yf.Ticker(symbol)
        hist = t.history(period='5d', interval='1d')
        if hist.empty:
            return jsonify({'error': 'No data found for ticker'}), 422

        row = hist.iloc[-1]

        # Issue #3 fix: fall back to reading currency from history metadata if
        # fast_info raises, so GBp tickers are never silently mis-divided
        currency = ''
        try:
            currency = t.fast_info.currency or ''
        except Exception:
            pass
        if not currency:
            try:
                currency = (t.info or {}).get('currency', '') or ''
            except Exception:
                pass
        divisor = 100 if currency == 'GBp' else 1

        c = round(float(row['Close']) / divisor, 4)
        h = round(float(row['High']) / divisor, 4)
        l = round(float(row['Low']) / divisor, 4)
        o = round(float(row['Open']) / divisor, 4)
        pc = round(float(hist.iloc[-2]['Close']) / divisor, 4) if len(hist) >= 2 else 0
        d = round(c - pc, 4)
        dp = round((d / pc) * 100, 4) if pc else 0

        data = {
            'c': c, 'h': h, 'l': l, 'o': o,
            'pc': pc, 'd': d, 'dp': dp,
            't': int(row.name.timestamp()),
        }
        with _quote_cache_lock:
            _quote_cache[symbol] = {'data': data, 'ts': time.time()}
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        with _quote_cache_lock:
            _quote_in_flight.pop(symbol, None)
        event.set()


@app.route('/api/options')
def options():
    symbol = request.args.get('ticker', '').strip().upper()
    if not symbol:
        return jsonify({'error': 'ticker parameter is required'}), 400

    requested_expiry = request.args.get('expiry', '').strip()
    cache_key = (symbol, requested_expiry)

    while True:
        with _cache_lock:
            # Cache hit — serve immediately
            if cache_key in _cache:
                result, ts = _cache[cache_key]
                if time.time() - ts < CACHE_TTL:
                    return jsonify(result)

            # Another thread is already fetching this key — wait for it
            if cache_key in _in_flight:
                event = _in_flight[cache_key]
            else:
                # We are the designated fetcher; register the sentinel
                event = threading.Event()
                _in_flight[cache_key] = event
                break  # exit the loop and proceed to fetch

        # Wait for the in-flight request to finish, then retry the cache
        event.wait(timeout=30)

    # Only one thread reaches here per cache_key at a time
    try:
        result = _fetch_options(symbol, requested_expiry)
        with _cache_lock:
            _cache[cache_key] = (result, time.time())
        return jsonify(result)

    except LookupError as e:
        return jsonify({'error': str(e)}), 422
    except Exception as e:
        msg = str(e)
        if 'rate' in msg.lower() or 'too many' in msg.lower() or '429' in msg:
            return jsonify({'error': 'Yahoo Finance rate limit reached — please wait a minute and try again'}), 429
        return jsonify({'error': msg}), 500
    finally:
        # Always clear the sentinel so waiting threads can retry the cache
        with _cache_lock:
            _in_flight.pop(cache_key, None)
        event.set()


PRICE_CACHE_TTL = 60  # seconds — matches frontend update interval


@app.route('/api/price')
def price():
    raw = request.args.get('tickers', '').strip()
    if not raw:
        return jsonify({'error': 'tickers parameter is required'}), 400

    symbols = [s.strip() for s in raw.split(',') if s.strip()]
    result = {}
    errors = {}

    def _r(v): return round(float(v), 4)

    for symbol in symbols:
        cache_key = ('price', symbol)

        while True:
            with _cache_lock:
                if cache_key in _cache:
                    val, ts = _cache[cache_key]
                    if time.time() - ts < PRICE_CACHE_TTL:
                        result[symbol] = val
                        break
                if cache_key in _in_flight:
                    event = _in_flight[cache_key]
                else:
                    event = threading.Event()
                    _in_flight[cache_key] = event
                    break
            event.wait(timeout=30)

        if symbol in result:
            continue

        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period='5d')
            if hist.empty:
                errors[symbol] = 'No data'
                continue
            quote = {
                'c':  _r(hist['Close'].iloc[-1]),
                'h':  _r(hist['High'].iloc[-1]),
                'l':  _r(hist['Low'].iloc[-1]),
                'o':  _r(hist['Open'].iloc[-1]),
                'pc': _r(hist['Close'].iloc[-2]) if len(hist) >= 2 else _r(hist['Close'].iloc[-1]),
            }
            try:
                quote['currency'] = ticker.fast_info.currency or 'USD'
            except Exception:
                quote['currency'] = 'USD'
            if quote.get('currency') in ('GBp', 'GBX'):
                for field in ('c', 'h', 'l', 'o', 'pc'):
                    if field in quote:
                        quote[field] = _r(quote[field] / 100)
                quote['currency'] = 'GBP'
            d = _r(quote['c'] - quote['pc'])
            quote['d']  = d
            quote['dp'] = _r((d / quote['pc']) * 100) if quote['pc'] else 0.0
            with _cache_lock:
                _cache[cache_key] = (quote, time.time())
            result[symbol] = quote
        except Exception as e:
            errors[symbol] = str(e)
        finally:
            with _cache_lock:
                _in_flight.pop(cache_key, None)
            event.set()

    return jsonify({'prices': result, 'errors': errors})


# Static file routes — MUST be registered after all /api/* routes so they
# don't shadow API handlers added in future.
@app.route('/')
def index():
    return send_from_directory(APP_DIR, 'index.html')


@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(APP_DIR, path)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
