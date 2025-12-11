// components/UserAvatar.js

import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../stores/useStore";
import { generateAvatarColor, getInitials } from "../utils/avatarUtils";

export default function UserAvatar({ size = 36, onPress }) {
  const user = useStore((s) => s.user);
  const navigation = useNavigation();

  if (!user) {
    return null;
  }

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate("Account");
    }
  };

  const avatarColor = user.avatarColor || generateAvatarColor(user.name);
  const initials = user.initials || getInitials(user.name);

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

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
}

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

