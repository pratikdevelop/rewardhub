import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdModal from '../../components/AdModal';
import { COLORS, RADIUS, SIZES, SPACING } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useAdGate } from '../../hooks/useAdGate';

const TOTAL = 16;
const PRIZE = 30;
const { width } = Dimensions.get('window');
const COLS  = 4;
const GAP   = SPACING.sm;
const TILE  = (width - SPACING.xl * 2 - GAP * (COLS - 1)) / COLS;

export default function LuckyScreen() {
  const { addCoins } = useAuth();
  const router       = useRouter();

  const [selected, setSelected] = useState<number | null>(null);
  const [lucky,    setLucky]    = useState<number | null>(null);
  const [done,     setDone]     = useState(false);
  const [won,      setWon]      = useState(false);

  const resetGame = useCallback(() => {
    setSelected(null);
    setLucky(null);
    setDone(false);
    setWon(false);
  }, []);

  const { adVisible, requestPlayAgain, onAdClose } = useAdGate(resetGame);

  const reveal = () => {
    if (selected === null || done) return;
    const luckyNum = Math.floor(Math.random() * TOTAL) + 1;
    setLucky(luckyNum);
    setDone(true);
    if (selected === luckyNum) {
      setWon(true);
      addCoins(PRIZE);
    }
  };

  const tileStyle = (n: number) => {
    const base = styles.tile;
    if (!done) return [base, n === selected ? styles.tileSelected : styles.tileDefault];
    if (n === lucky && n === selected) return [base, styles.tileWin];
    if (n === lucky)                   return [base, styles.tileLucky];
    if (n === selected)                return [base, styles.tileLose];
    return [base, styles.tileFaded];
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹  Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🍀  Lucky Number</Text>
        <View style={{ width: 64 }} />
      </View>

      <Text style={styles.sub}>Pick any number. Match the lucky draw to win {PRIZE} coins!</Text>

      {/* Number grid */}
      <View style={styles.grid}>
        {Array.from({ length: TOTAL }, (_, i) => i + 1).map(n => (
          <TouchableOpacity
            key={n}
            style={tileStyle(n)}
            onPress={() => !done && setSelected(n)}
            disabled={done}
            activeOpacity={0.75}
          >
            <Text style={styles.tileNum}>{n}</Text>
            {done && n === lucky && <Text style={styles.tileIcon}>⭐</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Status */}
      {!done ? (
        <Text style={styles.hint}>
          {selected ? `You picked ${selected} — tap Reveal!` : 'Tap a number to choose'}
        </Text>
      ) : (
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>{won ? '🎉' : '😢'}</Text>
          <Text style={styles.resultTitle}>
            {won
              ? `You matched ${lucky}! +${PRIZE} coins!`
              : `Lucky number was ${lucky}`}
          </Text>
          {!won && <Text style={styles.resultSub}>Better luck next time!</Text>}
        </View>
      )}

      {!done ? (
        <TouchableOpacity
          style={[styles.revealBtn, !selected && styles.disabled]}
          onPress={reveal}
          disabled={!selected}
        >
          <Text style={styles.revealText}>🎯  Reveal Lucky Number</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.againBtn} onPress={requestPlayAgain}>
          <Text style={styles.againText}>🔄  Play Again (Watch Ad)</Text>
        </TouchableOpacity>
      )}

      <AdModal visible={adVisible} onClose={onAdClose} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', paddingHorizontal: SPACING.xl },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingTop: SPACING.md, marginBottom: SPACING.sm },
  backBtn: { padding: SPACING.sm },
  backText:{ color: COLORS.primary, fontSize: SIZES.lg },
  title:   { color: COLORS.white, fontSize: SIZES.xl, fontWeight: '700' },
  sub:     { color: COLORS.textMuted, fontSize: SIZES.sm, textAlign: 'center', marginBottom: SPACING.xl, lineHeight: 20 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, justifyContent: 'center', marginBottom: SPACING.lg, width: '100%' },

  tile:         { width: TILE, height: TILE, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  tileDefault:  { backgroundColor: COLORS.bgInput, borderColor: 'transparent' },
  tileSelected: { backgroundColor: 'rgba(20,184,166,0.2)', borderColor: COLORS.lucky },
  tileWin:      { backgroundColor: COLORS.success, borderColor: '#86efac' },
  tileLucky:    { backgroundColor: '#14532d', borderColor: COLORS.success },
  tileLose:     { backgroundColor: '#7f1d1d', borderColor: COLORS.error },
  tileFaded:    { backgroundColor: COLORS.bgInput, borderColor: 'transparent', opacity: 0.3 },
  tileNum:      { color: COLORS.white, fontSize: SIZES.lg, fontWeight: '700' },
  tileIcon:     { fontSize: 10, position: 'absolute', top: 3, right: 4 },

  hint: { color: COLORS.textMuted, fontSize: SIZES.sm, marginBottom: SPACING.xl },

  resultCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    padding: SPACING.xl, alignItems: 'center', width: '100%',
    marginBottom: SPACING.xl,
  },
  resultEmoji:{ fontSize: 52, marginBottom: SPACING.sm },
  resultTitle:{ color: COLORS.white, fontSize: SIZES.lg, fontWeight: '700', textAlign: 'center' },
  resultSub:  { color: COLORS.textMuted, fontSize: SIZES.sm, marginTop: SPACING.xs },

  revealBtn: { backgroundColor: COLORS.lucky, borderRadius: RADIUS.lg, paddingVertical: 14, paddingHorizontal: 48, width: '100%', alignItems: 'center' },
  revealText:{ color: '#042f2e', fontSize: SIZES.md, fontWeight: '700' },
  disabled:  { opacity: 0.4 },

  againBtn: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, paddingVertical: 14, paddingHorizontal: 36, borderWidth: 1.5, borderColor: COLORS.lucky, width: '100%', alignItems: 'center' },
  againText: { color: COLORS.lucky, fontSize: SIZES.md, fontWeight: '600' },
});