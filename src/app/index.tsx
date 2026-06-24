import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { router } from 'expo-router';

export default function Index() {
  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1542751371-adc38448a05e',
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={[
          'rgba(0,0,0,0.85)',
          'rgba(18,18,18,0.95)',
        ]}
        style={styles.overlay}
      >
        {/* Logo Area */}

        <View style={styles.logoWrap}>
          <Text style={styles.logoEmoji}>
            🎮
          </Text>

          <Text style={styles.title}>
            RewardTube
          </Text>

          <Text style={styles.subtitle}>
            PLAY • WIN • EARN REAL REWARDS
          </Text>
        </View>

        {/* Hero Card */}

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>
            Daily Gaming Rewards
          </Text>

          <Text style={styles.heroText}>
            Spin wheels, solve quizzes,
            scratch cards, and earn coins
            every day.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                50K+
              </Text>

              <Text style={styles.statLabel}>
                Players
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                ₹10L+
              </Text>

              <Text style={styles.statLabel}>
                Rewards
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                24/7
              </Text>

              <Text style={styles.statLabel}>
                Games
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons */}

        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.9}
          onPress={() =>
            router.push('/login')
          }
        >
          <LinearGradient
            colors={[
              '#8B5CF6',
              '#6D28D9',
            ]}
            style={styles.primaryGradient}
          >
            <Text style={styles.primaryText}>
              START PLAYING
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.8}
          onPress={() =>
            router.push('/register')
          }
        >
          <Text style={styles.secondaryText}>
            CREATE ACCOUNT
          </Text>
        </TouchableOpacity>

        {/* Footer */}

        <Text style={styles.footer}>
          Secure • Fast Withdrawals • Fun
          Games
        </Text>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#000',
  },

  overlay: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },

  logoWrap: {
    alignItems: 'center',
    marginTop: 20,
  },

  logoEmoji: {
    fontSize: 72,
    marginBottom: 14,
  },

  title: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 1,
  },

  subtitle: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
    letterSpacing: 3,
    textAlign: 'center',
  },

  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 14,
  },

  heroText: {
    color: '#CFCFCF',
    fontSize: 16,
    lineHeight: 24,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },

  statBox: {
    alignItems: 'center',
    flex: 1,
  },

  statValue: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: '800',
  },

  statLabel: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 6,
  },

  primaryBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 30,
  },

  primaryGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 18,
  },

  primaryText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },

  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
  },

  secondaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },

  footer: {
    color: '#777',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 24,
  },
});
