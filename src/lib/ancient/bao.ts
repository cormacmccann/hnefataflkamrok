// Bao la Kiswahili — simplified two-row mancala (a beginner-friendly subset of Bao).
// Full Bao has 4×8 pits with complex relay-capture and the "nyumba" special pit.
// For an approachable playable engine we implement a HUS/BAO-LITE:
//   2 rows × 8 pits (top = Black, bottom = White). 2 seeds per pit at start.
//   On your turn pick one of YOUR pits (your row) with ≥2 seeds, lift its seeds,
//   sow them one-by-one counter-clockwise (your row L→R, opponent row R→L) skipping their store.
//   If last seed lands in YOUR pit with seeds (now ≥2), you continue: lift and sow again.
//   If last seed lands in your pit and the opponent pit directly across has seeds,
//   you CAPTURE all opposing seeds across — they're added to your store.
//   Empty-row defeat: if a player has no seeds anywhere, the other captures the remainder and wins.

export type BaoPlayer = 'white' | 'black';

export interface BaoState {
  // pits[0..7] = white row left→right, pits[8..15] = black row right→left
  pits: number[];
  storeW: number;
  storeB: number;
  turn: BaoPlayer;
  winner: BaoPlayer | null;
  log: string[];
  highlight: number | null; // last sown pit
}

export const PIT_COUNT = 16;

export function initialBaoState(): BaoState {
  return {
    pits: Array(PIT_COUNT).fill(2),
    storeW: 0,
    storeB: 0,
    turn: 'white',
    winner: null,
    log: ['Bao: White begins.'],
    highlight: null,
  };
}

function ownerPits(p: BaoPlayer): number[] {
  return p === 'white' ? [0, 1, 2, 3, 4, 5, 6, 7] : [8, 9, 10, 11, 12, 13, 14, 15];
}

export function legalBaoMoves(state: BaoState, who: BaoPlayer): number[] {
  if (state.winner) return [];
  return ownerPits(who).filter((i) => state.pits[i] >= 2);
}

// Sowing path: CCW. From white's perspective: 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15, then back to 0.
function nextIdx(i: number): number { return (i + 1) % PIT_COUNT; }

function oppositePit(i: number): number {
  // Across: white pit k mirrors black pit (15 - k); black pit k mirrors white pit (15 - k).
  return 15 - i;
}

export function applyBaoMove(state: BaoState, pitIdx: number): BaoState {
  if (state.winner) return state;
  if (!ownerPits(state.turn).includes(pitIdx)) return state;
  let seeds = state.pits[pitIdx];
  if (seeds < 2) return state;

  const pits = [...state.pits];
  let storeW = state.storeW, storeB = state.storeB;
  const log = [...state.log];
  let who = state.turn;
  let last = pitIdx;
  let safety = 200;
  let chainCount = 0;

  // Multi-lap: keep relaying while last seed lands in your pit with seeds (then >=2 after pickup).
  while (safety-- > 0) {
    pits[last] = 0;
    let idx = last;
    while (seeds > 0) {
      idx = nextIdx(idx);
      pits[idx] += 1;
      seeds -= 1;
    }
    last = idx;
    chainCount++;

    const own = ownerPits(who).includes(last);
    if (own && pits[last] >= 2) {
      // Capture check first: if landing in your own pit and the opposite has seeds, capture.
      const opp = oppositePit(last);
      if (pits[opp] > 0 && pits[last] === 1) {
        // (rule variant) capture happens when last seed makes count = 1 in your empty pit
        // Already handled below; skip relay
      }
      // Relay: pick up and continue sowing.
      seeds = pits[last];
      continue;
    }
    if (own && pits[last] === 1) {
      const opp = oppositePit(last);
      if (pits[opp] > 0) {
        const captured = pits[opp] + 1;
        pits[opp] = 0;
        pits[last] = 0;
        if (who === 'white') storeW += captured;
        else storeB += captured;
        log.push(`${who === 'white' ? 'White' : 'Black'} captures ${captured} seeds across pit ${last}.`);
      }
    }
    break;
  }

  log.push(`${who === 'white' ? 'White' : 'Black'} sowed from pit ${pitIdx + 1}${chainCount > 1 ? ` (×${chainCount} relays)` : ''}.`);

  // End condition: a player's row is empty.
  const whiteHas = ownerPits('white').some((i) => pits[i] > 0);
  const blackHas = ownerPits('black').some((i) => pits[i] > 0);
  let winner: BaoPlayer | null = null;
  if (!whiteHas || !blackHas) {
    // Sweep remaining to opponent's store.
    if (!whiteHas) storeB += ownerPits('black').reduce((s, i) => s + pits[i], 0);
    if (!blackHas) storeW += ownerPits('white').reduce((s, i) => s + pits[i], 0);
    ownerPits('white').forEach((i) => { pits[i] = 0; });
    ownerPits('black').forEach((i) => { pits[i] = 0; });
    if (storeW > storeB) winner = 'white';
    else if (storeB > storeW) winner = 'black';
    else winner = who; // tie-breaker: current mover
    log.push(`Game ends. White ${storeW} – Black ${storeB}. ${winner === 'white' ? 'White' : 'Black'} wins.`);
  }

  const nextTurn = who === 'white' ? 'black' : 'white';

  return {
    pits,
    storeW,
    storeB,
    turn: winner ? who : nextTurn,
    winner,
    log,
    highlight: last,
  };
}

export function chooseAIBaoMove(state: BaoState): number | null {
  const moves = legalBaoMoves(state, state.turn);
  if (!moves.length) return null;
  let best = moves[0]; let bestScore = -Infinity;
  for (const m of moves) {
    const after = applyBaoMove(state, m);
    const myStore = state.turn === 'white' ? after.storeW - state.storeW : after.storeB - state.storeB;
    const oppStore = state.turn === 'white' ? after.storeB - state.storeB : after.storeW - state.storeW;
    let score = myStore * 10 - oppStore * 8;
    if (after.winner === state.turn) score += 1000;
    if (after.winner && after.winner !== state.turn) score -= 1000;
    if (Math.random() < 0.06) score += Math.random() * 3;
    if (score > bestScore) { bestScore = score; best = m; }
  }
  return best;
}
