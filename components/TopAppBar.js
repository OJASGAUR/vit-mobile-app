// components/TopAppBar.js

import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/theme";
import UserAvatar from "./UserAvatar";

const TopAppBar = React.memo(({ title, onAvatarPress, showBackButton, onBackPress }) => {
  const colors = useThemeColors();

  const containerStyle = useMemo(
    () => [
      styles.container,
      { backgroundColor: colors.card },
      Platform.select({
        android: { elevation: 2 },
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
      }),
    ],
    [colors.card]
  );

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.card }]}
    >
      <View style={containerStyle}>
        {showBackButton ? (
          <TouchableOpacity
            onPress={onBackPress}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        <TouchableOpacity
          onPress={onAvatarPress}
          activeOpacity={0.7}
          style={styles.avatarButton}
        >
          <UserAvatar size={40} onPress={onAvatarPress} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

TopAppBar.displayName = "TopAppBar";

export default TopAppBar;

const styles = StyleSheet.create({
  safeArea: {
    zIndex: 10,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  spacer: {
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  avatarButton: {
    width: 40,
    alignItems: "flex-end",
  },
});

