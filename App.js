// App.js
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, StatusBar, Platform } from "react-native";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import TimetableScreen from "./screens/TimetableScreen";
import UploadScreen from "./screens/UploadScreen";
import SubscriptionScreen from "./screens/SubscriptionScreen";
import AccountScreen from "./screens/AccountScreen";
import OnboardingStep1 from "./screens/OnboardingStep1";
import OnboardingStep2 from "./screens/OnboardingStep2";
import DashboardScreen from "./screens/DashboardScreen";
import UnifiedFriendsScreen from "./screens/UnifiedFriendsScreen";
import FriendDetailScreen from "./screens/FriendDetailScreen";
import AttendanceScreen from "./screens/AttendanceScreen";
import UploadAttendanceScreen from "./screens/UploadAttendanceScreen";
import UnmarkedAttendanceModal from "./components/UnmarkedAttendanceModal";

import { useStore } from "./stores/useStore";
import { loadAppState } from "./services/localStorage";
import { useThemeColors } from "./theme/theme";
import { Ionicons } from "@expo/vector-icons";
import SplashScreen from "./components/SplashScreen";
import ProfilePanel from "./components/ProfilePanel";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// More screen - opens profile panel
function MoreScreen({ navigation }) {
  const [profilePanelVisible, setProfilePanelVisible] = React.useState(true);
  const colors = useThemeColors();
  
  React.useEffect(() => {
    // When More tab is pressed, open profile panel
    setProfilePanelVisible(true);
  }, []);

  return (
    <>
      <View style={{ flex: 1, backgroundColor: colors.background }} />
      <ProfilePanel
        visible={profilePanelVisible}
        onClose={() => {
          setProfilePanelVisible(false);
          // Navigate back to Dashboard when panel closes
          navigation.navigate("Dashboard");
        }}
      />
    </>
  );
}

