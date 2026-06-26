import { useRouter } from 'expo-router';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SIZES, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

// Mock data — replace with Firestore query later
const TRANSACTIONS = [
  { id: '1', game: 'Spin Wheel',   type: 'win',        amount: +20,  time: '2 hrs ago'  },
  { id: '2', game: 'Quiz Time',    type: 'win',        amount: +15,  time: '5 hrs ago'  },
  { id: '3', game: 'Daily Bonus',  type: 'bonus',      amount: +10,  time: 'Yesterday'  },
  { id: '4', game: 'UPI Payout',   type: 'withdrawal', amount: -500, time: '2 days ago' },
  { id: '5', game: 'Lucky Number', type: 'win',        amount: +30,  time: '3 days ago' },
  { id: '6', game: 'Scratch Card', type: 'win',        amount: +25,  time: '4 days ago' },
];

const STATS = [
  { label: 'Games Played', value: '24',  emoji: '🎮' },
  { label: 'Total Earned', value: '890', emoji: '💰' },
  { label: 'Withdrawn',    value: '500', emoji: '💳' },
  { label: 'Referrals',    value: '0',   emoji: '👥' },
];

const SETTINGS = [
  { label: 'Change Password',        emoji: '🔑' },
  { label: 'Notification Settings',  emoji: '🔔' },
  { label: 'Privacy Policy',         emoji: '📄' },
  { label: 'Help & Support',         emoji: '💬' },
];

export default function ProfileScreen() {
  const { user, coins, logout } = useAuth();
  const router = useRouter();

  const confirmLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const avatar = (user?.displayName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹  Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={confirmLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{avatar}</Text>
          </View>
          <Text style={styles.name}>{user?.displayName ?? 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.coinPill}>
            <Text style={styles.coinPillText}>💰  {coins} coins</Text>
          </View>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          {STATS.map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Transaction history */}
        <Text style={styles.sectionTitle}>Transaction History</Text>
        <View style={styles.txCard}>
          {TRANSACTIONS.map((tx, i) => (
            <View
              key={tx.id}
              style={[styles.txRow, i < TRANSACTIONS.length - 1 && styles.txBorder]}
            >
              <View style={styles.txLeft}>
                <Text style={styles.txGame}>{tx.game}</Text>
                <Text style={styles.txTime}>{tx.time}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.amount > 0 ? COLORS.success : COLORS.error }]}>
                {tx.amount > 0 ? `+${tx.amount}` : tx.amount}  💰
              </Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.settingsCard}>
          {SETTINGS.map((s, i) => (
            <TouchableOpacity
              key={s.label}
              style={[styles.settingsRow, i < SETTINGS.length - 1 && styles.settingsBorder]}
            >
              <Text style={styles.settingsEmoji}>{s.emoji}</Text>
              <Text style={styles.settingsLabel}>{s.label}</Text>
              <Text style={styles.settingsArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
          <Text style={styles.logoutBtnText}>⎋  Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.xl, paddingBottom: 60 },

  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xl },
  backBtn:    { padding: SPACING.sm },
  backText:   { color: COLORS.primary, fontSize: SIZES.lg },
  title:      { color: COLORS.white, fontSize: SIZES.xl, fontWeight: '700' },
  logoutText: { color: COLORS.error, fontSize: SIZES.md },

  avatarCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.xl },
  avatar:     { width: 76, height: 76, borderRadius: 38, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  avatarLetter:{ color: COLORS.white, fontSize: 34, fontWeight: '700' },
  name:       { color: COLORS.white, fontSize: SIZES.xl, fontWeight: '700' },
  email:      { color: COLORS.textMuted, fontSize: SIZES.sm, marginTop: 4 },
  coinPill:   { backgroundColor: 'rgba(245,166,35,0.15)', borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.gold, marginTop: SPACING.md },
  coinPillText:{ color: COLORS.gold, fontWeight: '700', fontSize: SIZES.md },

  sectionTitle: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: '700', marginBottom: SPACING.md, marginTop: SPACING.lg },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  statCard:  { flex: 1, minWidth: '45%', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center' },
  statEmoji: { fontSize: 28, marginBottom: SPACING.xs },
  statValue: { color: COLORS.gold, fontSize: SIZES.xxl, fontWeight: '700' },
  statLabel: { color: COLORS.textMuted, fontSize: SIZES.xs, marginTop: 2, textAlign: 'center' },

  txCard:    { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, overflow: 'hidden' },
  txRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg },
  txBorder:  { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  txLeft:    { flex: 1 },
  txGame:    { color: COLORS.white, fontSize: SIZES.md, fontWeight: '500' },
  txTime:    { color: COLORS.textMuted, fontSize: SIZES.xs, marginTop: 2 },
  txAmount:  { fontSize: SIZES.md, fontWeight: '700' },

  settingsCard:  { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.xl },
  settingsRow:   { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: SPACING.md },
  settingsBorder:{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  settingsEmoji: { fontSize: 20 },
  settingsLabel: { color: COLORS.white, fontSize: SIZES.md, flex: 1 },
  settingsArrow: { color: COLORS.textMuted, fontSize: SIZES.xl },

  logoutBtn:     { borderWidth: 1.5, borderColor: COLORS.error, borderRadius: RADIUS.lg, paddingVertical: 14, alignItems: 'center' },
  logoutBtnText: { color: COLORS.error, fontSize: SIZES.md, fontWeight: '600' },
});