

# Redesign Game Selection Landing Page

Completely rework `GameSetup.tsx` to match the reference design: a cinematic, full-screen Viking menu with a central parchment card, right-side settings panel, and bottom variant carousel.

## Layout Changes

### Current: Three-column grid layout inside a bordered card
### New: Full-screen cinematic layout with three distinct zones

```text
+--------------------------------------------------+
|              [Logo] HNEFATAFL                     |
|          Ancient Strategy of Kings                |
|                                                   |
|   +---------------------+    +----------------+   |
|   | PARCHMENT CARD      |    | PLAY AS        |   |
|   | "Current Variant"   |    |  [Defenders]   |   |
|   |   TABLUT            |    |  [Attackers]   |   |
|   |                     |    |                |   |
|   | History quote...    |    | DIFFICULTY     |   |
|   |                     |    |  [Easy]        |   |
|   | Board  Atk  Def     |    |  [Normal]      |   |
|   | 9x9   16  8+King    |    |  [Hard]        |   |
|   +---------------------+    |                |   |
|                              | [BEGIN BATTLE]  |   |
|                              +----------------+   |
|                                                   |
|          --- SELECT YOUR SAGA ---                  |
|   [Fidchell] [Brandub] [TABLUT] [Tawl] [Hnef]    |
+--------------------------------------------------+
```

## Specific Changes to `GameSetup.tsx`

1. **Background**: Keep viking background but add a vignette radial gradient overlay for depth, replacing the flat `bg-background/80` overlay.

2. **Header**: Replace logo image with a Viking arrow/shield SVG icon above the title. Title in large Cinzel gold text with glow. Subtitle as small tracked uppercase amber text.

3. **Center parchment card** (replaces left+middle columns):
   - Warm parchment background (`#dcc29a` tones) with dark text
   - Slight rotation (`-rotate-1`) for organic feel
   - Decorative corner brackets (CSS borders)
   - "CURRENT VARIANT" label in amber
   - Variant name as huge Cinzel heading
   - History text in italic serif
   - Bottom stats row: Board Size, Attackers count, Defenders count (from BOARD_CONFIGS)
   - Inner shadow and parchment-like box-shadow

4. **Right settings panel** (replaces right column):
   - Section labels with gold left border accent and gold text
   - "Carved button" style: dark gradient backgrounds with stone/wood shadow effects
   - Active state: gold background with dark text
   - Simplified difficulty: 3 levels with Viking-themed names (Thrall/Karl/Jarl mapping to easy/medium/valhalla)
   - Large gold "BEGIN BATTLE" button with glow shadow
   - Remove "Watch Demo" button from main view (or make it smaller/secondary)

5. **Bottom variant carousel** (replaces left column scroll list):
   - Horizontal row of stone tile cards
   - "SELECT YOUR SAGA" label with decorative line dividers
   - Each tile: carved button style, showing variant name + board size
   - Active tile: gold background, slightly scaled up with ring shadow
   - Horizontally scrollable with hidden scrollbar

6. **Animations**: 
   - Staggered entrance: header fades in first, then parchment card slides up, then settings panel, then carousel
   - Variant selection: AnimatePresence on parchment card content
   - Hover effects on carousel tiles and buttons

## CSS Changes to `index.css`

Add new utility classes:
- `.vignette` - radial gradient overlay
- `.parchment` - warm background with texture shadow
- `.carved-button` - dark gradient with inset shadow, gold hover border
- `.hide-scrollbar` - hide scrollbar for carousel

## Technical Details

- Keep all existing props, state, and callbacks unchanged
- Keep `VolumeControl`, `LanguageSelector`, and `TaflHistoryMap` modal
- Use `BOARD_CONFIGS` from constants to get attacker/defender counts for the stats row
- Map difficulties: beginner stays, easy -> "Thrall", medium -> "Karl", valhalla -> "Jarl"
- Maintain Fidchell-specific labels (White/Black instead of Defenders/Attackers)
- Keep the map button accessible (small icon in header area)

## Files Modified

1. **`src/components/game/GameSetup.tsx`** - Complete layout rewrite
2. **`src/index.css`** - Add parchment, carved-button, vignette styles

