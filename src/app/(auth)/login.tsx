import { useState } from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useAuth } from '../../context/AuthContext';

import {
  AppInput,
  GhostButton,
  InlineToast,
  PrimaryButton,
} from '../../components';

import {
  COLORS,
  RADIUS,
  SIZES,
  SPACING,
} from '../../constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      router.replace('/home');
    } catch (e: any) {
      setError(e?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoIcon}>🎮</Text>
          <Text style={styles.appName}>Reward Tube</Text>
          <Text style={styles.subtitle}>Sign in to continue playing</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>

          <InlineToast message={error} type="error" />

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
            onPress={() => router.push('/forgot-password')}
          >
            <Text style={styles.forgotText}>
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
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        {/* Register */}
        <GhostButton
          title="CREATE NEW ACCOUNT"
          onPress={() => router.push('/register')}
        />
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
    fontSize: 64, // Slightly larger to match Register screen
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
    // Modern shadow to match the Register screen
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    marginTop: 10, // Proper spacing instead of negative margins
  },
  forgotText: {
    color: COLORS.primary, // Uses your theme color instead of hardcoded blue
    fontSize: SIZES.sm,
    fontWeight: '600',
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
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  orText: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginHorizontal: SPACING.md,
    fontWeight: '600',
  },
});