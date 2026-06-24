import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { router } from 'expo-router';

import { useAuth } from '../context/AuthContext';

import {
  COLORS,
  SIZES,
  SPACING,
  RADIUS,
} from '../constants/theme';

const { width } = Dimensions.get('window');

const CARD_SIZE =
  (width - SPACING.xl * 2 - SPACING.md) / 2;

const GAMES = [
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
  const { user, coins, logout } = useAuth();

  const handleGamePress = (
    gameKey: string
  ) => {
    alert(
      `Opening ${gameKey} — build this screen next!`
    );

    // Example later:
    // router.push(`/games/${gameKey}`);
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
        {/* Top Bar */}

        <View style={styles.topBar}>
          <Text style={styles.appName}>
            Reward Tube
          </Text>

          <TouchableOpacity
            onPress={logout}
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
            {user?.email}
          </Text>

          <Text style={styles.coinBalance}>
            Coins :
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
            alert(
              'Withdrawal screen — coming next!'
            )
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
          {GAMES.map(game => (
            <TouchableOpacity
              key={game.key}
              style={[
                styles.gameCard,
                {
                  backgroundColor:
                    game.color,
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

              <Text style={styles.gameName}>
                {game.label}
              </Text>

              <Text style={styles.gameSub}>
                {game.sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Banner */}

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
    paddingBottom: SPACING.xxl * 2,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },

  appName: {
    color: COLORS.white,
    fontSize: SIZES.xl,
    fontWeight: '700',
  },

  logoutBtn: {
    padding: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutText: {
    fontSize: 18,
  },

  tagline: {
    color: COLORS.gold,
    fontSize: SIZES.xs,
    fontWeight: '700',
    letterSpacing: 2.5,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },

  coinCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  coinEmail: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: SIZES.sm,
    marginBottom: SPACING.sm,
  },

  coinBalance: {
    color: COLORS.gold,
    fontSize: SIZES.xxl,
    fontWeight: '700',
  },

  coinNumber: {
    color: COLORS.gold,
  },

  withdrawBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },

  withdrawText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },

  gameCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    justifyContent: 'flex-end',
  },

  gameEmoji: {
    fontSize: 36,
    marginBottom: 'auto',
  },

  gameName: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '700',
    marginTop: SPACING.lg,
  },

  gameSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: SIZES.xs,
    marginTop: 2,
  },

  dailyBanner: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: SIZES.sm,
    marginTop: 3,
  },

  dailyArrow: {
    color: COLORS.gold,
    fontSize: 28,
    fontWeight: '300',
  },
});