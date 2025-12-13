// screens/AttendanceCalculatorScreen.js

import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../stores/useStore";
import { useThemeColors } from "../theme/theme";
import TopAppBar from "../components/TopAppBar";
import ProfilePanel from "../components/ProfilePanel";

export default function AttendanceCalculatorScreen({ route, navigation }) {
  const { courseCode, courseName, courseType } = route.params || {};
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const [tempAttended, setTempAttended] = useState(0);
  const [tempMissed, setTempMissed] = useState(0);

  const colors = useThemeColors();
  const getCombinedAttendance = useStore((s) => s.getCombinedAttendance);

  // Get original attendance data
  const originalAttendance = useMemo(() => {
    if (!courseCode || !courseType) return { finalAttended: 0, finalMissed: 0, finalPercentage: null };
    return getCombinedAttendance(courseCode, courseType);
  }, [courseCode, courseType, getCombinedAttendance]);

  // Initialize temp values with original
  React.useEffect(() => {
    setTempAttended(originalAttendance.finalAttended || 0);
    setTempMissed(originalAttendance.finalMissed || 0);
  }, [originalAttendance.finalAttended, originalAttendance.finalMissed]);

  // Calculate current percentage
  const currentPercentage = useMemo(() => {
    const total = tempAttended + tempMissed;
    if (total === 0) return null;
    return Math.round((tempAttended / total) * 100);
  }, [tempAttended, tempMissed]);


  const handleIncrementAttended = useCallback(() => {
    setTempAttended((prev) => prev + 1);
  }, []);

  const handleDecrementAttended = useCallback(() => {
    if (tempAttended > 0) {
      setTempAttended((prev) => prev - 1);
    }
  }, [tempAttended]);

  const handleIncrementMissed = useCallback(() => {
    setTempMissed((prev) => prev + 1);
  }, []);

  const handleDecrementMissed = useCallback(() => {
    if (tempMissed > 0) {
      setTempMissed((prev) => prev - 1);
    }
  }, [tempMissed]);

  const handleReset = useCallback(() => {
    Alert.alert(
      "Reset Attendance",
      "Reset to original attendance values?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setTempAttended(originalAttendance.finalAttended || 0);
            setTempMissed(originalAttendance.finalMissed || 0);
          },
        },
      ]
    );
  }, [originalAttendance]);

  const handleAvatarPress = useCallback(() => {
    setProfilePanelVisible(true);
  }, []);

  const getPercentageColor = useCallback((percentage) => {
    if (percentage === null) return colors.textSecondary;
    if (percentage >= 80) return "#10B981"; // Green
    if (percentage >= 75) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  }, [colors.textSecondary]);

  const percentageColor = getPercentageColor(currentPercentage);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <TopAppBar
        title="Attendance Calculator"
        onAvatarPress={handleAvatarPress}
        showBackButton={navigation.canGoBack()}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Course Info */}
        <View style={[styles.courseInfoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.courseName, { color: colors.textPrimary }]}>
            {courseName?.replace(/\s*\(.*?\)/g, "") || "Course"}
          </Text>
          <Text style={[styles.courseCode, { color: colors.textSecondary }]}>
            {courseCode} {courseType ? `• ${courseType}` : ""}
          </Text>
        </View>

        {/* Current Attendance Percentage */}
        <View style={[styles.percentageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.percentageLabel, { color: colors.textSecondary }]}>
            Current Attendance Percentage
          </Text>
          <View style={styles.circularProgressContainer}>
            {/* Background circle */}
            <View style={[styles.circularProgressBackground, { borderColor: colors.border }]} />
            {/* Progress fill circle */}
            {currentPercentage !== null && (
              <View
                style={[
                  styles.circularProgressFill,
                  {
                    backgroundColor: `${percentageColor}20`,
                    borderColor: percentageColor,
                  },
                ]}
              />
            )}
            {/* Percentage text */}
            <View style={styles.percentageTextContainer}>
              <Text style={[styles.percentageText, { color: percentageColor }]}>
                {currentPercentage !== null ? `${currentPercentage}%` : "—%"}
              </Text>
            </View>
          </View>
        </View>

        {/* Adjust Controls */}
        <View style={[styles.controlsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Attended Controls */}
          <View style={styles.controlSection}>
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={[styles.controlButton, styles.incrementButton, { backgroundColor: "#F59E0B" }]}
                onPress={handleIncrementAttended}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, styles.decrementButton, { backgroundColor: "#F59E0B" }]}
                onPress={handleDecrementAttended}
                disabled={tempAttended === 0}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.controlLabel, { color: colors.textPrimary }]}>Attended</Text>
            <Text style={[styles.controlValue, { color: colors.textPrimary }]}>{tempAttended}</Text>
          </View>

          {/* Not Attended Controls */}
          <View style={styles.controlSection}>
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={[styles.controlButton, styles.incrementButton, { backgroundColor: "#EF4444" }]}
                onPress={handleIncrementMissed}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, styles.decrementButton, { backgroundColor: "#EF4444" }]}
                onPress={handleDecrementMissed}
                disabled={tempMissed === 0}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.controlLabel, { color: colors.textPrimary }]}>Not Attended</Text>
            <Text style={[styles.controlValue, { color: colors.textPrimary }]}>{tempMissed}</Text>
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color={colors.textPrimary} />
          <Text style={[styles.resetButtonText, { color: colors.textPrimary }]}>Reset</Text>
        </TouchableOpacity>
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
  courseInfoCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  courseName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  courseCode: {
    fontSize: 14,
  },
  percentageCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: "center",
  },
  percentageLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 20,
  },
  circularProgressContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 140,
    height: 140,
    marginVertical: 10,
  },
  circularProgressBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 12,
    position: "absolute",
  },
  circularProgressFill: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 12,
    position: "absolute",
  },
  percentageTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 140,
    height: 140,
  },
  percentageText: {
    fontSize: 32,
    fontWeight: "700",
  },
  controlsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  controlSection: {
    alignItems: "center",
    flex: 1,
  },
  controlButtons: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  incrementButton: {},
  decrementButton: {
    opacity: 0.8,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  controlValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

