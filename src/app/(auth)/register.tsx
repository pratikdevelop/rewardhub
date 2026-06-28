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
  InlineToast,
  PrimaryButton,
} from '../../components';

import {
  COLORS,
  RADIUS,
  SIZES,
  SPACING,
} from '../../constants/theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirm, setConfirm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const validate = () => {
    if (!name.trim()) return 'Please enter your name.';
    if (!email.includes('@')) return 'Please enter a valid email.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirm) return 'Passwords do not match.';
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    if (!acceptedTerms) {
      setError("Please accept the Terms & Conditions and Privacy Policy.");
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register(email.trim(), password, name.trim());
      router.replace('/home');
    } catch (e: any) {
      setError(e?.message || 'Registration failed. Please try again.');
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
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🎮</Text>
          <Text style={styles.title}>Join the Fun</Text>
          <Text style={styles.subtitle}>Create an account to start playing</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <InlineToast message={error} type="error" />

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

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  acceptedTerms && styles.checkboxSelected,
                ]}
              >
                {acceptedTerms && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>

              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.link} onPress={() => router.push("/terms")}>
                  Terms & Conditions
                </Text>{' '}
                and{' '}
                <Text style={styles.link} onPress={() => router.push("/privacy")}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </TouchableOpacity>
          </View>

          <PrimaryButton
            title="CREATE ACCOUNT"
            onPress={handleRegister}
            loading={loading}
            disabled={!acceptedTerms}
            style={[
              styles.registerBtn,
              !acceptedTerms && { opacity: 0.5 },
            ]}
          />
        </View>

        {/* Login Link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}> Sign In</Text>
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
    width: 80,
  },
  backText: {
    color: COLORS.primary,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl, // Increased spacing for a cleaner look
  },
  emoji: {
    fontSize: 64, // Slightly larger for better focal point
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
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    // Subtle modern shadow for depth (optional, works well on iOS/Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4, 
  },
  registerBtn: {
    marginTop: SPACING.sm,
  },
  termsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 6,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
  },
  checkmark: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  termsText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    lineHeight: 22,
  },
  link: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xl, // Add bottom padding so it doesn't touch the edge
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