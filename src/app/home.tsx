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
    sub: 'Win Coins',
    emoji: '🎡',
    color: COLORS.spin,
  },
  {
    key: 'scratch',
    label: 'Scratch & Win',
    sub: 'Exciting Rewards',
    emoji: '🎁',
    color: COLORS.scratch,
  },
  {
    key: 'captcha',
    label: 'Captcha Task',
    sub: 'Earn Coins',
    emoji: '🔐',
    color: COLORS.captcha,
  },
  {
    key: 'quiz',
    label: 'Quiz Time',
    sub: 'Answer & Win',
    emoji: '🧠',
    color: COLORS.quiz,
  },
  {
    key: 'lucky',
    label: 'Lucky Number',
    sub: 'Pick & Win',
    emoji: '🍀',
    color: COLORS.lucky,
  },
  {
    key: 'refer',
    label: 'Refer & Earn',
    sub: 'Invite Friends',
    emoji: '👥',
    color: COLORS.refer,
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const { user, coins, logout } = useAuth();

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

        {/* Header */}

        <View style={styles.topBar}>
          <Text style={styles.appName}>
            Reward Tube
          </Text>

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutBtn}
          >
            <Text style={styles.logoutText}>
              ⎋
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tagline */}

        <Text style={styles.tagline}>
          PLAY • EARN • REDEEM
        </Text>

        {/* Coin Card */}

        <View style={styles.coinCard}>
          <Text style={styles.coinEmail}>
            {user?.email ?? 'No Email'}
          </Text>

          <Text style={styles.coinBalance}>
            Coins:
            <Text style={styles.coinNumber}>
              {' '}
              {coins}
            </Text>{' '}
            💰
          </Text>
        </View>

        {/* Withdrawal */}

        <TouchableOpacity
          style={styles.withdrawBtn}
          activeOpacity={0.85}
          onPress={() =>
            alert('Withdrawal screen coming soon')
          }
        >
          <Text style={styles.withdrawText}>
            💳 WITHDRAWAL
          </Text>
        </TouchableOpacity>

        {/* Games */}

        <Text style={styles.sectionLabel}>
          Games
        </Text>

        <View style={styles.grid}>
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.key}
              style={[
                styles.gameCard,
                {
                  backgroundColor: game.color,
                },
              ]}
              activeOpacity={0.85}
              onPress={() =>
                handleGamePress(game.key)
              }
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

        {/* Daily Reward */}

        <TouchableOpacity
          style={styles.dailyBanner}
          activeOpacity={0.85}
        >
          <View>
            <Text style={styles.dailyTitle}>
              🎯 Daily Check-in
            </Text>

            <Text style={styles.dailySub}>
              Claim 10 free coins every day!
            </Text>
          </View>

          <Text style={styles.dailyArrow}>
            ›
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  flex: {
    flex: 1,
  },

  scroll: {
    padding: SPACING.xl,
    paddingBottom: 100,
  },

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

  tagline: {
    color: COLORS.gold,
    fontSize: SIZES.xs,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },

  coinCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
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

  withdrawBtn: {
    height: 55,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },

  withdrawText: {
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 1,
  },

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

  gameEmoji: {
    fontSize: 36,
  },

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