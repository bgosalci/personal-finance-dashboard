# Internationalization

The application supports multiple languages via `app/js/i18n.js`. Translations are embedded in the `DEFAULT_TRANSLATIONS` object and applied to elements with `data-i18n` attributes.

## Available Locales

The currently bundled locales are:

- `en`
- `es`
- `fr`
- `de`
- `it`
- `ro`
- `sq`
- `pe`

The Settings tab builds the language selector from the available locale list. Locale choice and RTL preference are stored in `localStorage`.

## Adding or Updating a Language

1. Add or update the locale entry inside `DEFAULT_TRANSLATIONS` in `app/js/i18n.js` using the English strings as a template.
2. Ensure all keys are present and consistent across locales.
3. Test by selecting the locale in Settings.

Language options should only be added when explicitly requested by a human developer. Pseudolocalisation is not listed by default.

## Runtime Overrides

The `I18n` module supports locale export/import via JSON (useful for sharing translations without editing source files). Imported locale data is stored in `localStorage` and overrides the defaults for that locale.

## Notes

- When the app is opened directly from the filesystem (`file://`), browser security restrictions can limit fetch usage. Built-in translations still work because they are bundled in the script.
- RTL support is controlled via the Settings toggle and applies a `dir="rtl"` attribute to the document.
