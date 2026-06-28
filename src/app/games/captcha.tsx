// import { useRouter } from 'expo-router';
// import { useCallback, useState } from 'react';
// import {
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import AdModal from '../../components/AdModal';
// import { COLORS, RADIUS, SIZES, SPACING } from '../../constants/theme';
// import { useAuth } from '../../context/AuthContext';
// import { useAdGate } from '../../hooks/useAdGate';

// const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
// const makeCode = (len = 5) =>
//   Array.from({ length: len }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');

// // Per-character style for distortion effect
// const CHAR_COLORS   = ['#f5a623', '#22c55e', '#a855f7', '#3b82f6', '#ef4444'];
// const CHAR_ROTATIONS = [-12, 8, -6, 10, -8];

// export default function CaptchaScreen() {
//   const { addCoins } = useAuth();
//   const router       = useRouter();

//   const [code,    setCode]    = useState(makeCode);
//   const [input,   setInput]   = useState('');
//   const [result,  setResult]  = useState('');
//   const [correct, setCorrect] = useState(false);
//   const [streak,  setStreak]  = useState(0);

//   const resetGame = useCallback(() => {
//     setCode(makeCode());
//     setInput('');
//     setResult('');
//     setCorrect(false);
//   }, []);

//   const { adVisible, requestPlayAgain, onAdClose } = useAdGate(resetGame);

//   const handleSubmit = () => {
//     if (input.trim().toUpperCase() === code) {
//       const earned = 5;
//       addCoins(earned);
//       setStreak(s => s + 1);
//       setResult(`✅ Correct! +${earned} coins earned!`);
//       setCorrect(true);
//     } else {
//       setStreak(0);
//       setResult('❌ Wrong code. New one generated!');
//       setCode(makeCode());
//       setInput('');
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
//           <Text style={styles.backText}>‹  Back</Text>
//         </TouchableOpacity>
//         <Text style={styles.title}>🔐  Captcha Task</Text>
//         <View style={{ width: 64 }} />
//       </View>

//       <Text style={styles.sub}>Type the code exactly to earn 5 coins!</Text>

//       {streak > 0 && (
//         <View style={styles.streakBadge}>
//           <Text style={styles.streakText}>🔥 Streak: {streak}</Text>
//         </View>
//       )}

//       {/* Captcha display */}
//       <View style={styles.captchaBox}>
//         {/* Noise lines */}
//         <View style={[styles.noiseLine, { top: '25%', transform: [{ rotate: '-4deg' }] }]} />
//         <View style={[styles.noiseLine, { top: '65%', transform: [{ rotate: '3deg' }] }]} />
//         <View style={styles.charRow}>
//           {code.split('').map((ch, i) => (
//             <Text
//               key={i}
//               style={[
//                 styles.codeChar,
//                 {
//                   color: CHAR_COLORS[i % CHAR_COLORS.length],
//                   transform: [{ rotate: `${CHAR_ROTATIONS[i]}deg` }, { translateY: i % 2 === 0 ? -5 : 5 }],
//                 },
//               ]}
//             >
//               {ch}
//             </Text>
//           ))}
//         </View>
//       </View>

//       <TouchableOpacity onPress={resetGame} style={styles.refreshRow}>
//         <Text style={styles.refreshText}>🔄  Refresh code</Text>
//       </TouchableOpacity>

//       {/* Input */}
//       <TextInput
//         style={styles.input}
//         value={input}
//         onChangeText={t => setInput(t.toUpperCase())}
//         placeholder="Enter code here"
//         placeholderTextColor={COLORS.textHint}
//         autoCapitalize="characters"
//         maxLength={5}
//         returnKeyType="done"
//         onSubmitEditing={handleSubmit}
//         editable={!correct}
//       />

//       {/* Result */}
//       {result !== '' && (
//         <Text style={[styles.result, correct ? styles.win : styles.error]}>{result}</Text>
//       )}

//       {!correct ? (
//         <TouchableOpacity
//           style={[styles.submitBtn, input.length < 5 && styles.disabled]}
//           onPress={handleSubmit}
//           disabled={input.length < 5}
//         >
//           <Text style={styles.submitText}>Submit & Earn  💰</Text>
//         </TouchableOpacity>
//       ) : (
//         <TouchableOpacity style={styles.againBtn} onPress={requestPlayAgain}>
//           <Text style={styles.againText}>🔄  New Captcha (Watch Ad)</Text>
//         </TouchableOpacity>
//       )}

