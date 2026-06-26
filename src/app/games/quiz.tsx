import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdModal from '../../components/AdModal';
import { COLORS, RADIUS, SIZES, SPACING } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useAdGate } from '../../hooks/useAdGate';

const ALL_QUESTIONS = [
  { q: 'Capital of India?',                  opts: ['Mumbai','New Delhi','Kolkata','Chennai'], ans: 1 },
  { q: 'Days in a leap year?',               opts: ['364','365','366','367'],                  ans: 2 },
  { q: 'Planet closest to the Sun?',         opts: ['Venus','Earth','Mars','Mercury'],          ans: 3 },
  { q: '15% of 200 = ?',                     opts: ['25','30','35','40'],                       ans: 1 },
  { q: 'Largest ocean?',                     opts: ['Atlantic','Indian','Pacific','Arctic'],    ans: 2 },
  { q: 'Sides of a hexagon?',                opts: ['5','6','7','8'],                           ans: 1 },
  { q: 'Symbol for Gold?',                   opts: ['Go','Gd','Au','Ag'],                       ans: 2 },
  { q: 'How many continents?',               opts: ['5','6','7','8'],                           ans: 2 },
  { q: '12 × 12 = ?',                        opts: ['132','144','156','124'],                   ans: 1 },
  { q: 'Inventor of the telephone?',         opts: ['Edison','Tesla','Bell','Marconi'],         ans: 2 },
  { q: 'Fastest land animal?',               opts: ['Lion','Cheetah','Leopard','Horse'],        ans: 1 },
  { q: 'Largest planet in solar system?',    opts: ['Saturn','Neptune','Jupiter','Uranus'],     ans: 2 },
];

const TOTAL_QS    = 5;
const COINS_EACH  = 5;

function pickQuestions() {
  return [...ALL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, TOTAL_QS);
}

export default function QuizScreen() {
  const { addCoins } = useAuth();
  const router       = useRouter();
  const fadeAnim     = useRef(new Animated.Value(1)).current;

  const [questions, setQuestions] = useState(pickQuestions);
  const [qIndex,    setQIndex]    = useState(0);
  const [score,     setScore]     = useState(0);
  const [selected,  setSelected]  = useState<number | null>(null);
  const [finished,  setFinished]  = useState(false);

  const resetGame = useCallback(() => {
    setQuestions(pickQuestions());
    setQIndex(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  }, []);

  const { adVisible, requestPlayAgain, onAdClose } = useAdGate(resetGame);

  const handleAnswer = (optIdx: number) => {
    if (selected !== null) return;
    setSelected(optIdx);

    const correct  = optIdx === questions[qIndex].ans;
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);

    setTimeout(() => {
      if (qIndex + 1 >= TOTAL_QS) {
        setFinished(true);
        const earned = newScore * COINS_EACH;
        if (earned > 0) addCoins(earned);
      } else {
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        setQIndex(q => q + 1);
        setSelected(null);
      }
    }, 900);
  };

  const q      = questions[qIndex];
  const earned = score * COINS_EACH;

  const optStyle = (i: number) => {
    if (selected === null) return styles.option;
    if (i === q.ans)    return [styles.option, styles.optCorrect];
    if (i === selected) return [styles.option, styles.optWrong];
    return [styles.option, styles.optDim];
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹  Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🧠  Quiz Time</Text>
        <View style={{ width: 64 }} />
      </View>

      {!finished ? (
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Progress */}
          <View style={styles.progressWrap}>
            <View style={[styles.progressBar, { width: `${(qIndex / TOTAL_QS) * 100}%` }]} />
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>Q {qIndex + 1} / {TOTAL_QS}</Text>
            <Text style={styles.scoreText}>Score: {score} 🏆</Text>
          </View>

          {/* Question */}
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{q.q}</Text>
          </View>

          {/* Options */}
          <View style={styles.options}>
            {q.opts.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={optStyle(i)}
                onPress={() => handleAnswer(i)}
                disabled={selected !== null}
                activeOpacity={0.8}
              >
                <View style={styles.optBadge}>
                  <Text style={styles.optBadgeText}>{String.fromCharCode(65 + i)}</Text>
                </View>
                <Text style={styles.optText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      ) : (
        /* Finished screen */
        <View style={styles.finishWrap}>
          <Text style={styles.finishEmoji}>{score >= 4 ? '🏆' : score >= 2 ? '🎉' : '😢'}</Text>
          <Text style={styles.finishTitle}>Quiz Complete!</Text>
          <Text style={styles.finishSub}>You got {score} out of {TOTAL_QS} correct</Text>

          <View style={styles.earnedCard}>
            <Text style={styles.earnedLabel}>Coins Earned</Text>
            <Text style={styles.earnedValue}>+{earned}  💰</Text>
          </View>

          <TouchableOpacity style={styles.againBtn} onPress={requestPlayAgain}>
            <Text style={styles.againText}>🔄  Play Again (Watch Ad)</Text>
          </TouchableOpacity>
        </View>
      )}

      <AdModal visible={adVisible} onClose={onAdClose} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, marginBottom: SPACING.md },
  backBtn: { padding: SPACING.sm },
  backText:{ color: COLORS.primary, fontSize: SIZES.lg },
  title:   { color: COLORS.white, fontSize: SIZES.xl, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: SPACING.xl },

  progressWrap: { height: 6, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: SPACING.sm },
  progressBar:  { height: '100%', backgroundColor: COLORS.quiz, borderRadius: RADIUS.full },
  metaRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xl },
  meta:      { color: COLORS.textMuted, fontSize: SIZES.sm },
  scoreText: { color: COLORS.gold, fontSize: SIZES.sm, fontWeight: '700' },

  questionCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    padding: SPACING.xl, marginBottom: SPACING.xl,
    minHeight: 110, justifyContent: 'center',
  },
  questionText: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: '600', textAlign: 'center', lineHeight: 26 },

  options:  { gap: SPACING.md },
  option: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1.5, borderColor: 'rgba(124,92,191,0.25)',
    gap: SPACING.md,
  },
  optCorrect: { backgroundColor: '#14532d', borderColor: COLORS.success },
  optWrong:   { backgroundColor: '#7f1d1d', borderColor: COLORS.error },
  optDim:     { opacity: 0.35 },
  optBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  optBadgeText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.sm },
  optText:      { color: COLORS.white, fontSize: SIZES.md, flex: 1 },

  finishWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  finishEmoji:{ fontSize: 80, marginBottom: SPACING.lg },
  finishTitle:{ color: COLORS.white, fontSize: SIZES.xxl, fontWeight: '700' },
  finishSub:  { color: COLORS.textMuted, fontSize: SIZES.md, marginTop: SPACING.sm, marginBottom: SPACING.xl },
  earnedCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    padding: SPACING.xl, width: '100%', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.gold, marginBottom: SPACING.xl,
  },
  earnedLabel: { color: COLORS.textMuted, fontSize: SIZES.sm, marginBottom: SPACING.sm },
  earnedValue: { color: COLORS.gold, fontSize: 40, fontWeight: '700' },

  againBtn: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, paddingVertical: 14, paddingHorizontal: 36, borderWidth: 1.5, borderColor: COLORS.quiz, width: '100%', alignItems: 'center' },
  againText: { color: COLORS.quiz, fontSize: SIZES.md, fontWeight: '600' },
});