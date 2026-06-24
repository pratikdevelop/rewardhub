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
  AppInput,
  InlineToast,
} from '../components';

import {
  COLORS,
  SIZES,
  SPACING,
  RADIUS,
} from '../constants/theme';

export default function RegisterScreen() {
  const { register } = useAuth();

  const [name, setName] =
    useState<string>('');

  const [email, setEmail] =
    useState<string>('');

  const [password, setPassword] =
    useState<string>('');

  const [confirm, setConfirm] =
    useState<string>('');

  const [loading, setLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>('');

  const validate = () => {
    if (!name.trim()) {
      return 'Please enter your name.';
    }

    if (!email.includes('@')) {
      return 'Please enter a valid email.';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }

    if (password !== confirm) {
      return 'Passwords do not match.';
    }

    return null;
  };

  const handleRegister = async () => {
    const err = validate();

    if (err) {
      setError(err);
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register(
        email.trim(),
        password,
        name.trim()
      );

      router.replace('/home');
    } catch (e: any) {
      setError(
        e?.message ||
          'Registration failed. Please try again.'
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
        {/* Back Button */}

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() =>
            router.back()
          }
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </TouchableOpacity>

        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.emoji}>
            🚀
          </Text>

          <Text style={styles.title}>
            Create Account
          </Text>

          <Text style={styles.subtitle}>
            Start earning coins today
          </Text>
        </View>

        {/* Bonus Banner */}

        <View style={styles.bonusBanner}>
          <Text style={styles.bonusText}>
            🎁 Sign-up bonus:
            {' '}
            50 free coins!
          </Text>
        </View>

        {/* Form Card */}

        <View style={styles.card}>
          <InlineToast
            message={error}
            type="error"
          />

          <AppInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Your Name"
            autoCapitalize="words"
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
            placeholder="Minimum 6 characters"
            secureTextEntry
          />

          <AppInput
            label="Confirm Password"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Re-enter password"
            secureTextEntry
          />

          <PrimaryButton
            title="CREATE ACCOUNT"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerBtn}
          />
        </View>

        {/* Login Link */}

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>
            Already have an account?
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push('/login')
            }
          >
            <Text style={styles.loginLink}>
              {' '}
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
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
  },

  backBtn: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },

  backText: {
    color: COLORS.primary,
    fontSize: SIZES.md,
    fontWeight: '600',
  },

  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  emoji: {
    fontSize: 56,
    marginBottom: SPACING.sm,
  },

  title: {
    color: COLORS.white,
    fontSize: SIZES.xxl,
    fontWeight: '700',
  },

  subtitle: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    marginTop: SPACING.xs,
  },

  bonusBanner: {
    backgroundColor:
      'rgba(245,166,35,0.15)',

    borderWidth: 1,

    borderColor: COLORS.gold,

    borderRadius: RADIUS.md,

    padding: SPACING.md,

    alignItems: 'center',

    marginBottom: SPACING.lg,
  },

  bonusText: {
    color: COLORS.gold,
    fontWeight: '700',
    fontSize: SIZES.md,
  },

  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },

  registerBtn: {
    marginTop: SPACING.sm,
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },

  loginText: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
  },

  loginLink: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: SIZES.md,
  },
});
