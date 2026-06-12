# Mobile Polish + Accurate History Map & Variant Histories

Two large but well-scoped tracks. Both are presentation/data only — no game-logic changes.

---

## Track 1 — Real, accurate Tafl history map (Leaflet + OpenStreetMap)

### Replace the SVG map
**File:** `src/components/game/TaflHistoryMap.tsx` — rewrite from the ground up using `react-leaflet` + Leaflet on OSM tiles. No API key required.

Add deps: `leaflet`, `react-leaflet@4`, `@types/leaflet`.

Map setup:
- `MapContainer` centered on ~`[58, 5]`, zoom 4, `maxBounds` covering Northern Europe + British Isles so users can't pan to Antarctica.
- Tile layer: OSM standard (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) with proper attribution.
- `scrollWheelZoom={false}` by default (touch/pinch still works); `touchZoom`, `dragging`, `tap` all enabled.
- Container fills the modal: `h-[70vh] sm:h-[60vh] w-full rounded-lg overflow-hidden`.

### Accurate pins (update `coordinates` + `origin` in `src/constants/game.ts`)

Pin each variant at its **actual archaeological find-site / best-attested origin**, with hover/popup showing find-site + date:

| Variant      | New coords (lat,lng)      | Find-site / rationale |
|--------------|---------------------------|-----------------------|
| Fidchell     | 53.171, -7.785            | Ballinderry crannog, Co. Offaly, Ireland — 10th-c. wooden board found 1932 |
| Brandub      | 53.580, -7.770            | Knowth, Co. Meath — 7×7 stone board fragment |
| Tablut       | 68.435, 18.806            | Sápmi / Lapland — documented by Linnaeus 1732 |
| Tawlbwrdd    | 52.413, -4.082            | Aberystwyth / Welsh law manuscripts (Robert ap Ifan, 1587 description) |
| Hnefatafl    | 60.137, 11.443            | Gokstad ship burial, Vestfold, Norway (~900 CE) — best-preserved Viking board fragment |
| Alea Evangelii | 51.279, 1.083           | Canterbury (Corpus Christi MS 122) — 12th-c. manuscript |

