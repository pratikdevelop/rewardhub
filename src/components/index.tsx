import { ReactNode } from 'react';

import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

import {
    COLORS,
    RADIUS,
    SIZES,
    SPACING,
} from '../constants/theme';

// ─────────────────────────────────────────────────────────────
// Primary Button
// ─────────────────────────────────────────────────────────────

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  color?: string;
}

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  style,
  color,
}: PrimaryButtonProps) {
  const bg = color || COLORS.primary;

  return (
    <TouchableOpacity
      style={[
        styles.primaryBtn,
        { backgroundColor: bg },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator
          color={COLORS.white}
        />
      ) : (
        <Text style={styles.primaryBtnText}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// Ghost Button
// ─────────────────────────────────────────────────────────────

interface GhostButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function GhostButton({
  title,
  onPress,
  style,
}: GhostButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.ghostBtn, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.ghostBtnText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// App Input
// ─────────────────────────────────────────────────────────────

interface AppInputProps
  extends TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
}

export function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: AppInputProps) {
  return (
    <View style={styles.inputWrap}>
      {label && (
        <Text style={styles.inputLabel}>
          {label}
        </Text>
      )}

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={
          COLORS.textHint
        }
        secureTextEntry={
          secureTextEntry
        }
        keyboardType={keyboardType}
        autoCapitalize={
          autoCapitalize
        }
        selectionColor={COLORS.primary}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Coin Badge
// ─────────────────────────────────────────────────────────────

interface CoinBadgeProps {
  coins: number | string;
}

export function CoinBadge({
  coins,
}: CoinBadgeProps) {
  return (
    <View style={styles.coinBadge}>
      <Text style={styles.coinIcon}>
        💰
      </Text>

      <Text style={styles.coinText}>
        {coins}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({
  title,
}: SectionHeaderProps) {
  return (
    <Text style={styles.sectionHeader}>
      {title}
    </Text>
  );
}

// ─────────────────────────────────────────────────────────────
// Inline Toast
// ─────────────────────────────────────────────────────────────

interface InlineToastProps {
  message?: string;
  type?: 'success' | 'error';
}

export function InlineToast({
  message,
  type = 'success',
}: InlineToastProps) {
  if (!message) return null;

  const bg =
    type === 'error'
      ? COLORS.error
      : COLORS.success;

  return (
    <View
      style={[
        styles.toast,
        { backgroundColor: bg },
      ]}
    >
      <Text style={styles.toastText}>
        {message}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  children,
  style,
}: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  primaryBtn: {
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },

  primaryBtnText: {
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  ghostBtn: {
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
  },

  ghostBtnText: {
    color: COLORS.primary,
    fontSize: SIZES.lg,
    fontWeight: '600',
  },

  inputWrap: {
    marginBottom: SPACING.lg,
  },

  inputLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    fontWeight: '500',
    marginBottom: SPACING.xs,
    letterSpacing: 0.3,
  },

  input: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor:
      'rgba(124,92,191,0.4)',
    borderRadius: RADIUS.md,
    height: 52,
    paddingHorizontal: SPACING.lg,
    color: COLORS.white,
    fontSize: SIZES.md,
  },

  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },

  coinIcon: {
    fontSize: 14,
    marginRight: 4,
  },

  coinText: {
    color: COLORS.gold,
    fontWeight: '700',
    fontSize: SIZES.md,
  },

  sectionHeader: {
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },

  toast: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },

  toastText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '600',
  },

  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
});
