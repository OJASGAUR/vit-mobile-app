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

// CHANGE THESE CODES BEFORE SHARING THE APP
const VALID_CODES = ["ADMIN-UNLOCK", "VITWISE2025"];

export default function SubscriptionScreen({ navigation }) {
  const [code, setCode] = useState("");

  const timetable = useStore((s) => s.timetable);
  const uploadsRemaining = useStore((s) => s.uploadsRemaining);
  const setUploadsRemaining = useStore((s) => s.setUploadsRemaining);
  const setSubscriptionCode = useStore((s) => s.setSubscriptionCode);

  const handleUnlock = async () => {
    const trimmed = code.trim();

    if (!trimmed) {
      Alert.alert("Enter code", "Please enter a subscription code.");
      return;
    }

    if (!VALID_CODES.includes(trimmed)) {
      Alert.alert("Invalid code", "The code you entered is not valid.");
      return;
    }

    // For now: practically unlimited uploads
    const newUploads = 999;

    setUploadsRemaining(newUploads);
    setSubscriptionCode(trimmed);

    await saveAppState({
      timetable,
      uploadsRemaining: newUploads,
      subscriptionCode: trimmed,
    });

    Alert.alert("Success", "Subscription unlocked!", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Subscription</Text>

        <Text style={styles.label}>
          Current uploads remaining:{" "}
          {uploadsRemaining === Infinity ? "∞" : uploadsRemaining}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter subscription code"
          placeholderTextColor="#789"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />

        <TouchableOpacity style={styles.button} onPress={handleUnlock}>
          <Text style={styles.buttonText}>Unlock</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          For testing, you can use code{" "}
          <Text style={styles.code}>ADMIN-UNLOCK</Text>. Change this before
          sharing the APK.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#061124",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 24,
  },
  label: {
    color: "#cde",
    marginBottom: 12,
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "rgba(0,122,255,0.95)",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  hint: {
    color: "#789",
    fontSize: 13,
  },
  code: {
    color: "#fff",
    fontWeight: "700",
  },
});
