

# Three Changes: Green Board, Layout Reorder, Translated Descriptions

## 1. Green Texture for Circular (Fidchell) 3D Board

The Fidchell board currently uses a dark purple base (`#1A1428`) which makes black pieces nearly invisible.

**File: `src/constants/game.ts`** -- Update `FIDCHELL_THEME`:
- `boardBase`: `#1A1428` → `#1B3D2F` (dark forest green)
- `squareLight`: `#7B68B0` → `#4A7A5A` (sage green)
- `squareDark`: `#4A3D6A` → `#2D5A3D` (deep green)
- `throne`: `#6B4EAB` → `#2E8B57` (sea green)
- `accentRing`: `#9F7AEA` → `#50C878` (emerald accent)
- `runeColor`: `#DDA0DD` → `#98FB98` (pale green for runes)
- Keep metallic/silver for the Navel Stone contrast

**File: `src/components/game/CircularBoard3D.tsx`** -- The Navel Stone and node colors reference theme values, so they'll pick up the green automatically. The hardcoded node fallback color `#4A3D6A` should also change to a green tone like `#2D5A3D`.

## 2. Move Game Variant Tiles to Top (Under Title)

**File: `src/components/game/GameSetup.tsx`** -- Reorder the three content sections inside the main `flex-col` container:
- Currently: Header → Parchment+Settings → Variant Carousel (bottom)
- New order: Header → **Variant Carousel** → Parchment+Settings

Simply move the entire "Bottom Variant Carousel" `<motion.div>` block (lines 266-349) to appear right after the Header block (after line 106), before the "Center area" div. No structural changes needed, just repositioning.

## 3. Translate Game Variant Descriptions & History

The `history` and `description` fields on each variant in `GAME_VARIANTS` are hardcoded English strings. To translate them, we need to:

**File: `src/i18n/translations.ts`** -- Add translation keys for each variant's description and history:
```
variantDescriptions: {
  fidchell: string;
  brandub: string;
  tablut: string;
  tawlbwrdd: string;
  hnefatafl: string;
  alea: string;
};
variantHistories: {
  fidchell: string;
  brandub: string;
  tablut: string;
  tawlbwrdd: string;
  hnefatafl: string;
  alea: string;
};
```

Add all 6 translations (en, swe, ga, gd, cy, ang) for each variant's description and history text, using culturally appropriate language.

**File: `src/components/game/GameSetup.tsx`** -- Replace `selectedVariant.history` and `infoVariant.history` references with `t.variantHistories[selectedVariant.id]` (with fallback to English). Similarly for any description usage.

## Files Modified
1. `src/constants/game.ts` -- green Fidchell theme colors
2. `src/components/game/CircularBoard3D.tsx` -- update hardcoded fallback node color
3. `src/components/game/GameSetup.tsx` -- reorder layout, use translated descriptions
4. `src/i18n/translations.ts` -- add `variantDescriptions` and `variantHistories` for all 6 languages

