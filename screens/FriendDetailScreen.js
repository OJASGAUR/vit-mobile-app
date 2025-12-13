// screens/FriendDetailScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../stores/useStore";
import { useThemeColors } from "../theme/theme";
import FriendAvatar from "../components/FriendAvatar";
import { removeFriend } from "../services/api";
import TopAppBar from "../components/TopAppBar";
import ProfilePanel from "../components/ProfilePanel";

export default function FriendDetailScreen({ route, navigation }) {
  const { friend } = route.params;
  const [removing, setRemoving] = useState(false);
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);

  const user = useStore((s) => s.user);
  const syncFriendsFromBackend = useStore((s) => s.syncFriendsFromBackend);
  const colors = useThemeColors();

  const handleAvatarPress = React.useCallback(() => {
    setProfilePanelVisible(true);
  }, []);

  const handleRemoveFriend = () => {
    if (!user || !friend) return;

    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${friend.name} from your friends list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setRemoving(true);
              await removeFriend(user.regNo, friend.regNo);
              Alert.alert("Success", "Friend removed", [
                {
                  text: "OK",
                  onPress: () => {
                    syncFriendsFromBackend(user.regNo);
                    navigation.goBack();
                  },
                },
              ]);
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to remove friend");
            } finally {
              setRemoving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <TopAppBar
        title="Friend Details"
        onAvatarPress={handleAvatarPress}
        showBackButton={navigation.canGoBack()}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
      >
        <View style={styles.container}>
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <FriendAvatar user={friend} size={120} />
            <Text style={[styles.friendName, { color: colors.textPrimary }]}>
              {friend.name}
            </Text>
            <Text style={[styles.friendRegNo, { color: colors.textSecondary }]}>
              {friend.regNo}
            </Text>
            {friend.bio && (
              <Text style={[styles.friendBio, { color: colors.textSecondary }]}>
                {friend.bio}
              </Text>
            )}
          </View>

          <View
            style={[
              styles.placeholderCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.placeholderTitle, { color: colors.textPrimary }]}>
              Timetable View
            </Text>
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              Coming soon! You'll be able to view your friend's timetable here.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.removeButton, { borderColor: colors.border }]}
            onPress={handleRemoveFriend}
            disabled={removing}
            activeOpacity={0.8}
          >
            {removing ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <>
                <Ionicons name="person-remove-outline" size={20} color={colors.accent} />
                <Text style={[styles.removeButtonText, { color: colors.accent }]}>
                  Remove Friend
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ProfilePanel
        visible={profilePanelVisible}
        onClose={() => setProfilePanelVisible(false)}
      />
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
  profileCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  friendName: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 4,
  },
  friendRegNo: {
    fontSize: 16,
    marginBottom: 12,
  },
  friendBio: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  placeholderCard: {
    alignItems: "center",
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

