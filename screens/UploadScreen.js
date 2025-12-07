// screens/UploadScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { useStore } from "../stores/useStore";
import { uploadImageAsync } from "../services/api";
import { saveAppState } from "../services/localStorage";
import { useThemeColors } from "../theme/theme";

export default function UploadScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const timetable = useStore((s) => s.timetable);
  const uploadsRemaining = useStore((s) => s.uploadsRemaining);
  const subscriptionCode = useStore((s) => s.subscriptionCode);
  const setTimetable = useStore((s) => s.setTimetable);
  const setUploadsRemaining = useStore((s) => s.setUploadsRemaining);

  const colors = useThemeColors();

  const goToSubscription = () => navigation.navigate("Subscription");

  const guardUploadLimit = () => {
    if (uploadsRemaining <= 0) {
      Alert.alert(
        "Upload limit reached",
        "You used your free upload. Enter a subscription code to unlock more uploads.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Enter code", onPress: goToSubscription },
        ]
      );
      return false;
    }
    return true;
  };

  const handlePickImage = async () => {
    if (!guardUploadLimit()) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to pick your timetable screenshot."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      Alert.alert("No image", "Please pick a timetable screenshot first.");
      return;
    }
    if (!guardUploadLimit()) return;

    try {
      setUploading(true);

      const result = await uploadImageAsync(image);

      if (!result || !result.timetable) {
        throw new Error("Backend did not return a timetable.");
      }

      const newRemaining = uploadsRemaining - 1;

      setTimetable(result.timetable);
      setUploadsRemaining(newRemaining);

      await saveAppState({
        timetable: result.timetable,
        uploadsRemaining: newRemaining,
        subscriptionCode,
      });

      Alert.alert("Timetable ready", "Your timetable has been generated!", [
        {
          text: "Open timetable",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "MainDrawer" }],
            });
          },
        },
      ]);
    } catch (e) {
      console.error("Upload error", e);
      Alert.alert("Error", e.message || "Failed to generate timetable.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["left", "right"]}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Upload timetable
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Upload once per semester. After that, the app works offline.
        </Text>

        <TouchableOpacity
          style={[
            styles.pickButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={handlePickImage}
        >
          <Text style={[styles.pickButtonText, { color: colors.textPrimary }]}>
            {image ? "Pick another image" : "Pick timetable image"}
          </Text>
        </TouchableOpacity>

        {image && (
          <View
            style={[
              styles.previewBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Image
              source={{ uri: image.uri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.uploadButton,
            { backgroundColor: colors.accent },
            (!image || uploading) && { opacity: 0.6 },
          ]}
          onPress={handleUpload}
          disabled={!image || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadButtonText}>Upload & Generate</Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Uploads remaining: {uploadsRemaining}
        </Text>

        <TouchableOpacity onPress={goToSubscription}>
          <Text style={[styles.link, { color: colors.accent }]}>
            Have a subscription code?
          </Text>
        </TouchableOpacity>

        {timetable && (
          <TouchableOpacity
            onPress={() => navigation.navigate("Timetable")}
            style={styles.secondaryButton}
          >
            <Text style={[styles.secondaryText, { color: colors.accent }]}>
              Go to current timetable
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "900", marginBottom: 8 },
  subtitle: { marginBottom: 16 },
  pickButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
  },
  pickButtonText: { fontWeight: "700" },
  previewBox: {
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 220,
    marginBottom: 16,
    borderWidth: 1,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  uploadButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  footerText: { marginTop: 4, marginBottom: 8 },
  link: { fontWeight: "600" },
  secondaryButton: { marginTop: 16, paddingVertical: 10 },
  secondaryText: { fontWeight: "600" },
});
