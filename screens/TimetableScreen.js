// screens/TimetableScreen.js

import React, { useState, useRef, useEffect } from "react"; // ADD useEffect
import { View, Text, StyleSheet, ScrollView } from "react-native";
import PagerView from "react-native-pager-view";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { useStore } from "../stores/useStore";
import { useThemeColors } from "../theme/theme";
import DayTabs from "../components/DayTabs";
import { mergeLabBlocks } from "../helpers/mergeLabs";

export default function TimetableScreen() {
  const timetable = useStore((s) => s.timetable);
  const colors = useThemeColors();
  const pagerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!timetable) {
    return null;
  }

  const days = Object.keys(timetable);
  
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const filteredDays = days.filter(day => 
    day && 
    day.trim() !== "" && 
    weekdays.includes(day)
  );

  const displayDays = filteredDays.length > 0 ? filteredDays : 
    days.filter(day => day && day.trim() !== "");

  // Function to get current day index
  const getCurrentDayIndex = () => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Map JavaScript day to your weekday array
    const dayMap = {
      1: "Monday",
      2: "Tuesday", 
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
      0: "Sunday"
    };
    
    const todayName = dayMap[today];
    const todayIndex = displayDays.findIndex(day => 
      day.toLowerCase() === todayName.toLowerCase()
    );
    
    // If today is in the timetable, return its index, otherwise return 0
    return todayIndex >= 0 ? todayIndex : 0;
  };

  // Set initial page to current day on mount
  useEffect(() => {
    if (displayDays.length > 0) {
      const todayIndex = getCurrentDayIndex();
      setCurrentIndex(todayIndex);
      
      // Small delay to ensure PagerView is ready
      setTimeout(() => {
        if (pagerRef.current) {
          pagerRef.current.setPage(todayIndex);
        }
      }, 100);
    }
  }, [displayDays.length]); // Run when displayDays is available

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <DayTabs
        days={displayDays}
        currentIndex={currentIndex}
        onPress={(i) => {
          setCurrentIndex(i);
          pagerRef.current?.setPage(i);
        }}
      />

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={currentIndex} // Set initial page to current day
        onPageSelected={(e) => setCurrentIndex(e.nativeEvent.position)}
      >
        {displayDays.map((day, index) => {
          let events = timetable[day] || [];

          events = [...events].sort((a, b) => a.start.localeCompare(b.start));
          events = mergeLabBlocks(events);

          return (
            <ScrollView
              key={day}
              style={styles.page}
              contentContainerStyle={styles.pageContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Add "Today" badge if this is the current day */}
              {index === getCurrentDayIndex() && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayText}>TODAY</Text>
                </View>
              )}

              <Animated.Text
                entering={FadeInDown.delay(50)}
                style={[styles.dayTitle, { color: colors.textPrimary }]}
              >
                {day}
              </Animated.Text>

              {events.map((evt, idx) => {
                const cardColor = evt.type === 'Lab' 
                  ? 'rgba(0, 200, 83, 0.12)'
                  : 'rgba(33, 150, 243, 0.12)';
                
                const borderColor = evt.type === 'Lab'
                  ? 'rgba(0, 200, 83, 0.25)'
                  : 'rgba(33, 150, 243, 0.25)';

                return (
                  <Animated.View
                    key={`${evt.courseCode}-${evt.slot}-${idx}`}
                    entering={FadeInDown.delay(idx * 40)}
                    style={[
                      styles.card,
                      {
                        backgroundColor: cardColor,
                        borderColor: borderColor,
                      },
                    ]}
                  >
                    <View style={styles.slotContainer}>
                      <Text style={[styles.slot, { color: colors.textPrimary }]}>
                        {evt.slot}
                      </Text>
                    </View>

                    <Text
                      style={[styles.course, { color: colors.textPrimary }]}
                      numberOfLines={2}
                    >
                      {evt.courseName.replace(/\s*\(.*?\)/g, '')}
                    </Text>

                    <View style={styles.timeContainer}>
                      <Text style={[styles.timeText, { color: colors.textPrimary }]}>
                        {evt.start} - {evt.end}
                      </Text>
                    </View>

                    <View style={styles.locationContainer}>
                      <Ionicons 
                        name="location-outline" 
                        size={16}
                        color={colors.textSecondary} 
                        style={{ opacity: 0.9 }}
                      />
                      <Text style={[styles.location, { color: colors.textSecondary }]}>
                        {evt.venue}
                      </Text>
                    </View>
                  </Animated.View>
                );
              })}

              {events.length === 0 && (
                <Text
                  style={[
                    styles.emptyText,
                    { color: colors.textSecondary },
                  ]}
                >
                  No classes today 🎉
                </Text>
              )}
            </ScrollView>
          );
        })}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  pageContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 24,
  },
  todayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  todayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dayTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  card: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    position: 'relative',
    minHeight: 140,
  },
  slotContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  slot: {
    fontSize: 14,
    fontWeight: "800",
    opacity: 0.9,
  },
  course: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
    paddingRight: 55,
  },
  timeContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timeText: {
    fontSize: 19,
    fontWeight: "600",
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  location: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
    opacity: 0.9,
  },
  emptyText: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 15,
  },
});