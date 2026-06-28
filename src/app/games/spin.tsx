import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import AdModal from '../../components/AdModal';
import { SPACING } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useAdGate } from '../../hooks/useAdGate';

const PRIZES   = [10, 5, 20, 2, 50, 0, 15, 3];
// Richer, more modern game palette
const PALETTE  = ['#FFB627','#2DC653','#9B5DE5','#3B82F6','#EF4444','#1F2937','#F472B6','#14B8A6'];
const SLICE    = (2 * Math.PI) / PRIZES.length;
const { width } = Dimensions.get('window');
const SIZE     = width * 0.88;
const CX       = SIZE / 2;
const CY       = SIZE / 2;
const R        = SIZE / 2 - 28; // Inner wheel radius
const BORDER_R = SIZE / 2 - 4; // Outer border radius

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

function labelPos(index: number) {
  const angle = index * SLICE - Math.PI / 2 + SLICE / 2;
  const dist  = R * 0.62;
  return { x: CX + dist * Math.cos(angle), y: CY + dist * Math.sin(angle) + 2 };
}

export default function SpinScreen() {
  const { addCoins }  = useAuth();
  const router        = useRouter();
  const spinAnim      = useRef(new Animated.Value(0)).current;
  const totalRotation = useRef(0);

  // UX Animation States
  const buttonPulse   = useRef(new Animated.Value(1)).current;
  const resultScale   = useRef(new Animated.Value(0)).current;
  const buttonSlide   = useRef(new Animated.Value(100)).current; // Starts off-screen

  const [spinning,  setSpinning]  = useState(false);
  const [gameOver,  setGameOver]  = useState(false);
  const [result,    setResult]    = useState('');
  const [wonCoins,  setWonCoins]  = useState(0);

  const resetGame = useCallback(() => {
    setGameOver(false);
    setResult('');
    setWonCoins(0);
    resultScale.setValue(0);
    buttonSlide.setValue(100);
  }, []);

  const { adVisible, requestPlayAgain, onAdClose } = useAdGate(resetGame);

  // Irresistible pulsing button when idle
  useEffect(() => {
    if (!spinning && !gameOver) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonPulse, { toValue: 1.06, duration: 500, useNativeDriver: true }),
          Animated.timing(buttonPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      buttonPulse.setValue(1);
    }
  }, [spinning, gameOver]);

  const spin = () => {
    if (spinning || gameOver) return;
    setSpinning(true);
    setResult('');
    resultScale.setValue(0);
    buttonSlide.setValue(100);

    const extraSpins  = (6 + Math.floor(Math.random() * 4)) * 360;
    const randomDeg   = Math.floor(Math.random() * 360);
    const targetTotal = totalRotation.current + extraSpins + randomDeg;

    Animated.timing(spinAnim, {
      toValue: targetTotal,
      duration: 4500,
      easing: Easing.bezier(0.15, 0.8, 0.15, 1), // Heavy, satisfying deceleration
      useNativeDriver: true,
    }).start(() => {
      totalRotation.current = targetTotal;
      setSpinning(false);
      setGameOver(true);

      const normalized = ((targetTotal % 360) + 360) % 360;
      const idx        = Math.floor(((360 - normalized) % 360) / (360 / PRIZES.length)) % PRIZES.length;
      const prize      = PRIZES[idx];
      setWonCoins(prize);

      // SEQUENCE THE REVEAL (Crucial for modern game feel)
      setTimeout(() => {
        if (prize > 0) {
          addCoins(prize);
          setResult(`${prize}`);
          // Bouncy pop-in for win
          Animated.spring(resultScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
        } else {
          setResult('0');
          // Softer pop-in for loss
          Animated.spring(resultScale, { toValue: 1, friction: 6, tension: 20, useNativeDriver: true }).start();
        }

        // Slide in play again button after result is seen
        setTimeout(() => {
          Animated.spring(buttonSlide, { toValue: 0, friction: 5, tension: 30, useNativeDriver: true }).start();
        }, 600);

      }, 400); // Pause before revealing result
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
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Lucky Spin</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Wheel Container */}
      <View style={styles.wheelWrapper}>
        {/* Floating Pointer - Elevated above wheel */}
        <View style={styles.pointerContainer}>
          {/* <Svg width={36} height={40}>
            <Polygon points="18,38 2,4 34,4" fill="#FFD700" />
            <Polygon points="18,32 6,6 30,6" fill="#FFF176" /> 
          </Svg> */}
        </View>

        {/* Static Outer Ring with Pegs */}
        <Svg width={SIZE} height={SIZE} style={styles.absolute}>
          {/* Outer metallic ring */}
          <Circle cx={CX} cy={CY} r={BORDER_R} fill="#2D1B4E" />
          <Circle cx={CX} cy={CY} r={BORDER_R - 6} fill="#1A0A2E" stroke="#4C1D95" strokeWidth={2} />
          
          {/* Pegs */}
          {PRIZES.map((_, i) => {
            const angle = i * SLICE - Math.PI / 2;
            const px = CX + (BORDER_R - 12) * Math.cos(angle);
            const py = CY + (BORDER_R - 12) * Math.sin(angle);
            return (
              <Circle key={i} cx={px} cy={py} r={5} fill="#FFD700" stroke="#B8860B" strokeWidth={1.5} />
            );
          })}
        </Svg>

        {/* Rotating Inner Wheel */}
        <Animated.View style={[styles.absolute, { transform: [{ rotate }] }]}>
          <Svg width={SIZE} height={SIZE}>
            {PRIZES.map((prize, i) => {
              const { x, y } = labelPos(i);
              return (
                <G key={i}>
                  <Path d={slicePath(i)} fill={PALETTE[i]} />
                  {/* Slice borders for depth */}
                  <Path d={slicePath(i)} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
                  <SvgText
                    x={x} y={y}
                    fill="white"
                    fontSize={prize === 0 ? 32 : 22}
                    fontWeight="900"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {prize === 0 ? '✖' : `${prize}`}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </Animated.View>

        {/* Static Center Hub */}
        <View style={styles.centerHub}>
          <View style={styles.centerHubInner} />
        </View>
      </View>

      {/* Result Display Area */}
      <View style={styles.resultContainer}>
        {result !== '' && (
          <Animated.View style={[styles.resultCard, { transform: [{ scale: resultScale }] }]}>
            {wonCoins > 0 ? (
              <>
                <Text style={styles.winTitle}>YOU WON</Text>
                <View style={styles.coinBadge}>
                  <Text style={styles.coinEmoji}>💰</Text>
                  <Text style={styles.coinAmount}>{result}</Text>
                </View>
              </>
            ) : (
              <View style={styles.loseBadge}>
                <Text style={styles.loseEmoji}>😅</Text>
                <Text style={styles.loseText}>Try Again!</Text>
              </View>
            )}
          </Animated.View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.bottomArea}>
        {!gameOver ? (
          <Animated.View style={{ transform: [{ scale: buttonPulse }], width: '100%', alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.spinBtn}
              onPress={spin}
              disabled={spinning}
              activeOpacity={0.9}
            >
              <Text style={styles.spinBtnText}>SPIN</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View style={{ transform: [{ translateY: buttonSlide }], width: '100%', alignItems: 'center' }}>
            <TouchableOpacity style={styles.againBtn} onPress={requestPlayAgain} activeOpacity={0.8}>
              <Text style={styles.againText}>🔄  Play Again (Watch Ad)</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <AdModal visible={adVisible} onClose={onAdClose} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B0216', alignItems: 'center' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    width: '100%', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, marginBottom: SPACING.sm 
  },
  backBtn: { 
    width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', 
    justifyContent: 'center', alignItems: 'center' 
  },
  backText: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginTop: -2 },
  title: { color: '#FFF', fontSize: 22, fontWeight: '800', letterSpacing: 1 },

  wheelWrapper: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  absolute: { position: 'absolute', top: 0, left: 0 },
  
  pointerContainer: {
    zIndex: 10,
    marginBottom: -18,
    marginTop: -12,
    // iOS Shadow for elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 10,
  },
  centerHub: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#1A0A2E',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 5,
    borderWidth: 3,
    borderColor: '#4C1D95',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 12,
  },
  centerHubInner: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#B8860B',
  },

  // Result UI
  resultContainer: {
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  winTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  coinEmoji: { fontSize: 28, marginRight: 8 },
  coinAmount: { color: '#FFD700', fontSize: 44, fontWeight: '900' },
  
  loseBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  loseEmoji: { fontSize: 40, marginBottom: 4 },
  loseText: { color: '#9CA3AF', fontSize: 18, fontWeight: '700' },

  // Bottom Buttons
  bottomArea: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
    paddingBottom: 40,
  },
  spinBtn: {
    width: '80%',
    height: 64,
    backgroundColor: '#22C55E',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    // 3D Press effect border
    borderBottomWidth: 6,
    borderBottomColor: '#16A34A',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
  },
  spinBtnText: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: 4 },
  
  againBtn: {
    width: '80%',
    height: 60,
    backgroundColor: 'transparent',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#9B5DE5',
    shadowColor: '#9B5DE5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  againText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});