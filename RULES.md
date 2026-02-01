# Project Rules

This file outlines the coding standards and workflow rules for the Personal Finance Dashboard project.

## Contribution Guidelines
- Follow the modular JavaScript architecture in `app/js/` (IIFE modules with explicit public APIs).
- Keep `app/index.html` focused on structure; logic should live in modules.
- Use `DialogManager` for alerts, confirmations, and prompts.
- Use `I18n.t()` and `data-i18n` attributes for user-facing text.
- Use `StorageUtils.getStorage()` when you need storage with fallback behavior.
- Ensure all new code is covered by tests in the `__tests__` directory.
- Run `npm install` inside `app/js` before running tests.
- Keep documentation up to date with code changes.
- Respect `.gitignore`; do not commit dependencies or local build artifacts.
- Add new language options (including pseudolocalisation) only when explicitly requested by a human developer.

## Community Standards
- Be respectful and collaborative.
- Provide clear commit messages that describe your changes.
- Review pull requests thoroughly before merging.

These rules complement the detailed guidance in `DEVELOPMENT_GUIDE.md` and `agent.md`.
