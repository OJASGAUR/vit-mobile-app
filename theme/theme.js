// theme/theme.js
import React from "react";
import { View } from "react-native";
import { useStore } from "../stores/useStore";

export const lightTheme = {
  background: "#F4F4F5",
  card: "#FFFFFF",
  textPrimary: "#020617",
  textSecondary: "#4B5563",
  accent: "#2563EB",
  border: "rgba(15,23,42,0.08)",
};

export const darkTheme = {
  background: "#020617",
  card: "#020617",
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
  accent: "#3B82F6",
  border: "rgba(148,163,184,0.25)",
};

export function useThemeColors() {
  const darkMode = useStore((s) => s.darkMode);
  return darkMode ? darkTheme : lightTheme;
}

export function ThemeProvider({ children }) {
  const colors = useThemeColors();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {children}
    </View>
  );
}
