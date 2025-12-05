// App.js
import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, StatusBar } from "react-native";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";

import TimetableScreen from "./screens/TimetableScreen";
import UploadScreen from "./screens/UploadScreen";
import SubscriptionScreen from "./screens/SubscriptionScreen";

import { useStore } from "./stores/useStore";
import { loadAppState } from "./services/localStorage";
import { ThemeProvider, useThemeColors } from "./theme/theme";
import ThemeToggle from "./components/ThemeToggle";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function MainDrawer() {
  const colors = useThemeColors();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.textPrimary,
        headerTitleAlign: "center",
        headerRight: () => <ThemeToggle />,
        drawerStyle: { backgroundColor: colors.background },
        drawerActiveTintColor: colors.textPrimary,
        drawerInactiveTintColor: colors.textSecondary,
      }}
    >
      <Drawer.Screen
        name="Timetable"
        component={TimetableScreen}
        options={{ title: "Timetable" }}
      />
      <Drawer.Screen
        name="Upload"
        component={UploadScreen}
        options={{ title: "Upload timetable" }}
      />
      <Drawer.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ title: "Subscription" }}
      />
    </Drawer.Navigator>
  );
}

function UploadStack() {
  const colors = useThemeColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.textPrimary,
        headerTitleAlign: "center",
        headerRight: () => <ThemeToggle />,
      }}
    >
      <Stack.Screen
        name="Upload"
        component={UploadScreen}
        options={{ title: "Upload timetable" }}
      />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ title: "Subscription" }}
      />
      <Stack.Screen
        name="MainDrawer"
        component={MainDrawer}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const timetable = useStore((s) => s.timetable);
  const setTimetable = useStore((s) => s.setTimetable);
  const uploadsRemaining = useStore((s) => s.uploadsRemaining);
  const setUploadsRemaining = useStore((s) => s.setUploadsRemaining);
  const setSubscriptionCode = useStore((s) => s.setSubscriptionCode);
  const darkMode = useStore((s) => s.darkMode);
  const setDarkMode = useStore((s) => s.setDarkMode);
  const hydrated = useStore((s) => s.hydrated);
  const setHydrated = useStore((s) => s.setHydrated);

  const colors = useThemeColors();

  // Hydrate from AsyncStorage
  useEffect(() => {
    const hydrate = async () => {
      try {
        const saved = await loadAppState();
        if (saved) {
          if (saved.timetable) setTimetable(saved.timetable);
          if (typeof saved.uploadsRemaining === "number") {
            setUploadsRemaining(saved.uploadsRemaining);
          }
          if (saved.subscriptionCode) {
            setSubscriptionCode(saved.subscriptionCode);
          }
          if (typeof saved.darkMode === "boolean") {
            setDarkMode(saved.darkMode);
          }
        }
      } catch (e) {
        console.warn("hydrate failed", e);
      } finally {
        setHydrated(true);
      }
    };
    hydrate();
  }, []);

  if (!hydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const hasTimetable = !!timetable;

  const navTheme = darkMode
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.background,
          card: colors.card,
          text: colors.textPrimary,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.card,
          text: colors.textPrimary,
        },
      };

  return (
    <ThemeProvider>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.card}
      />
      <NavigationContainer theme={navTheme}>
        {hasTimetable ? <MainDrawer /> : <UploadStack />}
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#061124",
    alignItems: "center",
    justifyContent: "center",
  },
});
