import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdModal from '../../components/AdModal';
import { COLORS, RADIUS, SIZES, SPACING } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useAdGate } from '../../hooks/useAdGate';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const makeCode = (len = 5) =>
  Array.from({ length: len }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');

// Per-character style for distortion effect
const CHAR_COLORS   = ['#f5a623', '#22c55e', '#a855f7', '#3b82f6', '#ef4444'];
const CHAR_ROTATIONS = [-12, 8, -6, 10, -8];

export default function CaptchaScreen() {
  const { addCoins } = useAuth();
  const router       = useRouter();

  const [code,    setCode]    = useState(makeCode);
  const [input,   setInput]   = useState('');
  const [result,  setResult]  = useState('');
  const [correct, setCorrect] = useState(false);
  const [streak,  setStreak]  = useState(0);

  const resetGame = useCallback(() => {
    setCode(makeCode());
    setInput('');
    setResult('');
    setCorrect(false);
  }, []);

  const { adVisible, requestPlayAgain, onAdClose } = useAdGate(resetGame);

  const handleSubmit = () => {
    if (input.trim().toUpperCase() === code) {
      const earned = 5;
      addCoins(earned);
      setStreak(s => s + 1);
      setResult(`✅ Correct! +${earned} coins earned!`);
      setCorrect(true);
    } else {
      setStreak(0);
      setResult('❌ Wrong code. New one generated!');
      setCode(makeCode());
      setInput('');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹  Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔐  Captcha Task</Text>
        <View style={{ width: 64 }} />
      </View>

      <Text style={styles.sub}>Type the code exactly to earn 5 coins!</Text>

      {streak > 0 && (
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 Streak: {streak}</Text>
        </View>
      )}

      {/* Captcha display */}
      <View style={styles.captchaBox}>
        {/* Noise lines */}
        <View style={[styles.noiseLine, { top: '25%', transform: [{ rotate: '-4deg' }] }]} />
        <View style={[styles.noiseLine, { top: '65%', transform: [{ rotate: '3deg' }] }]} />
        <View style={styles.charRow}>
          {code.split('').map((ch, i) => (
            <Text
              key={i}
              style={[
                styles.codeChar,
                {
                  color: CHAR_COLORS[i % CHAR_COLORS.length],
                  transform: [{ rotate: `${CHAR_ROTATIONS[i]}deg` }, { translateY: i % 2 === 0 ? -5 : 5 }],
                },
              ]}
            >
              {ch}
            </Text>
          ))}
        </View>
      </View>

      <TouchableOpacity onPress={resetGame} style={styles.refreshRow}>
        <Text style={styles.refreshText}>🔄  Refresh code</Text>
      </TouchableOpacity>

      {/* Input */}
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={t => setInput(t.toUpperCase())}
        placeholder="Enter code here"
        placeholderTextColor={COLORS.textHint}
        autoCapitalize="characters"
        maxLength={5}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        editable={!correct}
      />

      {/* Result */}
      {result !== '' && (
        <Text style={[styles.result, correct ? styles.win : styles.error]}>{result}</Text>
      )}

      {!correct ? (
        <TouchableOpacity
          style={[styles.submitBtn, input.length < 5 && styles.disabled]}
          onPress={handleSubmit}
          disabled={input.length < 5}
        >
          <Text style={styles.submitText}>Submit & Earn  💰</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.againBtn} onPress={requestPlayAgain}>
          <Text style={styles.againText}>🔄  New Captcha (Watch Ad)</Text>
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
  sub:     { color: COLORS.textMuted, fontSize: SIZES.sm, marginBottom: SPACING.lg, textAlign: 'center' },

  streakBadge: { backgroundColor: 'rgba(245,166,35,0.15)', borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.gold, marginBottom: SPACING.lg },
  streakText:  { color: COLORS.gold, fontWeight: '700', fontSize: SIZES.sm },

  captchaBox: {
    width: '100%', height: 100,
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.lg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
    overflow: 'hidden',
    position: 'relative',
  },
  noiseLine: {
    position: 'absolute', width: '130%', height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  charRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  codeChar: { fontSize: 34, fontWeight: '900', fontFamily: 'monospace' },

  refreshRow: { marginBottom: SPACING.xl },
  refreshText:{ color: COLORS.primary, fontSize: SIZES.sm },

  input: {
    width: '100%',
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.md,
    height: 56, paddingHorizontal: SPACING.lg,
    color: COLORS.white, fontSize: SIZES.xxl,
    textAlign: 'center', letterSpacing: 10,
    borderWidth: 1, borderColor: 'rgba(124,92,191,0.4)',
    marginBottom: SPACING.md, fontWeight: '700',
  },

  result: { fontSize: SIZES.md, fontWeight: '600', marginBottom: SPACING.lg, textAlign: 'center' },
  win:    { color: COLORS.success },
  error:  { color: COLORS.error },

  submitBtn:  { backgroundColor: COLORS.captcha, borderRadius: RADIUS.lg, paddingVertical: 14, paddingHorizontal: 48, width: '100%', alignItems: 'center' },
  submitText: { color: COLORS.white, fontSize: SIZES.md, fontWeight: '700' },
  disabled:   { opacity: 0.4 },

  againBtn: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, paddingVertical: 14, paddingHorizontal: 36, borderWidth: 1.5, borderColor: COLORS.captcha, width: '100%', alignItems: 'center' },
  againText: { color: COLORS.captcha, fontSize: SIZES.md, fontWeight: '600' },
});