# TAFL interface validation

Validated locally on 26 October 2026. These checks concern the local checkout and preview, not a hosted deployment.

## Delivered experience

- One generated walnut-disc TAFL emblem is used by the introduction, collection and game headers, with a matching favicon. Source and generation notes: `tafl-identity.md`.
- An immersive, viewport-height desktop collection uses a full-bleed illustrated background, a larger central board preview, a separate title area and larger pill-shaped game selectors. The phone collection stacks vertically. During play, all game stages fill the viewport; settings and history open on demand rather than shrinking the board.
- All 15 games have live, playable 2D and 3D views. Changing view preserves the position and current turn.
- The five square Tafl variants share the same pure rules between human play and computer search. Circular Fidchell is explicitly a modern connection interpretation.
- Standard Tafl supports computer opponents, shared-screen two-player play and computer demonstrations. Ur, Petteia, Latrunculorum and the three race interpretations use a computer opponent. Bao uses shared-screen play. Mehen supports human/computer player configuration.
- Rules and historical limits are documented in `game-rules.md` and exposed within the interface. Copenhagen core omits automatic exit-fort and agreed-draw adjudication; Bao's omitted advanced provisions remain disclosed. Lost historical rules are not presented as recovered fact.

## Checks

- `npm run typecheck`: passed.
- `npm run build`: passed. Vite still reports large JavaScript chunks; Three.js and the atlas are loaded separately from the initial collection.
- `npm run test:rules`: 41 regression checks passed, covering movement, escape, capture, shieldwalls, repetition, AI wins, immobilisation, Ur paths/rosettes/bearing off, race turns, invalid actions and Bao seed conservation.
- `npm run lint`: zero errors; 32 existing hook-dependency and Fast Refresh warnings remain.
- `git diff --check`: passed.

## Browser evidence

Desktop collection at 1440×900, 1366×768, 1280×650 and 1024×600: no page overflow and all launch controls visible. The eight-game world list also fits at 1024×600 without internal scrolling.

Phone collection at 390×844 and 320×568: no horizontal overflow. A vertical page scroll is used for the collection. All six Tafl playing rooms fit at 320×568; square and circular 2D boards remain within their stages.

All five square Tafl variants: legal attacker and defender moves, turn changes and one-ply local undo. Fidchell: alternating placements. Tablut against the computer: opening move, human move, computer response and two-ply undo. Computer demonstration: multiple autonomous turns. Switching 2D→3D→2D retains the position.

All eight world games opened and accepted legal actions in 2D at 1440×900, including Ur entry, tactical moves, race entry, Bao sowing and Mehen entry. Senet at 390×844: portrait board, visible 44px action controls, working move, modal focus and scroll locking.

All eight world boards rendered in Chromium with SwiftShader WebGL at 1440×900, with no page errors, console errors or GL errors. Patolli additionally rendered with the full plinth visible at 320×568. Square Tafl 3D also rendered and switched views successfully. The in-app browser's unavailable-WebGL path was checked separately; it offers the same live game in 2D.

## Assets

`node scripts/prepare-board-models.mjs` reproduces geometry-only siblings of the original carved piece models. Every geometry byte is retained; embedded textures that were already replaced by runtime materials are removed. Download size falls from approximately 17.3 MB to 748 KB (95.7% reduction). Original source models are retained. The runtime uses local procedural wood textures and local-font engraving without a remote 3D-font download.

## Final additions and refinements

Chess is the fifteenth game, available under Classics. Its chess.js engine enforces legal checks, castling, en passant and explicit promotion to all four pieces. Local computer/shared-screen games, three computer levels, undo, board orientation, move history and PGN export are available in both views. The table automatically adjudicates threefold and fifty-move draws; tournament clocks and claim arbitration are not implemented. Sixteen chess regressions run alongside the 25 ancient/Tafl checks.

The Sound control opens levels on one tap; a double click or double touch mutes music and effects. Repeating it restores their previous individual levels, including a channel that was already zero. Previous levels survive game changes and reloads. Actual audio element volumes and native touchscreen events were checked. The profile placeholder reserves its width during loading so controls do not move between taps.

All six offered languages now cover collection text, rules, controls, status/results, dialogs, labels and board accessibility. English is the source; Swedish, Irish, Scottish Gaelic, Welsh and Old English each have the full phrase catalogue. Native language names, personal names, standard chess notation and bibliographic titles are retained where appropriate. Old English uses an adapted modern-interface vocabulary. Automated coverage/placeholder checks supplement browser checks; these are not a native linguist's sign-off. Live language switching in chess preserved SAN history and the position.

The final collection polish gives titles their own grid row above the board, descriptions below, and larger, bolder game pills. World games use two rows on desktop to retain readable names. All desktop language layouts were checked at 1024×600; immersive Tafl and chess stages were measured at exactly the viewport size on desktop and 320×568 phones.
