// screens/DashboardScreen.js

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../stores/useStore";
import { useThemeColors } from "../theme/theme";
import { findNextClass } from "../utils/nextClassUtils";
import TopAppBar from "../components/TopAppBar";
import ProfilePanel from "../components/ProfilePanel";

export default function DashboardScreen({ navigation }) {
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextClassInfo, setNextClassInfo] = useState(null);

  const user = useStore((s) => s.user);
  const timetable = useStore((s) => s.timetable);
  const colors = useThemeColors();
  const darkMode = useStore((s) => s.darkMode);

  // Update time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update next class info - memoized to prevent unnecessary recalculations
  useEffect(() => {
    if (timetable) {
      const next = findNextClass(timetable, currentTime);
      setNextClassInfo(next);
    } else {
      setNextClassInfo(null);
    }
  }, [timetable, currentTime]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []); // Only calculate once per mount

  const userName = useMemo(() => user?.name?.split(" ")[0] || "there", [user?.name]);

  // Get current day name
  const currentDayName = useMemo(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date().getDay();
    return days[today];
  }, [currentTime]);

  // Check if today is weekend
  const isWeekend = useMemo(() => {
    const today = new Date().getDay();
    return today === 0 || today === 6; // Sunday or Saturday
  }, [currentTime]);

  const handleAvatarPress = useCallback(() => {
    setProfilePanelVisible(true);
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <TopAppBar
        title="Dashboard"
        onAvatarPress={handleAvatarPress}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        initialNumToRender={5}
        windowSize={5}
      >
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={[styles.dayName, { color: colors.accent }]}>
            {currentDayName}
          </Text>
          <Text style={[styles.greeting, { color: colors.textPrimary }]}>
            {greeting}, {userName}
          </Text>
        </View>

        {/* Weekend Message */}
        {isWeekend ? (
          <View
            style={[
              styles.weekendCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.weekendTitle, { color: colors.textPrimary }]}>
              No classes today
            </Text>
            <Text style={[styles.weekendSubtitle, { color: colors.textSecondary }]}>
              Enjoy your weekend! Classes resume on Monday.
            </Text>
          </View>
        ) : nextClassInfo && nextClassInfo.class ? (
          <TouchableOpacity
            style={[
              styles.nextClassCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => navigation.navigate("Timetable")}
            activeOpacity={0.8}
          >
            <View style={styles.nextClassHeader}>
              <Ionicons
                name="time-outline"
                size={24}
                color={colors.accent}
              />
              <Text style={[styles.nextClassLabel, { color: colors.textSecondary }]}>
                {nextClassInfo.isOngoing ? "CLASS ONGOING" : "NEXT CLASS"}
              </Text>
            </View>
            <Text
              style={[styles.nextClassCourse, { color: colors.textPrimary }]}
              numberOfLines={2}
            >
              {nextClassInfo.class.courseName.replace(/\s*\(.*?\)/g, "")}
            </Text>
            <View style={styles.nextClassDetails}>
              <View style={styles.nextClassDetailItem}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.nextClassDetailText, { color: colors.textSecondary }]}>
                  {nextClassInfo.day}
                </Text>
              </View>
              <View style={styles.nextClassDetailItem}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.nextClassDetailText, { color: colors.textSecondary }]}>
                  {nextClassInfo.class.start} - {nextClassInfo.class.end}
                </Text>
              </View>
              <View style={styles.nextClassDetailItem}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.nextClassDetailText, { color: colors.textSecondary }]}>
                  {nextClassInfo.class.venue}
                </Text>
              </View>
            </View>
            {!nextClassInfo.isOngoing && (
              <View style={styles.countdownContainer}>
                <Text style={[styles.countdownLabel, { color: colors.textSecondary }]}>
                  Starts in:
                </Text>
                <Text style={[styles.countdownTime, { color: colors.accent }]}>
                  {nextClassInfo.timeRemaining}
                </Text>
              </View>
            )}
            {nextClassInfo.isOngoing && (
              <View style={styles.ongoingBadge}>
                <View
                  style={[
                    styles.ongoingDot,
                    { backgroundColor: colors.accent },
                  ]}
                />
                <Text style={[styles.ongoingText, { color: colors.accent }]}>
                  Class in progress
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
              No upcoming classes
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              {timetable
                ? "Enjoy your free time!"
                : "Upload your timetable to see your schedule"}
            </Text>
          </View>
        )}

        {/* Placeholder Summary Cards */}
        <View style={styles.summarySection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Quick Overview
          </Text>
          <View style={styles.summaryGrid}>
            <TouchableOpacity
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => navigation.navigate("Attendance")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={32}
                color={colors.accent}
              />
              <Text style={[styles.summaryCardTitle, { color: colors.textPrimary }]}>
                Attendance Tracker
              </Text>
              <Text style={[styles.summaryCardValue, { color: colors.textSecondary }]}>
                View details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => navigation.navigate("Subjects")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="book-outline"
                size={32}
                color={colors.accent}
              />
              <Text style={[styles.summaryCardTitle, { color: colors.textPrimary }]}>
                Subjects
              </Text>
              <Text style={[styles.summaryCardValue, { color: colors.textSecondary }]}>
                View all
              </Text>
            </TouchableOpacity>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={32}
                color={colors.accent}
              />
              <Text style={[styles.summaryCardTitle, { color: colors.textPrimary }]}>
                Assignments
              </Text>
              <Text style={[styles.summaryCardValue, { color: colors.textSecondary }]}>
                Coming soon
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <ProfilePanel
        visible={profilePanelVisible}
        onClose={() => setProfilePanelVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  greetingSection: {
    marginBottom: 24,
  },
  dayName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  weekendCard: {
    padding: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 24,
  },
  weekendTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  weekendSubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  nextClassCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  nextClassHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  nextClassLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  nextClassCourse: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  nextClassDetails: {
    gap: 8,
    marginBottom: 16,
  },
  nextClassDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nextClassDetailText: {
    fontSize: 14,
  },
  countdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  countdownLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  countdownTime: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  ongoingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  ongoingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ongoingText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  summarySection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: "47%",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  summaryCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: 14,
  },
});

