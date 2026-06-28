import { useRouter } from 'expo-router';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';

import {
  COLORS,
  RADIUS,
  SIZES,
  SPACING,
} from '../constants/theme';

const { width } = Dimensions.get('window');

const CARD_SIZE =
  (width - SPACING.xl * 2 - SPACING.md) / 2;

type Game = {
  key: string;
  label: string;
  sub: string;
  emoji: string;
  color: string;
};

const GAMES: Game[] = [
  {
    key: 'spin',
    label: 'Spin Wheel',
    sub: 'Test Your Luck!',
    emoji: '🎡',
    color: COLORS.spin,
  },
  {
    key: 'scratch',
    label: 'Scratch Card',
    sub: 'Reveal Surprises',
    emoji: '🎁',
    color: COLORS.scratch,
  },
    {
    key: 'captcha', // Keep key as 'captcha' so your existing route still works perfectly!
    label: 'Mine Sweeper',
    sub: 'Find Hidden Gems',
    emoji: '💎',
    color: '#00b894', // Beautiful emerald green
  },
  {
    key: 'quiz', // Keeping 'quiz' key so your existing buttons/routing still work!
    label: 'Color Dash',
    sub: 'Brain Trick',
    emoji: '🧠',
    color: '#f1c40f', // Vibrant yellow
  },
  {
    key: 'lucky',
    label: 'Lucky Number',
    sub: 'Pick & Pray!',
    emoji: '🍀',
    color: COLORS.lucky,
  },
  {
    key: 'arcane-duel',
    label: 'Arcane Duel',
    sub: 'Card Battle',
    emoji: '🃏',
    color: '#5B2C8E',
  },
  {
    key: 'ChessGame',
    label: 'Chess',
    sub: 'Strategic Win',
    emoji: '♟️',
    color: '#2D5A27',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleGamePress = (gameKey: string) => {
    router.push(`/games/${gameKey}`); 
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.bg}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ─────────────────────────────── */}
        <View style={styles.topBar}>
          <Text style={styles.appName}>
            Reward Tube
          </Text>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              style={styles.iconBtn}
            >
              <Text style={styles.iconText}>👤</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              onPress={handleLogout}
              style={styles.iconBtn}
            >
              <Text style={styles.logoutText}>⎋</Text>
            </TouchableOpacity> */}
          </View>
        </View>

        {/* ── Tagline ─────────────────────────────── */}
        <Text style={styles.tagline}>
          PLAY • WIN • REPEAT
        </Text>

        {/* ── Token Card ─────────────────────────── */}
        <View style={styles.coinCard}>
          <Text style={styles.coinEmail}>
            {user?.email ?? 'Player'}
          </Text>

          <Text style={styles.coinBalance}>
            Tokens:
            <Text style={styles.coinNumber}>
              {' '}{user?.coins}
            </Text>{' '}🎮
          </Text>
        </View>

        {/* ── Games Section ───────────────────────── */}
        <Text style={styles.sectionLabel}>🎮 Fun Games</Text>

        <View style={styles.grid}>
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.key}
              style={[
                styles.gameCard,
                { backgroundColor: game.color },
              ]}
              activeOpacity={0.85}
              onPress={() => handleGamePress(game.key)}
            >
              <Text style={styles.gameEmoji}>
                {game.emoji}
              </Text>

              <View>
                <Text style={styles.gameName}>
                  {game.label}
                </Text>
                <Text style={styles.gameSub}>
                  {game.sub}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Daily Check-in ──────────────────────── */}
        {/* <TouchableOpacity
          style={styles.dailyBanner}
          activeOpacity={0.85}
        >
          <View>
            <Text style={styles.dailyTitle}>
              🎯 Daily Check-in
            </Text>
            <Text style={styles.dailySub}>
              Claim 10 free tokens every day!
            </Text>
          </View>
          <Text style={styles.dailyArrow}>›</Text>
        </TouchableOpacity> */}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  flex: { flex: 1 },

  scroll: {
    padding: SPACING.xl,
    paddingBottom: 100,
  },

  // Header
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  appName: {
    color: COLORS.white,
    fontSize: SIZES.xl,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 18,
  },

  // Tagline
  tagline: {
    color: COLORS.gold,
    fontSize: SIZES.xs,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },

  // Token card
  coinCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  coinEmail: {
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  coinBalance: {
    color: COLORS.gold,
    fontSize: SIZES.xxl,
    fontWeight: '700',
  },
  coinNumber: {
    color: COLORS.white,
  },

  // Games grid
  sectionLabel: {
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  gameCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  gameEmoji: { fontSize: 36 },
  gameName: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: SIZES.md,
  },
  gameSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: SIZES.xs,
    marginTop: 4,
  },

  // Daily banner
  dailyBanner: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  dailyTitle: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '700',
  },
  dailySub: {
    color: COLORS.textMuted,
    marginTop: 4,
  },
  dailyArrow: {
    color: COLORS.gold,
    fontSize: 30,
  },
});