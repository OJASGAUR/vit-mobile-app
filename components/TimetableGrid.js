// components/TimetableGrid.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TimetableGrid({ data }) {
  const days = Object.keys(data);

  return (
    <View>
      {days.map((day) => (
        <View key={day} style={styles.dayBlock}>
          <Text style={styles.dayTitle}>{day}</Text>

          {data[day].length === 0 && (
            <Text style={styles.empty}>No classes</Text>
          )}

          {data[day].map((entry, idx) => (
            <View key={idx} style={styles.card}>
              <Text style={styles.course}>{entry.courseName}</Text>
              <Text style={styles.sub}>
                {entry.start} - {entry.end} ({entry.type})
              </Text>
              <Text style={styles.sub}>{entry.venue}</Text>
              <Text style={styles.slot}>{entry.slot}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dayBlock: { marginBottom: 20 },
  dayTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  empty: {
    fontSize: 15,
    opacity: 0.6,
  },
  card: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: "#fff",
  },
  course: {
    fontSize: 16,
    fontWeight: "700",
  },
  sub: {
    fontSize: 14,
    opacity: 0.7,
  },
  slot: {
    fontSize: 12,
    marginTop: 4,
    color: "#6200ee",
  },
});
