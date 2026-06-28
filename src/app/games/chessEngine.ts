/**
 * chessEngine.ts
 * Pure chess logic: piece representation, move generation, validation,
 * check / checkmate / stalemate detection, and FEN-like utilities.
 *
 * Board representation:
 *   - 8x8 array of squares, board[row][col] where row 0 is the top (black side)
 *   - Each square is either null or a piece object { type, color }
 *   - type:  'p' | 'n' | 'b' | 'r' | 'q' | 'k'
 *   - color: 'w' | 'b'
 *
 * No React dependencies — pure TypeScript, easy to test and reuse.
 */

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';

export interface Piece {
  type: PieceType;
  color: Color;
}

export type Square = Piece | null;
export type Board = Square[][];

export interface Move {
  from: [number, number];
  to: [number, number];
  piece: Piece;
  captured?: Piece | null;
  promotion?: PieceType;
  isCastle?: 'kingside' | 'queenside';
  isEnPassant?: boolean;
}

export interface GameState {
  board: Board;
  turn: Color;
  castlingRights: {
    w: { k: boolean; q: boolean };
    b: { k: boolean; q: boolean };
  };
  enPassantTarget: [number, number] | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  history: Move[];
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

/** Create the standard starting position. */
export function createInitialBoard(): Board {
  const back: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  const board: Board = Array.from({ length: 8 }, () => Array<Square>(8).fill(null));

  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: back[c], color: 'b' };
    board[1][c] = { type: 'p', color: 'b' };
    board[6][c] = { type: 'p', color: 'w' };
    board[7][c] = { type: back[c], color: 'w' };
  }
  return board;
}

export function createInitialState(): GameState {
  return {
    board: createInitialBoard(),
    turn: 'w',
    castlingRights: {
      w: { k: true, q: true },
      b: { k: true, q: true },
    },
    enPassantTarget: null,
    halfmoveClock: 0,
    fullmoveNumber: 1,
    history: [],
  };
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((sq) => (sq ? { ...sq } : null)));
}

export function cloneState(state: GameState): GameState {
  return {
    board: cloneBoard(state.board),
    turn: state.turn,
    castlingRights: {
      w: { ...state.castlingRights.w },
      b: { ...state.castlingRights.b },
    },
    enPassantTarget: state.enPassantTarget ? [...state.enPassantTarget] as [number, number] : null,
    halfmoveClock: state.halfmoveClock,
    fullmoveNumber: state.fullmoveNumber,
    history: [...state.history],
  };
}

export function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

export function squareToAlgebraic([r, c]: [number, number]): string {
  return `${FILES[c]}${8 - r}`;
}

/** Find the king of a given color. Returns [row, col] or null. */
export function findKing(board: Board, color: Color): [number, number] | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = board[r][c];
      if (sq && sq.type === 'k' && sq.color === color) return [r, c];
    }
  }
  return null;
}

/**
 * Generate "pseudo-legal" moves for a single piece (does not check
 * whether the move leaves own king in check). Used as a building block.
 */
