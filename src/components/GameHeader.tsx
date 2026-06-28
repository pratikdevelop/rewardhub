import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIUS, SIZES, SPACING, glowShadow } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

interface GameHeaderProps {
  title: string;
  accentColor?: string;
}

export default function GameHeader({ title, accentColor = COLORS.primary }: GameHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: accentColor }]}>{title}</Text>

      <View style={[styles.coinBadge, { borderColor: accentColor + '55', ...glowShadow(accentColor, 0.4) }]}>
        <Text style={styles.coinEmoji}>💰</Text>
        <Text style={[styles.coinText, { color: accentColor }]}>{user?.coins}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { color: COLORS.white, fontSize: 22, fontWeight: '300', marginTop: -2 },
  title: { fontSize: SIZES.lg, fontWeight: '800', letterSpacing: 0.5 },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
  },
  coinEmoji: { fontSize: 13 },
  coinText:  { fontWeight: '800', fontSize: SIZES.md },
});