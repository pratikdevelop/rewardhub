import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import AdModal from '../../components/AdModal';
import { COLORS, RADIUS, SIZES, SPACING } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useAdGate } from '../../hooks/useAdGate';

const PRIZES   = [10, 5, 20, 2, 50, 0, 15, 3];
const PALETTE  = ['#f5a623','#22c55e','#a855f7','#3b82f6','#ef4444','#6b7280','#ec4899','#14b8a6'];
const SLICE    = (2 * Math.PI) / PRIZES.length;
const { width } = Dimensions.get('window');
const SIZE     = width * 0.8;
const CX       = SIZE / 2;
const CY       = SIZE / 2;
const R        = SIZE / 2 - 4;

// Build SVG arc path for one slice
function slicePath(index: number): string {
  const start = index * SLICE - Math.PI / 2;
  const end   = start + SLICE;
  const x1 = CX + R * Math.cos(start);
  const y1 = CY + R * Math.sin(start);
  const x2 = CX + R * Math.cos(end);
  const y2 = CY + R * Math.sin(end);
  const large = SLICE > Math.PI ? 1 : 0;
  return `M${CX},${CY} L${x1},${y1} A${R},${R},0,${large},1,${x2},${y2} Z`;
}

// Label position for each slice
function labelPos(index: number) {
  const angle = index * SLICE - Math.PI / 2 + SLICE / 2;
  const dist  = R * 0.65;
  return {
    x: CX + dist * Math.cos(angle),
    y: CY + dist * Math.sin(angle),
  };
}

export default function SpinScreen() {
  const { addCoins }  = useAuth();
  const router        = useRouter();
  const spinAnim      = useRef(new Animated.Value(0)).current;
  const totalRotation = useRef(0);

  const [spinning,  setSpinning]  = useState(false);
  const [gameOver,  setGameOver]  = useState(false);
  const [result,    setResult]    = useState('');
  const [wonCoins,  setWonCoins]  = useState(0);

  const resetGame = useCallback(() => {
    setGameOver(false);
    setResult('');
    setWonCoins(0);
  }, []);

  const { adVisible, requestPlayAgain, onAdClose } = useAdGate(resetGame);

  const spin = () => {
    if (spinning || gameOver) return;
    setSpinning(true);
    setResult('');

    const extraSpins  = (5 + Math.floor(Math.random() * 5)) * 360;
    const randomDeg   = Math.floor(Math.random() * 360);
    const targetTotal = totalRotation.current + extraSpins + randomDeg;

    Animated.timing(spinAnim, {
      toValue: targetTotal,
      duration: 3500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      totalRotation.current = targetTotal;
      setSpinning(false);
      setGameOver(true);

      // Which prize did the pointer land on?
      const normalized = ((targetTotal % 360) + 360) % 360;
      const idx        = Math.floor(((360 - normalized) % 360) / (360 / PRIZES.length)) % PRIZES.length;
      const prize      = PRIZES[idx];
      setWonCoins(prize);

      if (prize > 0) {
        addCoins(prize);
        setResult(`🎉 You won ${prize} coins!`);
      } else {
        setResult('😢 Better luck next time!');
      }
    });
  };

  const rotate = spinAnim.interpolate({
    inputRange:  [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹  Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🎡  Spin Wheel</Text>
        <View style={{ width: 64 }} />
      </View>

      <Text style={styles.sub}>Spin to win up to 50 coins!</Text>

      {/* Pointer */}
      <Text style={styles.pointer}>▼</Text>

      {/* Wheel */}
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg width={SIZE} height={SIZE}>
          {PRIZES.map((prize, i) => {
            const { x, y } = labelPos(i);
            return (
              <React.Fragment key={i}>
                <Path d={slicePath(i)} fill={PALETTE[i]} stroke="#1a0a2e" strokeWidth={1.5} />
                <SvgText
                  x={x} y={y}
                  fill="white"
                  fontSize={13}
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {prize === 0 ? '😢' : `+${prize}`}
                </SvgText>
              </React.Fragment>
            );
          })}
          {/* Center hub */}
          <Circle cx={CX} cy={CY} r={22} fill={COLORS.bg} />
          <Circle cx={CX} cy={CY} r={18} fill={COLORS.primary} />
        </Svg>
      </Animated.View>

      {/* Result */}
      {result !== '' && (
        <Text style={[styles.result, wonCoins > 0 ? styles.win : styles.lose]}>
          {result}
        </Text>
      )}

      {/* Buttons */}
      {!gameOver ? (
        <TouchableOpacity
          style={[styles.spinBtn, spinning && styles.disabled]}
          onPress={spin}
          disabled={spinning}
        >
          <Text style={styles.spinBtnText}>{spinning ? 'Spinning…' : 'SPIN NOW'}</Text>
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
  safe:    { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center' },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, marginBottom: SPACING.sm },
  backBtn: { padding: SPACING.sm },
  backText:{ color: COLORS.primary, fontSize: SIZES.lg },
  title:   { color: COLORS.white, fontSize: SIZES.xl, fontWeight: '700' },
  sub:     { color: COLORS.textMuted, fontSize: SIZES.sm, marginBottom: SPACING.sm },
  pointer: { color: COLORS.gold, fontSize: 30, marginBottom: -6, zIndex: 10 },
  result:  { fontSize: SIZES.lg, fontWeight: '700', marginTop: SPACING.lg, marginBottom: SPACING.sm },
  win:     { color: COLORS.gold },
  lose:    { color: COLORS.textMuted },
  spinBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.spin,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    paddingHorizontal: 52,
  },
  disabled:    { opacity: 0.5 },
  spinBtnText: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: '700', letterSpacing: 1 },
  againBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderWidth: 1.5,
    borderColor: COLORS.spin,
  },
  againText: { color: COLORS.spin, fontSize: SIZES.md, fontWeight: '600' },
});