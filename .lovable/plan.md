## Goal

Make the top-right controls clearer and dramatically friendlier on mobile, and move language into the profile (user) dropdown.

## 1. Language inside the profile dropdown

In `ProfileChip` (`src/components/auth/ProfileChip.tsx`), add a "Language" submenu section to the dropdown:

- New `DropdownMenuLabel` "Language" followed by a row of 6 flag buttons (en, swe, ga, gd, cy, ang) wired to `useLanguage().setLanguage`.
- Selected language gets a check mark and `bg-secondary` background.
- Reuses the existing `languageFlags` map and `Language` type from `src/i18n/translations.ts`.

This keeps the existing standalone `LanguageSelector` working, but on small screens we hide it (see section 3) since it now lives inside the profile dropdown.

## 2. Label the little icons

Add a small caption under each icon button in the `GameSetup` top-right strip (How to play, Map, Multiplayer) and the in-game header (Volume, Profile). Pattern:

```tsx
<button className="flex flex-col items-center gap-0.5 tap-target carved-button rounded-lg px-2 py-1.5">
  <BookOpen className="w-4 h-4" />
  <span className="text-[9px] uppercase tracking-wider font-['Cinzel']">Rules</span>
</button>
```

Labels (all i18n-keyed, fall back to English):
- Rules / How to play
- Map / History
- Multi / Multiplayer
- Lang / Language (desktop only; mobile uses profile dropdown)
- Sound / Volume
- Guest name / Profile

Translation keys added to `src/i18n/translations.ts`: `rulesShort`, `mapShort`, `multiShort`, `langShort`, `soundShort`.

## 3. Mobile UX rework

Current pain: 6 small icons crammed into the top-right corner, easy to mis-tap, no labels, and the language popover overlaps the volume popover.

Changes:

- **Top-right strip becomes a horizontal "toolbar"** with proper spacing (`gap-2`), each item is a labelled vertical icon+caption tile (≥44×44 tap target), wrapping to two rows under 360px width.
- **Profile chip on mobile** shows the avatar + a small "guest" pill (no truncated name) and stays in the toolbar, opening the dropdown that now also contains Language.
- **Standalone `LanguageSelector` hidden under `sm`** since it lives in the profile dropdown.
- **MultiplayerMenu modal**: bigger tap targets on tabs, `min-h-12` on Create/Join buttons, and the "Same screen" tab description shortened to one line on mobile.
- **In-game header (`Index.tsx`)**: the centered logo currently competes with the right-side controls — on mobile shrink the logo to `h-7`, move volume + profile into the same labelled-icon toolbar pattern, and add `safe-top` padding so the iOS notch doesn't overlap.
- **AuthDialog**: stack the Google/Apple buttons full-width with `min-h-11` and add larger spacing between form fields on mobile (`space-y-4`).

## 4. Files touched

- `src/components/auth/ProfileChip.tsx` — add language section + mobile-friendly trigger
- `src/components/game/GameSetup.tsx` — label icons, restructure top-right toolbar
- `src/pages/Index.tsx` — same toolbar pattern in the in-game header, smaller logo on mobile, safe-area padding
- `src/components/game/LanguageSelector.tsx` — add `className` prop to allow hiding on `sm` from parents (no behavior change)
- `src/components/game/VolumeControl.tsx` — accept optional label, popover anchors right on mobile so it doesn't overflow
- `src/components/multiplayer/MultiplayerMenu.tsx` — larger tap targets, tighter mobile copy
- `src/components/auth/AuthDialog.tsx` — taller buttons + spacing on mobile
- `src/i18n/translations.ts` — 5 new short labels per language

## Out of scope

- No changes to the 3D board, gameplay, AI, or multiplayer sync.
- No new colors or fonts — uses existing carved-button/Cinzel design system.
