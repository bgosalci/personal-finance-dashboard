# Internationalization

The application now supports multiple languages via JSON locale files stored in `app/locales`.

## Adding a Language
1. Copy `app/locales/en.json` to `app/locales/{code}.json`.
2. Translate each value.
3. Languages listed in the selector are generated from the keys in `DEFAULT_TRANSLATIONS`, so no additional configuration is required.

## Runtime Selection
The Settings tab provides a language selector and RTL toggle. Chosen locale and direction are stored in `localStorage`.

If the app is opened directly from the filesystem (`file://`), locale files cannot be fetched due to browser restrictions. In that case the built-in English translations are used automatically so the interface remains functional offline.

## Pseudolocalisation
Select the `pseudo` locale to enable pseudolocalisation for QA.
