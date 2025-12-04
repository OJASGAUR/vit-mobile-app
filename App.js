// App.js
import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";

import TimetableScreen from "./screens/TimetableScreen";
import UploadScreen from "./screens/UploadScreen";
import SubscriptionScreen from "./screens/SubscriptionScreen";

import { useStore } from "./stores/useStore";
import { loadAppState } from "./services/localStorage";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function MainDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#061124" },
        headerTintColor: "#fff",
        drawerStyle: { backgroundColor: "#020814" },
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#9bb2cf",
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

export default function App() {
  const timetable = useStore((s) => s.timetable);
  const setTimetable = useStore((s) => s.setTimetable);
  const uploadsRemaining = useStore((s) => s.uploadsRemaining);
  const setUploadsRemaining = useStore((s) => s.setUploadsRemaining);
  const setSubscriptionCode = useStore((s) => s.setSubscriptionCode);
  const hydrated = useStore((s) => s.hydrated);
  const setHydrated = useStore((s) => s.setHydrated);

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

  return (
    <NavigationContainer>
      {hasTimetable ? (
        // User already has timetable → open drawer directly
        <MainDrawer />
      ) : (
        // First launch (no timetable) → show upload flow first
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#061124" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
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
      )}
    </NavigationContainer>
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
cd