//       <AdModal visible={adVisible} onClose={onAdClose} />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe:    { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', paddingHorizontal: SPACING.xl },
//   header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingTop: SPACING.md, marginBottom: SPACING.sm },
//   backBtn: { padding: SPACING.sm },
//   backText:{ color: COLORS.primary, fontSize: SIZES.lg },
//   title:   { color: COLORS.white, fontSize: SIZES.xl, fontWeight: '700' },
//   sub:     { color: COLORS.textMuted, fontSize: SIZES.sm, marginBottom: SPACING.lg, textAlign: 'center' },

//   streakBadge: { backgroundColor: 'rgba(245,166,35,0.15)', borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.gold, marginBottom: SPACING.lg },
//   streakText:  { color: COLORS.gold, fontWeight: '700', fontSize: SIZES.sm },

//   captchaBox: {
//     width: '100%', height: 100,
//     backgroundColor: COLORS.bgInput,
//     borderRadius: RADIUS.lg,
//     alignItems: 'center', justifyContent: 'center',
//     marginBottom: SPACING.md,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   noiseLine: {
//     position: 'absolute', width: '130%', height: 1.5,
//     backgroundColor: 'rgba(255,255,255,0.08)',
//   },
//   charRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   codeChar: { fontSize: 34, fontWeight: '900', fontFamily: 'monospace' },

//   refreshRow: { marginBottom: SPACING.xl },
//   refreshText:{ color: COLORS.primary, fontSize: SIZES.sm },

//   input: {
//     width: '100%',
//     backgroundColor: COLORS.bgInput,
//     borderRadius: RADIUS.md,
//     height: 56, paddingHorizontal: SPACING.lg,
//     color: COLORS.white, fontSize: SIZES.xxl,
//     textAlign: 'center', letterSpacing: 10,
//     borderWidth: 1, borderColor: 'rgba(124,92,191,0.4)',
//     marginBottom: SPACING.md, fontWeight: '700',
//   },

//   result: { fontSize: SIZES.md, fontWeight: '600', marginBottom: SPACING.lg, textAlign: 'center' },
//   win:    { color: COLORS.success },
//   error:  { color: COLORS.error },

//   submitBtn:  { backgroundColor: COLORS.captcha, borderRadius: RADIUS.lg, paddingVertical: 14, paddingHorizontal: 48, width: '100%', alignItems: 'center' },
//   submitText: { color: COLORS.white, fontSize: SIZES.md, fontWeight: '700' },
//   disabled:   { opacity: 0.4 },

//   againBtn: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, paddingVertical: 14, paddingHorizontal: 36, borderWidth: 1.5, borderColor: COLORS.captcha, width: '100%', alignItems: 'center' },
//   againText: { color: COLORS.captcha, fontSize: SIZES.md, fontWeight: '600' },
// });


import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import {
  Alert,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// --- TYPES ---
type CellState = 'hidden' | 'revealed' | 'flagged';
type CellContent = 'empty' | 'number' | 'bomb' | 'gem';

interface Cell {
  state: CellState;
  content: CellContent;
  value: number; // 1-8 for numbers
}

type GameStatus = 'playing' | 'won' | 'lost';

// --- CONSTANTS ---
const GRID_SIZE = 6;
const TOTAL_BOMBS = 5;
const TOTAL_GEMS = 5;

const NUMBER_COLORS: Record<number, string> = {
  1: '#3498db',
  2: '#27ae60',
  3: '#e74c3c',
  4: '#8e44ad',
  5: '#c0392b',
  6: '#16a085',
  7: '#2c3e50',
  8: '#7f8c8d',
};

// --- HELPERS ---
const createEmptyGrid = (): Cell[][] =>
  Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      state: 'hidden' as CellState,
      content: 'empty' as CellContent,
      value: 0,
    }))
  );

const placeMinesAndGems = (grid: Cell[][], safeRow: number, safeCol: number): Cell[][] => {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  let bombsPlaced = 0;
  let gemsPlaced = 0;

  while (bombsPlaced < TOTAL_BOMBS || gemsPlaced < TOTAL_GEMS) {
    const r = Math.floor(Math.random() * GRID_SIZE);
    const c = Math.floor(Math.random() * GRID_SIZE);

    // Don't place on first tap or already occupied
    if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) continue;
    if (newGrid[r][c].content !== 'empty') continue;

    if (bombsPlaced < TOTAL_BOMBS) {
      newGrid[r][c].content = 'bomb';
      bombsPlaced++;
    } else {
      newGrid[r][c].content = 'gem';
      gemsPlaced++;
    }
  }

  // Calculate numbers
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (newGrid[r][c].content === 'bomb') continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            if (newGrid[nr][nc].content === 'bomb') count++;
          }
        }
      }
      if (count > 0) {
        newGrid[r][c].content = 'number';
        newGrid[r][c].value = count;
      }
    }
  }

  return newGrid;
};

