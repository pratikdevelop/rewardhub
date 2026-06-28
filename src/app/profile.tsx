import { useRouter } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS, RADIUS, SIZES, SPACING } from "../constants/theme";
import { useAuth } from "../context/AuthContext";

const SETTINGS = [
  {
    label: "Change Password",
    emoji: "🔑",
  },
  // {
  //   label: "Notification Settings",
  //   emoji: "🔔",
  // },
  {
    label: "Privacy Policy",
    emoji: "📄",
  },
  // {
  //   label: "Help & Support",
  //   emoji: "💬",
  // },
   {
    label: "Terms & Services",
    emoji: "📜",
  },
  {
    label: "Delete Account",
    emoji: "🗑️",
  },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
    router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const avatar = (
    user?.displayName?.[0] ??
    user?.email?.[0] ??
    "?"
  ).toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Profile</Text>

          <TouchableOpacity onPress={confirmLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{avatar}</Text>
          </View>

          <Text style={styles.name}>
            {user?.displayName || "Guest User"}
          </Text>

          <Text style={styles.email}>
            {user?.email || "No Email"}
          </Text>

          <View style={styles.coinPill}>
            <Text style={styles.coinPillText}>
              🪙 {user?.coins} Coins
            </Text>
          </View>
        </View>

        {/* Account Information */}

        <Text style={styles.sectionTitle}>
          Account Information
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Display Name
            </Text>

            <Text style={styles.infoValue}>
              {user?.displayName || "Not Available"}
            </Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Email
            </Text>

            <Text style={styles.infoValue}>
              {user?.email || "Not Available"}
            </Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              User ID
            </Text>

            <Text
              style={styles.infoValue}
              numberOfLines={1}
            >
              {user?.uid}
            </Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Coins
            </Text>

            <Text
              style={[
                styles.infoValue,
                {
                  color: COLORS.gold,
                  fontWeight: "700",
                },
              ]}
            >
              🪙 {user?.coins}
            </Text>
          </View>
        </View>

        {/* Settings */}

        <Text style={styles.sectionTitle}>
          Account Settings
        </Text>

        <View style={styles.settingsCard}>
          {SETTINGS.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.settingsRow,
                index !== SETTINGS.length - 1 &&
                  styles.settingsBorder,
              ]}
               onPress={() => {
  switch (item.label) {
    case "Change Password":
      router.push("/change-password");
      break;

    case "Privacy Policy":
      router.push("/privacy");
      break;

    case "Terms & Services":
      router.push("/terms");
      break;

    case "Delete Account":
      router.push("/delete-account");
      break;
  }

  }}
            >
              <Text style={styles.settingsEmoji}>
                {item.emoji}
              </Text>

              <Text style={styles.settingsLabel}>
                {item.label}
              </Text>

              <Text style={styles.settingsArrow}>
                ›
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={confirmLogout}
        >
          <Text style={styles.logoutBtnText}>
            ⎋ Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scroll: {
    padding: SPACING.xl,
    paddingBottom: 60,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.xl,
  },

  backBtn: {
    padding: SPACING.sm,
  },

  backText: {
    color: COLORS.primary,
    fontSize: SIZES.lg,
    fontWeight: "600",
  },

  title: {
    color: COLORS.white,
    fontSize: SIZES.xl,
    fontWeight: "700",
  },

  logoutText: {
    color: COLORS.error,
    fontSize: SIZES.md,
    fontWeight: "600",
  },

  avatarCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: "center",
    marginBottom: SPACING.xl,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },

  avatarLetter: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: "700",
  },

  name: {
    color: COLORS.white,
    fontSize: SIZES.xl,
    fontWeight: "700",
  },

  email: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginTop: 4,
  },

  coinPill: {
    marginTop: SPACING.md,
    backgroundColor: "rgba(245,166,35,0.15)",
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },

  coinPillText: {
    color: COLORS.gold,
    fontWeight: "700",
    fontSize: SIZES.md,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontWeight: "700",
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },

  infoCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    marginBottom: SPACING.xl,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },

  infoDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  infoLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    flex: 1,
  },

  infoValue: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },

  settingsCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    marginBottom: SPACING.xl,
  },

  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
  },

  settingsBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },

  settingsEmoji: {
    fontSize: 20,
    width: 30,
  },

  settingsLabel: {
    flex: 1,
    color: COLORS.white,
    fontSize: SIZES.md,
    marginLeft: SPACING.sm,
  },

  settingsArrow: {
    color: COLORS.textMuted,
    fontSize: 24,
  },

  logoutBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.error,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: SPACING.xl,
  },

  logoutBtnText: {
    color: COLORS.error,
    fontSize: SIZES.md,
    fontWeight: "700",
  },
});