// screens/TimetableScreen.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../stores/useStore";
import TimetableGrid from "../components/TimetableGrid";
import { useThemeColors } from "../theme/theme";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetableScreen() {
  const timetable = useStore((s) => s.timetable);
  const currentDay = useStore((s) => s.currentDay);
  const setCurrentDay = useStore((s) => s.setCurrentDay);
  const weekView = useStore((s) => s.weekView);
  const toggleWeekView = useStore((s) => s.toggleWeekView);

  const colors = useThemeColors();

  if (!timetable) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No timetable loaded. Upload from the menu.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["left", "right"]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Day selector */}
        <View style={[styles.tabsWrapper, { borderBottomColor: colors.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {DAYS.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setCurrentDay(d)}
                style={[
                  styles.tab,
                  currentDay === d && { borderBottomWidth: 2, borderBottomColor: colors.accent },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        currentDay === d ? colors.textPrimary : colors.textSecondary,
                    },
                  ]}
                >
                  {d.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={toggleWeekView}
              style={[
                styles.viewToggle,
                { backgroundColor: colors.accent },
              ]}
            >
              <Text style={styles.viewToggleText}>
                {weekView ? "Week" : "Day"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {weekView ? (
            <TimetableGrid timetable={timetable} weekView />
          ) : (
            <TimetableGrid timetable={timetable} singleDay day={currentDay} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  tabsWrapper: {
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  tabsContainer: {
    paddingHorizontal: 12,
    alignItems: "center",
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
    alignItems: "center",
  },
  tabText: {
    fontWeight: "700",
    fontSize: 15,
  },
  viewToggle: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 8,
  },
  viewToggleText: {
    color: "#fff",
    fontWeight: "700",
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  },
});
