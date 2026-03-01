
# Add "Built with Lovable" Badge

## Change
Add a small "Built with Lovable" link/badge in the bottom-right corner of the GameSetup landing page, linking to the user's referral URL.

## Implementation in `src/components/game/GameSetup.tsx`

Add a fixed-position element in the bottom-right corner (similar to how the top-right controls are positioned), just before the closing `</div>` of the root container:

```tsx
<a
  href="https://lovable.dev/invite/8MUK1UP"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-lg 
    bg-black/40 backdrop-blur-sm border border-primary/20 
    text-xs text-primary/80 hover:text-primary hover:border-primary/40 
    transition-colors font-['Cinzel']"
>
  Built with Lovable
</a>
```

This places a subtle, styled badge that matches the Viking aesthetic (dark translucent background, gold text, Cinzel font) in the bottom-right corner without interfering with any game UI.

## File Modified
- `src/components/game/GameSetup.tsx` -- add the badge element
