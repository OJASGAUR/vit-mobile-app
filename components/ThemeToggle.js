// components/ThemeToggle.js
import React, { useEffect, useRef } from "react";
import { Pressable, Animated, Text, StyleSheet } from "react-native";
import { useStore } from "../stores/useStore";
import { saveAppState } from "../services/localStorage";
import { useThemeColors } from "../theme/theme";

export default function ThemeToggle() {
  const darkMode = useStore((s) => s.darkMode);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const colors = useThemeColors();

  const progress = useRef(new Animated.Value(darkMode ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: darkMode ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [darkMode]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 26], // knob travel
  });

  const handleToggle = async () => {
    const next = !darkMode;
    toggleTheme();
    await saveAppState({ darkMode: next });
  };

  return (
    <Pressable style={styles.wrapper} onPress={handleToggle} hitSlop={10}>
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: darkMode
              ? "rgba(15,23,42,1)"
              : "rgba(148,163,184,0.6)",
          },
        ]}
      >
        <Animated.View
          style={[
            styles.knob,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <Text style={styles.icon}>{darkMode ? "🌙" : "☀️"}</Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginRight: 12,
  },
  track: {
    width: 50,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  icon: {
    fontSize: 14,
  },
});
