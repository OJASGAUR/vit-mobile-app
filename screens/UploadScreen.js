// screens/UploadScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { uploadTextAsync } from "../services/api";
import { useStore } from "../stores/useStore";

export default function UploadScreen({ navigation }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const setTimetable = useStore((s) => s.setTimetable);
  const uploadsRemaining = useStore((s) => s.uploadsRemaining);
  const setUploadsRemaining = useStore((s) => s.setUploadsRemaining);

  const handleSubmit = async () => {
    if (!text.trim()) {
      Alert.alert("Error", "Paste your timetable text first");
      return;
    }

    if (uploadsRemaining <= 0) {
      Alert.alert("Limit reached", "No uploads remaining");
      return;
    }

    try {
      setLoading(true);

      const result = await uploadTextAsync(text);

      setTimetable(result.timetable);
      setUploadsRemaining(uploadsRemaining - 1);

      Alert.alert("Success", "Timetable generated!", [
        { text: "View", onPress: () => navigation.navigate("Timetable") },
      ]);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to parse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>

        <Text style={styles.title}>Paste Timetable Text</Text>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Paste here..."
          style={styles.input}
          multiline
        />

        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.button, loading && { opacity: 0.5 }]}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Processing..." : "Generate Timetable"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.remaining}>
          Uploads remaining: {uploadsRemaining}
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  input: {
    minHeight: 200,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    fontSize: 15,
    textAlignVertical: "top",
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#6200ee",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  remaining: {
    fontSize: 14,
    textAlign: "center",
    marginVertical: 8,
  },
});
