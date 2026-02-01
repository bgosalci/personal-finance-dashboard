# Agent Development Guide

This document provides development best practices and guidelines for the Personal Finance Dashboard project. It complements the [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) with focused, actionable guidance for contributors and maintainers.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Development Principles](#development-principles)
- [Code Quality Standards](#code-quality-standards)
- [Data Management](#data-management)
- [UI/UX Patterns](#uiux-patterns)
- [Testing Expectations](#testing-expectations)
- [External Services](#external-services)
- [Code Review Checklist](#code-review-checklist)

## Architecture Overview

### Modular SPA Layout

The dashboard is a single-page application composed of:
- `app/index.html` for structure and templates.
- `app/css/style.css` for layout and theming.
- `app/js/*.js` for feature modules and services.

JavaScript modules use the IIFE pattern and expose a small public API for maintainability. Module initialization is orchestrated from `main.js` and `financialDashboard.js`.

### Core Modules

- **FinancialDashboard**: Coordinates module initialization.
- **TabManager**: Controls navigation state.
- **PortfolioManager**: Portfolio CRUD, charts, and totals.
- **WatchlistManager**: Watchlist CRUD and live quote updates.
- **PensionManager**: Pension tracking and summaries.
- **Calculator**: Loan, investment, CAGR, mortgage, salary, and fair value calculators.
- **StockTracker**: Multi-year performance tracking.
- **StockFinance**: Financial statements and ratios.
- **Settings**: Preferences, language/theme, and data import/export.
- **I18n** / **ThemeManager**: Localization and theming.

## Development Principles

1. **Privacy-first**
   - Store user data locally unless explicitly using external APIs.
   - Never log or transmit user-entered data beyond required API calls.

2. **Progressive enhancement**
   - Core functionality works without network access.
   - Live quotes and market status are optional extras.

3. **Maintainability**
   - Keep modules focused and testable.
   - Avoid cross-module coupling; communicate via events or explicit APIs.

## Code Quality Standards

### JavaScript
- Use `const`/`let` (no `var`).
- Keep functions small and well-scoped.
- Prefer descriptive names for variables and DOM IDs.
- Validate user input before processing.

### Localization
- Use `data-i18n` for static text.
- Use `I18n.t()` for runtime strings.
- Keep translation keys consistent across locales.

### Error Handling
- Gracefully handle network failures.
- Avoid user-facing errors for optional APIs.
- Use `DialogManager` for user confirmations.

## Data Management

- Use module-specific storage keys.
- Use `StorageUtils.getStorage()` for safe storage access.
- Ensure export/import paths can handle malformed data.

## UI/UX Patterns

- Maintain consistent button styles and spacing.
- Keep table layouts responsive with horizontal scroll when needed.
- Use summary cards and charts to highlight key metrics.

## Testing Expectations

- Update Jest tests in `__tests__/` for any new behaviors.
- Validate UI flows manually (portfolio, watchlist, pension, calculators, tracker, settings).
- Confirm i18n and theme changes still render correctly.

## External Services

- **Finnhub**: Quotes, search, and financial statements.
- **Polygon.io**: Market status indicators.
- **ExchangeRate-API**: Base currency conversion.

Avoid hard dependencies on these services; the app should remain usable without them.

## Code Review Checklist

- [ ] Code matches module pattern and naming conventions.
- [ ] UI strings are localized via `I18n`.
- [ ] Documentation updated (README, guides, API reference).
- [ ] Tests updated and passing.
- [ ] Manual sanity checks completed for key tabs.
