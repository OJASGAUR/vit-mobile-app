// screens/SubjectsScreen.js

import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../stores/useStore";
import { useThemeColors } from "../theme/theme";
import TopAppBar from "../components/TopAppBar";
import ProfilePanel from "../components/ProfilePanel";

export default function SubjectsScreen({ navigation }) {
  const [profilePanelVisible, setProfilePanelVisible] = React.useState(false);
  
  const timetable = useStore((s) => s.timetable);
  const colors = useThemeColors();
  const mapTimetableTypeToAttendanceType = useStore((s) => s.mapTimetableTypeToAttendanceType);

  // Extract unique subjects from timetable
  const subjects = useMemo(() => {
    if (!timetable) return [];

    const subjectMap = new Map();
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    days.forEach((day) => {
      const dayEvents = timetable[day] || [];
      dayEvents.forEach((evt) => {
        // Create composite key: courseCode-type
        const normalizedType = mapTimetableTypeToAttendanceType(evt.type);
        const key = `${evt.courseCode}-${normalizedType}`;

        if (!subjectMap.has(key)) {
          subjectMap.set(key, {
            courseCode: evt.courseCode,
            courseName: evt.courseName,
            type: normalizedType,
            originalType: evt.type,
          });
        }
      });
    });

    // Convert to array and sort by course code
    return Array.from(subjectMap.values()).sort((a, b) => {
      if (a.courseCode !== b.courseCode) {
        return a.courseCode.localeCompare(b.courseCode);
      }
      return a.type.localeCompare(b.type);
    });
  }, [timetable, mapTimetableTypeToAttendanceType]);

  const handleAvatarPress = React.useCallback(() => {
    setProfilePanelVisible(true);
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <TopAppBar
        title="Subjects"
        onAvatarPress={handleAvatarPress}
        showBackButton={navigation.canGoBack()}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
      >
        {subjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No subjects found
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Upload your timetable to see your subjects
            </Text>
          </View>
        ) : (
          subjects.map((subject) => (
            <View
              key={`${subject.courseCode}-${subject.type}`}
              style={[
                styles.subjectCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
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
                <Ionicons
                  name="book-outline"
                  size={24}
                  color={colors.accent}
                />
              </View>
            </View>
          ))
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  subjectCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  subjectInfo: {
    flex: 1,
    marginRight: 12,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  subjectCode: {
    fontSize: 14,
  },
});

