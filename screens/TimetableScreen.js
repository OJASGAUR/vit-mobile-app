// vit-mobile-app/screens/TimetableScreen.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../stores/useStore";
import TimetableGrid from "../components/TimetableGrid";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function TimetableScreen({ navigation }) {
  const timetable = useStore(s => s.timetable);
  const currentDay = useStore(s => s.currentDay);
  const setCurrentDay = useStore(s => s.setCurrentDay);
  const weekView = useStore(s => s.weekView);
  const toggleWeekView = useStore(s => s.toggleWeekView);

  if (!timetable) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No timetable loaded. Upload from Home.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top","left","right"]}>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Schedule</Text>

          <TouchableOpacity onPress={() => navigation.navigate("Saved")}>
            <Text style={styles.link}>Saved</Text>
          </TouchableOpacity>
        </View>

        {/* DAY SELECTOR – NOW FIXED & NO GAP */}
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {DAYS.map(d => (
              <TouchableOpacity
                key={d}
                onPress={() => setCurrentDay(d)}
                style={[styles.tab, currentDay === d && styles.tabActive]}
              >
                <Text style={[styles.tabText, currentDay === d && styles.tabTextActive]}>
                  {d.slice(0, 3)}
                </Text>
                {currentDay === d && <View style={styles.activeDot} />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={toggleWeekView} style={styles.viewToggle}>
              <Text style={styles.viewToggleText}>{weekView ? "Week" : "Day"}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* BODY */}
        <View style={styles.body}>
          {weekView
            ? <TimetableGrid timetable={timetable} weekView />
            : <TimetableGrid timetable={timetable} singleDay day={currentDay} />}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#061124"
  },

  container: {
    flex: 1,
    backgroundColor: "#061124",
  },

  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
  },

  link: {
    color: "#66b0ff",
    fontWeight: "700",
    fontSize: 15,
  },

  /* TABS SECTION - FIXED SPACING */
  tabsWrapper: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },

  tabsContainer: {
    paddingHorizontal: 12,
    alignItems: "center"
  },

  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
    alignItems: "center",
  },

  tabActive: {},

  tabText: {
    color: "#bcd7ef",
    fontWeight: "700",
    fontSize: 15
  },

  tabTextActive: {
    color: "#fff",
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: "rgba(0,122,255,0.95)",
    marginTop: 4,
  },

  viewToggle: {
    backgroundColor: "rgba(0,122,255,0.95)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 8,
  },

  viewToggleText: {
    color: "#fff",
    fontWeight: "700"
  },

  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8
  },

  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    color: "#bcd7ef",
    fontSize: 16
  }
});
