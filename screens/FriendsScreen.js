// screens/FriendsScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../stores/useStore";
import { useThemeColors } from "../theme/theme";
import FriendAvatar from "../components/FriendAvatar";

export default function FriendsScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);

  const user = useStore((s) => s.user);
  const friends = useStore((s) => s.friends);
  const syncFriendsFromBackend = useStore((s) => s.syncFriendsFromBackend);
  const colors = useThemeColors();

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

  const handleFriendPress = (friend) => {
    navigation.navigate("FriendDetail", { friend });
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
          {friends.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No friends yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Search for users and send friend requests to get started
              </Text>
              <TouchableOpacity
                style={[styles.searchButton, { backgroundColor: colors.accent }]}
                onPress={() => navigation.navigate("SearchFriends")}
                activeOpacity={0.8}
              >
                <Ionicons name="search" size={20} color="#FFF" />
                <Text style={styles.searchButtonText}>Search Friends</Text>
              </TouchableOpacity>
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
                <FriendAvatar user={friend} size={60} />
                <View style={styles.friendInfo}>
                  <Text style={[styles.friendName, { color: colors.textPrimary }]}>
                    {friend.name}
                  </Text>
                  <Text style={[styles.friendRegNo, { color: colors.textSecondary }]}>
                    {friend.regNo}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))
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
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  searchButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

