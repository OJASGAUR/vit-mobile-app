// screens/TimetableScreen.js

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import PagerView from "react-native-pager-view";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { useStore } from "../stores/useStore";
import { useThemeColors } from "../theme/theme";
import DayTabs from "../components/DayTabs";
import { mergeLabBlocks } from "../helpers/mergeLabs";
import { findNextClass, isNextClass } from "../utils/nextClassUtils";

// Simplified Animated Gradient Border - Uses timer instead of frame-based updates for better performance
const AnimatedGradientBorder = React.memo(({ rotation, wavePosition }) => {
  const [gradientColors, setGradientColors] = useState(['#FF69B4', '#FFD700']);
  const [gradientPositions, setGradientPositions] = useState({
    top: { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
    right: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
    bottom: { start: { x: 1, y: 0 }, end: { x: 0, y: 0 } },
    left: { start: { x: 0, y: 1 }, end: { x: 0, y: 0 } },
  });

  // Use timer-based updates instead of frame-based for much better performance
  useEffect(() => {
    let animationFrameId;
    let lastUpdateTime = 0;
    const UPDATE_INTERVAL_MS = 100; // Update every 100ms (10fps) - smooth but performant

    const updateAnimation = () => {
      const now = Date.now();
      if (now - lastUpdateTime >= UPDATE_INTERVAL_MS) {
        // Read shared values
        const rot = rotation.value;
        const wave = wavePosition.value;
        
        // Calculate colors based on rotation
        const phase = (rot * 3) % 3;
        let colors;
        if (phase < 1) {
          const t = phase;
          colors = [
            `rgba(255, ${Math.floor(105 + t * 150)}, ${Math.floor(180 + t * 75)}, 1)`,
            `rgba(255, ${Math.floor(255 - t * 63)}, ${Math.floor(0 + t * 200)}, 1)`,
          ];
        } else if (phase < 2) {
          const t = phase - 1;
          colors = [
            `rgba(${Math.floor(255 - t * 255)}, ${Math.floor(255 - t * 175)}, ${Math.floor(0 + t * 255)}, 1)`,
            `rgba(${Math.floor(0 + t * 100)}, ${Math.floor(100 + t * 155)}, ${Math.floor(255 - t * 55)}, 1)`,
          ];
        } else {
          const t = phase - 2;
          colors = [
            `rgba(${Math.floor(0 + t * 255)}, ${Math.floor(100 + t * 155)}, ${Math.floor(255 - t * 75)}, 1)`,
            `rgba(255, ${Math.floor(105 + t * 150)}, ${Math.floor(180 + t * 75)}, 1)`,
          ];
        }
        
        // Calculate positions based on wave (simplified calculation without interpolate)
        const topStartX = -0.5 + wave * 2; // Map 0-1 to -0.5 to 1.5
        const rightWave = (wave + 0.25) % 1;
        const rightStartY = -0.5 + rightWave * 2;
        const bottomWave = (wave + 0.5) % 1;
        const bottomStartX = 1.5 - bottomWave * 2; // Reverse direction
        const leftWave = (wave + 0.75) % 1;
        const leftStartY = 1.5 - leftWave * 2; // Reverse direction
        
        setGradientColors(colors);
        setGradientPositions({
          top: { start: { x: topStartX, y: 0 }, end: { x: topStartX + 1, y: 0 } },
          right: { start: { x: 0, y: rightStartY }, end: { x: 0, y: rightStartY + 1 } },
          bottom: { start: { x: bottomStartX, y: 0 }, end: { x: bottomStartX - 1, y: 0 } },
          left: { start: { x: 0, y: leftStartY }, end: { x: 0, y: leftStartY - 1 } },
        });
        
        lastUpdateTime = now;
      }
      
      animationFrameId = requestAnimationFrame(updateAnimation);
    };

    animationFrameId = requestAnimationFrame(updateAnimation);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [rotation, wavePosition]);

  return (
    <View style={styles.gradientBorderContainer} pointerEvents="none">
      {/* Top edge */}
      <View style={styles.gradientEdgeTop}>
        <LinearGradient
          colors={gradientColors}
          start={gradientPositions.top.start}
          end={gradientPositions.top.end}
          style={styles.gradientFill}
        />
      </View>
      
      {/* Right edge */}
      <View style={styles.gradientEdgeRight}>
        <LinearGradient
          colors={gradientColors}
          start={gradientPositions.right.start}
          end={gradientPositions.right.end}
          style={styles.gradientFill}
        />
      </View>
      
      {/* Bottom edge */}
      <View style={styles.gradientEdgeBottom}>
        <LinearGradient
          colors={gradientColors}
          start={gradientPositions.bottom.start}
          end={gradientPositions.bottom.end}
          style={styles.gradientFill}
        />
      </View>
      
      {/* Left edge */}
      <View style={styles.gradientEdgeLeft}>
        <LinearGradient
          colors={gradientColors}
          start={gradientPositions.left.start}
          end={gradientPositions.left.end}
          style={styles.gradientFill}
        />
      </View>
    </View>
  );
});

export default function TimetableScreen() {
  const timetable = useStore((s) => s.timetable);
  const colors = useThemeColors();
  const darkMode = useStore((s) => s.darkMode);
  const pagerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextClassInfo, setNextClassInfo] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Animation values for animated gradient border
  const gradientRotation = useSharedValue(0);
  const wavePosition = useSharedValue(0);
  
  // Refs for ScrollView to auto-scroll to highlighted card
  const scrollViewRefs = useRef({});
  
  // Track if user is manually scrolling (disable auto-scroll)
  const userScrollingRef = useRef({});
  const autoScrollEnabledRef = useRef(true);
  const lastScrollTimeRef = useRef({});

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

  // Memoize sorted and merged events for each day to avoid recalculating on every render
  const memoizedEvents = useMemo(() => {
    const eventsMap = {};
    displayDays.forEach(day => {
      const dayEvents = timetable[day] || [];
      if (dayEvents.length > 0) {
        const sorted = [...dayEvents].sort((a, b) => a.start.localeCompare(b.start));
        eventsMap[day] = mergeLabBlocks(sorted);
      } else {
        eventsMap[day] = [];
      }
    });
    return eventsMap;
  }, [timetable, displayDays]);

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

  // Update time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update next class info - use currentTime to fix countdown timing
  useEffect(() => {
    if (timetable) {
      const next = findNextClass(timetable, currentTime);
      setNextClassInfo(next);
    }
  }, [timetable, currentTime]);

  // Start animated gradient border animation
  useEffect(() => {
    if (nextClassInfo && nextClassInfo.class) {
      // Gradient rotation - cycles through colors (pink -> yellow -> blue -> pink)
      gradientRotation.value = withRepeat(
        withTiming(1, {
          duration: 3000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
      
      // Wave position - creates sweeping effect
      wavePosition.value = withRepeat(
        withTiming(1, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      gradientRotation.value = 0;
      wavePosition.value = 0;
    }
  }, [nextClassInfo]);

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

  // Animated style for ongoing badge
  const animatedBadgeStyle = useAnimatedStyle(() => {
    const rotation = gradientRotation.value;
    const opacity = 0.7 + Math.sin(rotation * Math.PI * 2) * 0.3;
    return {
      opacity: opacity,
    };
  });

  // Auto-scroll to highlighted card (only if user hasn't scrolled manually)
  useEffect(() => {
    if (nextClassInfo && nextClassInfo.class && nextClassInfo.day && autoScrollEnabledRef.current) {
      const dayIndex = displayDays.findIndex(d => d === nextClassInfo.day);
      if (dayIndex === currentIndex) {
        // Check if user has scrolled recently (within last 3 seconds)
        const lastScrollTime = lastScrollTimeRef.current[nextClassInfo.day] || 0;
        const timeSinceScroll = Date.now() - lastScrollTime;
        
        if (timeSinceScroll < 3000) {
          // User scrolled recently, don't auto-scroll
          return;
        }
        
        // Find the card index in the events array
        const dayEvents = timetable[nextClassInfo.day] || [];
        const sortedEvents = [...dayEvents].sort((a, b) => a.start.localeCompare(b.start));
        const mergedEvents = mergeLabBlocks(sortedEvents);
        
        const cardIndex = mergedEvents.findIndex(evt => 
          isNextClass(evt, nextClassInfo)
        );
        
        if (cardIndex >= 0 && scrollViewRefs.current[nextClassInfo.day]) {
          // Calculate scroll position (day title + previous cards)
          const dayTitleHeight = 40; // Approximate day title height
          const cardHeight = 160; // Approximate card height with margin
          const scrollY = dayTitleHeight + (cardIndex * cardHeight) - 20; // 20px offset for visibility
          
          // Scroll to the highlighted card
          setTimeout(() => {
            // Double-check that user hasn't scrolled in the meantime
            const currentTime = Date.now();
            const timeSinceLastScroll = currentTime - (lastScrollTimeRef.current[nextClassInfo.day] || 0);
            
            if (autoScrollEnabledRef.current && 
                !userScrollingRef.current[nextClassInfo.day] && 
                timeSinceLastScroll >= 3000) {
              scrollViewRefs.current[nextClassInfo.day]?.scrollTo({
                y: Math.max(0, scrollY),
                animated: true,
              });
            }
          }, 500);
        }
      }
    }
  }, [nextClassInfo, currentIndex, displayDays, timetable]);
  
  // Handle scroll events to detect user scrolling
  const handleScrollBeginDrag = (day) => {
    userScrollingRef.current[day] = true;
    autoScrollEnabledRef.current = false;
    lastScrollTimeRef.current[day] = Date.now();
  };
  
  const handleScroll = (day) => {
    // Track any scroll movement
    lastScrollTimeRef.current[day] = Date.now();
    userScrollingRef.current[day] = true;
    autoScrollEnabledRef.current = false;
  };
  
  const handleScrollEndDrag = (day) => {
    // Mark that user finished scrolling
    lastScrollTimeRef.current[day] = Date.now();
    // Keep auto-scroll disabled for this session
    // It will only re-enable if user switches days or app restarts
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <DayTabs
        days={displayDays}
        currentIndex={currentIndex}
        onPress={(i) => {
          setCurrentIndex(i);
          pagerRef.current?.setPage(i);
          // Reset scroll tracking for the new day to allow auto-scroll
          const newDay = displayDays[i];
          if (newDay) {
            userScrollingRef.current[newDay] = false;
            lastScrollTimeRef.current[newDay] = 0;
            autoScrollEnabledRef.current = true;
          }
        }}
      />

      {/* Countdown Bar */}
      {nextClassInfo && nextClassInfo.class && (
        <View style={[
          styles.countdownBar,
          {
            backgroundColor: nextClassInfo.isOngoing 
              ? (darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.1)')
              : colors.card,
            borderBottomColor: colors.border,
          }
        ]}>
          <View style={styles.countdownContent}>
            {nextClassInfo.isOngoing ? (
              <Animated.View style={animatedBadgeStyle}>
                <View style={styles.ongoingBadge}>
                  <Ionicons 
                    name="radio-button-on" 
                    size={14} 
                    color={colors.accent}
                    style={styles.ongoingIcon}
                  />
                  <Text style={[styles.ongoingText, { color: colors.accent }]}>
                    CLASS ONGOING
                  </Text>
                </View>
              </Animated.View>
            ) : (
              <>
                <Ionicons 
                  name="time-outline" 
                  size={16} 
                  color={colors.accent}
                  style={styles.countdownIcon}
                />
                <Text style={[styles.countdownLabel, { color: colors.textSecondary }]}>
                  START IN:
                </Text>
                <Text style={[styles.countdownTime, { color: colors.accent }]}>
                  {nextClassInfo.timeRemaining}
                </Text>
              </>
            )}
          </View>
        </View>
      )}

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={currentIndex} // Set initial page to current day
        onPageSelected={(e) => {
          const newIndex = e.nativeEvent.position;
          setCurrentIndex(newIndex);
        }}
        onPageScroll={(e) => {
          // Update index immediately during swipe for instant feedback
          const offset = e.nativeEvent.offset;
          const position = e.nativeEvent.position;
          if (offset === 0 && position !== currentIndex) {
            setCurrentIndex(position);
          }
        }}
      >
        {displayDays.map((day, index) => {
          const events = memoizedEvents[day] || [];

          return (
            <ScrollView
              key={day}
              ref={(ref) => {
                if (ref) scrollViewRefs.current[day] = ref;
              }}
              style={styles.page}
              contentContainerStyle={styles.pageContent}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              onScrollBeginDrag={() => handleScrollBeginDrag(day)}
              onScrollEndDrag={() => handleScrollEndDrag(day)}
              onScroll={() => handleScroll(day)}
              scrollEventThrottle={16}
            >
              <Text
                style={[styles.dayTitle, { color: colors.textPrimary }]}
              >
                {day}
              </Text>

              {events.map((evt, idx) => {
                const cardColor = evt.type === 'Lab' 
                  ? 'rgba(0, 200, 83, 0.12)'
                  : 'rgba(33, 150, 243, 0.12)';
                
                const borderColor = evt.type === 'Lab'
                  ? 'rgba(0, 200, 83, 0.25)'
                  : 'rgba(33, 150, 243, 0.25)';

                const isNextClassCard = isNextClass(evt, nextClassInfo) && day === nextClassInfo?.day;

                return (
                  <View
                    key={`${evt.courseCode}-${evt.slot}-${idx}`}
                    style={styles.cardWrapper}
                  >
                    {/* Animated gradient border - only on edges */}
                    {isNextClassCard && (
                      <AnimatedGradientBorder
                        rotation={gradientRotation}
                        wavePosition={wavePosition}
                      />
                    )}
                    <View
                      style={[
                        styles.card,
                        {
                          backgroundColor: cardColor,
                          borderColor: isNextClassCard ? 'transparent' : borderColor,
                          borderWidth: isNextClassCard ? 0 : 1,
                        },
                        isNextClassCard && {
                          shadowColor: colors.accent,
                          shadowOffset: { width: 0, height: 0 },
                          shadowRadius: 12,
                          shadowOpacity: 0.4,
                          elevation: 10,
                        }
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
                    </View>
                  </View>
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
  countdownBar: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  countdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownIcon: {
    marginRight: 8,
  },
  countdownLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  countdownTime: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  ongoingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  ongoingIcon: {
    marginRight: 6,
  },
  ongoingText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
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
  dayTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  cardWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  gradientBorderContainer: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 17,
    zIndex: 1,
    overflow: 'hidden',
  },
  gradientEdgeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
  },
  gradientEdgeRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 3,
    borderTopRightRadius: 17,
    borderBottomRightRadius: 17,
  },
  gradientEdgeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
  },
  gradientEdgeLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 17,
    borderBottomLeftRadius: 17,
  },
  gradientFill: {
    flex: 1,
    borderRadius: 17,
  },
  card: {
    padding: 14,
    borderRadius: 14,
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