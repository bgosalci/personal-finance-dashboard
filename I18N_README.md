# Internationalization

The application supports multiple languages through built-in translations defined in `app/js/i18n.js`. Optional JSON files in `app/locales` can override these defaults. Currently English, Spanish, French, German, Italian and Albanian are available.

## Adding a Language
1. Add a new entry to the `DEFAULT_TRANSLATIONS` object in `app/js/i18n.js` using the English strings as a template.
2. Translate each value.
3. (Optional) Provide a matching `app/locales/{code}.json` file if you want to maintain translations outside the script.
4. Languages listed in the selector are generated from the keys in `DEFAULT_TRANSLATIONS`, so no additional configuration is required.

Language options are added only when requested by a human developer. Pseudolocalisation is not included in the selector by default.

## Runtime Selection
The Settings tab provides a language selector and RTL toggle. Chosen locale and direction are stored in `localStorage`.

If the app is opened directly from the filesystem (`file://`), locale files cannot be fetched due to browser restrictions. In that case the built-in English translations are used automatically so the interface remains functional offline.
