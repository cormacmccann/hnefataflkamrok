# Playable rules and historical limits

TAFL uses the same pure rules engine for square-board human play and AI search. A move is checked against the current position and turn when it is committed, including moves requested by the computer. Selecting a piece is no longer a prerequisite for committing its AI move.

## Tafl family

- **Brandub / Brandubh:** 7×7, eight attackers, four defenders and an armed king. Corner escape; the king requires four attackers on the throne and can be sandwiched elsewhere. The throne is not hostile to the king. Based on the [World Tafl Federation's modern Brandubh rules](https://aagenielsen.dk/brandubh2_rules_en.pdf).
- **Tablut:** 9×9, sixteen attackers, eight defenders and an armed king. Any edge is an escape; the king needs two-sided capture in the field, three attackers beside the empty throne, or four attackers on the throne. See [the published Tablut rules](https://aagenielsen.dk/tablut_regler.php) and [Salmi's corrected translation compared with earlier translations](https://aagenielsen.dk/tablut_translations.php).
- **Tawlbwrdd:** 11×11, twenty-four attackers, twelve defenders and an armed king. Uses the [modern historical reconstruction](https://aagenielsen.dk/historical_hnefatafl_rules.php), including edge escape and throne-dependent king capture. This is a reconstruction of incomplete historical evidence.
- **Hnefatafl:** 11×11, twenty-four attackers, twelve defenders and an armed king. Implements the core of [Copenhagen rules](https://aagenielsen.dk/copenhagen_rules.php): corner escape; four-sided king capture, or three beside the throne; board edges are not hostile; shieldwall captures of two or more soldiers require a complete front and both brackets. Shieldwalls never remove the king. **Exit-fort claims and agreed draws are not automatically adjudicated; this should be labelled Copenhagen core, rather than full tournament rules.**
- **Alea Evangelii:** the app's adapted 19×19 layout and edge-escape game are a modern playable interpretation. The surviving manuscript does not establish a complete playable ruleset or this precise implementation.
- **Circular Fidchell:** a modern connection game inspired by the name and cultural setting. The ancient rules are lost. The square Ballinderry board does not establish the circular layout or connection mechanic used here.

Attackers move first. Soldiers slide orthogonally without jumping. A soldier may cross an empty throne, but cannot stop there. Only corner-escape variants restrict the corner squares. Captures require the opponent to close the trap; voluntarily entering a sandwich is safe. The engine also resolves full encirclement and loss by immobilisation.

A third occurrence of the same position with the same player to move ends the game. Historical/Copenhagen tables award an attacker win, following their defender-loss convention. Brandubh instead penalises the player whose move closes that third occurrence, so either side can lose by repeating. This is the table’s precise convention; arbitration about a player being forced into a cycle is not inferred. Local undo restores one ply in pass-and-play or two plies against the computer, including the correct turn and captured pieces.

## Other games

The Royal Game of Ur uses the popular modern fourteen-square route, seven tokens per player and four binary dice. The visible five rosettes now correspond to engine path indices 3, 7 and 13; the central shared rosette is safe; rosettes award another turn. Exact bearing off is required. The route is an interpretation, not a complete surviving rules document. The [British Museum board record](https://www.britishmuseum.org/collection/object/W_1928-1009-378) documents the surviving twenty-square object and its rosettes.

Petteia, Latrunculorum, Senet, Patolli, Liubo and Mehen remain the app's labelled modern reconstructions or interpretations. No claim is made that their full rules survive. Their move entry points reject out-of-turn, stale or impossible actions where applicable. Race games now honour their configured exact/overshoot bearing-off rule. Senet rolls of 1, 4 and 5 award an extra turn, while its other scholarly formation and exchange rules are not modelled. Bao rejects moves outside its legal choices and preserves seeds if its defensive sowing limit is reached. Mehen rejects unrolled and forged actions.

## Validation

Run `node scripts/test-game-rules.mjs`. The runner uses esbuild (already part of Vite's dependency tree) to compile the pure engines to a temporary directory, runs assertions, then removes that directory. Checks cover variant starts, rook movement, restrictions, escape, king participation/capture, safe voluntary sandwiches, multiple captures, shieldwalls, encirclement, immediate AI wins, Ur path continuity/rosettes/safety/extra turns/bearing off, race overshoot, Senet extra turns, Bao seed conservation through 80 plies, and invalid actions.

## Historical evidence corrections

The six table histories distinguish surviving evidence from modern game design. The [National Museum of Ireland’s Ballinderry record](https://source.museum.ie/en-IE/Collections-Research/Irish-Antiquities-Division-Collections/Collections-List-%281%29/Viking/The-Ballinderry-gaming-board) locates the square, forty-nine-hole board in Co. Westmeath. It does not establish this app’s circular Fidchell rules. The [CELT edition of Tochmarc Étaíne](https://celt.ucc.ie/document/G300012/) provides a primary literary reference to fidchell.

The [holding college’s manuscript catalogue](https://www.ccc.ox.ac.uk/corpus-manuscripts) identifies the Corpus Irish Gospels as Corpus Christi College, Oxford, MS 122, dated 1140–1199. The game diagram and explanation are catalogued on folios 5v and 6 in [Digital Bodleian’s indexed manuscript metadata](https://iiif.biblissima.fr/collections/manifest/c10d265c9e7e483f0f7f687bc46104b78a7eea08). The manuscript’s original place of production is uncertain; the app’s Oxford map marker indicates its present holding institution, not the game’s birthplace. Unsupported Canterbury, Cambridge and bishop attributions have been removed from the short history.
