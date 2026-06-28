import { useCallback, useRef, useState } from 'react';
import {
  Animated, Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdModal from '../../components/AdModal';
import GameHeader from '../../components/GameHeader';
import { COLORS, RADIUS, SIZES, SPACING, glowShadow } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useAdGate } from '../../hooks/useAdGate';

const { width } = Dimensions.get('window');

const TOTAL     = 15;
const PRIZE     = 30;
const COLS      = 4;
const GAP       = 10;
const TILE_SIZE = (width - SPACING.xl * 2 - GAP * (COLS - 1)) / COLS;

export default function LuckyScreen() {
  const { addCoins } = useAuth();

  const [selected, setSelected] = useState<number | null>(null);
  const [lucky,    setLucky]    = useState<number | null>(null);
  const [done,     setDone]     = useState(false);
  const [won,      setWon]      = useState(false);

  // One animated value per tile
  const tileAnims = useRef(
    Array.from({ length: TOTAL }, () => new Animated.Value(1))
  ).current;
  const resultAnim = useRef(new Animated.Value(0)).current;

  const resetGame = useCallback(() => {
    setSelected(null);
    setLucky(null);
    setDone(false);
    setWon(false);
    tileAnims.forEach(a => a.setValue(1));
    resultAnim.setValue(0);
  }, []);

  const { adVisible, requestPlayAgain, onAdClose } = useAdGate(resetGame);

  // Tap a number
  const pickNumber = (n: number) => {
    if (done) return;
    setSelected(prev => {
      // Bounce the newly selected tile
      const idx = n - 1;
      Animated.sequence([
        Animated.timing(tileAnims[idx], { toValue: 0.88, duration: 80, useNativeDriver: true }),
        Animated.spring(tileAnims[idx], { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
      return n;
    });
  };

  // Reveal lucky number
  const reveal = () => {
    if (!selected || done) return;
    const luckyNum = Math.floor(Math.random() * TOTAL) + 1;
    setLucky(luckyNum);
    setDone(true);

    const isWin = selected === luckyNum;
    setWon(isWin);
    if (isWin) addCoins(PRIZE);

    // Animate the lucky tile with a big pop
    Animated.sequence([
      Animated.timing(tileAnims[luckyNum - 1], { toValue: 1.35, duration: 200, useNativeDriver: true }),
      Animated.spring(tileAnims[luckyNum - 1], { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    // Fade result banner in
    Animated.timing(resultAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  };

  // Determine tile visual state
  const tileState = (n: number): 'idle' | 'selected' | 'winner' | 'loser' | 'faded' => {
    if (!done) return n === selected ? 'selected' : 'idle';
    if (n === lucky && n === selected) return 'winner';
    if (n === lucky)                   return 'winner';
    if (n === selected)                return 'loser';
    return 'faded';
  };

  const tileStyles: Record<string, object> = {
    idle:     { backgroundColor: COLORS.bgCard,   borderColor: COLORS.border },
    selected: { backgroundColor: COLORS.lucky + '22', borderColor: COLORS.lucky },
    winner:   { backgroundColor: COLORS.success + '25', borderColor: COLORS.success },
    loser:    { backgroundColor: COLORS.error + '20', borderColor: COLORS.error },
    faded:    { backgroundColor: COLORS.bgCard,   borderColor: 'transparent', opacity: 0.3 },
  };

  const tileTextColor: Record<string, string> = {
    idle:     COLORS.white,
    selected: COLORS.lucky,
    winner:   COLORS.success,
    loser:    COLORS.error,
    faded:    COLORS.textHint,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <GameHeader title="🍀  Lucky Number" accentColor={COLORS.lucky} />

      {/* Prize banner */}
      <View style={[styles.prizeBanner, glowShadow(COLORS.lucky, 0.35)]}>
        <View style={styles.prizeLeft}>
          <Text style={styles.prizeLabel}>JACKPOT PRIZE</Text>
          <Text style={styles.prizeAmount}>+{PRIZE} 💰</Text>
        </View>
        <View style={styles.prizeDivider} />
        <View style={styles.prizeRight}>
          <Text style={styles.prizeLabel}>NUMBERS</Text>
          <Text style={styles.prizeCount}>1 – {TOTAL}</Text>
        </View>
      </View>

      {/* Instruction */}
      <Text style={styles.instruction}>
        {!done
          ? selected
            ? `You picked  #${selected}  — tap Reveal!`
            : 'Pick any number below 👇'
          : won
            ? `#${lucky} was the lucky number!`
            : `Lucky number was  #${lucky}`}
      </Text>

      {/* Number grid */}
      <View style={[styles.gridWrap, glowShadow(COLORS.lucky, 0.15)]}>
        <View style={styles.grid}>
          {Array.from({ length: TOTAL }, (_, i) => i + 1).map(n => {
            const state = tileState(n);
            return (
              <Animated.View
                key={n}
                style={{ transform: [{ scale: tileAnims[n - 1] }] }}
              >
                <TouchableOpacity
                  style={[styles.tile, tileStyles[state],
                    state === 'selected' && glowShadow(COLORS.lucky, 0.6),
                    state === 'winner'   && glowShadow(COLORS.success, 0.8),
                    state === 'loser'    && glowShadow(COLORS.error, 0.4),
                  ]}
                  onPress={() => pickNumber(n)}
                  disabled={done}
                  activeOpacity={0.75}
                >
                  {/* Star icon on winning tile */}
                  {state === 'winner' && (
                    <Text style={styles.winnerStar}>⭐</Text>
                  )}
                  <Text style={[styles.tileNum, { color: tileTextColor[state] }]}>
                    {n}
                  </Text>
                  {state === 'selected' && (
                    <View style={styles.selectedDot} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* Result card */}
      <Animated.View style={[styles.resultCard,
        won ? styles.resultWin : done ? styles.resultLose : styles.resultHidden,
        { opacity: resultAnim, transform: [{ scale: resultAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] },
      ]}>
        <Text style={styles.resultEmoji}>{won ? '🎉' : '😢'}</Text>
        <View>
          <Text style={[styles.resultTitle, { color: won ? COLORS.gold : COLORS.textMuted }]}>
            {won ? `You matched #${lucky}!` : `No match this time`}
          </Text>
          <Text style={[styles.resultSub, { color: won ? COLORS.success : COLORS.textHint }]}>
            {won ? `+${PRIZE} coins added to your wallet` : `The lucky number was #${lucky}`}
          </Text>
        </View>
      </Animated.View>

      {/* Action buttons */}
      {!done ? (
        <TouchableOpacity
          style={[
            styles.revealBtn,
            selected ? glowShadow(COLORS.lucky, 0.6) : styles.revealBtnDisabled,
          ]}
          onPress={reveal}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={[styles.revealBtnText, !selected && { color: COLORS.textHint }]}>
            {selected ? '🎯  Reveal Lucky Number' : 'Pick a number first'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.againBtn, glowShadow(COLORS.lucky, 0.3)]}
          onPress={requestPlayAgain}
          activeOpacity={0.8}
        >
          <Text style={styles.againText}>🔄  Play Again · Watch Ad</Text>
        </TouchableOpacity>
      )}

      <AdModal visible={adVisible} onClose={onAdClose} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
  },

  // Prize banner
  prizeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.lucky + '44',
    width: width - SPACING.xl * 2,
  },
  prizeLeft:    { flex: 1, alignItems: 'center' },
  prizeRight:   { flex: 1, alignItems: 'center' },
  prizeDivider: { width: 1, height: 40, backgroundColor: COLORS.border },
  prizeLabel:   { color: COLORS.textMuted, fontSize: SIZES.xs, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  prizeAmount:  { color: COLORS.gold, fontSize: SIZES.xxl, fontWeight: '900' },
  prizeCount:   { color: COLORS.lucky, fontSize: SIZES.xxl, fontWeight: '900' },

  // Instruction
  instruction: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    fontWeight: '600',
    marginBottom: SPACING.lg,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },

  // Grid
  gridWrap: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginHorizontal: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.lucky + '22',
    marginBottom: SPACING.sm,
    width: width - SPACING.xl * 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    justifyContent: 'center',
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    position: 'relative',
  },
  tileNum: {
    fontSize: SIZES.lg,
    fontWeight: '800',
  },
  selectedDot: {
    position: 'absolute',
    bottom: 5,
    width: 5, height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.lucky,
  },
  winnerStar: {
    position: 'absolute',
    top: 2, right: 4,
    fontSize: 9,
  },

  // Result card
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.xl,
    borderWidth: 1.5,
    marginBottom: SPACING.lg,
    width: width - SPACING.xl * 2,
  },
  resultHidden: { borderColor: 'transparent', backgroundColor: 'transparent' },
  resultWin:    { backgroundColor: 'rgba(255,215,0,0.08)', borderColor: COLORS.goldDark },
  resultLose:   { backgroundColor: COLORS.bgCard, borderColor: COLORS.border },
  resultEmoji:  { fontSize: 36 },
  resultTitle:  { fontSize: SIZES.md, fontWeight: '800' },
  resultSub:    { fontSize: SIZES.sm, marginTop: 2 },

  // Buttons
  revealBtn: {
    backgroundColor: COLORS.lucky,
    borderRadius: RADIUS.full,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: width - SPACING.xl * 2,
    alignItems: 'center',
  },
  revealBtnDisabled: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  revealBtnText: {
    color: '#002B2E',
    fontSize: SIZES.lg,
    fontWeight: '900',
  },

  againBtn: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderWidth: 1.5,
    borderColor: COLORS.lucky,
    width: width - SPACING.xl * 2,
    alignItems: 'center',
  },
  againText: {
    color: COLORS.lucky,
    fontSize: SIZES.md,
    fontWeight: '700',
  },
});