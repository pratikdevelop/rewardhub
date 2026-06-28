import {
  Canvas,
  Group,
  LinearGradient,
  Path,
  RoundedRect,
  Skia,
  notifyChange,
  vec,
} from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdModal from '../../components/AdModal';
import { COLORS, RADIUS, SIZES, SPACING } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useAdGate } from '../../hooks/useAdGate';

// ---------------------------------------------------------------------------
// Prize tiers — small / medium / jackpot, each with its own odds, coin
// amount, label and "reveal weight" (how flashy the win animation gets).
// ---------------------------------------------------------------------------
type Tier = 'lose' | 'small' | 'medium' | 'jackpot';

interface Prize {
  tier: Tier;
  coins: number;
  label: string;
  emoji: string;
}

const PRIZE_TABLE: { tier: Tier; weight: number; coinsRange: [number, number]; label: string; emoji: string }[] = [
  { tier: 'lose',    weight: 45, coinsRange: [0, 0],     label: 'No win this time',  emoji: '💨' },
  { tier: 'small',   weight: 35, coinsRange: [10, 40],   label: 'Nice!',             emoji: '✨' },
  { tier: 'medium',  weight: 15, coinsRange: [50, 150],  label: 'Great win!',        emoji: '🔥' },
  { tier: 'jackpot', weight: 5,  coinsRange: [250, 500], label: 'JACKPOT!',          emoji: '👑' },
];

function rollPrize(): Prize {
  const totalWeight = PRIZE_TABLE.reduce((s, p) => s + p.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const entry of PRIZE_TABLE) {
    if (roll < entry.weight) {
      const [min, max] = entry.coinsRange;
      const coins = min === max ? 0 : Math.floor(min + Math.random() * (max - min));
      return { tier: entry.tier, coins, label: entry.label, emoji: entry.emoji };
    }
    roll -= entry.weight;
  }
  const fallback = PRIZE_TABLE[0];
  return { tier: fallback.tier, coins: 0, label: fallback.label, emoji: fallback.emoji };
}

const TIER_THEME: Record<Tier, { glow: string; gradient: [string, string]; haptic: () => void }> = {
  lose:    { glow: COLORS.textMuted, gradient: [COLORS.bgCard, COLORS.bgInput] as [string, string], haptic: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) },
  small:   { glow: '#7FE3C0',        gradient: ['#1E3A34', '#0F2420'] as [string, string],            haptic: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) },
  medium:  { glow: '#FFD45E',        gradient: ['#3A2E12', '#231A08'] as [string, string],             haptic: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy) },
  jackpot: { glow: '#FF8A4C',        gradient: ['#4A1430', '#23071A'] as [string, string],              haptic: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) },
};

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - SPACING.xl * 2;
const CARD_H = CARD_W * 0.62;
const BRUSH_RADIUS = 34;
const SCRATCH_THRESHOLD = 0.55; // fraction of card area scratched to auto-reveal rest

