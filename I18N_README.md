# Internationalization

The application now supports multiple languages via JSON locale files stored in `app/locales`.

## Adding a Language
1. Copy `app/locales/en.json` to `app/locales/{code}.json`.
2. Translate each value.
3. Add the locale code to `I18n.availableLocales` if not already present.

## Runtime Selection
The Settings tab provides a language selector and RTL toggle. Chosen locale and direction are stored in `localStorage`.

## Export/Import
Language files can be exported and imported from the Settings tab for custom localisation.

## Pseudolocalisation
Select the `pseudo` locale to enable pseudolocalisation for QA.
