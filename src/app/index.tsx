import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { router } from 'expo-router';

export default function Index() {
  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?q=80&w=2000&auto=format&fit=crop', // Colorful abstract gaming background
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
          'rgba(0,0,0,0.8)',
          'rgba(10,10,18,0.95)',
        ]}
        style={styles.overlay}
      >
        {/* Logo Area */}
        <View style={styles.logoWrap}>
          <Text style={styles.logoEmoji}>🎮</Text>
          <Text style={styles.title}>RewardTube</Text>
          <Text style={styles.subtitle}>
            FUN GAMES • DAILY CHALLENGES
          </Text>
        </View>

        {/* Hero Card - Focused on Games */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>
            Test Your Skills
          </Text>

          <Text style={styles.heroText}>
            Battle in card duels, sweep for gems, and trick your brain with fast-paced arcade games.
          </Text>

          <View style={styles.gameTags}>
            <View style={styles.tag}>
              <Text style={styles.tagEmoji}>🃏</Text>
              <Text style={styles.tagText}>Card Duels</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagEmoji}>💎</Text>
              <Text style={styles.tagText}>Mine Sweep</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagEmoji}>🧠</Text>
              <Text style={styles.tagText}>Brain Tricks</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>5+</Text>
              <Text style={styles.statLabel}>Unique Games</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>∞</Text>
              <Text style={styles.statLabel}>Replayability</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>24/7</Text>
              <Text style={styles.statLabel}>Play Anytime</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.9}
            onPress={() => router.push('/login')}
          >
            <LinearGradient
              colors={['#8B5CF6', '#6D28D9']}
              style={styles.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryText}>START PLAYING</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.8}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.secondaryText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          100% Free • No Ads • Pure Fun
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
    marginBottom: 20,
  },
  gameTags: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginBottom: 10,
  },
  tag: {
    alignItems: 'center',
    flex: 1,
  },
  tagEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  tagText: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
  buttonContainer: {
    marginTop: 30,
  },
  primaryBtn: {
    borderRadius: 18,
    overflow: 'hidden',
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