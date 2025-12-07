// screens/TimetableScreen.js

import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

import { useStore } from "../stores/useStore";
import TimetableGrid from "../components/TimetableGrid";

export default function TimetableScreen() {
  const timetable = useStore((s) => s.timetable);

  if (!timetable) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>No timetable yet</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TimetableGrid data={timetable} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  msg: { fontSize: 18, fontWeight: "500" },
});
