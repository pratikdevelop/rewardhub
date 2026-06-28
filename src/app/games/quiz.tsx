import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from "../../context/AuthContext";
// --- TYPES ---
type GameStatus = 'playing' | 'gameover';

interface ColorOption {
  text: string;
  textColor: string;
}

// --- CONSTANTS ---
const COLORS_MAP: Record<string, string> = {
  RED: '#e74c3c',
  BLUE: '#3498db',
  GREEN: '#2ecc71',
  YELLOW: '#f1c40f',
  PURPLE: '#9b59b6',
  ORANGE: '#e67e22',
};

const COLOR_NAMES = Object.keys(COLORS_MAP);
const MAX_LIVES = 5;
const COINS_PER_TAP = 10;

// --- HELPERS ---
const shuffleArray = <T,>(array: T[]): T[] => {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const generateRound = (difficulty: number): { targetText: string; options: ColorOption[]; correctCount: number } => {
  const targetText = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
  let options: ColorOption[] = [];
  
  // As difficulty increases, add more correct tiles to find (max 3)
  const correctCount = Math.min(1 + Math.floor(difficulty / 8), 3);
  
  for (let i = 0; i < correctCount; i++) {
    let wrongColorName = targetText;
    while (wrongColorName === targetText) {
      wrongColorName = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
    }
    options.push({
      text: targetText,
      textColor: COLORS_MAP[wrongColorName], 
    });
  }

  for (let i = options.length; i < 16; i++) {
    let wrongText = targetText;
    while (wrongText === targetText) {
      wrongText = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
    }
    
    let textColor = COLORS_MAP[wrongText];
    if (Math.random() > 0.5) {
      const randomColor = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
      textColor = COLORS_MAP[randomColor];
    }
    options.push({ text: wrongText, textColor: textColor });
  }

  return { targetText, options: shuffleArray(options), correctCount };
};

// --- INSTRUCTIONS POPUP ---
const InstructionsPopup = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => (
  <Modal visible={visible} animationType="fade" transparent>
    <View style={popupStyles.overlay}>
      <View style={popupStyles.container}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop' }}
          style={popupStyles.imageBg}
          imageStyle={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
        >
          <View style={popupStyles.imageOverlay}>
            <Text style={popupStyles.title}>COLOR DASH</Text>
            <Text style={popupStyles.subtitle}>BRAIN TRICK GAME</Text>
          </View>
        </ImageBackground>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={popupStyles.content}>
          <View style={popupStyles.ruleRow}>
            <Text style={popupStyles.ruleIcon}>🧠</Text>
            <Text style={popupStyles.ruleText}>Find the tiles that match the TOP word. Ignore the text color!</Text>
          </View>
          
          <View style={popupStyles.ruleRow}>
            <Text style={popupStyles.ruleIcon}>💰</Text>
            <Text style={popupStyles.ruleText}>Every correct tap gives you +10 Coins!</Text>
          </View>

          <View style={popupStyles.ruleRow}>
            <Text style={popupStyles.ruleIcon}>❤️</Text>
            <Text style={popupStyles.ruleText}>You start with 5 Lives. A wrong tap or running out of time loses 1 life.</Text>
          </View>

          <View style={popupStyles.ruleRow}>
            <Text style={popupStyles.ruleIcon}>💀</Text>
            <Text style={popupStyles.ruleText}>When all 5 lives are gone, the game ends and you keep your coins.</Text>
          </View>

          <TouchableOpacity
            style={popupStyles.button}
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onClose();
            }}
          >
            <Text style={popupStyles.buttonText}>START GAME</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const popupStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  container: { width: '100%', maxHeight: '85%', backgroundColor: '#12122a', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(241, 196, 15, 0.4)' },
  imageBg: { width: '100%', height: 160, justifyContent: 'flex-end' },
  imageOverlay: { backgroundColor: 'rgba(10,10,20,0.75)', padding: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  title: { color: '#f1c40f', fontSize: 28, fontWeight: '900', letterSpacing: 3, textAlign: 'center' },
  subtitle: { color: '#dfe6e9', fontSize: 12, fontWeight: '600', letterSpacing: 4, textAlign: 'center', marginTop: 4 },
  content: { padding: 24 },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 15 },
  ruleIcon: { fontSize: 22, width: 30, textAlign: 'center' },
  ruleText: { color: '#dfe6e9', fontSize: 15, flex: 1, lineHeight: 22, fontWeight: '500' },
  button: { backgroundColor: '#f1c40f', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#f1c40f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  buttonText: { color: '#0a0a14', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
});

// --- MAIN SCREEN ---
export default function ColorDash() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [lives, setLives] = useState(MAX_LIVES);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  
  const [targetText, setTargetText] = useState('');
  const [options, setOptions] = useState<ColorOption[]>([]);
  const [correctRemaining, setCorrectRemaining] = useState(0);
  const [tappedIds, setTappedIds] = useState<Set<number>>(new Set());

  const [timeLeft, setTimeLeft] = useState(100);
  const timerAnim = useRef(new Animated.Value(100)).current;
  const timerInterval = useRef<any>(null);
  const router = useRouter();

const { addCoins } = useAuth();

  const clearTimer = () => { if (timerInterval.current) clearInterval(timerInterval.current); };

  const startTimer = (duration: number) => {
    clearTimer();
    setTimeLeft(duration);
    timerAnim.setValue(duration);
    Animated.timing(timerAnim, { toValue: 0, duration: duration * 10, useNativeDriver: false }).start();
    let time = duration;
    timerInterval.current = setInterval(() => {
      time -= 1;
      if (time <= 0) { 
        clearTimer(); 
        loseLife("Time's up!"); 
      }
      else setTimeLeft(time);
    }, 10);
  };

  const loadRound = useCallback(() => {
    const roundData = generateRound(roundsPlayed);
    setTargetText(roundData.targetText);
    setOptions(roundData.options);
    setCorrectRemaining(roundData.correctCount);
    setTappedIds(new Set());
    
    // Gets faster as you play more rounds
    const duration = Math.max(40, 120 - (roundsPlayed * 2)); 
    startTimer(duration);
  }, [roundsPlayed]);

  useEffect(() => {
    if (!showInstructions && gameStatus === 'playing') {
      loadRound();
    }
    return () => clearTimer();
  }, [showInstructions, gameStatus, loadRound]);

  const loseLife = (reason: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    const newLives = lives - 1;
    setLives(newLives);

    if (newLives <= 0) {
      setGameStatus('gameover');
      setTimeout(() => {
       Alert.alert(
  "🎉 Game Over",
  `${reason}

You earned ${coinsEarned} Coins.

Do you want to claim your reward?`,
  [
    {
      text: "Play Again",
      onPress: resetGame,
    },
    {
      text: `Claim ${coinsEarned} Coins`,
      onPress: async () => {
        try {
          await addCoins(coinsEarned);

          Alert.alert(
            "Reward Claimed",
            `${coinsEarned} coins have been added to your account.`,
            [
              {
                text: "OK",
                onPress: resetGame,
              },
            ]
          );
        } catch {
          Alert.alert(
            "Error",
            "Unable to save your reward."
          );
        }
      },
    },
  ]
);
      }, 400);
    } else {
      // Flash red and skip to next round
      setTimeout(() => {
        setRoundsPlayed(r => r + 1);
      }, 600);
    }
  };

  const handleTap = (index: number) => {
    if (gameStatus !== 'playing' || tappedIds.has(index)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newTapped = new Set(tappedIds);
    newTapped.add(index);
    setTappedIds(newTapped);

    if (options[index].text === targetText) {
      // CORRECT!
      const newCorrectRemaining = correctRemaining - 1;
      setCorrectRemaining(newCorrectRemaining);
      setCoinsEarned(c => c + COINS_PER_TAP); // ADD 10 COINS
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (newCorrectRemaining <= 0) {
        clearTimer();
        // Round complete, go to next
        setTimeout(() => {
          setRoundsPlayed(r => r + 1);
        }, 300);
      }
    } else {
      // WRONG TAP!
      clearTimer();
      loseLife(`You tapped "${options[index].text}" instead of "${targetText}".`);
    }
  };

  const resetGame = () => {
    clearTimer();
    setGameStatus('playing');
    setLives(MAX_LIVES);
    setCoinsEarned(0);
    setRoundsPlayed(0);
  };

  const widthInterpolate = timerAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  const getTimerColor = () => timeLeft > 60 ? '#2ecc71' : timeLeft > 30 ? '#f1c40f' : '#e74c3c';

  return (
    <View style={styles.container}>
      <InstructionsPopup visible={showInstructions} onClose={() => setShowInstructions(false)} />
    <View style={styles.topBar}>
  <TouchableOpacity
    style={styles.backButton}
    onPress={() => router.back()}
  >
    <Text style={styles.backText}>← Back</Text>
  </TouchableOpacity>
</View>

      {/* Header Stats */}
      <View style={styles.header}>
        <View style={styles.statBox}>
          <Text style={styles.scoreLabel}>LIVES</Text>
          <Text style={styles.livesText}>{'❤️'.repeat(lives)}{'🖤'.repeat(MAX_LIVES - lives)}</Text>
        </View>
        
        <View style={styles.coinBox}>
          <Text style={styles.coinText}>+{coinsEarned} 💰</Text>
        </View>
      </View>

      {/* Target Prompt */}
      <View style={styles.promptContainer}>
        <Text style={styles.promptSubText}>FIND THE WORD:</Text>
        <Text style={[styles.promptText, { color: COLORS_MAP[targetText] || '#fff' }]}>
          {targetText}
        </Text>
        <Text style={styles.promptHint}>(Ignore the text color!)</Text>
      </View>

      {/* Timer Bar */}
      <View style={styles.timerOuter}>
        <Animated.View style={[styles.timerInner, { width: widthInterpolate, backgroundColor: getTimerColor() }]} />
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {options.map((opt, index) => {
          const isTapped = tappedIds.has(index);
          const isCorrectTile = opt.text === targetText;
          
          let bgColor = '#1e272e';
          if (isTapped && isCorrectTile) bgColor = '#27ae60'; 
          if (isTapped && !isCorrectTile) bgColor = '#c0392b'; 

          return (
            <TouchableOpacity
              key={index}
              style={[styles.cell, { backgroundColor: bgColor, opacity: isTapped ? 0.5 : 1 }]}
              onPress={() => handleTap(index)}
              activeOpacity={0.8}
              disabled={isTapped}
            >
              <Text style={[styles.cellText, { color: opt.textColor }]}>
                {opt.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>
        Tap {correctRemaining} more correct tile{correctRemaining !== 1 ? 's' : ''} (+{COINS_PER_TAP} each)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a14', paddingTop: 60, paddingHorizontal: 20, alignItems: 'center' },
  header: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  statBox: { backgroundColor: '#1e272e', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12, alignItems: 'center', flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  scoreLabel: { color: '#636e72', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  livesText: { fontSize: 16 }, // Hearts display
  coinBox: { backgroundColor: '#2d3436', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(241, 196, 15, 0.3)' },
  coinText: { color: '#f1c40f', fontSize: 20, fontWeight: '900' },
  promptContainer: { alignItems: 'center', marginBottom: 20 },
  promptSubText: { color: '#a4b0be', fontSize: 14, fontWeight: '700', letterSpacing: 2, marginBottom: 5 },
  promptText: { fontSize: 50, fontWeight: '900', letterSpacing: 5 },
  promptHint: { color: '#636e72', fontSize: 12, marginTop: 5, fontStyle: 'italic' },
  timerOuter: { width: '100%', height: 8, backgroundColor: '#2f3542', borderRadius: 4, marginBottom: 30, overflow: 'hidden' },
  timerInner: { height: '100%', borderRadius: 4 },
  grid: { width: '100%', aspectRatio: 1, maxWidth: 350, flexDirection: 'row', flexWrap: 'wrap', borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#2f3542' },
  cell: { width: '25%', aspectRatio: 1, borderWidth: 1, borderColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  cellText: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase' },
  footerText: { color: '#a4b0be', fontSize: 16, fontWeight: '700', marginTop: 30, letterSpacing: 1 },
  topBar: {
  width: "100%",
  marginTop: 50,
  marginBottom: 10,
},

backButton: {
  alignSelf: "flex-start",
  paddingVertical: 8,
  paddingHorizontal: 12,
},

backText: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "700",
},
});