const revealEmptyCells = (grid: Cell[][], row: number, col: number): Cell[][] => {
  const newGrid = grid.map(r => r.map(c => ({ ...c })));
  const stack: [number, number][] = [[row, col]];

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) continue;
    if (newGrid[r][c].state !== 'hidden') continue;
    if (newGrid[r][c].content === 'bomb' || newGrid[r][c].content === 'gem') continue;

    newGrid[r][c].state = 'revealed';

    if (newGrid[r][c].content === 'empty') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) stack.push([r + dr, c + dc]);
        }
      }
    }
  }

  return newGrid;
};

// --- INSTRUCTIONS POPUP ---
const InstructionsPopup = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => (
  <Modal visible={visible} animationType="fade" transparent>
    <View style={popupStyles.overlay}>
      <View style={popupStyles.container}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?q=80&w=800&auto=format&fit=crop' }} // Abstract geo pattern
          style={popupStyles.imageBg}
          imageStyle={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
        >
          <View style={popupStyles.imageOverlay}>
            <Text style={popupStyles.title}>MINE SWEEPER</Text>
            <Text style={popupStyles.subtitle}>FIND THE GEMS</Text>
          </View>
        </ImageBackground>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={popupStyles.content}>
          <View style={popupStyles.ruleRow}>
            <Text style={popupStyles.ruleIcon}>💎</Text>
            <Text style={popupStyles.ruleText}>Find all 5 hidden gems to win the round!</Text>
          </View>

          <View style={popupStyles.ruleRow}>
            <Text style={popupStyles.ruleIcon}>💣</Text>
            <Text style={popupStyles.ruleText}>Tap a bomb and it's game over.</Text>
          </View>

          <View style={popupStyles.ruleRow}>
            <Text style={popupStyles.ruleIcon}>🔢</Text>
            <Text style={popupStyles.ruleText}>Numbers tell you how many bombs are touching that tile.</Text>
          </View>

          <View style={popupStyles.ruleRow}>
            <Text style={popupStyles.ruleIcon}>🚩</Text>
            <Text style={popupStyles.ruleText}>Long-press a tile to flag it if you think it's a bomb.</Text>
          </View>

          <TouchableOpacity
            style={popupStyles.button}
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onClose();
            }}
          >
            <Text style={popupStyles.buttonText}>START MINING</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const popupStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(46, 213, 115, 0.4)',
  },
  imageBg: {
    width: '100%',
    height: 160,
    justifyContent: 'flex-end',
  },
  imageOverlay: {
    backgroundColor: 'rgba(10,10,20,0.75)',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    color: '#2ed573',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
  },
  subtitle: {
    color: '#dfe6e9',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    padding: 24,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 15,
  },
  ruleIcon: {
    fontSize: 22,
    width: 30,
    textAlign: 'center',
  },
  ruleText: {
    color: '#dfe6e9',
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#2ed573',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2ed573',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#0a0a14',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
});

