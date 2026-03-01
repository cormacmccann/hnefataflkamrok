

# Fix Fidchell Board Lines Visibility

## Problem
The concentric rings (torus geometries) and radial spokes (box geometries) are positioned at `y=0.01`, but the board base platform's top surface sits at `y=0.05` (center at `y=-0.1`, height `0.3`). This means all the web lines are hidden inside the board.

## Solution
Raise the Y position of rings and spokes above the board surface.

## Changes in `src/components/game/CircularBoard3D.tsx`

1. **Concentric rings** (line 99): Change `position={[0, 0.01, 0]}` to `position={[0, 0.06, 0]}`
2. **Radial spokes** (line 121): Change the Y component from `0.01` to `0.06`
3. **Spoke box geometry** (line 126): Increase height from `0.02` to `0.03` for better visibility

These three small coordinate fixes will make the entire web pattern visible on top of the board surface.

