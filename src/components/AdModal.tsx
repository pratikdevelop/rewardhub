import { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, RADIUS, SIZES, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

const ADS = [
  { emoji: '🛒', title: 'Shop & Save Big!',   sub: 'Amazing deals. Get ₹100 off your first order.',  cta: 'Install Now' },
  { emoji: '🎮', title: 'Play GameZone Pro',   sub: '500+ casual games. Win real prizes daily!',      cta: 'Play Free'   },
  { emoji: '📱', title: 'Upgrade Your Phone',  sub: 'Latest smartphones at unbeatable EMI prices.',   cta: 'Shop Now'    },
  { emoji: '🍕', title: 'Order Food Fast',     sub: 'Hot meals in 30 min. First order free!',         cta: 'Order Now'   },
  { emoji: '💊', title: 'Health & Wellness',   sub: 'Vitamins & supplements delivered to your door.', cta: 'Buy Now'     },
];

interface AdModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AdModal({ visible, onClose }: AdModalProps) {
  const [countdown, setCountdown] = useState(5);
  const [canSkip,   setCanSkip]   = useState(false);
  const [ad]  = useState(() => ADS[Math.floor(Math.random() * ADS.length)]);
  const scale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    if (!visible) return;
    setCountdown(5);
    setCanSkip(false);

    Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start();

    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); setCanSkip(true); return 0; }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <Text style={styles.adLabel}>Advertisement</Text>

        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Ad · Sponsored</Text>
            <View style={styles.admobBadge}><Text style={styles.admobText}>AdMob</Text></View>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.adEmoji}>{ad.emoji}</Text>
            <Text style={styles.adTitle}>{ad.title}</Text>
            <Text style={styles.adSub}>{ad.sub}</Text>
            <TouchableOpacity style={styles.ctaBtn}>
              <Text style={styles.ctaText}>{ad.cta}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Text style={styles.timerText}>
          {canSkip ? '' : `Ad closes in ${countdown}s`}
        </Text>
        {canSkip && (
          <TouchableOpacity style={styles.skipBtn} onPress={onClose}>
            <Text style={styles.skipText}>Skip Ad  ✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  adLabel: { color: 'rgba(255,255,255,0.4)', fontSize: SIZES.xs, alignSelf: 'flex-start', marginBottom: SPACING.sm },

  card: { backgroundColor: '#fff', borderRadius: RADIUS.xl, width: '100%', maxWidth: 340, overflow: 'hidden' },
  cardHeader: {
    backgroundColor: '#f1f1f1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  cardHeaderText: { fontSize: SIZES.xs, color: '#666' },
  admobBadge: { backgroundColor: '#ddd', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  admobText:  { fontSize: 10, color: '#555' },

  cardBody: { padding: SPACING.xl, alignItems: 'center' },
  adEmoji:  { fontSize: 56, marginBottom: SPACING.md },
  adTitle:  { fontSize: SIZES.xl, fontWeight: '700', color: '#111', textAlign: 'center', marginBottom: SPACING.xs },
  adSub:    { fontSize: SIZES.sm, color: '#555', textAlign: 'center', marginBottom: SPACING.lg, lineHeight: 20 },
  ctaBtn:   { backgroundColor: COLORS.gold, borderRadius: RADIUS.md, paddingVertical: 12, paddingHorizontal: SPACING.xl, width: '100%', alignItems: 'center' },
  ctaText:  { color: '#111', fontWeight: '700', fontSize: SIZES.md },

  timerText: { color: 'rgba(255,255,255,0.5)', fontSize: SIZES.sm, marginTop: SPACING.lg },
  skipBtn: {
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  skipText: { color: COLORS.white, fontSize: SIZES.sm, fontWeight: '500' },
});