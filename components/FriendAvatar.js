// components/FriendAvatar.js

import React, { useMemo } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { generateAvatarColor, getInitials } from "../utils/avatarUtils";

const FriendAvatar = React.memo(({ user, size = 40 }) => {
  const avatarColor = useMemo(
    () =>
      user?.avatarColor ||
      generateAvatarColor(user?.name || user?.regNo || "User"),
    [user?.avatarColor, user?.name, user?.regNo]
  );

  const initials = useMemo(
    () => user?.initials || getInitials(user?.name || user?.regNo || "U"),
    [user?.initials, user?.name, user?.regNo]
  );

  const avatarStyle = useMemo(
    () => ({
      width: size,
      height: size,
      borderRadius: size / 2,
    }),
    [size]
  );

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      {user.avatar ? (
        <Image source={{ uri: user.avatar }} style={avatarStyle} />
      ) : (
        <View style={[avatarStyle, styles.placeholder, { backgroundColor: avatarColor }]}>
          <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
        </View>
      )}
    </View>
  );
});

FriendAvatar.displayName = "FriendAvatar";

export default FriendAvatar;

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#FFF",
    fontWeight: "700",
  },
});