function generatePseudoMovesForPiece(
  state: GameState,
  r: number,
  c: number,
): Move[] {
  const board = state.board;
  const piece = board[r][c];
  if (!piece) return [];
  const moves: Move[] = [];
  const { type, color } = piece;

  const pushMove = (to: [number, number], extra: Partial<Move> = {}) => {
    const captured = board[to[0]][to[1]];
    moves.push({ from: [r, c], to, piece, captured, ...extra });
  };

  const slide = (deltas: [number, number][]) => {
    for (const [dr, dc] of deltas) {
      let nr = r + dr;
      let nc = c + dc;
      while (inBounds(nr, nc)) {
        const target = board[nr][nc];
        if (!target) {
          pushMove([nr, nc]);
        } else {
          if (target.color !== color) pushMove([nr, nc]);
          break;
        }
        nr += dr;
        nc += dc;
      }
    }
  };

  const step = (deltas: [number, number][]) => {
    for (const [dr, dc] of deltas) {
      const nr = r + dr;
      const nc = c + dc;
      if (!inBounds(nr, nc)) continue;
      const target = board[nr][nc];
      if (!target || target.color !== color) pushMove([nr, nc]);
    }
  };

  switch (type) {
    case 'p': {
      const dir = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;
      const promotionRow = color === 'w' ? 0 : 7;

      // Single forward
      if (inBounds(r + dir, c) && !board[r + dir][c]) {
        if (r + dir === promotionRow) {
          for (const promo of ['q', 'r', 'b', 'n'] as PieceType[]) {
            pushMove([r + dir, c], { promotion: promo });
          }
        } else {
          pushMove([r + dir, c]);
        }
        // Double forward from start
        if (r === startRow && !board[r + 2 * dir][c]) {
          pushMove([r + 2 * dir, c]);
        }
      }
      // Captures
      for (const dc of [-1, 1]) {
        const nr = r + dir;
        const nc = c + dc;
        if (!inBounds(nr, nc)) continue;
        const target = board[nr][nc];
        if (target && target.color !== color) {
          if (nr === promotionRow) {
            for (const promo of ['q', 'r', 'b', 'n'] as PieceType[]) {
              pushMove([nr, nc], { promotion: promo });
            }
          } else {
            pushMove([nr, nc]);
          }
        }
        // En passant
        if (
          state.enPassantTarget &&
          state.enPassantTarget[0] === nr &&
          state.enPassantTarget[1] === nc
        ) {
          pushMove([nr, nc], { isEnPassant: true, captured: board[r][nc] });
        }
      }
      break;
    }
    case 'n':
      step([
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ]);
      break;
    case 'b':
      slide([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
      break;
    case 'r':
      slide([[-1, 0], [1, 0], [0, -1], [0, 1]]);
      break;
    case 'q':
      slide([
        [-1, -1], [-1, 1], [1, -1], [1, 1],
        [-1, 0], [1, 0], [0, -1], [0, 1],
      ]);
      break;
    case 'k': {
      step([
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1],
      ]);
      // Castling
      const rights = state.castlingRights[color];
      const homeRow = color === 'w' ? 7 : 0;
      if (r === homeRow && c === 4) {
        // Kingside
        if (rights.k && !board[homeRow][5] && !board[homeRow][6]
            && board[homeRow][7]?.type === 'r' && board[homeRow][7]?.color === color) {
          pushMove([homeRow, 6], { isCastle: 'kingside' });
        }
        // Queenside
        if (rights.q && !board[homeRow][1] && !board[homeRow][2] && !board[homeRow][3]
            && board[homeRow][0]?.type === 'r' && board[homeRow][0]?.color === color) {
          pushMove([homeRow, 2], { isCastle: 'queenside' });
        }
      }
      break;
    }
  }
  return moves;
}

/** Returns true if `color` king is attacked on `board`. */
export function isKingInCheck(board: Board, color: Color): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  const opponent: Color = color === 'w' ? 'b' : 'w';

  // Pawn attacks
  const pawnDir = opponent === 'w' ? -1 : 1; // pawns of opponent that attack us move opposite to their color dir
  for (const dc of [-1, 1]) {
    const pr = kingPos[0] + pawnDir;
    const pc = kingPos[1] + dc;
    if (inBounds(pr, pc)) {
      const p = board[pr][pc];
      if (p && p.color === opponent && p.type === 'p') return true;
    }
  }
  // Knight attacks
  const knightDeltas = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];
  for (const [dr, dc] of knightDeltas) {
    const nr = kingPos[0] + dr;
    const nc = kingPos[1] + dc;
    if (inBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.color === opponent && p.type === 'n') return true;
    }
  }
  // Sliding attacks (bishop/queen diagonals, rook/queen orthogonals)
  const diag: [number, number][] = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  const orth: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of diag) {
    let nr = kingPos[0] + dr;
    let nc = kingPos[1] + dc;
    while (inBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p) {
        if (p.color === opponent && (p.type === 'b' || p.type === 'q')) return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }
  for (const [dr, dc] of orth) {
    let nr = kingPos[0] + dr;
    let nc = kingPos[1] + dc;
    while (inBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p) {
        if (p.color === opponent && (p.type === 'r' || p.type === 'q')) return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }
  // King adjacency
  for (const [dr, dc] of [...diag, ...orth]) {
    const nr = kingPos[0] + dr;
    const nc = kingPos[1] + dc;
    if (inBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.color === opponent && p.type === 'k') return true;
    }
  }
  return false;
}

