import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdModal from '../../components/AdModal';
import { COLORS, RADIUS, SIZES, SPACING } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useAdGate } from '../../hooks/useAdGate';

const EMOJIS  = ['💎', '🌟', '💰', '🎁', '🔥', '💫'];
const COLS    = 3;
const ROWS    = 2;
const TOTAL   = COLS * ROWS;
const { width } = Dimensions.get('window');
const GAP       = SPACING.md;
const TILE_SIZE = (width - SPACING.xl * 2 - GAP * (COLS - 1)) / COLS;

function buildCard(): string[] {
  const values = Array.from({ length: TOTAL }, () =>
    EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
  );
  // Guarantee one matching pair (match 2 shown as "match" — or 3 if lucky)
  const winner = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  values[Math.floor(Math.random() * COLS)]        = winner;
  values[COLS + Math.floor(Math.random() * COLS)] = winner;
  return values;
}

export default function ScratchScreen() {
  const { addCoins } = useAuth();
  const router       = useRouter();

  const [values,   setValues]   = useState<string[]>(buildCard);
  const [revealed, setRevealed] = useState<boolean[]>(Array(TOTAL).fill(false));
  const [done,     setDone]     = useState(false);
  const [result,   setResult]   = useState('');
  const [matched,  setMatched]  = useState<number[]>([]);

  const resetGame = useCallback(() => {
    setValues(buildCard());
    setRevealed(Array(TOTAL).fill(false));
    setDone(false);
    setResult('');
    setMatched([]);
  }, []);

  const { adVisible, requestPlayAgain, onAdClose } = useAdGate(resetGame);

  const reveal = (i: number) => {
    if (revealed[i] || done) return;
    const next = [...revealed];
    next[i] = true;
    setRevealed(next);

    if (next.every(Boolean)) {
      setDone(true);
      const counts: Record<string, number[]> = {};
      values.forEach((v, idx) => {
        if (!counts[v]) counts[v] = [];
        counts[v].push(idx);
      });
      const match = Object.values(counts).find(arr => arr.length >= 3);
      if (match) {
        addCoins(25);
        setResult('🎉 Match 3! You won 25 coins!');
        setMatched(match);
      } else {
        setResult('😢 No match this time!');
      }
    }
  };

  const revealAll = () => {
    Array.from({ length: TOTAL }, (_, i) => i).forEach(reveal);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹  Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🎁  Scratch & Win</Text>
        <View style={{ width: 64 }} />
      </View>

      <Text style={styles.sub}>Tap tiles to reveal. Match 3 to win 25 coins!</Text>

      {/* Grid */}
      <View style={styles.grid}>
        {values.map((emoji, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.tile,
              revealed[i] && styles.tileRevealed,
              matched.includes(i) && styles.tileMatched,
            ]}
            onPress={() => reveal(i)}
            disabled={revealed[i] || done}
            activeOpacity={0.75}
          >
            {revealed[i]
              ? <Text style={styles.tileEmoji}>{emoji}</Text>
              : <Text style={styles.tileHidden}>?</Text>
            }
          </TouchableOpacity>
        ))}
      </View>

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <View style={[styles.progressBar, { width: `${(revealed.filter(Boolean).length / TOTAL) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>{revealed.filter(Boolean).length}/{TOTAL} revealed</Text>

      {/* Result */}
      {result !== '' && (
        <Text style={[styles.result, matched.length ? styles.win : styles.lose]}>{result}</Text>
      )}

      {!done ? (
        <TouchableOpacity style={styles.revealBtn} onPress={revealAll}>
          <Text style={styles.revealBtnText}>Reveal All</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.againBtn} onPress={requestPlayAgain}>
          <Text style={styles.againText}>🔄  New Card (Watch Ad)</Text>
        </TouchableOpacity>
      )}

      <AdModal visible={adVisible} onClose={onAdClose} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center' },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, marginBottom: SPACING.sm },
  backBtn: { padding: SPACING.sm },
  backText:{ color: COLORS.primary, fontSize: SIZES.lg },
  title:   { color: COLORS.white, fontSize: SIZES.xl, fontWeight: '700' },
  sub:     { color: COLORS.textMuted, fontSize: SIZES.sm, marginBottom: SPACING.xl, textAlign: 'center', paddingHorizontal: SPACING.xl },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  tile: {
    width: TILE_SIZE, height: TILE_SIZE,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.scratch,
    alignItems: 'center', justifyContent: 'center',
  },
  tileRevealed: { backgroundColor: COLORS.bgInput },
  tileMatched:  { backgroundColor: COLORS.success },
  tileEmoji:    { fontSize: 38 },
  tileHidden:   { fontSize: 36, color: COLORS.white, fontWeight: '900' },

  progressWrap: { width: '80%', height: 6, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: 6 },
  progressBar:  { height: '100%', backgroundColor: COLORS.scratch, borderRadius: RADIUS.full },
  progressText: { color: COLORS.textMuted, fontSize: SIZES.xs, marginBottom: SPACING.md },

  result: { fontSize: SIZES.lg, fontWeight: '700', marginBottom: SPACING.lg, textAlign: 'center' },
  win:    { color: COLORS.gold },
  lose:   { color: COLORS.textMuted },

  revealBtn: { backgroundColor: COLORS.scratch, borderRadius: RADIUS.lg, paddingVertical: 14, paddingHorizontal: 48 },
  revealBtnText: { color: COLORS.white, fontSize: SIZES.md, fontWeight: '700' },
  againBtn: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, paddingVertical: 14, paddingHorizontal: 36, borderWidth: 1.5, borderColor: COLORS.scratch },
  againText: { color: COLORS.scratch, fontSize: SIZES.md, fontWeight: '600' },
});