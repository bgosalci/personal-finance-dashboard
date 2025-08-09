# Internationalization

The application now supports multiple languages via a single JSON file stored at `app/locales/locale.json`.

## Adding a Language
1. Open `app/locales/locale.json`.
2. Add a new top-level key under `locales` using the language code.
3. Translate each value.
4. The language will automatically appear in the Settings tab.

## Runtime Selection
The Settings tab provides a language selector and RTL toggle. Chosen locale and direction are stored in `localStorage`.

If the app is opened directly from the filesystem (`file://`), the bundled English translations are used so the interface remains functional offline.

## Pseudolocalisation
Select the `pseudo` locale to enable pseudolocalisation for QA.
