# Documentation Summary - Personal Finance Dashboard

## Overview
This document summarizes the Personal Finance Dashboard codebase and the supporting documentation set. The app is a client-side financial dashboard built with modular JavaScript files under `app/js/` and a static HTML shell in `app/index.html`.

## Repository Snapshot
- **Repository**: bgosalci/personal-finance-dashboard
- **Entry Point**: `app/index.html`
- **Architecture**: Vanilla JavaScript + IIFE modules
- **Key Modules**: Portfolio, Watchlist, Pension, Calculators, Stock Tracker, Stock Finance, Settings, i18n

## Feature Coverage

1. **Portfolio Management**
   - Multiple portfolios, summaries, charts, and transaction history.
   - Base currency conversion with daily FX updates.

2. **Watchlist**
   - Manual refresh or real-time updates via Finnhub WebSocket.
   - Drag-and-drop ordering and quick visual indicators.

3. **Pension Tracking**
   - Entry tracking, CAGR metrics, and charts.
   - Export/import for long-term history.

4. **Financial Calculators**
   - Loan, investment, CAGR, mortgage, salary, and fair value calculators.

5. **Stock Performance Tracker**
   - Multi-year price tracking with growth analysis.

6. **Stock Finance Performance**
   - Income, balance sheet, and cash flow statements from Finnhub.

7. **Settings & Customization**
   - Base currency, theme, font size, language, RTL toggle.
   - Data export/import/delete tools.
   - Finnhub API key storage for live quotes.

## Technical Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js (bundled)
- **Icons**: Ionicons (CDN)
- **Storage**: Browser localStorage with memory fallback
- **Testing**: Jest + JSDOM

## External Integrations
- **Finnhub**: Quotes, symbol search, and financial statements
- **Polygon.io**: Market status (pre/regular/after hours)
- **ExchangeRate-API**: FX conversion rates

## Documentation Index

- **README.md**: High-level overview, features, and setup instructions.
- **DEVELOPMENT_GUIDE.md**: Contributor workflow, architecture, and testing.
- **TECHNICAL_DOCUMENTATION.md**: Module map and data/storage details.
- **API_REFERENCE.md**: Public module APIs.
- **USER_GUIDE.md**: End-user instructions.
- **I18N_README.md**: Localization process and translation tips.
- **RULES.md**: Repository contribution rules.
- **agent.md**: Developer best practices and project conventions.

## Notes
The dashboard can run fully offline for manual data entry, but real-time quotes, market status, and FX conversion require network access. All user data remains stored locally in the browser.
