// components/DayTabs.js
import React, { useMemo } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useThemeColors } from "../theme/theme";

const DayTabs = React.memo(({ days, currentIndex, onPress }) => {
  const colors = useThemeColors();
  
  // Memoize filtered days to avoid recalculating on every render
  const displayDays = useMemo(() => {
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const validDays = days.filter(day => 
      day && 
      day.trim() !== "" && 
      weekdays.includes(day)
    );
    return validDays.length > 0 ? validDays : 
      days.filter(day => day && day.trim() !== "");
  }, [days]);

  return (
    <View style={styles.container}>
      {displayDays.map((day, i) => {
        const isActive = currentIndex >= 0 && i === currentIndex;
        const dayAbbrev = day.substring(0, 3); // Mon, Tue, etc.

        const animatedStyle = useAnimatedStyle(() => {
          return {
            opacity: withTiming(isActive ? 1 : 0, { duration: 100 }),
          };
        }, [isActive]);

        return (
          <TouchableOpacity
            key={day}
            style={[
              styles.tab,
              {
                backgroundColor: isActive ? colors.accent : 'transparent',
                borderColor: colors.border || colors.card,
              },
            ]}
            onPress={() => onPress(i)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: isActive ? '#FFFFFF' : colors.textSecondary,
                  fontWeight: isActive ? "700" : "500",
                },
              ]}
            >
              {dayAbbrev}
            </Text>

            <Animated.View
              style={[
                styles.activeDot,
                { backgroundColor: isActive ? '#FFFFFF' : colors.primary },
                animatedStyle,
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

export default DayTabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around', // This makes tabs expand and fill the width
    alignItems: 'center',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tab: {
    flex: 1, // Each tab takes equal space
    alignItems: "center",
    justifyContent: 'center',
    height: '100%',
    marginHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
    textAlign: 'center',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
});