function MainTabs() {
  const colors = useThemeColors();
  const darkMode = useStore((s) => s.darkMode);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          ...Platform.select({
            android: {
              elevation: 8,
            },
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Timetable"
        component={TimetableScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Friends"
        component={UnifiedFriendsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  const colors = useThemeColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.textPrimary,
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Account"
        component={AccountScreen}
        options={{ title: "Account" }}
      />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ title: "Subscription" }}
      />
      <Stack.Screen
        name="Upload"
        component={UploadScreen}
        options={{ title: "Upload Timetable" }}
      />
      <Stack.Screen
        name="FriendDetail"
        component={FriendDetailScreen}
        options={{ title: "Friend Details" }}
      />
        <Stack.Screen
          name="Attendance"
          component={AttendanceScreen}
          options={{ headerShown: false }}
        />
      <Stack.Screen
        name="UploadAttendance"
        component={UploadAttendanceScreen}
        options={{ title: "Upload Attendance" }}
      />
    </Stack.Navigator>
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
        name="MainStack"
        component={MainStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function OnboardingStack() {
  const colors = useThemeColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.textPrimary,
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="OnboardingStep1"
        component={OnboardingStep1}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OnboardingStep2"
        component={OnboardingStep2}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function AppContent() {
  const [showUnmarkedModal, setShowUnmarkedModal] = useState(false);
  const timetable = useStore((s) => s.timetable);
  const user = useStore((s) => s.user);
  const darkMode = useStore((s) => s.darkMode);
  const colors = useThemeColors();
  const hydrated = useStore((s) => s.hydrated);

  const hasTimetable = !!timetable;
  const hasUser = !!user;

  // Check for unmarked attendance on app start
  useEffect(() => {
    if (hydrated && hasUser && hasTimetable) {
      // Check for unmarked attendance after a short delay
      setTimeout(() => {
        setShowUnmarkedModal(true);
      }, 1500);
    }
  }, [hydrated, hasUser, hasTimetable]);

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
        {!hasUser ? (
          <OnboardingStack />
        ) : hasTimetable ? (
          <MainStack />
        ) : (
          <UploadStack />
        )}
      </NavigationContainer>
      <UnmarkedAttendanceModal
        visible={showUnmarkedModal}
        onClose={() => setShowUnmarkedModal(false)}
      />
    </>
  );
}

export default function App() {
  const setTimetable = useStore((s) => s.setTimetable);
  const normalizeTimetable = useStore((s) => s.normalizeTimetable);
  const setUploadsRemaining = useStore((s) => s.setUploadsRemaining);
  const setSubscriptionCode = useStore((s) => s.setSubscriptionCode);
  const setDarkMode = useStore((s) => s.setDarkMode);
  const setUser = useStore((s) => s.setUser);
  const setFriends = useStore((s) => s.setFriends);
  const setFriendRequests = useStore((s) => s.setFriendRequests);
  const hydrated = useStore((s) => s.hydrated);
  const setHydrated = useStore((s) => s.setHydrated);

  const [showSplash, setShowSplash] = useState(true);

  // Hydrate from AsyncStorage
  useEffect(() => {
    const hydrate = async () => {
      try {
        const saved = await loadAppState();
        if (saved) {
          if (saved.timetable) {
            // Normalize timetable to ensure Saturday and Sunday are present
            const normalized = normalizeTimetable(saved.timetable);
            setTimetable(normalized);
          }
          if (typeof saved.uploadsRemaining === "number") {
            setUploadsRemaining(saved.uploadsRemaining);
          }
          if (saved.subscriptionCode) {
            setSubscriptionCode(saved.subscriptionCode);
          }
          if (typeof saved.darkMode === "boolean") {
            setDarkMode(saved.darkMode);
          }
          if (saved.user) {
            await setUser(saved.user);
          }
          if (saved.friends) {
            setFriends(saved.friends);
          }
          if (saved.friendRequests) {
            setFriendRequests(saved.friendRequests);
          }
          if (saved.attendance) {
            const { setAttendance } = useStore.getState();
            // Migrate old attendance format to new format if needed
            const migratedAttendance = {};
            Object.keys(saved.attendance).forEach(key => {
              const oldData = saved.attendance[key];
              
              // Check if key is old format (just courseCode) or new format (courseCode-type)
              const isOldFormat = !key.includes('-ETH') && !key.includes('-ELA') && !key.includes('-TH');
              
              if (isOldFormat) {
                // Old format: migrate to both ETH and ELA (assuming it could be either)
                // Check if old format (has 'attended' and 'missed' directly)
                if (oldData.attended !== undefined && oldData.baselineAttended === undefined) {
                  // Migrate to both ETH and ELA with same values (user can adjust later)
                  migratedAttendance[`${key}-ETH`] = {
                    baselineAttended: 0,
                    baselineMissed: 0,
                    dailyAttended: oldData.attended || 0,
                    dailyMissed: oldData.missed || 0,
                    requiredPercent: oldData.requiredPercent || 75,
                  };
                  migratedAttendance[`${key}-ELA`] = {
                    baselineAttended: 0,
                    baselineMissed: 0,
                    dailyAttended: oldData.attended || 0,
                    dailyMissed: oldData.missed || 0,
                    requiredPercent: oldData.requiredPercent || 75,
                  };
                } else {
                  // Already in new format structure but old key format
                  migratedAttendance[`${key}-ETH`] = {
                    baselineAttended: oldData.baselineAttended || 0,
                    baselineMissed: oldData.baselineMissed || 0,
                    dailyAttended: oldData.dailyAttended || 0,
                    dailyMissed: oldData.dailyMissed || 0,
                    requiredPercent: oldData.requiredPercent || 75,
                  };
                  migratedAttendance[`${key}-ELA`] = {
                    baselineAttended: oldData.baselineAttended || 0,
                    baselineMissed: oldData.baselineMissed || 0,
                    dailyAttended: oldData.dailyAttended || 0,
                    dailyMissed: oldData.dailyMissed || 0,
                    requiredPercent: oldData.requiredPercent || 75,
                  };
                }
              } else {
                // Already in new format (has type in key)
                if (oldData.attended !== undefined && oldData.baselineAttended === undefined) {
                  // Migrate: old 'attended'/'missed' become 'dailyAttended'/'dailyMissed'
                  migratedAttendance[key] = {
                    baselineAttended: 0,
                    baselineMissed: 0,
                    dailyAttended: oldData.attended || 0,
                    dailyMissed: oldData.missed || 0,
                    requiredPercent: oldData.requiredPercent || 75,
                  };
                } else {
                  // Already in new format or missing fields
                  migratedAttendance[key] = {
                    baselineAttended: oldData.baselineAttended || 0,
                    baselineMissed: oldData.baselineMissed || 0,
                    dailyAttended: oldData.dailyAttended || 0,
                    dailyMissed: oldData.dailyMissed || 0,
                    requiredPercent: oldData.requiredPercent || 75,
                  };
                }
              }
            });
            await setAttendance(migratedAttendance);
          }
          if (saved.attendanceMarks) {
            const { setAttendanceMarks } = useStore.getState();
            await setAttendanceMarks(saved.attendanceMarks);
          }
          if (saved.attendanceUploadDate) {
            const { setAttendanceUploadDate } = useStore.getState();
            await setAttendanceUploadDate(saved.attendanceUploadDate);
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