/** Apply a move to a cloned state and return the new state. */
export function applyMove(state: GameState, move: Move): GameState {
  const next = cloneState(state);
  const board = next.board;
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  const piece = board[fr][fc]!;

  // Move the piece
  board[tr][tc] = move.promotion
    ? { type: move.promotion, color: piece.color }
    : { ...piece };
  board[fr][fc] = null;

  // En passant capture removes the pawn behind
  if (move.isEnPassant) {
    board[fr][tc] = null;
  }

  // Castling: move the rook too
  if (move.isCastle === 'kingside') {
    board[tr][5] = board[tr][7];
    board[tr][7] = null;
  } else if (move.isCastle === 'queenside') {
    board[tr][3] = board[tr][0];
    board[tr][0] = null;
  }

  // Update castling rights
  if (piece.type === 'k') {
    next.castlingRights[piece.color].k = false;
    next.castlingRights[piece.color].q = false;
  }
  if (piece.type === 'r') {
    const homeRow = piece.color === 'w' ? 7 : 0;
    if (fr === homeRow && fc === 0) next.castlingRights[piece.color].q = false;
    if (fr === homeRow && fc === 7) next.castlingRights[piece.color].k = false;
  }
  // Rook captured loses opposite-side castling rights
  if (move.captured && move.captured.type === 'r') {
    const oppColor = move.captured.color;
    const homeRow = oppColor === 'w' ? 7 : 0;
    if (tr === homeRow && tc === 0) next.castlingRights[oppColor].q = false;
    if (tr === homeRow && tc === 7) next.castlingRights[oppColor].k = false;
  }

  // En passant target update (only set when pawn moves two squares)
  if (piece.type === 'p' && Math.abs(tr - fr) === 2) {
    next.enPassantTarget = [(fr + tr) / 2, fc];
  } else {
    next.enPassantTarget = null;
  }

  // Half-move clock
  if (piece.type === 'p' || move.captured) {
    next.halfmoveClock = 0;
  } else {
    next.halfmoveClock += 1;
  }

  // Full move number
  if (state.turn === 'b') next.fullmoveNumber += 1;

  next.turn = state.turn === 'w' ? 'b' : 'w';
  next.history = [...state.history, move];
  return next;
}

/**
 * Generate all legal moves for `color` in the given state.
 * Filters out pseudo-moves that leave own king in check.
 * For castling we also verify the king doesn't pass through attacked squares.
 */
export function generateLegalMoves(state: GameState, color?: Color): Move[] {
  const turn = color ?? state.turn;
  const board = state.board;
  const pseudo: Move[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === turn) {
        pseudo.push(...generatePseudoMovesForPiece(state, r, c));
      }
    }
  }

  const legal: Move[] = [];
  for (const move of pseudo) {
    // For castling, ensure king isn't in check, doesn't pass through check, doesn't end in check.
    if (move.isCastle) {
      if (isKingInCheck(board, turn)) continue;
      const homeRow = turn === 'w' ? 7 : 0;
      const passCol = move.isCastle === 'kingside' ? 5 : 3;
      // Temporarily place king on passCol to test
      const testBoard = cloneBoard(board);
      testBoard[homeRow][4] = null;
      testBoard[homeRow][passCol] = { type: 'k', color: turn };
      if (isKingInCheck(testBoard, turn)) continue;
    }
    const next = applyMove(state, move);
    if (!isKingInCheck(next.board, turn)) {
      legal.push(move);
    }
  }
  return legal;
}

export interface GameStatus {
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  winner: Color | null;
  inCheck: boolean;
}

export function getGameStatus(state: GameState): GameStatus {
  const legal = generateLegalMoves(state);
  const inCheck = isKingInCheck(state.board, state.turn);
  if (legal.length === 0) {
    if (inCheck) {
      return {
        isCheckmate: true,
        isStalemate: false,
        isDraw: false,
        winner: state.turn === 'w' ? 'b' : 'w',
        inCheck: true,
      };
    }
    return {
      isCheckmate: false,
      isStalemate: true,
      isDraw: true,
      winner: null,
      inCheck: false,
    };
  }
  // 50-move rule
  if (state.halfmoveClock >= 100) {
    return { isCheckmate: false, isStalemate: false, isDraw: true, winner: null, inCheck };
  }
  return { isCheckmate: false, isStalemate: false, isDraw: false, winner: null, inCheck };
}

/** Generate legal moves for a specific square (for UI highlighting). */
export function legalMovesFrom(state: GameState, r: number, c: number): Move[] {
  const piece = state.board[r][c];
  if (!piece || piece.color !== state.turn) return [];
  return generateLegalMoves(state, piece.color).filter(
    (m) => m.from[0] === r && m.from[1] === c,
  );
}
