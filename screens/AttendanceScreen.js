// screens/AttendanceScreen.js

import React, { useMemo, useCallback } from "react";
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
import TopAppBar from "../components/TopAppBar";
import ProfilePanel from "../components/ProfilePanel";

export default function AttendanceScreen({ navigation }) {
  const [profilePanelVisible, setProfilePanelVisible] = React.useState(false);
  
  const timetable = useStore((s) => s.timetable);
  const attendance = useStore((s) => s.attendance);
  const getCombinedAttendance = useStore((s) => s.getCombinedAttendance);
  const mapTimetableTypeToAttendanceType = useStore((s) => s.mapTimetableTypeToAttendanceType);
  const colors = useThemeColors();

  // Extract unique subjects from timetable (grouped by courseCode-type)
  const subjects = useMemo(() => {
    if (!timetable) return [];
    
    const subjectMap = new Map();
    
    Object.keys(timetable).forEach(day => {
      const dayEvents = timetable[day] || [];
      dayEvents.forEach(event => {
        if (event.courseCode) {
          // Get type from event, default to "Theory" if missing
          const eventType = event.type || "Theory";
          const normalizedType = mapTimetableTypeToAttendanceType(eventType);
          const key = `${event.courseCode}-${normalizedType}`;
          
          // Always update to get the latest slot info (in case same course has multiple slots)
          subjectMap.set(key, {
            courseCode: event.courseCode,
            courseName: event.courseName,
            slot: event.slot || "",
            type: normalizedType,
          });
        }
      });
    });
    
    // Sort by courseCode then type for consistent display
    return Array.from(subjectMap.values()).sort((a, b) => {
      if (a.courseCode !== b.courseCode) {
        return a.courseCode.localeCompare(b.courseCode);
      }
      return a.type.localeCompare(b.type);
    });
  }, [timetable, mapTimetableTypeToAttendanceType]);

  const handleAvatarPress = useCallback(() => {
    setProfilePanelVisible(true);
  }, []);

  const getPercentageColor = useCallback((percentage) => {
    if (percentage >= 80) return "#10B981"; // Green
    if (percentage >= 75) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <TopAppBar
        title="Attendance"
        onAvatarPress={handleAvatarPress}
        showBackButton={navigation.canGoBack()}
        onBackPress={() => navigation.goBack()}
      />
      {/* Upload Attendance Button */}
      <View style={[styles.uploadButtonContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: colors.accent }]}
          onPress={() => navigation.navigate("UploadAttendance")}
          activeOpacity={0.8}
        >
          <Ionicons name="cloud-upload-outline" size={18} color="#FFF" />
          <Text style={styles.uploadButtonText}>Upload Attendance</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      >
        {subjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="checkmark-circle-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No subjects found
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Upload your timetable to start tracking attendance
            </Text>
          </View>
        ) : (
          subjects.map((subject) => {
            // Get combined attendance (baseline + daily) - now includes type
            const combined = getCombinedAttendance(subject.courseCode, subject.type);
            const finalPercentage = combined.finalPercentage;
            
            // Use 75 as default required percent for color calculation
            const percentageColor = finalPercentage !== null 
              ? getPercentageColor(finalPercentage) 
              : colors.textSecondary;

            return (
              <TouchableOpacity
                key={`${subject.courseCode}-${subject.type}`}
                style={[
                  styles.subjectCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => {
                  navigation.navigate("AttendanceCalculator", {
                    courseCode: subject.courseCode,
                    courseName: subject.courseName,
                    courseType: subject.type,
                  });
                }}
                activeOpacity={0.7}
              >
                <View style={styles.subjectHeader}>
                  <View style={styles.subjectInfo}>
                    <Text
                      style={[styles.subjectName, { color: colors.textPrimary }]}
                      numberOfLines={2}
                    >
                      {subject.courseName.replace(/\s*\(.*?\)/g, "")}
                    </Text>
                    <Text style={[styles.subjectCode, { color: colors.textSecondary }]}>
                      {subject.courseCode} {subject.type ? `• ${subject.type}` : ""}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.percentageBadge,
                      { backgroundColor: finalPercentage !== null ? `${percentageColor}15` : `${colors.textSecondary}15` },
                    ]}
                  >
                    <Text
                      style={[styles.percentageText, { color: finalPercentage !== null ? percentageColor : colors.textSecondary }]}
                    >
                      {finalPercentage !== null ? `${finalPercentage}%` : "—%"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  subjectCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 0,
  },
  subjectInfo: {
    flex: 1,
    marginRight: 12,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
  },
  subjectCode: {
    fontSize: 12,
  },
  percentageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: "700",
  },
  uploadButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

