// screens/SearchFriendsScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
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
import { getUserByRegNo, sendFriendRequest } from "../services/api";

export default function SearchFriendsScreen({ navigation }) {
  const [searchText, setSearchText] = useState("");
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null); // 'none', 'sent', 'incoming', 'friends'

  const user = useStore((s) => s.user);
  const friends = useStore((s) => s.friends);
  const friendRequests = useStore((s) => s.friendRequests);
  const syncFriendsFromBackend = useStore((s) => s.syncFriendsFromBackend);
  const colors = useThemeColors();

  const checkRequestStatus = (targetRegNo) => {
    if (!targetRegNo || !user) return "none";

    // Check if already friends
    const isFriend = friends.some((f) => f.regNo === targetRegNo);
    if (isFriend) return "friends";

    // Check incoming requests
    const incoming = friendRequests?.incomingRequests || [];
    const hasIncoming = incoming.some((req) => req.fromRegNo === targetRegNo);
    if (hasIncoming) return "incoming";

    // Check sent requests
    const sent = friendRequests?.sentRequests || [];
    const hasSent = sent.some((req) => req.toRegNo === targetRegNo);
    if (hasSent) return "sent";

    return "none";
  };

  const handleSearch = async () => {
    if (!searchText.trim()) {
      Alert.alert("Error", "Please enter a registration number");
      return;
    }

    if (searchText.trim() === user?.regNo) {
      Alert.alert("Error", "Cannot search for yourself");
      return;
    }

    try {
      setSearching(true);
      setFoundUser(null);
      setRequestStatus(null);

      const result = await getUserByRegNo(searchText.trim());
      if (result.success && result.user) {
        setFoundUser(result.user);
        const status = checkRequestStatus(result.user.regNo);
        setRequestStatus(status);
      }
    } catch (err) {
      Alert.alert("Error", err.message || "User not found");
      setFoundUser(null);
      setRequestStatus(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!foundUser || !user) return;

    try {
      setSending(true);
      await sendFriendRequest(user.regNo, foundUser.regNo);
      setRequestStatus("sent");
      Alert.alert("Success", "Friend request sent!");
      
      // Sync friends to update sent requests
      await syncFriendsFromBackend(user.regNo);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to send friend request");
    } finally {
      setSending(false);
    }
  };

  const getStatusButton = () => {
    if (!foundUser) return null;

    switch (requestStatus) {
      case "friends":
        return (
          <View style={[styles.statusButton, { backgroundColor: colors.accent }]}>
            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            <Text style={styles.statusButtonText}>Friends</Text>
          </View>
        );
      case "sent":
        return (
          <View style={[styles.statusButton, { backgroundColor: colors.textSecondary }]}>
            <Ionicons name="time-outline" size={20} color="#FFF" />
            <Text style={styles.statusButtonText}>Request Sent</Text>
          </View>
        );
      case "incoming":
        return (
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: colors.accent }]}
            onPress={() => navigation.navigate("FriendRequests")}
          >
            <Ionicons name="mail-outline" size={20} color="#FFF" />
            <Text style={styles.statusButtonText}>Incoming Request</Text>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
            onPress={handleSendRequest}
            disabled={sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={20} color="#FFF" />
                <Text style={styles.actionButtonText}>Send Friend Request</Text>
              </>
            )}
          </TouchableOpacity>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Search Friends
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Search for users by their registration number
          </Text>

          <View style={styles.searchContainer}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.card,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter registration number"
              placeholderTextColor={colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: colors.accent }]}
              onPress={handleSearch}
              disabled={searching}
              activeOpacity={0.8}
            >
              {searching ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Ionicons name="search" size={24} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>

          {foundUser && (
            <View
              style={[
                styles.userCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <FriendAvatar user={foundUser} size={80} />
              <Text style={[styles.userName, { color: colors.textPrimary }]}>
                {foundUser.name}
              </Text>
              <Text style={[styles.userRegNo, { color: colors.textSecondary }]}>
                {foundUser.regNo}
              </Text>
              {getStatusButton()}
            </View>
          )}

          {!foundUser && !searching && searchText.trim() && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Search for a user to get started
              </Text>
            </View>
          )}
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
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  userCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 4,
  },
  userRegNo: {
    fontSize: 14,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    width: "100%",
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    width: "100%",
  },
  statusButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});

