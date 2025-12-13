// screens/FriendRequestsScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../stores/useStore";
import { useThemeColors } from "../theme/theme";
import FriendAvatar from "../components/FriendAvatar";
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from "../services/api";

export default function FriendRequestsScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState({});

  const user = useStore((s) => s.user);
  const friendRequests = useStore((s) => s.friendRequests);
  const syncFriendsFromBackend = useStore((s) => s.syncFriendsFromBackend);
  const colors = useThemeColors();

  const incomingRequests = friendRequests?.incomingRequests || [];
  const sentRequests = friendRequests?.sentRequests || [];

  useEffect(() => {
    if (user?.regNo) {
      syncFriendsFromBackend(user.regNo);
    }
  }, [user?.regNo]);

  const handleRefresh = async () => {
    if (!user?.regNo) return;
    setRefreshing(true);
    await syncFriendsFromBackend(user.regNo);
    setRefreshing(false);
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
        <FriendAvatar user={request.user} size={60} />
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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.container}>
          {/* Incoming Requests */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Incoming Requests ({incomingRequests.length})
            </Text>
            {incomingRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="mail-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No incoming requests
                </Text>
              </View>
            ) : (
              incomingRequests.map((request) => renderRequestCard(request, true))
            )}
          </View>

          {/* Sent Requests */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Sent Requests ({sentRequests.length})
            </Text>
            {sentRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="send-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No sent requests
                </Text>
              </View>
            ) : (
              sentRequests.map((request) => renderRequestCard(request, false))
            )}
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  requestCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  rejectButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  pendingText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
});

