// components/TimetableGrid.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

          {data[day].map((entry, idx) => {
            // Determine card color
            const cardColor = entry.type === 'Lab' 
              ? 'rgba(0, 200, 83, 0.15)'
              : 'rgba(33, 150, 243, 0.15)';
            
            const borderColor = entry.type === 'Lab'
              ? 'rgba(0, 200, 83, 0.3)'
              : 'rgba(33, 150, 243, 0.3)';

            return (
              <View key={idx} style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
                {/* Slot - Top Right */}
                <View style={styles.slotContainer}>
                  <Text style={styles.slot}>{entry.slot}</Text>
                </View>

                {/* Course Name */}
                <Text style={styles.course}>
                  {entry.courseName.replace(/\s*\(.*?\)/g, '')}
                </Text>

                {/* Time Range - Center */}
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>
                    {entry.start} - {entry.end}
                  </Text>
                </View>

                {/* Location - Bottom Right */}
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={14} color="#666" />
                  <Text style={styles.location}>{entry.venue}</Text>
                </View>
              </View>
            );
          })}
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
    padding: 16,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 6,
    position: 'relative',
  },
  slotContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  slot: {
    fontSize: 12,
    fontWeight: "700",
    color: '#555',
  },
  course: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    paddingRight: 50,
  },
  timeContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timeText: {
    fontSize: 18,
    fontWeight: "600",
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  location: {
    fontSize: 13,
    marginLeft: 4,
    color: '#666',
  },
});