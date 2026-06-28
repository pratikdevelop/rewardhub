/**
 * ChessGame.tsx
 * Full chess game screen: 8x8 board, drag-free tap-to-move interaction,
 * legal-move highlighting, check / checkmate / stalemate detection,
 * AI opponent (minimax + alpha-beta pruning), difficulty selector,
 * move history, captured-pieces display, undo, and new-game controls.
 *
 * Drop-in usage:
 *   import ChessGame from './ChessGame';
 *   <ChessGame />
 *
 * The AI runs in a setTimeout so the UI thread can render the "thinking..."
 * state before the (synchronous) search starts. For stronger play you can
 * move findBestMove into a Web Worker / Worker thread on platforms that
 * support it.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Difficulty, findBestMove } from './chessAI';
import {
  applyMove,
  Color,
  createInitialState,
  findKing,
  GameState,
  getGameStatus,
  legalMovesFrom,
  Move,
  squareToAlgebraic
} from './chessEngine';
import PieceView from './ChessPieces';

const { width } = Dimensions.get('window');

const DIFFICULTIES: { key: Difficulty; label: string; desc: string }[] = [
  { key: 'easy', label: 'Easy', desc: 'Beginner-friendly, depth 1' },
  { key: 'medium', label: 'Medium', desc: 'Casual play, depth 2' },
  { key: 'hard', label: 'Hard', desc: 'Strong play, depth 3' },
  { key: 'expert', label: 'Expert', desc: 'Tough opponent, depth 4' },
];

interface CapturedCount {
  w: Partial<Record<string, number>>;
  b: Partial<Record<string, number>>;
}

export default function ChessGame() {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [legalForSelected, setLegalForSelected] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [aiThinking, setAiThinking] = useState(false);
  const [history, setHistory] = useState<GameState[]>([]);
  const [status, setStatus] = useState(() => getGameStatus(state));
  const boardSize = Math.min(width - 24, 420);
  const squareSize = boardSize / 8;
  const aiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recompute game status whenever state changes
  useEffect(() => {
    setStatus(getGameStatus(state));
  }, [state]);

  // Trigger AI when it's the AI's turn
  useEffect(() => {
    if (status.isCheckmate || status.isStalemate || status.isDraw) return;
    if (state.turn !== playerColor && !aiThinking) {
      setAiThinking(true);
      aiTimer.current = setTimeout(() => {
        const result = findBestMove(state, difficulty);
        if (result.move) {
          setState((prev) => applyMove(prev, result.move!));
          setLastMove(result.move);
        }
        setAiThinking(false);
      }, 300);
    }
    return () => {
      if (aiTimer.current) clearTimeout(aiTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, playerColor, difficulty]);

  const captured = useMemo<CapturedCount>(() => {
    const count: CapturedCount = { w: {}, b: {} };
    for (const move of state.history) {
      if (move.captured) {
        const taker = move.piece.color;
        const taken: any = move.captured.color;
        count[taker][taken.type === 'p' ? 'p' : taken.type] =
          (count[taker][taken.type] || 0) + 1;
      }
    }
    return count;
  }, [state.history]);

  const moveHistory = useMemo(
    () =>
      state.history.map((m, i) => {
        const from = squareToAlgebraic(m.from);
        const to = squareToAlgebraic(m.to);
        const promo = m.promotion ? m.promotion.toUpperCase() : '';
        const castle = m.isCastle === 'kingside' ? 'O-O' : m.isCastle === 'queenside' ? 'O-O-O' : null;
        const san = castle ? castle : `${from}-${to}${promo ? '=' + promo : ''}`;
        return { num: Math.floor(i / 2) + 1, color: m.piece.color, san };
      }),
    [state.history],
  );

  const onSquarePress = useCallback(
    (r: number, c: number) => {
      if (aiThinking) return;
      if (status.isCheckmate || status.isStalemate || status.isDraw) return;
      if (state.turn !== playerColor) return;

      const piece = state.board[r][c];

      // If a square is already selected, try to move there
      if (selected) {
        // Click same square = deselect
        if (selected[0] === r && selected[1] === c) {
          setSelected(null);
          setLegalForSelected([]);
          return;
        }
        // Click another own piece = reselect
        if (piece && piece.color === playerColor) {
          setSelected([r, c]);
          setLegalForSelected(legalMovesFrom(state, r, c));
          return;
        }
        // Try to move
        const move = legalForSelected.find(
          (m) => m.to[0] === r && m.to[1] === c,
        );
        if (move) {
          // Handle promotion (default to queen for simplicity)
          const moveToApply: Move = move.promotion
            ? { ...move, promotion: 'q' }
            : move;
          setHistory((h) => [...h, state]);
          setState((prev) => applyMove(prev, moveToApply));
          setLastMove(moveToApply);
          setSelected(null);
          setLegalForSelected([]);
        } else {
          // Invalid target — clear selection
          setSelected(null);
          setLegalForSelected([]);
        }
        return;
      }

      // No selection yet: select own piece
      if (piece && piece.color === playerColor) {
        setSelected([r, c]);
        setLegalForSelected(legalMovesFrom(state, r, c));
      }
    },
    [aiThinking, status, state, playerColor, selected, legalForSelected],
  );

  const newGame = useCallback((color: Color = playerColor) => {
    if (aiTimer.current) clearTimeout(aiTimer.current);
    setHistory([]);
    setSelected(null);
    setLegalForSelected([]);
    setLastMove(null);
    setAiThinking(false);
    setPlayerColor(color);
    setState(createInitialState());
  }, [playerColor]);

  const undo = useCallback(() => {
    if (aiThinking) return;
    if (history.length === 0) return;
    // Undo two plies (player + AI) so it's the player's turn again.
    const steps = history.length >= 2 ? 2 : 1;
    const newHistory = history.slice(0, history.length - steps);
    const restored = newHistory.length > 0
      ? newHistory[newHistory.length - 1]
      : createInitialState();
    setState(restored);
    setHistory(newHistory);
    setSelected(null);
    setLegalForSelected([]);
    setLastMove(null);
  }, [aiThinking, history]);

  const resign = useCallback(() => {
    Alert.alert(
      'Resign?',
      `You will lose to the ${difficulty} AI.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resign',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Game Over', `You resigned. AI (${difficulty}) wins.`),
        },
      ],
    );
  }, [difficulty]);

  const isAiTurn = state.turn !== playerColor && !status.isCheckmate && !status.isStalemate;
  const aiColor: Color = playerColor === 'w' ? 'b' : 'w';
  const kingInCheckPos = useMemo<[number, number] | null>(() => {
    if (!status.inCheck) return null;
    return findKing(state.board, state.turn);
  }, [status.inCheck, state]);

  const renderSquare = (r: number, c: number) => {
    const isLight = (r + c) % 2 === 0;
    const piece = state.board[r][c];
    const isSelected = selected && selected[0] === r && selected[1] === c;
    const isLegalTarget = legalForSelected.some((m) => m.to[0] === r && m.to[1] === c);
    const isCapture = isLegalTarget && piece;
    const isLastMove =
      lastMove &&
      ((lastMove.from[0] === r && lastMove.from[1] === c) ||
        (lastMove.to[0] === r && lastMove.to[1] === c));
    const isCheckSquare = kingInCheckPos && kingInCheckPos[0] === r && kingInCheckPos[1] === c;

    // Flip the visual board if player is black
    const visualR = playerColor === 'w' ? r : 7 - r;
    const visualC = playerColor === 'w' ? c : 7 - c;

    let bg = isLight ? '#F0D9B5' : '#B58863';
    if (isLastMove) bg = isLight ? '#F7EC74' : '#DAC34B';
    if (isSelected) bg = isLight ? '#A7C6E8' : '#7A9BC2';

    return (
      <TouchableOpacity
        key={`${visualR}-${visualC}`}
        activeOpacity={0.7}
        onPress={() => onSquarePress(r, c)}
        style={[
          styles.square,
          {
            width: squareSize,
            height: squareSize,
            backgroundColor: bg,
          },
          isCheckSquare && styles.checkSquare,
        ]}
      >
        {/* Coordinate labels on edges */}
        {visualC === 0 && (
          <Text style={[styles.coord, styles.coordFile, { color: isLight ? '#B58863' : '#F0D9B5' }]}>
            {8 - visualR}
          </Text>
        )}
        {visualR === 7 && (
          <Text style={[styles.coord, styles.coordRank, { color: isLight ? '#B58863' : '#F0D9B5' }]}>
            {String.fromCharCode(97 + visualC)}
          </Text>
        )}

        {piece && <PieceView piece={piece} size={squareSize} />}

        {isLegalTarget && !isCapture && (
          <View style={[styles.legalDot, { width: squareSize * 0.3, height: squareSize * 0.3, borderRadius: squareSize * 0.15 }]} />
        )}
        {isLegalTarget && isCapture && (
          <View style={[styles.legalRing, { width: squareSize * 0.85, height: squareSize * 0.85, borderRadius: squareSize * 0.425 }]} />
        )}
      </TouchableOpacity>
    );
  };

  const renderBoard = () => {
    const rows = [];
    // We always render from the player's perspective
    for (let visualR = 0; visualR < 8; visualR++) {
      const row = [];
      for (let visualC = 0; visualC < 8; visualC++) {
        const r = playerColor === 'w' ? visualR : 7 - visualR;
        const c = playerColor === 'w' ? visualC : 7 - visualC;
        row.push(renderSquare(r, c));
      }
      rows.push(
        <View key={visualR} style={styles.row}>
          {row}
        </View>,
      );
    }
    return <View style={[styles.board, { width: boardSize, height: boardSize }]}>{rows}</View>;
  };

  const renderCapturedRow = (color: Color) => {
    const taken: Partial<Record<string, number>> = captured[color];
    const entries = Object.entries(taken).sort(
      (a, b) => PIECE_DISPLAY_ORDER.indexOf(a[0]) - PIECE_DISPLAY_ORDER.indexOf(b[0]),
    );
    return (
      <View style={styles.capturedRow}>
        {entries.map(([type, n]) =>
          Array.from({ length: n as number }).map((_, i) => (
            <Text
              key={`${type}-${i}`}
              style={[
                styles.capturedGlyph,
                { color: color === 'w' ? '#1F2937' : '#FFFFFF' },
              ]}
            >
              {GLYPH[type as keyof typeof GLYPH]}
            </Text>
          )),
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Chess vs Computer</Text>
          <Text style={styles.subtitle}>
            Difficulty: <Text style={styles.subtitleBold}>{DIFFICULTIES.find((d) => d.key === difficulty)?.label}</Text>
            {'  •  '}
            You play: <Text style={styles.subtitleBold}>{playerColor === 'w' ? 'White' : 'Black'}</Text>
          </Text>
        </View>

        {/* Top player = AI */}
        <View style={styles.playerBar}>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>Computer ({aiColor === 'w' ? 'White' : 'Black'})</Text>
            {aiThinking ? (
              <View style={styles.thinkingRow}>
                <ActivityIndicator size="small" color="#4F46E5" />
                <Text style={styles.thinkingText}>Thinking…</Text>
              </View>
            ) : (
              <Text style={styles.playerStatus}>
                {isAiTurn ? 'To move' : 'Waiting'}
              </Text>
            )}
          </View>
          {renderCapturedRow(aiColor)}
        </View>

        {/* Board */}
        <View style={styles.boardWrap}>{renderBoard()}</View>

        {/* Bottom player = human */}
        <View style={styles.playerBar}>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>You ({playerColor === 'w' ? 'White' : 'Black'})</Text>
            <Text style={styles.playerStatus}>
              {status.isCheckmate && status.winner === playerColor
                ? 'You won!'
                : status.isCheckmate
                  ? 'Checkmate'
                  : status.isStalemate
                    ? 'Stalemate'
                    : status.inCheck && state.turn === playerColor
                      ? 'In check!'
                      : state.turn === playerColor
                        ? 'Your move'
                        : 'Waiting'}
            </Text>
          </View>
          {renderCapturedRow(playerColor)}
        </View>

        {/* Status banner */}
        {(status.isCheckmate || status.isStalemate || status.isDraw) && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              {status.isCheckmate
                ? status.winner === playerColor
                  ? 'You won by checkmate!'
                  : 'Computer won by checkmate.'
                : status.isStalemate
                  ? 'Stalemate — draw.'
                  : 'Draw (50-move rule).'}
            </Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.btn} onPress={() => newGame(playerColor)}>
            <Text style={styles.btnText}>New Game</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary, history.length === 0 && styles.btnDisabled]}
            onPress={undo}
            disabled={history.length === 0 || aiThinking}
          >
            <Text style={styles.btnText}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={resign}>
            <Text style={styles.btnText}>Resign</Text>
          </TouchableOpacity>
        </View>

        {/* Color choice */}
        <View style={styles.controlsRow}>
          <Text style={styles.sectionLabel}>Play as:</Text>
          <TouchableOpacity
            style={[styles.chip, playerColor === 'w' && styles.chipActive]}
            onPress={() => newGame('w')}
          >
            <Text style={[styles.chipText, playerColor === 'w' && styles.chipTextActive]}>White</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, playerColor === 'b' && styles.chipActive]}
            onPress={() => newGame('b')}
          >
            <Text style={[styles.chipText, playerColor === 'b' && styles.chipTextActive]}>Black</Text>
          </TouchableOpacity>
        </View>

        {/* Difficulty chips */}
        <View style={styles.controlsRow}>
          <Text style={styles.sectionLabel}>AI strength:</Text>
          {DIFFICULTIES.map((d) => (
            <TouchableOpacity
              key={d.key}
              style={[styles.chip, difficulty === d.key && styles.chipActive]}
              onPress={() => setDifficulty(d.key)}
            >
              <Text style={[styles.chipText, difficulty === d.key && styles.chipTextActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Move history */}
        <View style={styles.historyBox}>
          <Text style={styles.historyTitle}>Moves</Text>
          <View style={styles.historyGrid}>
            {moveHistory.length === 0 ? (
              <Text style={styles.historyEmpty}>No moves yet. Make your first move!</Text>
            ) : (
              Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => {
                const w = moveHistory[i * 2];
                const b = moveHistory[i * 2 + 1];
                return (
                  <View key={i} style={styles.historyRow}>
                    <Text style={styles.historyNum}>{i + 1}.</Text>
                    <Text style={styles.historyMove}>{w?.san}</Text>
                    <Text style={styles.historyMove}>{b?.san ?? ''}</Text>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const PIECE_DISPLAY_ORDER = ['q', 'r', 'b', 'n', 'p'];
const GLYPH: Record<string, string> = {
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scroll: {
    padding: 12,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
    marginTop: Platform.OS === 'android' ? 8 : 0,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  subtitleBold: {
    fontWeight: '700',
    color: '#1F2937',
  },
  playerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  playerInfo: {
    flexDirection: 'column',
  },
  playerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  playerStatus: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  thinkingText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  boardWrap: {
    padding: 8,
    backgroundColor: '#3B2A1E',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  board: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  square: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  coord: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '700',
    opacity: 0.7,
  },
  coordFile: {
    top: 2,
    left: 3,
  },
  coordRank: {
    bottom: 2,
    right: 3,
  },
  legalDot: {
    backgroundColor: 'rgba(31, 41, 55, 0.35)',
    position: 'absolute',
  },
  legalRing: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: 'rgba(31, 41, 55, 0.45)',
    backgroundColor: 'transparent',
  },
  checkSquare: {
    backgroundColor: '#EF4444',
  },
  capturedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 160,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capturedGlyph: {
    fontSize: 18,
    marginLeft: -2,
  },
  banner: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#1F2937',
    borderRadius: 8,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    maxWidth: 420,
    width: '100%',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginRight: 4,
  },
  btn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  btnSecondary: {
    backgroundColor: '#6B7280',
  },
  btnDanger: {
    backgroundColor: '#DC2626',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#4F46E5',
  },
  chipText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  historyBox: {
    marginTop: 16,
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  historyGrid: {
    flexDirection: 'column',
  },
  historyRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyNum: {
    width: 30,
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  historyMove: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  historyEmpty: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});
