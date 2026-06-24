import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { router } from 'expo-router';

import { useAuth } from '../context/AuthContext';

import {
  PrimaryButton,
  GhostButton,
  AppInput,
  InlineToast,
} from '../components';

import {
  COLORS,
  SIZES,
  SPACING,
  RADIUS,
} from '../constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] =
    useState<string>('');

  const [password, setPassword] =
    useState<string>('');

  const [loading, setLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>('');

  const handleLogin = async () => {
    if (
      !email.trim() ||
      !password.trim()
    ) {
      setError(
        'Please enter your email and password.'
      );

      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(
        email.trim(),
        password
      );

      router.replace('/home');
    } catch (e: any) {
      setError(
        e?.message ||
          'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={
          styles.container
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.logoIcon}>
            🎮
          </Text>

          <Text style={styles.appName}>
            Reward Tube
          </Text>

          <Text style={styles.subtitle}>
            Sign in to continue earning
          </Text>
        </View>

        {/* Card */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Welcome Back
          </Text>

          <InlineToast
            message={error}
            type="error"
          />

          <AppInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
          />

          <AppInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.forgotWrap}
          >
            <Text
              style={styles.forgotText}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <PrimaryButton
            title="SIGN IN"
            onPress={handleLogin}
            loading={loading}
            style={styles.signInBtn}
          />
        </View>

        {/* Divider */}

        <View style={styles.divider}>
          <View style={styles.line} />

          <Text style={styles.orText}>
            OR
          </Text>

          <View style={styles.line} />
        </View>

        {/* Register */}

        <GhostButton
          title="CREATE NEW ACCOUNT"
          onPress={() =>
            router.push('/register')
          }
        />

        {/* Terms */}

        <Text style={styles.terms}>
          By signing in you agree to our{' '}
          <Text style={styles.link}>
            Terms of Service
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  container: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },

  logoIcon: {
    fontSize: 58,
    marginBottom: SPACING.sm,
  },

  appName: {
    color: COLORS.white,
    fontSize: SIZES.xxl,
    fontWeight: '700',
    letterSpacing: 1,
  },

  subtitle: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    marginTop: SPACING.xs,
  },

  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },

  cardTitle: {
    color: COLORS.white,
    fontSize: SIZES.xl,
    fontWeight: '700',
    marginBottom: SPACING.lg,
  },

  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
    marginTop: -SPACING.sm,
  },

  forgotText: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
  },

  signInBtn: {
    marginTop: SPACING.sm,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor:
      'rgba(255,255,255,0.12)',
  },

  orText: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginHorizontal: SPACING.md,
    fontWeight: '600',
  },

  terms: {
    color: COLORS.textHint,
    fontSize: SIZES.xs,
    textAlign: 'center',
    marginTop: SPACING.xl,
    lineHeight: 20,
  },

  link: {
    color: COLORS.primary,
  },
});
