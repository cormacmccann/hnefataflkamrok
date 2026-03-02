

# Translate All Hardcoded English Strings

## Problem
Many UI strings throughout the app are hardcoded in English and don't change when the language is switched. The translation system (`t` object) exists and has translations for 6 languages, but several components still use raw English text.

## Scope of Changes

### 1. Add new translation keys to `src/i18n/translations.ts`

New keys needed (with translations for all 6 languages: en, swe, ga, gd, cy, ang):

| Key | English value |
|-----|---------------|
| `ancientStrategy` | "Ancient Strategy of Kings" |
| `currentVariant` | "Current Variant" |
| `selectYourSaga` | "Select Your Saga" |
| `beginBattle` | "Begin Battle" |
| `rings` | "rings" |
| `white` | "White" |
| `black` | "Black" |
| `circular` | "Circular" |
| `circularWeb` | "Circular web" |
| `connection` | "Connection" |
| `kingEscape` | "King escape" |
| `connectNavelToEdge` | "Connect Navel to edge" |
| `blockTheConnection` | "Block the connection" |
| `kingEscapedCorner` | "The King has escaped to the corner!" |
| `kingCaptured` | "The King has been captured!" |
| `moveOf` | "'s Move" (for demo popup) |
| `piece` | "Piece" |
| `thrall` | "Thrall" |
| `karl` | "Karl" |
| `jarl` | "Jarl" |
| `infoAbout` | "Info about" |
| `historyMapTitle` | "History Map" |

### 2. Update `src/components/game/GameSetup.tsx`

Replace all hardcoded strings with `t.xxx` references:
- Line 101: `HNEFATAFL` -> `t.appName` (uppercased)
- Line 104: `"Ancient Strategy of Kings"` -> `t.ancientStrategy`
- Line 133: `"Current Variant"` -> `t.currentVariant`
- Line 145: `"Board"` -> `t.board`
- Line 147: `'7 rings'` -> `t.rings` equivalent
- Line 152: `'Black'` / `'Attackers'` -> `t.black` / `t.attackers`
- Line 160: `'White'` / `'Defenders'` -> `t.white` / `t.defenders`
- Line 181: `"Play As"` -> `t.playAs`
- Line 193: `'White'` -> `t.white`
- Line 196: `'Connect Navel to edge'` -> `t.connectNavelToEdge`
- Line 209: `'Black'` -> `t.black`
- Line 212: `'Block the connection'` -> `t.blockTheConnection`
- Line 222: `"Difficulty"` -> `t.difficulty`
- Lines 32-34: `DIFFICULTY_MAP` labels -> use `t` keys
- Line 251: `"Begin Battle"` -> `t.beginBattle`
- Line 260: `"Watch Demo"` -> `t.watchDemo`
- Line 276: `"Select Your Saga"` -> `t.selectYourSaga`
- Line 303: `'Circular'` -> `t.circular`
- Line 344: `'Board:'`, `'Victory:'`, `'Connection'`, `'King escape'` -> translated
- Line 77: `"History Map"` title -> `t.historyMapTitle`

### 3. Update `src/components/game/VictoryModal.tsx`

- Lines 53-55: `'The King has escaped to the corner!'` and `'The King has been captured!'` -> `t.kingEscapedCorner` / `t.kingCaptured`

### 4. Update `src/components/game/DemoMovePopup.tsx`

- Lines 14-17: `getPieceTypeName` returns hardcoded 'King', 'Defender', 'Attacker', 'Piece' -> use translation context
- Line 29: `'Attackers'` / `'Defenders'` -> translated
- Line 47: `"'s Move"` -> translated phrase

### 5. Translations for all 6 languages

Each new key will be translated into Swedish, Irish Gaelic, Scots Gaelic, Welsh, and Old English, following the existing translation patterns and culturally appropriate terminology already established in the file.

## Files Modified
1. `src/i18n/translations.ts` -- add ~20 new keys to `Translations` interface and all 6 language objects
2. `src/components/game/GameSetup.tsx` -- replace ~20 hardcoded strings with `t.xxx`
3. `src/components/game/VictoryModal.tsx` -- replace 2 hardcoded strings
4. `src/components/game/DemoMovePopup.tsx` -- replace ~5 hardcoded strings, add `useLanguage` hook

