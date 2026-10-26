# Interface localization

The offered languages are English (`en`), Swedish (`swe`, HTML `sv`), Irish (`ga`), Scottish Gaelic (`gd`), Welsh (`cy`) and Old English (`ang`). The language preference is saved locally. Selectors appear in the collection and while playing.

`src/i18n/phrases.source.json` is the curated English phrase inventory. The five JSON catalogs in `src/i18n/locales/` provide matching keys and preserve interpolation placeholders. Proper names, source titles, coordinate labels, standard notation and user-entered text are kept intact where appropriate. Old English is a contemporary-interface adaptation.

New React UI uses `useUiTranslation()` and its `tr(phrase, values)` or `trText(dynamicText)` helpers. The legacy UI bridge translates text-node data and user-facing attributes, including portal dialogs; it does not replace DOM structure, inputs, source code, styles or explicitly protected user content. Structured ancient move logs stay unchanged in the engine and are localized at rendering boundaries.

Run `npm run check:translations` to check complete coverage and placeholder parity. Run `node scripts/extract-ui-phrases.mjs` to write candidate phrases to the system temporary directory; review candidates before adding user-facing phrases to the curated inventory. This report deliberately includes some proper names and code-like candidates, which must not be blindly translated.

When adding a new phrase, add its exact English key to the inventory and every locale. Preserve `{name}` placeholders and use structured values rather than concatenated English. Keep algebraic chess notation unchanged. Browser-check long labels, dialogs, legal-move labels, post-roll states and game outcomes, not only the first collection screen.
