// screens/UnifiedFriendsScreen.js

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../stores/useStore";
import { useThemeColors } from "../theme/theme";
import FriendAvatar from "../components/FriendAvatar";
import TopAppBar from "../components/TopAppBar";
import ProfilePanel from "../components/ProfilePanel";
import {
  getUserByRegNo,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../services/api";

export default function UnifiedFriendsScreen({ navigation }) {
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState({});

  const user = useStore((s) => s.user);
  const friends = useStore((s) => s.friends);
  const friendRequests = useStore((s) => s.friendRequests);
  const syncFriendsFromBackend = useStore((s) => s.syncFriendsFromBackend);
  const colors = useThemeColors();

  const incomingRequests = useMemo(() => friendRequests?.incomingRequests || [], [friendRequests?.incomingRequests]);
  const sentRequests = useMemo(() => friendRequests?.sentRequests || [], [friendRequests?.sentRequests]);
  const hasPendingRequests = useMemo(() => incomingRequests.length > 0 || sentRequests.length > 0, [incomingRequests.length, sentRequests.length]);

  useEffect(() => {
    if (user?.regNo) {
      syncFriendsFromBackend(user.regNo);
    }
  }, [user?.regNo]);

  const handleRefresh = useCallback(async () => {
    if (!user?.regNo) return;
    setRefreshing(true);
    await syncFriendsFromBackend(user.regNo);
    setRefreshing(false);
  }, [user?.regNo, syncFriendsFromBackend]);

  const checkRequestStatus = useCallback((targetRegNo) => {
    if (!targetRegNo || !user) return "none";

    const isFriend = friends.some((f) => f.regNo === targetRegNo);
    if (isFriend) return "friends";

    const hasIncoming = incomingRequests.some((req) => req.fromRegNo === targetRegNo);
    if (hasIncoming) return "incoming";

    const hasSent = sentRequests.some((req) => req.toRegNo === targetRegNo);
    if (hasSent) return "sent";

    return "none";
  }, [user, friends, incomingRequests, sentRequests]);

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
      await syncFriendsFromBackend(user.regNo);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to send friend request");
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (request) => {
    if (!user) return;

    const key = `${request.fromRegNo}-${request.toRegNo}`;
    setProcessing({ ...processing, [key]: "accepting" });

    try {
      await acceptFriendRequest(request.fromRegNo, request.toRegNo);
      Alert.alert("Success", "Friend request accepted!");
      await syncFriendsFromBackend(user.regNo);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to accept friend request");
    } finally {
      setProcessing({ ...processing, [key]: null });
    }
  };

  const handleReject = async (request) => {
    if (!user) return;

    Alert.alert(
      "Reject Request",
      `Are you sure you want to reject ${request.user?.name || request.fromRegNo}'s friend request?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            const key = `${request.fromRegNo}-${request.toRegNo}`;
            setProcessing({ ...processing, [key]: "rejecting" });

            try {
              await rejectFriendRequest(request.fromRegNo, request.toRegNo);
              Alert.alert("Success", "Friend request rejected");
              await syncFriendsFromBackend(user.regNo);
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to reject friend request");
            } finally {
              setProcessing({ ...processing, [key]: null });
            }
          },
        },
      ]
    );
  };

  const handleFriendPress = useCallback((friend) => {
    navigation.navigate("FriendDetail", { friend });
  }, [navigation]);
  
  const handleAvatarPress = useCallback(() => {
    setProfilePanelVisible(true);
  }, []);

  const renderRequestCard = (request, isIncoming) => {
    const key = `${request.fromRegNo}-${request.toRegNo}`;
    const isProcessing = processing[key];

    return (
      <View
        key={key}
        style={[
          styles.requestCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <FriendAvatar user={request.user} size={56} />
        <View style={styles.requestInfo}>
          <Text style={[styles.requestName, { color: colors.textPrimary }]}>
            {request.user?.name || request.fromRegNo}
          </Text>
          <Text style={[styles.requestRegNo, { color: colors.textSecondary }]}>
            {request.user?.regNo || request.fromRegNo}
          </Text>
        </View>
        {isIncoming ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.acceptButton, { backgroundColor: colors.accent }]}
              onPress={() => handleAccept(request)}
              disabled={!!isProcessing}
              activeOpacity={0.8}
            >
              {isProcessing === "accepting" ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                  <Text style={styles.buttonText}>Accept</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rejectButton, { borderColor: colors.border }]}
              onPress={() => handleReject(request)}
              disabled={!!isProcessing}
              activeOpacity={0.8}
            >
              {isProcessing === "rejecting" ? (
                <ActivityIndicator color={colors.textSecondary} size="small" />
              ) : (
                <>
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                  <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
                    Reject
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pendingBadge}>
            <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.pendingText, { color: colors.textSecondary }]}>
              Pending
            </Text>
          </View>
        )}
      </View>
    );
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
          <View style={[styles.statusButton, { backgroundColor: colors.accent }]}>
            <Ionicons name="mail-outline" size={20} color="#FFF" />
            <Text style={styles.statusButtonText}>Incoming Request</Text>
          </View>
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <TopAppBar
        title="Friends"
        onAvatarPress={handleAvatarPress}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      >
        {/* Section 1: Search Bar */}
        <View style={styles.searchSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Search Friends
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
        </View>

        {/* Section 2: Pending Requests */}
        {hasPendingRequests && (
          <View style={styles.requestsSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Pending Requests
            </Text>

            {incomingRequests.length > 0 && (
              <View style={styles.subsection}>
                <Text style={[styles.subsectionTitle, { color: colors.textSecondary }]}>
                  Incoming ({incomingRequests.length})
                </Text>
                {incomingRequests.map((request) => renderRequestCard(request, true))}
              </View>
            )}

            {sentRequests.length > 0 && (
              <View style={styles.subsection}>
                <Text style={[styles.subsectionTitle, { color: colors.textSecondary }]}>
                  Sent ({sentRequests.length})
                </Text>
                {sentRequests.map((request) => renderRequestCard(request, false))}
              </View>
            )}
          </View>
        )}

        {/* Section 3: Your Friends */}
        <View style={styles.friendsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Your Friends ({friends.length})
          </Text>
          {friends.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No friends yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Search for users and send friend requests to get started
              </Text>
            </View>
          ) : (
            friends.map((friend) => (
              <TouchableOpacity
                key={friend.regNo}
                style={[
                  styles.friendCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleFriendPress(friend)}
                activeOpacity={0.7}
              >
                <FriendAvatar user={friend} size={64} />
                <View style={styles.friendInfo}>
                  <Text style={[styles.friendName, { color: colors.textPrimary }]}>
                    {friend.name}
                  </Text>
                  <Text style={[styles.friendRegNo, { color: colors.textSecondary }]}>
                    {friend.regNo}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.viewTimetableButton, { backgroundColor: colors.accent }]}
                  onPress={() => handleFriendPress(friend)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.viewTimetableText}>View Timetable</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
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
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  searchSection: {
    marginBottom: 32,
  },
  requestsSection: {
    marginBottom: 32,
  },
  friendsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  subsection: {
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    marginTop: 8,
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
  requestCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  requestRegNo: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  rejectButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  pendingText: {
    fontSize: 14,
    fontWeight: "600",
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  friendRegNo: {
    fontSize: 14,
  },
  viewTimetableButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  viewTimetableText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});

