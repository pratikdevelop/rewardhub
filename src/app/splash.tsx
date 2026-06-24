import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { COLORS, SIZES, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const logoScale   = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const dotAnim     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Pop the logo in
    Animated.spring(logoScale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();

    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // 2. Fade tagline in after logo settles
    setTimeout(() => {
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 500);

    // 3. Pulse the loading dots
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circleTop]} />
      <View style={[styles.circle, styles.circleBottom]} />

      {/* Logo */}
      <Animated.View style={[
        styles.logoWrap,
        { transform: [{ scale: logoScale }], opacity: logoOpacity },
      ]}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>🎮</Text>
        </View>
        <Text style={styles.appName}>Reward Tube</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
        PLAY  •  EARN  •  REDEEM
      </Animated.Text>

      {/* Loading dots */}
      <Animated.View style={[styles.dots, { opacity: dotAnim }]}>
        <View style={styles.dot} />
        <View style={[styles.dot, { marginHorizontal: SPACING.sm }]} />
        <View style={styles.dot} />
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // decorative blobs
  circle: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    opacity: 0.08,
  },
  circleTop: {
    backgroundColor: COLORS.primary,
    top: -width * 0.2,
    right: -width * 0.2,
  },
  circleBottom: {
    backgroundColor: COLORS.gold,
    bottom: -width * 0.2,
    left: -width * 0.2,
  },

  // logo
  logoWrap: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  logoIcon: {
    fontSize: 52,
  },
  appName: {
    color: COLORS.white,
    fontSize: SIZES.xxxl,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // tagline
  tagline: {
    color: COLORS.gold,
    fontSize: SIZES.sm,
    fontWeight: '600',
    letterSpacing: 3,
    marginBottom: SPACING.xxl * 2,
  },

  // loading dots
  dots: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});
