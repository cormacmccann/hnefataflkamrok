

# Mobile Optimization + "Built with Lovable" Badge Image

## Overview
Two areas of work: (1) optimize the entire app for mobile viewports, and (2) replace the text-only "Built with Lovable" badge with the uploaded image badge linking to the referral URL.

---

## 1. Replace "Built with Lovable" Badge with Image

**File: `src/components/game/GameSetup.tsx`**

- Copy `user-uploads://builtwith.png` to `src/assets/builtwith.png`
- Import the image in GameSetup
- Replace the text `<a>` badge (lines 352-363) with an `<img>` tag using the uploaded badge image
- Keep the same fixed positioning (`fixed bottom-4 right-4 z-30`) and link to `https://lovable.dev/invite/8MUK1UP`

---

## 2. Mobile Optimization

### 2a. GameSetup Screen (`src/components/game/GameSetup.tsx`)

The setup screen uses `flex-col lg:flex-row` for the parchment + settings layout, which works. Issues to fix:

- **Header text**: `text-4xl md:text-5xl` is too large on small screens -- reduce to `text-2xl sm:text-3xl md:text-5xl`
- **Parchment card**: `max-w-md` with `p-6 md:p-8` is fine but add responsive padding `p-4 sm:p-6 md:p-8`
- **Top-right controls cluster**: The Map button, LanguageSelector, and VolumeControl all sit in a row at `fixed top-4 right-4`. On mobile these can overflow. Reduce gaps and make icons smaller on mobile.
- **Variant tiles at bottom**: Use horizontal scroll on mobile instead of `flex-wrap` so tiles don't push the page too tall. Change to `flex-nowrap overflow-x-auto` on small screens, `flex-wrap` on larger.
- **Container padding**: `px-4 py-8` -- reduce vertical padding on mobile: `py-4 sm:py-8`

### 2b. In-Game Screen (`src/pages/Index.tsx`)

- **Left panel** (Turn Indicator + Controls): `fixed top-20 left-4 w-48` is too wide on mobile. Change to `w-36 sm:w-48` and reduce padding. On very small screens, make controls more compact.
- **Turn Indicator** (`TurnIndicator.tsx`): Reduce piece indicator size and text on mobile. Use `text-sm sm:text-lg` for player name, `w-6 h-6 sm:w-8 sm:h-8` for the colored circle.
- **Header logo**: Already has `h-12 sm:h-16` -- good.
- **Bottom stats bar**: `fixed bottom-4` with `px-4 py-2` pills can overlap on narrow screens. Make text smaller on mobile: `text-xs` and reduce horizontal padding. Use `gap-2 sm:gap-4`.
- **Demo mode popup** (`DemoMovePopup.tsx`): `fixed bottom-24` with `max-w-md` -- add `mx-4` for side padding and reduce text sizes on mobile.
- **Mobile history panel**: Already exists with `lg:hidden` toggle -- this is good.

### 2c. 3D Scene Camera (`src/components/game/Scene3D.tsx`)

- The camera is at `position={[0, 12, 8]}` with `minDistance={8}`. On mobile the board can appear too far. No code change needed here as OrbitControls allows pinch-to-zoom, but consider starting the camera slightly closer on mobile or adjusting FOV.

### 2d. Modals

- **VictoryModal**: Already uses `sm:max-w-md` which is responsive.
- **RulesModal**: Uses `sm:max-w-2xl max-h-[85vh]` -- fine.
- **TaflHistoryMap**: `max-w-3xl` may be too wide. Add `max-w-[95vw] sm:max-w-3xl` and ensure `p-4 sm:p-6` padding.

### 2e. Global CSS / Meta

- The `index.html` should have proper viewport meta tag (likely already present). Verify.
- Add `touch-action: manipulation` on interactive areas to prevent double-tap zoom delays on mobile.

---

## Files to Modify

1. **Copy asset**: `user-uploads://builtwith.png` to `src/assets/builtwith.png`
2. **`src/components/game/GameSetup.tsx`** -- mobile-responsive classes, badge image replacement
3. **`src/pages/Index.tsx`** -- responsive overlay panel widths and spacing
4. **`src/components/game/TurnIndicator.tsx`** -- compact mobile layout
5. **`src/components/game/DemoMovePopup.tsx`** -- mobile padding
6. **`src/components/game/TaflHistoryMap.tsx`** -- constrain width on mobile
7. **`src/index.css`** -- add touch-action utility if needed