export default function ScratchScreen() {
  const { addCoins } = useAuth();
  const router = useRouter();

  const [prize, setPrize] = useState<Prize>(rollPrize);
  const [revealed, setRevealed] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [confettiKey, setConfettiKey] = useState(0);

  // Skia path lives in a shared value so the gesture can mutate + repaint it
  // entirely on the UI thread (notifyChange), instead of bouncing every
  // touch sample over to JS just to force a React re-render.
  const scratchPath = useSharedValue(Skia.Path.Make());

  // Touch-sample counter, also UI-thread only. ~110 samples ≈ "fully scratched".
  const touchCount = useSharedValue(0);
  const MAX_USEFUL_TOUCHES = 110;
  const hasRevealed = useSharedValue(false); // shared across UI (worklet) and JS thread

  // Reanimated values for the supporting UI (entrance, shimmer, result card).
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);
  const shimmerX = useSharedValue(-1);
  const resultScale = useSharedValue(0);
  const resultOpacity = useSharedValue(0);
  const coinPulse = useSharedValue(1);
  const hintOpacity = useSharedValue(1);

  const startEntrance = useCallback(() => {
    cardOpacity.value = withTiming(1, { duration: 380 });
    cardScale.value = withSpring(1, { damping: 14, stiffness: 140 });
    shimmerX.value = -1;
    shimmerX.value = withDelay(
      400,
      withRepeat(withTiming(1.4, { duration: 1600, easing: Easing.inOut(Easing.ease) }), -1, false)
    );
    hintOpacity.value = withRepeat(withSequence(withTiming(0.35, { duration: 900 }), withTiming(1, { duration: 900 })), -1, true);
  }, [cardOpacity, cardScale, shimmerX, hintOpacity]);

  const finishReveal = useCallback((p: Prize) => {
    if (hasRevealed.value) return;
    hasRevealed.value = true;
    setRevealed(true);
    setScratchProgress(1);
    hintOpacity.value = withTiming(0, { duration: 150 });
    TIER_THEME[p.tier].haptic();
    if (p.coins > 0) addCoins(p.coins);
    if (p.tier === 'jackpot' || p.tier === 'medium') {
      setConfettiKey((k) => k + 1);
    }
    resultOpacity.value = withTiming(1, { duration: 260 });
    resultScale.value = withSequence(
      withTiming(1.08, { duration: 220, easing: Easing.out(Easing.back(1.6)) }),
      withTiming(1, { duration: 140 })
    );
    if (p.coins > 0) {
      coinPulse.value = withRepeat(withSequence(withTiming(1.12, { duration: 420 }), withTiming(1, { duration: 420 })), 2, true);
    }
  }, [addCoins, coinPulse, hasRevealed, hintOpacity, resultOpacity, resultScale]);

  const updateProgress = useCallback((progress: number) => {
    setScratchProgress(progress);
  }, []);

  const resetGame = useCallback(() => {
    scratchPath.value = Skia.Path.Make();
    touchCount.value = 0;
    hasRevealed.value = false;
    setScratchProgress(0);
    setRevealed(false);
    setConfettiKey(0);
    resultOpacity.value = 0;
    resultScale.value = 0;
    cardOpacity.value = 0;
    cardScale.value = 0.9;
    setPrize(rollPrize());
    requestAnimationFrame(startEntrance);
  }, [cardOpacity, cardScale, hasRevealed, resultOpacity, resultScale, scratchPath, startEntrance, touchCount]);

  const { adVisible, requestPlayAgain, onAdClose } = useAdGate(resetGame);

  // Run entrance animation once on mount.
  useMemo(() => {
    requestAnimationFrame(startEntrance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Runs entirely on the UI thread. Mutates the shared path in place and
  // notifies Skia to repaint, then throttles the JS-side progress update.
  const handleTouch = useCallback((x: number, y: number, isStart: boolean) => {
    'worklet';
    if (hasRevealed.value) return;
    if (isStart) {
      scratchPath.value.moveTo(x, y);
    } else {
      scratchPath.value.lineTo(x, y);
    }
    notifyChange(scratchPath);

    touchCount.value += 1;
    const progress = Math.min(1, touchCount.value / MAX_USEFUL_TOUCHES);

    // Only cross the JS bridge every few samples, and always on threshold/finish.
    if (touchCount.value % 3 === 0 || progress >= SCRATCH_THRESHOLD) {
      runOnJS(updateProgress)(progress);
    }
    if (progress >= SCRATCH_THRESHOLD) {
      runOnJS(finishReveal)(prize);
    }
  }, [finishReveal, hasRevealed, prize, scratchPath, touchCount, updateProgress]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .averageTouches(true)
        .maxPointers(1)
        .onBegin((e) => handleTouch(e.x, e.y, true))
        .onUpdate((e) => handleTouch(e.x, e.y, false)),
    [handleTouch]
  );

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const resultAnimStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
    transform: [{ scale: resultScale.value }],
  }));

  const coinAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coinPulse.value }],
  }));

  const hintAnimStyle = useAnimatedStyle(() => ({
    opacity: revealed ? 0 : hintOpacity.value,
  }));

  const theme = TIER_THEME[prize.tier];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Text style={styles.backText}>‹  Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🎟️  Scratch & Win</Text>
        <View style={{ width: 64 }} />
      </View>

      <Text style={styles.sub}>Drag your finger across the foil to scratch it off</Text>

      {/* Card */}
      <Animated.View style={[styles.cardShadowWrap, cardAnimStyle]}>
        <View style={[styles.card, { shadowColor: theme.glow }]}>
          {/* Prize layer (sits underneath the scratchable foil) */}
          <View style={[styles.prizeLayer, { backgroundColor: theme.gradient[1] }]}>
            <View style={styles.prizeLayerGradientTop}>
              <Text style={styles.prizeEmoji}>{prize.emoji}</Text>
              <Text style={[styles.prizeLabel, { color: theme.glow }]}>{prize.label}</Text>
              {prize.coins > 0 ? (
                <Animated.Text style={[styles.prizeCoins, coinAnimStyle]}>
                  +{prize.coins} coins
                </Animated.Text>
              ) : (
                <Text style={styles.prizeCoinsMuted}>Try again next card</Text>
              )}
            </View>
          </View>

          {/* Scratchable foil layer, punched through by the gesture path */}
          {!revealed && (
            <GestureDetector gesture={panGesture}>
              <View style={StyleSheet.absoluteFill}>
                <Canvas style={StyleSheet.absoluteFill}>
                  <Group layer>
                    <RoundedRect x={0} y={0} width={CARD_W} height={CARD_H} r={20}>
                      <LinearGradient
                        start={vec(0, 0)}
                        end={vec(CARD_W, CARD_H)}
                        colors={['#9AA3B5', '#E4E8F0', '#8B92A8', '#D8DCE6']}
                      />
                    </RoundedRect>
                    <Path
                      path={scratchPath}
                      style="stroke"
                      strokeWidth={BRUSH_RADIUS}
                      strokeCap="round"
                      strokeJoin="round"
                      blendMode="clear"
                    />
                  </Group>
                </Canvas>
                {/* Foil texture / branding sits visually on top of the canvas paint */}
                <View style={styles.foilTextWrap} pointerEvents="none">
                  <Text style={styles.foilText}>SCRATCH HERE</Text>
                  <Text style={styles.foilSubtext}>🪙</Text>
                </View>
              </View>
            </GestureDetector>
          )}
        </View>
      </Animated.View>

      {/* Scratch progress */}
      {!revealed && (
        <>
          <View style={styles.progressWrap}>
            <View style={[styles.progressBar, { width: `${scratchProgress * 100}%`, backgroundColor: theme.glow }]} />
          </View>
          <Animated.Text style={[styles.hint, hintAnimStyle]}>
            Keep scratching… {Math.round(scratchProgress * 100)}%
          </Animated.Text>
        </>
      )}

      {/* Result */}
      {revealed && (
        <Animated.View style={[styles.resultWrap, resultAnimStyle]}>
          <Text style={[styles.resultTitle, { color: theme.glow }]}>
            {prize.tier === 'jackpot' ? '👑 JACKPOT! 👑' : prize.coins > 0 ? `${prize.emoji} You won ${prize.coins} coins!` : '😅 Better luck next time!'}
          </Text>
          <TouchableOpacity style={[styles.againBtn, { borderColor: theme.glow }]} onPress={requestPlayAgain} activeOpacity={0.8}>
            <Text style={[styles.againText, { color: theme.glow }]}>🔄  New Card (Watch Ad)</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {revealed && (prize.tier === 'jackpot' || prize.tier === 'medium') && (
        <ConfettiBurst key={confettiKey} colorA={theme.glow} />
      )}

      <AdModal visible={adVisible} onClose={onAdClose} />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Lightweight confetti burst — a handful of animated dots/rects flung
// outward and faded, used only for medium/jackpot wins.
// ---------------------------------------------------------------------------
function ConfettiBurst({ colorA }: { colorA: string }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        angle: (i / 18) * Math.PI * 2 + Math.random() * 0.4,
        distance: 90 + Math.random() * 110,
        delay: Math.random() * 80,
        size: 6 + Math.random() * 6,
        color: i % 2 === 0 ? colorA : COLORS.gold,
      })),
    [colorA]
  );

  return (
    <View style={styles.confettiRoot} pointerEvents="none">
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} {...p} />
      ))}
    </View>
  );
}

