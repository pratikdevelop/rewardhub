import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SIZES, SPACING } from '../../constants/theme';

const CODE             = 'EARN2025';
const COINS_PER_FRIEND = 20;

export default function ReferScreen() {
  const router         = useRouter();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join Reward Hub and earn coins! Use code ${CODE} to get ${COINS_PER_FRIEND} bonus coins.\n\nDownload: https://rewardhub.app`,
        title: 'Join Reward Hub',
      });
    } catch {
      Alert.alert('Error', 'Could not open share sheet.');
    }
  };

  const handleCopy = () => {
    // Uncomment when expo-clipboard is installed:
    // Clipboard.setStringAsync(CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹  Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>👥  Refer & Earn</Text>
        <View style={{ width: 64 }} />
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🎁</Text>
        <Text style={styles.heroTitle}>Invite Friends,{'\n'}Earn Together!</Text>
        <Text style={styles.heroSub}>
          Both you and your friend get {COINS_PER_FRIEND} coins for every successful referral
        </Text>
      </View>

      {/* Referral code card */}
      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Your Referral Code</Text>
        <Text style={styles.codeValue}>{CODE}</Text>
        <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
          <Text style={styles.copyText}>{copied ? '✅  Copied!' : '📋  Copy Code'}</Text>
        </TouchableOpacity>
      </View>

      {/* Steps */}
      <View style={styles.steps}>
        <Text style={styles.stepsTitle}>How it works</Text>
        {[
          'Share your code with friends',
          'Friend installs & registers with your code',
          'Both of you instantly get 20 coins!',
        ].map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Referred</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Coins Earned</Text>
        </View>
      </View>

      {/* Share button */}
      <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
        <Text style={styles.shareBtnText}>🚀  Share & Earn Now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: SPACING.xl },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: SPACING.md, marginBottom: SPACING.lg },
  backBtn: { padding: SPACING.sm },
  backText:{ color: COLORS.primary, fontSize: SIZES.lg },
  title:   { color: COLORS.white, fontSize: SIZES.xl, fontWeight: '700' },

  hero: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.refer },
  heroEmoji:{ fontSize: 48, marginBottom: SPACING.sm },
  heroTitle:{ color: COLORS.white, fontSize: SIZES.xl, fontWeight: '700', textAlign: 'center', marginBottom: SPACING.sm },
  heroSub:  { color: COLORS.textMuted, fontSize: SIZES.sm, textAlign: 'center', lineHeight: 20 },

  codeCard: { backgroundColor: COLORS.bgInput, borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.lg },
  codeLabel:{ color: COLORS.textMuted, fontSize: SIZES.sm, marginBottom: SPACING.sm },
  codeValue:{ color: COLORS.gold, fontSize: 32, fontWeight: '900', letterSpacing: 6, marginBottom: SPACING.lg },
  copyBtn:  { backgroundColor: COLORS.refer, borderRadius: RADIUS.md, paddingVertical: 10, paddingHorizontal: SPACING.xl },
  copyText: { color: '#111', fontWeight: '700', fontSize: SIZES.md },

  steps:      { marginBottom: SPACING.lg },
  stepsTitle: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: '700', marginBottom: SPACING.md },
  stepRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  stepNum:    { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.refer, alignItems: 'center', justifyContent: 'center' },
  stepNumText:{ color: '#111', fontWeight: '700', fontSize: SIZES.md },
  stepText:   { color: COLORS.textMuted, fontSize: SIZES.md, flex: 1 },

  statsRow:    { flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.xl, alignItems: 'center', justifyContent: 'space-around' },
  statBox:     { alignItems: 'center', flex: 1 },
  statValue:   { color: COLORS.gold, fontSize: SIZES.xxl, fontWeight: '700' },
  statLabel:   { color: COLORS.textMuted, fontSize: SIZES.xs, marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)' },

  shareBtn:     { backgroundColor: COLORS.refer, borderRadius: RADIUS.lg, paddingVertical: 16, alignItems: 'center' },
  shareBtnText: { color: '#111', fontSize: SIZES.lg, fontWeight: '700' },
});