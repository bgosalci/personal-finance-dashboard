import os
import yfinance as yf
from flask import Flask, jsonify, request, send_from_directory, make_response

APP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')

app = Flask(__name__, static_folder=None)


@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    return response


@app.route('/api/options')
def options():
    symbol = request.args.get('ticker', '').strip().upper()
    if not symbol:
        return jsonify({'error': 'ticker parameter is required'}), 400

    try:
        ticker = yf.Ticker(symbol)

        # Last closing price
        hist = ticker.history(period='5d')
        if hist.empty:
            return jsonify({'error': 'Ticker not found or no price data available'}), 404
        price = round(float(hist['Close'].iloc[-1]), 2)

        # Available expirations
        expirations = list(ticker.options)
        if not expirations:
            return jsonify({'error': 'No options available for this ticker'}), 422

        # Use requested expiry or default to nearest
        requested = request.args.get('expiry', '').strip()
        expiry = requested if requested in expirations else expirations[0]

        # Options chain
        chain = ticker.option_chain(expiry)
        calls = chain.calls.reset_index(drop=True)
        puts  = chain.puts.reset_index(drop=True)

        if calls.empty or puts.empty:
            return jsonify({'error': 'Empty options chain for this expiry'}), 422

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

        return jsonify({
            'price':       price,
            'strike':      atm_strike,
            'call':        mid(call_row),
            'put':         mid(put_row),
            'expiry':      expiry,
            'expirations': expirations,
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Static file routes — MUST be registered after all /api/* routes so they
# don't shadow API handlers added in future.
@app.route('/')
def index():
    return send_from_directory(APP_DIR, 'index.html')


@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(APP_DIR, path)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
