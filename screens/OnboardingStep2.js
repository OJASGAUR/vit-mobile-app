// screens/OnboardingStep2.js

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useThemeColors } from "../theme/theme";
import { useStore } from "../stores/useStore";
import { generateAvatarColor, getInitials } from "../utils/avatarUtils";

export default function OnboardingStep2({ navigation, route }) {
  const { name, regNo } = route.params;
  const [avatarUri, setAvatarUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const colors = useThemeColors();
  const setUser = useStore((s) => s.setUser);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant camera roll permissions to select a photo");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      
      // Generate avatar if no photo selected
      const avatarColor = generateAvatarColor(name);
      const initials = getInitials(name);
      
      const userData = {
        name,
        regNo,
        avatar: avatarUri || null, // null means use auto-generated
        avatarColor,
        initials,
        bio: "",
        phone: "",
        socialLinks: {
          instagram: "",
          twitter: "",
          facebook: "",
        },
      };

      await setUser(userData);
      
      // Navigation will be handled by App.js based on user state
      // Just go back or let the app re-render
    } catch (error) {
      console.error("Error completing onboarding:", error);
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const avatarColor = generateAvatarColor(name);
  const initials = getInitials(name);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Add Profile Photo
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose a photo or skip to use an auto-generated avatar
          </Text>
        </View>

        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={[styles.changeButton, { backgroundColor: colors.accent }]}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={20} color="#FFF" />
            <Text style={styles.changeButtonText}>
              {avatarUri ? "Change Photo" : "Choose Photo"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.skipButton, { borderColor: colors.border }]}
            onPress={handleSkip}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
              Skip
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: colors.accent }]}
            onPress={handleComplete}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.completeButtonText}>Complete</Text>
                <Ionicons name="checkmark" size={20} color="#FFF" style={styles.buttonIcon} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  header: {
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  avatarImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  avatarText: {
    fontSize: 64,
    fontWeight: "700",
    color: "#FFF",
  },
  changeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  changeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  skipButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

