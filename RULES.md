# Project Rules

This file outlines basic rules and coding standards for the Personal Finance Dashboard project.

## Contribution Guidelines
- Follow the modular JavaScript architecture used throughout the `app/js/` directory.
- Ensure all new code is covered by tests located in the `__tests__` directory.
- Run `npm install` inside `app/js` before running tests.
- Keep documentation up to date with code changes.
- Respect the `.gitignore` settings; do not commit dependencies or local build artifacts.
- Use the built-in `DialogManager` for all alerts, prompts, and confirmation dialogs.
- Customize portfolio table headers only through the `PortfolioColumns` module.
- Add new language options (including pseudolocalisation) only when explicitly requested by a human developer.

## Community Standards
- Be respectful and collaborative.
- Provide clear commit messages that describe your changes.
- Review pull requests thoroughly before merging.

These rules complement the detailed guidance in `DEVELOPMENT_GUIDE.md` and `agent.md`.