### Custom markers + routes
- Use `L.divIcon` with a small themed dot (`variant.theme.corner` background, accent ring border, variant initial) so markers match each variant's palette.
- Selected variant marker pulses (CSS keyframe on the divIcon).
- Trade/diffusion routes drawn with `Polyline` using **historically-attested Viking/Insular routes**, not random arcs:
  1. Gokstad (Norway) → Dublin/Ballinderry (Norse settlement of Ireland, 9th c.)
  2. Gokstad → York/Canterbury (Danelaw, 9th–10th c.)
  3. Sápmi → Gokstad (Sami contact / Linnaeus' northern route)
  4. Knowth → Aberystwyth (Insular Celtic exchange)
  Each polyline: dashed gold, animated `dashOffset` on mount, with a `Tooltip` naming the route.
- Click a marker → calls `onSelectVariant(variant)` (existing behaviour).

### Mobile sizing for the modal
- Modal wrapper: `max-w-[100vw] sm:max-w-3xl w-full max-h-[100dvh] sm:max-h-[90vh]`, full-bleed on phones with rounded only on `sm:`.
- Title/subtitle scale: `text-lg sm:text-xl`.
- Bottom variant info bar wraps onto multiple lines on small screens (`flex-wrap gap-2`).
- Close button enlarged tap area: `p-3` + `aria-label`.

---

## Track 2 — Accurate, sourced variant histories (all 6 languages)

### Rewrite `history`, `era`, `origin` in `src/constants/game.ts`

English source-of-truth strings (≤ ~320 chars each, mention find-site + date):

- **Fidchell** — era: `c. 600–1100 CE`. History: "Fidchell ('wood-wisdom') is a Celtic board game referenced in early Irish sagas like *Tochmarc Étaíne*. A wooden 7×7 board was excavated at Ballinderry crannog, Co. Offaly in 1932 and dated to the 10th century. The Welsh cognate *gwyddbwyll* appears in the Mabinogion."
- **Brandub** — era: `c. 700–1100 CE`. History: "Brandub ('black raven') is the Irish 7×7 tafl variant. A stone board fragment from Knowth, Co. Meath and a complete wooden board from Ballinderry attest its play in early medieval Ireland, with the king representing the High King of Tara."
- **Tablut** — era: `documented 1732, played earlier`. History: "Tablut is the Sámi 9×9 tafl, recorded in detail by Carl Linnaeus during his 1732 *Iter Lapponicum*. His diary preserves the rules — the only complete historical ruleset for any tafl game — and was the basis of all modern reconstructions."
- **Tawlbwrdd** — era: `c. 900–1587 CE`. History: "Tawlbwrdd ('throw-board') is the Welsh 11×11 tafl. Described in the *Cyfraith Hywel* law texts and in Robert ap Ifan's 1587 manuscript, which provides our clearest medieval Welsh board diagram with 8 defenders, 16 attackers, and an armed king."
- **Hnefatafl** — era: `c. 400–1100 CE`. History: "Hnefatafl ('king's table') was the dominant Norse strategy game of the Viking Age. Boards and pieces have been excavated at Gokstad (Norway, c. 900), Birka (Sweden), and across the Norse diaspora from Dublin to L'Anse aux Meadows. Sagas including *Friðþjófs saga* describe play."
- **Alea Evangelii** — era: `c. 1000–1150 CE`. History: "Alea Evangelii ('Game of the Gospels') survives in a single 12th-century Canterbury manuscript (Corpus Christi College Cambridge MS 122), which presents the 19×19 board as a Christological diagram and credits Bishop Israel the Grammarian (10th c.) for the layout."

### Translate to all 6 languages
**File:** `src/i18n/translations.ts` — update the 6 `variantHistories` blocks (en/swe/ga/gd/cy/ang) **and** the matching `variantDescriptions` short blurbs so they reflect the new factual content. Each language gets a faithful translation; Old English (`ang`) and Gaelic variants stay in stylized period idiom but with the corrected facts (find-sites, dates, manuscripts).

---

## Track 3 — Aggressive mobile polish

### Global
**File:** `src/index.css`
- Add `html, body { -webkit-text-size-adjust: 100%; overscroll-behavior: none; }`
- Add utility `.tap-target { min-height: 44px; min-width: 44px; }` and apply to all icon-only buttons listed below.
- Ensure `body` has `touch-action: manipulation` already (verify; add if missing).

### `src/components/game/GameSetup.tsx`
- Header controls (top-right): on `<sm`, stack to a single row with `gap-1` and shrink `Map/Language/Volume` buttons to `p-1.5`; add `tap-target`.
- Variant carousel:
  - Add scroll-snap: `snap-x snap-mandatory` on the container, `snap-center` on each tile.
  - Reduce tile min-width to `min-w-[96px]` on mobile, `min-w-[110px]` on `sm:`.
  - Make info `(i)` button a proper `tap-target` (`w-7 h-7` on mobile) so it isn't a 12px hit.
- Parchment + settings stack: already `flex-col lg:flex-row`. On mobile, reduce parchment padding to `p-4` and rotate `-rotate-0` (drop the tilt on `<sm` — it clips on narrow screens).
- Bottom badges (Kamrok / Built with Lovable): on `<sm` move to a single centered row above the safe area to avoid overlap with iOS home indicator: `bottom-[max(0.75rem,env(safe-area-inset-bottom))]`.
- Begin Battle button: `py-4` on mobile (bigger thumb target).

### `src/pages/Index.tsx` (in-game screen)
- Header logo: shrink to `h-9 sm:h-16` so it doesn't dominate the phone screen.
- Left panel (`TurnIndicator` + `GameControls`):
  - Width `w-[44vw] max-w-[180px] sm:w-48`.
  - Position `top-16 sm:top-20`.
- Right `MoveHistory` toggle button: become a floating icon button on mobile (`w-10 h-10 rounded-full`, scroll icon only) instead of a wide labeled bar.
- Mobile history panel: full-width drawer from right `w-[80vw] max-w-xs h-[60vh]` with a backdrop.
- Bottom stats bar: on `<sm`, condense to icons + numbers (`A: 16 • D: 13`), `text-[11px]`, and lift above safe area with `bottom-[max(1rem,env(safe-area-inset-bottom))]`.
- Kamrok / Lovable badges: same safe-area lift as setup screen.

### `src/components/game/TurnIndicator.tsx`, `GameControls.tsx`, `MoveHistory.tsx`, `VictoryModal.tsx`, `RulesModal.tsx`, `DemoMovePopup.tsx`
- All modals: `max-w-[95vw] max-h-[90dvh] overflow-y-auto p-4 sm:p-6`.
- All icon buttons: add `tap-target` class.
- Replace any `hover:` only affordances with `active:` equivalents for touch.
- Text scales: `text-xs sm:text-sm` minimum for body, `text-base sm:text-lg` for headings.

### `src/components/game/Scene3D.tsx`
- Ensure Three canvas accepts pinch-to-zoom: pass `touch-action: none` on the canvas wrapper (Three handles gestures), and lower `OrbitControls` `rotateSpeed` on touch.
- Verify camera FOV / distance gives a usable board view at ≤390px wide — bump default zoom-out by ~15% on mobile via `useMediaQuery('(max-width: 640px)')`.

### Viewport
- `index.html` `<meta name="viewport">` — confirm it includes `viewport-fit=cover` so safe-area insets work. Update if missing.

---

## Files Touched

1. `package.json` — add `leaflet`, `react-leaflet`, `@types/leaflet`
2. `src/components/game/TaflHistoryMap.tsx` — rewritten with Leaflet
3. `src/constants/game.ts` — accurate coordinates, era, history, origin per variant
4. `src/i18n/translations.ts` — updated `variantDescriptions` + `variantHistories` for all 6 languages
5. `src/components/game/GameSetup.tsx` — mobile polish (carousel, badges, header, button sizes)
6. `src/pages/Index.tsx` — in-game mobile layout (panels, stats bar, badges, safe-area)
7. `src/components/game/TurnIndicator.tsx`, `GameControls.tsx`, `MoveHistory.tsx`, `VictoryModal.tsx`, `RulesModal.tsx`, `DemoMovePopup.tsx` — tap targets, modal sizing, type scale
8. `src/components/game/Scene3D.tsx` — touch gesture tuning, mobile camera zoom
9. `src/index.css` — safe-area utilities, tap-target class, overscroll fix
10. `index.html` — `viewport-fit=cover`

No backend, no schema, no game-logic changes.
