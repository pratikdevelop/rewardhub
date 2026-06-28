import { useState } from "react";

import { router } from "expo-router";

import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from "firebase/auth";

import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { AppInput, InlineToast, PrimaryButton } from "../components";
import { COLORS, RADIUS, SIZES, SPACING } from "../constants/theme";
import { auth } from "../firebase/firebaseAuth";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [type, setType] = useState<"success" | "error">("error");

  const validate = () => {
    if (!currentPassword) {
      return "Please enter your current password.";
    }

    if (newPassword.length < 6) {
      return "New password must be at least 6 characters.";
    }

    if (newPassword !== confirmPassword) {
      return "Passwords do not match.";
    }

    if (currentPassword === newPassword) {
      return "New password must be different from current password.";
    }

    return null;
  };

  const handleChangePassword = async () => {
    const error = validate();

    if (error) {
      setType("error");
      setMessage(error);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const user = auth.currentUser;

      if (!user || !user.email) {
        throw new Error("User not logged in.");
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      setType("success");
      setMessage("Password updated successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      let message = "Unable to update password.";

      switch (error.code) {
        case "auth/wrong-password":
          message = "Current password is incorrect.";
          break;

        case "auth/invalid-credential":
          message = "Current password is incorrect.";
          break;

        case "auth/weak-password":
          message = "Password should be at least 6 characters.";
          break;

        case "auth/requires-recent-login":
          message =
            "Please login again before changing your password.";
          break;

        default:
          message = error.message;
      }

      setType("error");
      setMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.icon}>🔑</Text>

            <Text style={styles.title}>
              Change Password
            </Text>

            <Text style={styles.subtitle}>
              Keep your account secure by using a
              strong password.
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
              label="Current Password"
              placeholder="Enter current password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <AppInput
              label="New Password"
              placeholder="Minimum 6 characters"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <AppInput
              label="Confirm Password"
              placeholder="Re-enter new password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <PrimaryButton
              title="UPDATE PASSWORD"
              loading={loading}
              onPress={handleChangePassword}
              style={styles.button}
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
    textAlign: "center",
    fontSize: SIZES.md,
  },

  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },

  button: {
    marginTop: SPACING.md,
  },
});