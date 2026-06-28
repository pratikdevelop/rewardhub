/**
 * chessAI.ts
 * Minimax with alpha-beta pruning chess AI.
 *
 * Difficulty is controlled by:
 *   - search depth (1 = easy / shallow, 4 = strong)
 *   - random move probability from a pool of top-N candidate moves
 *
 * The evaluator combines material, piece-square tables, mobility, and
 * simple king safety. Strong enough to beat casual players at depth 3+,
 * but still fast enough to run on-device without blocking the UI thread
 * for long at depth <= 3.
 */

import {
  GameState,
  Move,
  Color,
  applyMove,
  generateLegalMoves,
  isKingInCheck,
} from './chessEngine';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

const DEPTH: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4,
};

const RANDOMNESS: Record<Difficulty, number> = {
  easy: 0.45, // 45% chance to pick a random top-3 move
  medium: 0.15,
  hard: 0.05,
  expert: 0,
};

// Material values (centipawns)
const PIECE_VALUE: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-square tables (from white's perspective, row 0 = black back rank).
// Encourage knights to center, bishops to long diagonals, etc.
const PST_PAWN = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];
const PST_KNIGHT = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];
const PST_BISHOP = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];
const PST_ROOK = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];
const PST_QUEEN = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];
const PST_KING = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

const PST: Record<string, number[][]> = {
  p: PST_PAWN,
  n: PST_KNIGHT,
  b: PST_BISHOP,
  r: PST_ROOK,
  q: PST_QUEEN,
  k: PST_KING,
};

/**
 * Evaluate the position from the perspective of `side`.
 * Positive = good for `side`, negative = bad.
 */
function evaluate(state: GameState, side: Color): number {
  let score = 0;
  const board = state.board;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const table = PST[p.type];
      // For white pieces use table as-is, for black mirror vertically.
      const pstVal = p.color === 'w' ? table[r][c] : table[7 - r][c];
      const val = PIECE_VALUE[p.type] + pstVal;
      score += p.color === side ? val : -val;
    }
  }
  // Small mobility bonus
  const myMoves = generateLegalMoves(state, side).length;
  const oppMoves = generateLegalMoves(state, side === 'w' ? 'b' : 'w').length;
  score += (myMoves - oppMoves) * 2;
  return score;
}

/** Order moves to make alpha-beta pruning more effective: captures first. */
function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => {
    const av = a.captured ? PIECE_VALUE[a.captured.type] - PIECE_VALUE[a.piece.type] / 10 : 0;
    const bv = b.captured ? PIECE_VALUE[b.captured.type] - PIECE_VALUE[b.piece.type] / 10 : 0;
    return bv - av;
  });
}

/**
 * Negamax with alpha-beta pruning.
 * Returns the score from the perspective of the side to move.
 */
function negamax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  side: Color,
): number {
  const moves = generateLegalMoves(state);
  if (moves.length === 0) {
    if (isKingInCheck(state.board, state.turn)) {
      // Checkmate: very bad for side to move. Prefer faster mates.
      return -100000 + (1000 - depth);
    }
    return 0; // Stalemate
  }
  if (depth === 0) {
    // Evaluate from the perspective of `side` (the side to move at root).
    const evalSide = state.turn === side ? side : side;
    return evaluate(state, evalSide) * (state.turn === side ? 1 : -1);
  }

  let best = -Infinity;
  for (const move of orderMoves(moves)) {
    const next = applyMove(state, move);
    const score = -negamax(next, depth - 1, -beta, -alpha, side);
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

export interface AIResult {
  move: Move | null;
  score: number;
  candidatesConsidered: number;
}

/**
 * Pick the best move for the side to move using minimax + alpha-beta.
 * Adds controlled randomness on lower difficulties so it isn't deterministic.
 */
export function findBestMove(state: GameState, difficulty: Difficulty = 'medium'): AIResult {
  const moves = generateLegalMoves(state);
  if (moves.length === 0) return { move: null, score: 0, candidatesConsidered: 0 };

  const depth = DEPTH[difficulty];
  const side = state.turn;
  const scored: { move: Move; score: number }[] = [];

  for (const move of orderMoves(moves)) {
    const next = applyMove(state, move);
    const score = -negamax(next, depth - 1, -Infinity, Infinity, side);
    scored.push({ move, score });
  }

  scored.sort((a, b) => b.score - a.score);

  // Add randomness: on easy/medium, sometimes pick a random move from top-N.
  const rand = Math.random();
  if (rand < RANDOMNESS[difficulty]) {
    const topN = difficulty === 'easy' ? 3 : 2;
    const pool = scored.slice(0, Math.min(topN, scored.length));
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return { move: pick.move, score: pick.score, candidatesConsidered: moves.length };
  }

  return { move: scored[0].move, score: scored[0].score, candidatesConsidered: moves.length };
}
