// components/UserAvatar.js

import React, { useMemo, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../stores/useStore";
import { generateAvatarColor, getInitials } from "../utils/avatarUtils";

const UserAvatar = React.memo(({ size = 36, onPress }) => {
  const user = useStore((s) => s.user);
  const navigation = useNavigation();

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate("Account");
    }
  }, [onPress, navigation]);

  const avatarColor = useMemo(
    () => user?.avatarColor || (user?.name ? generateAvatarColor(user.name) : "#2563EB"),
    [user?.avatarColor, user?.name]
  );

  const initials = useMemo(
    () => user?.initials || (user?.name ? getInitials(user.name) : "U"),
    [user?.initials, user?.name]
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
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={styles.container}>
      {user.avatar ? (
        <Image source={{ uri: user.avatar }} style={avatarStyle} />
      ) : (
        <View style={[avatarStyle, styles.placeholder, { backgroundColor: avatarColor }]}>
          <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

UserAvatar.displayName = "UserAvatar";

export default UserAvatar;

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
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

