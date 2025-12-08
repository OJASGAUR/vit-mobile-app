// App.js
import React, { useEffect, useState } from "react"; // ADD useState
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
import { useThemeColors } from "./theme/theme";
import ThemeToggle from "./components/ThemeToggle";
import SplashScreen from "./components/SplashScreen"; // ADD THIS IMPORT

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

function AppContent() {
  const timetable = useStore((s) => s.timetable);
  const darkMode = useStore((s) => s.darkMode);
  const colors = useThemeColors();

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
    <>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.card}
      />
      <NavigationContainer theme={navTheme}>
        {hasTimetable ? <MainDrawer /> : <UploadStack />}
      </NavigationContainer>
    </>
  );
}

export default function App() {
  const setTimetable = useStore((s) => s.setTimetable);
  const setUploadsRemaining = useStore((s) => s.setUploadsRemaining);
  const setSubscriptionCode = useStore((s) => s.setSubscriptionCode);
  const setDarkMode = useStore((s) => s.setDarkMode);
  const hydrated = useStore((s) => s.hydrated);
  const setHydrated = useStore((s) => s.setHydrated);
  
  const [showSplash, setShowSplash] = useState(true); // ADD THIS STATE

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

  // Show splash screen for 2.5 seconds
  if (showSplash) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }

  if (!hydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return <AppContent />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#061124",
    alignItems: "center",
    justifyContent: "center",
  },
});