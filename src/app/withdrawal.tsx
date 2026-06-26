import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SIZES, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const MIN_COINS  = 500;
const COIN_VALUE = 0.01; // 1 coin = ₹0.01

const METHODS = [
  { id: 'upi',   label: 'UPI ID',        placeholder: 'yourname@upi',    icon: '📲' },
  { id: 'paytm', label: 'Paytm Number',  placeholder: '10-digit mobile', icon: '💳' },
  { id: 'bank',  label: 'Bank Transfer', placeholder: 'Account number',  icon: '🏦' },
];

export default function WithdrawalScreen() {
  const { coins } = useAuth();
  const router    = useRouter();

  const [method,  setMethod]  = useState('upi');
  const [address, setAddress] = useState('');
  const [amount,  setAmount]  = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selected     = METHODS.find(m => m.id === method)!;
  const coinsNum     = parseInt(amount || '0', 10);
  const rupees       = (coinsNum * COIN_VALUE).toFixed(2);
  const canWithdraw  = coins >= MIN_COINS && coinsNum >= MIN_COINS && coinsNum <= coins && address.trim().length > 3;

  const handleWithdraw = async () => {
    if (!canWithdraw) return;
    setLoading(true);
    // TODO: Replace with Firestore call:
    // await firestore().collection('withdrawals').add({
    //   userId: user.uid, coins: coinsNum, method, address,
    //   status: 'pending', createdAt: firestore.FieldValue.serverTimestamp(),
    // });
    // await addCoins(-coinsNum);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successWrap}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Request Submitted!</Text>
          <Text style={styles.successSub}>
            Your withdrawal of ₹{rupees} ({coinsNum} coins) via {selected.label} has been submitted.{'\n'}Processing takes 1–3 business days.
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹  Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>💳  Withdrawal</Text>
          <View style={{ width: 64 }} />
        </View>

        {/* Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balLabel}>Available Balance</Text>
          <Text style={styles.balCoins}>{coins}  💰</Text>
          <Text style={styles.balRupees}>≈ ₹{(coins * COIN_VALUE).toFixed(2)}</Text>
          {coins < MIN_COINS && (
            <View style={styles.warnBox}>
              <Text style={styles.warnText}>⚠️  You need at least {MIN_COINS} coins to withdraw</Text>
            </View>
          )}
        </View>

        {/* Method */}
        <Text style={styles.label}>Select Method</Text>
        <View style={styles.methodRow}>
          {METHODS.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.methodCard, method === m.id && styles.methodCardActive]}
              onPress={() => { setMethod(m.id); setAddress(''); }}
            >
              <Text style={styles.methodIcon}>{m.icon}</Text>
              <Text style={[styles.methodLabel, method === m.id && styles.methodLabelActive]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Address */}
        <Text style={styles.label}>{selected.label}</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder={selected.placeholder}
          placeholderTextColor={COLORS.textHint}
          autoCapitalize="none"
          keyboardType={method === 'bank' ? 'numeric' : 'default'}
        />

        {/* Coin amount */}
        <Text style={styles.label}>Coins to Redeem (min {MIN_COINS})</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder={`${MIN_COINS}–${coins}`}
          placeholderTextColor={COLORS.textHint}
          keyboardType="numeric"
        />
        {coinsNum > 0 && (
          <Text style={styles.conversion}>You will receive  ₹{rupees}</Text>
        )}

        {/* Summary */}
        <View style={styles.summary}>
          {[
            ['Coins redeemed',  coinsNum ? `${coinsNum} 💰` : '—'],
            ['Amount received', coinsNum ? `₹${rupees}` : '—'],
            ['Processing time', '1–3 business days'],
          ].map(([k, v]) => (
            <View key={k} style={styles.summaryRow}>
              <Text style={styles.summaryKey}>{k}</Text>
              <Text style={styles.summaryVal}>{v}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.withdrawBtn, (!canWithdraw || loading) && styles.disabled]}
          onPress={handleWithdraw}
          disabled={!canWithdraw || loading}
        >
          <Text style={styles.withdrawBtnText}>
            {loading ? 'Processing…' : 'Withdraw Now'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.xl, paddingBottom: 60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xl },
  backBtn:{ padding: SPACING.sm },
  backText:{ color: COLORS.primary, fontSize: SIZES.lg },
  title:  { color: COLORS.white, fontSize: SIZES.xl, fontWeight: '700' },

  balanceCard: { backgroundColor: COLORS.primaryDark, borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.xl },
  balLabel:    { color: 'rgba(255,255,255,0.65)', fontSize: SIZES.sm },
  balCoins:    { color: COLORS.gold, fontSize: 42, fontWeight: '700', marginTop: SPACING.xs },
  balRupees:   { color: 'rgba(255,255,255,0.5)', fontSize: SIZES.md, marginTop: 4 },
  warnBox:     { backgroundColor: 'rgba(245,166,35,0.12)', borderRadius: RADIUS.md, padding: SPACING.sm, marginTop: SPACING.md },
  warnText:    { color: COLORS.warning, fontSize: SIZES.sm, textAlign: 'center' },

  label: { color: COLORS.textMuted, fontSize: SIZES.sm, fontWeight: '500', marginBottom: SPACING.sm, marginTop: SPACING.lg },

  methodRow: { flexDirection: 'row', gap: SPACING.sm },
  methodCard: { flex: 1, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  methodCardActive: { borderColor: COLORS.lucky, backgroundColor: 'rgba(20,184,166,0.08)' },
  methodIcon:       { fontSize: 22, marginBottom: 4 },
  methodLabel:      { color: COLORS.textMuted, fontSize: SIZES.xs, textAlign: 'center' },
  methodLabelActive:{ color: COLORS.lucky },

  input: { backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, height: 52, paddingHorizontal: SPACING.lg, color: COLORS.white, fontSize: SIZES.md, borderWidth: 1, borderColor: 'rgba(124,92,191,0.35)' },
  conversion: { color: COLORS.gold, fontSize: SIZES.sm, marginTop: SPACING.sm, textAlign: 'right' },

  summary:    { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg, marginTop: SPACING.xl, marginBottom: SPACING.xl, gap: SPACING.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryKey: { color: COLORS.textMuted, fontSize: SIZES.sm },
  summaryVal: { color: COLORS.white, fontSize: SIZES.sm, fontWeight: '600' },

  withdrawBtn:      { backgroundColor: COLORS.lucky, borderRadius: RADIUS.lg, height: 54, alignItems: 'center', justifyContent: 'center' },
  withdrawBtnText:  { color: '#042f2e', fontSize: SIZES.lg, fontWeight: '700' },
  disabled:         { opacity: 0.4 },

  successWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  successEmoji: { fontSize: 80, marginBottom: SPACING.xl },
  successTitle: { color: COLORS.white, fontSize: SIZES.xxl, fontWeight: '700', marginBottom: SPACING.md },
  successSub:   { color: COLORS.textMuted, fontSize: SIZES.md, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xxl },
  doneBtn:      { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: 14, paddingHorizontal: 48 },
  doneBtnText:  { color: COLORS.white, fontSize: SIZES.lg, fontWeight: '700' },
});