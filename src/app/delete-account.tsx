import { useState } from "react";

import { router } from "expo-router";

import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
    EmailAuthProvider,
    deleteUser,
    reauthenticateWithCredential,
} from "firebase/auth";

import { deleteDoc, doc } from "firebase/firestore";

import {
    AppInput,
    InlineToast,
    PrimaryButton,
} from "../components";

import {
    COLORS,
    RADIUS,
    SIZES,
    SPACING,
} from "../constants/theme";

import { auth, db } from "../firebase/firebaseAuth";

export default function DeleteAccountScreen() {
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [type, setType] = useState<"success" | "error">(
    "error"
  );

  const deleteAccount = async () => {
    if (!password.trim()) {
      setType("error");
      setMessage("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const user = auth.currentUser;

      if (!user || !user.email) {
        throw new Error("User not found.");
      }

      const credential =
        EmailAuthProvider.credential(
          user.email,
          password
        );

      await reauthenticateWithCredential(
        user,
        credential
      );

      await deleteDoc(
        doc(db, "users", user.uid)
      );

      await deleteUser(user);

      setType("success");
      setMessage(
        "Account deleted successfully."
      );

      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 1000);
    } catch (error: any) {
      let msg = "Unable to delete account.";

      switch (error.code) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
          msg = "Incorrect password.";
          break;

        case "auth/requires-recent-login":
          msg =
            "Please login again and retry.";
          break;

        default:
          msg = error.message;
      }

      setType("error");
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent.\n\nAll your coins, progress and account data will be deleted forever.\n\nDo you want to continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteAccount,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>
              ← Back
            </Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.icon}>
              🗑️
            </Text>

            <Text style={styles.title}>
              Delete Account
            </Text>

            <Text style={styles.subtitle}>
              This action cannot be undone.
            </Text>
          </View>

          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>
              ⚠️ Warning
            </Text>

            <Text style={styles.warningText}>
              Deleting your account will permanently remove:
            </Text>

            <Text style={styles.listItem}>
              • Your account
            </Text>

            <Text style={styles.listItem}>
              • Coins balance
            </Text>

            <Text style={styles.listItem}>
              • Game progress
            </Text>

            <Text style={styles.listItem}>
              • Rewards history
            </Text>

            <Text style={styles.listItem}>
              • All personal data
            </Text>
          </View>

          <View style={styles.card}>
            {message ? (
              <InlineToast
                message={message}
                type={type}
              />
            ) : null}

            <AppInput
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <PrimaryButton
              title="DELETE ACCOUNT"
              loading={loading}
              onPress={confirmDelete}
              style={styles.deleteBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  container: {
    flexGrow: 1,
    padding: SPACING.xl,
  },

  backBtn: {
    marginBottom: SPACING.lg,
  },

  backText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: SIZES.md,
  },

  header: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },

  icon: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },

  title: {
    color: COLORS.white,
    fontSize: SIZES.xxl,
    fontWeight: "700",
  },

  subtitle: {
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    fontSize: SIZES.md,
  },

  warningCard: {
    backgroundColor: "rgba(255,0,0,0.08)",
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },

  warningTitle: {
    color: COLORS.error,
    fontSize: SIZES.lg,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },

  warningText: {
    color: COLORS.white,
    marginBottom: SPACING.md,
  },

  listItem: {
    color: COLORS.textMuted,
    marginBottom: 6,
    fontSize: SIZES.sm,
  },

  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },

  deleteBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.error,
  },
});