// --- MAIN SCREEN ---
export default function MineSweeper() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [grid, setGrid] = useState<Cell[][]>(createEmptyGrid());
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [gemsFound, setGemsFound] = useState(0);
  const [isFirstTap, setIsFirstTap] = useState(true);

  const resetGame = useCallback(() => {
    setGrid(createEmptyGrid());
    setGameStatus('playing');
    setGemsFound(0);
    setIsFirstTap(true);
  }, []);

  const checkWinCondition = (currentGrid: Cell[][]) => {
    let found = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentGrid[r][c].content === 'gem' && currentGrid[r][c].state === 'revealed') {
          found++;
        }
      }
    }
    setGemsFound(found);
    if (found === TOTAL_GEMS) {
      setGameStatus('won');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        Alert.alert('JACKPOT!', `You found all ${TOTAL_GEMS} gems safely!`, [
          { text: 'PLAY AGAIN', onPress: resetGame },
        ]);
      }, 300);
    }
  };

  const handlePress = (row: number, col: number) => {
    if (gameStatus !== 'playing') return;
    const cell = grid[row][col];
    if (cell.state === 'revealed' || cell.state === 'flagged') return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let currentGrid = grid.map(r => r.map(c => ({ ...c })));

    // First tap logic: generate grid safely
    if (isFirstTap) {
      currentGrid = placeMinesAndGems(currentGrid, row, col);
      setIsFirstTap(false);
    }

    // Handle tap based on content
    if (currentGrid[row][col].content === 'bomb') {
      currentGrid[row][col].state = 'revealed';
      setGrid(currentGrid);
      setGameStatus('lost');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Reveal all other bombs
      setTimeout(() => {
        const revealAll = currentGrid.map(r => r.map(c => {
          if (c.content === 'bomb' && c.state !== 'revealed') return { ...c, state: 'revealed' as CellState };
          return c;
        }));
        setGrid(revealAll);
      }, 400);

      setTimeout(() => {
        Alert.alert('BOOM!', 'You hit a bomb.', [
          { text: 'TRY AGAIN', onPress: resetGame },
        ]);
      }, 800);
      return;
    }

    if (currentGrid[row][col].content === 'gem') {
      currentGrid[row][col].state = 'revealed';
      setGrid(currentGrid);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      checkWinCondition(currentGrid);
      return;
    }

    // Number or Empty
    if (currentGrid[row][col].content === 'empty') {
      const updatedGrid = revealEmptyCells(currentGrid, row, col);
      setGrid(updatedGrid);
    } else {
      currentGrid[row][col].state = 'revealed';
      setGrid(currentGrid);
    }
  };

  const handleLongPress = (row: number, col: number) => {
    if (gameStatus !== 'playing') return;
    const cell = grid[row][col];
    if (cell.state === 'revealed') return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const newGrid = grid.map(r => r.map(c => ({ ...c })));
    newGrid[row][col].state = newGrid[row][col].state === 'flagged' ? 'hidden' : 'flagged';
    setGrid(newGrid);
  };

  const getCellStyle = (cell: Cell): object => {
    if (cell.state === 'revealed') {
      if (cell.content === 'bomb') return styles.cellBomb;
      if (cell.content === 'gem') return styles.cellGem;
      return styles.cellRevealed;
    }
    if (cell.state === 'flagged') return styles.cellFlagged;
    return styles.cellHidden;
  };

  return (
    <View style={styles.container}>
      <InstructionsPopup visible={showInstructions} onClose={() => setShowInstructions(false)} />

      {/* Header Stats */}
      <View style={styles.header}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>GEMS</Text>
          <Text style={styles.statValue}>{gemsFound}/{TOTAL_GEMS} 💎</Text>
        </View>
        
        <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
          <Text style={styles.resetText}>RESTART</Text>
        </TouchableOpacity>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>BOMBS</Text>
          <Text style={styles.statValue}>{TOTAL_BOMBS} 💣</Text>
        </View>
      </View>

      {/* Grid */}
      <View style={styles.gridWrapper}>
        <View style={styles.grid}>
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <TouchableOpacity
                key={`${r}-${c}`}
                style={[styles.cell, getCellStyle(cell)]}
                onPress={() => handlePress(r, c)}
                onLongPress={() => handleLongPress(r, c)}
                activeOpacity={0.7}
              >
                {cell.state === 'hidden' && <Text style={styles.hiddenText}>?</Text>}
                {cell.state === 'flagged' && <Text style={styles.flagText}>🚩</Text>}
                {cell.state === 'revealed' && cell.content === 'number' && (
                  <Text style={[styles.numberText, { color: NUMBER_COLORS[cell.value] || '#fff' }]}>
                    {cell.value}
                  </Text>
                )}
                {cell.state === 'revealed' && cell.content === 'gem' && (
                  <Text style={styles.gemText}>💎</Text>
                )}
                {cell.state === 'revealed' && cell.content === 'bomb' && (
                  <Text style={styles.bombText}>💣</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      {/* Footer Hint */}
      <Text style={styles.hint}>
        {gameStatus === 'playing' 
          ? 'Tap to reveal • Long press to flag' 
          : gameStatus === 'won' 
          ? 'You found all gems!' 
          : 'You hit a bomb!'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a14',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(46, 213, 115, 0.2)',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#a4b0be',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statValue: {
    color: '#dfe6e9',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  resetBtn: {
    backgroundColor: '#2ed573',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetText: {
    color: '#0a0a14',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  gridWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    aspectRatio: 1,
    maxWidth: 400,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2f3542',
    backgroundColor: '#2f3542',
  },
  cell: {
    width: `${100 / GRID_SIZE}%`,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellHidden: {
    backgroundColor: '#485460',
  },
  cellRevealed: {
    backgroundColor: '#1e272e',
  },
  cellFlagged: {
    backgroundColor: '#e17055',
  },
  cellGem: {
    backgroundColor: '#00b894',
  },
  cellBomb: {
    backgroundColor: '#d63031',
  },
  hiddenText: {
    color: '#636e72',
    fontSize: 20,
    fontWeight: '900',
  },
  flagText: {
    fontSize: 20,
  },
  numberText: {
    fontSize: 22,
    fontWeight: '900',
  },
  gemText: {
    fontSize: 24,
  },
  bombText: {
    fontSize: 24,
  },
  hint: {
    color: '#636e72',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 20,
  },
});