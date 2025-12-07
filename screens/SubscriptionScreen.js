// screens/SubscriptionScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../stores/useStore";
import { saveAppState } from "../services/localStorage";
import { useThemeColors } from "../theme/theme";

const VALID_CODE = "KL3ERT&*9";

export default function SubscriptionScreen({ navigation }) {
  const [codeInput, setCodeInput] = useState("");

  const setUploadsRemaining = useStore((s) => s.setUploadsRemaining);
  const setSubscriptionCode = useStore((s) => s.setSubscriptionCode);
  const uploadsRemaining = useStore((s) => s.uploadsRemaining);
  const timetable = useStore((s) => s.timetable);

  const colors = useThemeColors();

  const handleApply = async () => {
    const code = codeInput.trim();

    if (!code) {
      Alert.alert("Empty", "Please enter the subscription code.");
      return;
    }

    if (code !== VALID_CODE) {
      Alert.alert("Invalid code", "The subscription code you entered is not valid.");
      return;
    }

    setUploadsRemaining(9999);
    setSubscriptionCode(code);

    await saveAppState({
      timetable,
      uploadsRemaining: 9999,
      subscriptionCode: code,
    });

    Alert.alert("Success", "Subscription activated!", [
      {
        text: "OK",
        onPress: () => navigation.navigate("Upload"),
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["left", "right"]}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Subscription
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter your subscription code to unlock more uploads.
        </Text>

        <TextInput
          value={codeInput}
          onChangeText={setCodeInput}
          placeholder="Enter subscription code"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={handleApply}
        >
          <Text style={styles.buttonText}>Apply code</Text>
        </TouchableOpacity>

        <Text style={[styles.info, { color: colors.textSecondary }]}>
          Current uploads remaining: {uploadsRemaining}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "900", marginBottom: 8 },
  subtitle: { marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  info: { marginTop: 4 },
});
