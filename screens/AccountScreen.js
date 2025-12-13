// screens/AccountScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useStore } from "../stores/useStore";
import { useThemeColors } from "../theme/theme";
import { generateAvatarColor, getInitials } from "../utils/avatarUtils";
import { BACKEND_URL } from "../services/backend";

export default function AccountScreen({ navigation }) {
  const user = useStore((s) => s.user);
  const updateUser = useStore((s) => s.updateUser);
  const logout = useStore((s) => s.logout);
  const colors = useThemeColors();

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [instagram, setInstagram] = useState(user?.socialLinks?.instagram || "");
  const [twitter, setTwitter] = useState(user?.socialLinks?.twitter || "");
  const [facebook, setFacebook] = useState(user?.socialLinks?.facebook || "");
  const [saving, setSaving] = useState(false);

  const avatarColor = user?.avatarColor || generateAvatarColor(user?.name || "");
  const initials = user?.initials || getInitials(user?.name || "");

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant camera roll permissions");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const avatarUri = result.assets[0].uri;
        
        // Sync to backend
        if (user?.regNo) {
          try {
            await fetch(`${BACKEND_URL}/api/user/register`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: user.name,
                regNo: user.regNo,
                avatar: avatarUri,
                bio: user.bio || "",
                phone: user.phone || "",
                socialLinks: user.socialLinks || {},
              }),
            });
          } catch (err) {
            console.warn("Failed to sync avatar to backend:", err);
            // Continue anyway
          }
        }
        
        await updateUser({ avatar: avatarUri });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    try {
      setSaving(true);
      const updatedData = {
        name: name.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        socialLinks: {
          instagram: instagram.trim(),
          twitter: twitter.trim(),
          facebook: facebook.trim(),
        },
      };
      
      // Sync to backend
      if (user?.regNo) {
        try {
          await fetch(`${BACKEND_URL}/api/user/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: updatedData.name,
              regNo: user.regNo,
              avatar: user.avatar,
              bio: updatedData.bio,
              phone: updatedData.phone,
              socialLinks: updatedData.socialLinks,
            }),
          });
        } catch (err) {
          console.warn("Failed to sync user to backend:", err);
          // Continue anyway
        }
      }
      
      await updateUser(updatedData);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout? You'll need to complete onboarding again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: "OnboardingStep1" }],
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["left", "right"]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.changePhotoButton, { backgroundColor: colors.accent }]}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={18} color="#FFF" />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Basic Information
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                Name <Text style={{ color: colors.accent }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.textPrimary,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                Registration Number
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.textSecondary,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                value={user?.regNo || ""}
                editable={false}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Bio</Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    color: colors.textPrimary,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Phone Number</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.textPrimary,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Social Links */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Social Links
            </Text>

            <View style={styles.inputContainer}>
              <View style={styles.socialInputRow}>
                <Ionicons name="logo-instagram" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[
                    styles.socialInput,
                    {
                      color: colors.textPrimary,
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  value={instagram}
                  onChangeText={setInstagram}
                  placeholder="Instagram username"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.socialInputRow}>
                <Ionicons name="logo-twitter" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[
                    styles.socialInput,
                    {
                      color: colors.textPrimary,
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  value={twitter}
                  onChangeText={setTwitter}
                  placeholder="X/Twitter username"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.socialInputRow}>
                <Ionicons name="logo-facebook" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[
                    styles.socialInput,
                    {
                      color: colors.textPrimary,
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  value={facebook}
                  onChangeText={setFacebook}
                  placeholder="Facebook username"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.accent }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                  <Ionicons name="checkmark" size={20} color="#FFF" style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.logoutButton, { borderColor: colors.border }]}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.accent} />
              <Text style={[styles.logoutButtonText, { color: colors.accent }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 16,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFF",
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  changePhotoText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  socialInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  socialInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  buttonSection: {
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonIcon: {
    marginLeft: 4,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