function ConfettiPiece({
  angle,
  distance,
  delay,
  size,
  color,
}: { angle: number; distance: number; delay: number; size: number; color: string }) {
  const progress = useSharedValue(0);

  useMemo(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 700 + Math.random() * 300, easing: Easing.out(Easing.cubic) })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => {
    const dx = Math.cos(angle) * distance * progress.value;
    const dy = Math.sin(angle) * distance * progress.value - 40 * progress.value;
    return {
      opacity: 1 - progress.value,
      transform: [
        { translateX: dx },
        { translateY: dy },
        { rotate: `${progress.value * 360}deg` },
      ] as const,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size * 1.6,
          borderRadius: 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, marginBottom: SPACING.sm },
  backBtn: { padding: SPACING.sm },
  backText: { color: COLORS.primary, fontSize: SIZES.lg },
  title: { color: COLORS.white, fontSize: SIZES.xl, fontWeight: '700' },
  sub: { color: COLORS.textMuted, fontSize: SIZES.sm, marginBottom: SPACING.lg, textAlign: 'center', paddingHorizontal: SPACING.xl },

  cardShadowWrap: { marginBottom: SPACING.lg },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.bgCard,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  prizeLayer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  prizeLayerGradientTop: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  prizeEmoji: { fontSize: 56 },
  prizeLabel: { fontSize: SIZES.lg, fontWeight: '800', letterSpacing: 1 },
  prizeCoins: { color: COLORS.white, fontSize: SIZES.xl, fontWeight: '900' },
  prizeCoinsMuted: { color: COLORS.textMuted, fontSize: SIZES.sm },

  foilTextWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 8 },
  foilText: { color: 'rgba(60,64,82,0.55)', fontSize: SIZES.md, fontWeight: '800', letterSpacing: 3 },
  foilSubtext: { fontSize: 30, opacity: 0.55 },

  progressWrap: { width: '80%', height: 6, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: 6 },
  progressBar: { height: '100%', borderRadius: RADIUS.full },
  hint: { color: COLORS.textMuted, fontSize: SIZES.xs, marginBottom: SPACING.md },

  resultWrap: { alignItems: 'center', gap: SPACING.md, marginTop: SPACING.sm },
  resultTitle: { fontSize: SIZES.lg, fontWeight: '800', textAlign: 'center' },

  againBtn: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, paddingVertical: 14, paddingHorizontal: 36, borderWidth: 1.5 },
  againText: { fontSize: SIZES.md, fontWeight: '700' },

  confettiRoot: { position: 'absolute', top: '38%', left: '50%', width: 0, height: 0 },
});