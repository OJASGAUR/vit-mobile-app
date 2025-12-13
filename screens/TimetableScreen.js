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
import TopAppBar from "../components/TopAppBar";
import ProfilePanel from "../components/ProfilePanel";
import { mergeLabBlocks } from "../helpers/mergeLabs";
import { findNextClass, isNextClass } from "../utils/nextClassUtils";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { scheduleAttendanceReminder, cancelReminders, requestPermissions } from "../services/notifications";

// Simplified Animated Gradient Border - Uses timer instead of frame-based updates for better performance
const AnimatedGradientBorder = React.memo(({ rotation, wavePosition, darkMode }) => {
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
        
        // Calculate colors based on rotation - brighter colors for light mode
        const phase = (rot * 3) % 3;
        let colors;
        
        if (darkMode) {
          // Dark mode: softer, more visible colors
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
        } else {
          // Light mode: brighter, more saturated colors for better visibility
          if (phase < 1) {
            const t = phase;
            colors = [
              `rgba(236, 72, 153, 1)`, // Bright pink
              `rgba(251, 191, 36, 1)`, // Bright yellow
            ];
          } else if (phase < 2) {
            const t = phase - 1;
            colors = [
              `rgba(251, 191, 36, 1)`, // Bright yellow
              `rgba(59, 130, 246, 1)`, // Bright blue
            ];
          } else {
            const t = phase - 2;
            colors = [
              `rgba(59, 130, 246, 1)`, // Bright blue
              `rgba(236, 72, 153, 1)`, // Bright pink
            ];
          }
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
  }, [rotation, wavePosition, darkMode]);

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
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const timetable = useStore((s) => s.timetable);
  const colors = useThemeColors();
  const darkMode = useStore((s) => s.darkMode);
  const markPresent = useStore((s) => s.markPresent);
  const markAbsent = useStore((s) => s.markAbsent);
  const hasAttendanceBeenMarked = useStore((s) => s.hasAttendanceBeenMarked);
  const getAttendanceMark = useStore((s) => s.getAttendanceMark);
  const generateSlotId = useStore((s) => s.generateSlotId);
  const attendanceUploadDate = useStore((s) => s.attendanceUploadDate);
  const pagerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 means no tab selected
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

  // Check if today is weekend - memoize to avoid recalculation
  const isWeekend = useMemo(() => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    return today === 0 || today === 6; // Sunday or Saturday
  }, [currentTime]); // Recalculate when time changes (but only check once per minute)

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

  // Function to get current day index - memoized
  const getCurrentDayIndex = useCallback(() => {
    // If it's weekend, return -1 (no tab selected)
    if (isWeekend) {
      return -1;
    }
    
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
    
    // If today is in the timetable, return its index, otherwise return -1 (no selection)
    return todayIndex >= 0 ? todayIndex : -1;
  }, [isWeekend, displayDays]);

  // Update time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update next class info - use currentTime to fix countdown timing
  useEffect(() => {
    if (timetable && !isWeekend) {
      const next = findNextClass(timetable, currentTime);
      setNextClassInfo(next);
    } else if (isWeekend) {
      // On weekend, find next Monday class
      const next = findNextClass(timetable, currentTime);
      setNextClassInfo(next);
    }
  }, [timetable, currentTime, isWeekend]);

  // Start animated gradient border animation (only if today's classes are not done)
  useEffect(() => {
    if (nextClassInfo && 
        nextClassInfo.class && 
        !nextClassInfo.allTodayClassesDone &&
        nextClassInfo.isToday) {
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

  // Set initial page to current day on mount (only if not weekend)
  useEffect(() => {
    if (displayDays.length > 0 && !isWeekend) {
      const todayIndex = getCurrentDayIndex();
      if (todayIndex >= 0) {
        setCurrentIndex(todayIndex);
        
        // Small delay to ensure PagerView is ready
        setTimeout(() => {
          if (pagerRef.current) {
            pagerRef.current.setPage(todayIndex);
          }
        }, 100);
      }
    } else if (isWeekend) {
      // On weekend, set to -1 (no tab selected)
      setCurrentIndex(-1);
    }
  }, [displayDays.length, isWeekend]); // Run when displayDays is available or weekend status changes

  // Schedule attendance reminder after last class
  useEffect(() => {
    const setupReminders = async () => {
      if (!timetable || isWeekend) {
        await cancelReminders();
        return;
      }
      
      const today = new Date();
      const todayDayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.getDay()];
      const todayEvents = timetable[todayDayName] || [];
      
      if (todayEvents.length === 0) {
        await cancelReminders();
        return;
      }
      
      // Find last class end time
      let lastEndTime = null;
      todayEvents.forEach(evt => {
        if (evt.end) {
          const [hour, min] = evt.end.split(':').map(Number);
          const endTime = new Date();
          endTime.setHours(hour, min, 0, 0);
          if (!lastEndTime || endTime > lastEndTime) {
            lastEndTime = endTime;
          }
        }
      });
      
      if (lastEndTime && lastEndTime > today) {
        const hasPermission = await requestPermissions();
        if (hasPermission) {
          await scheduleAttendanceReminder(lastEndTime);
        }
      } else {
        await cancelReminders();
      }
    };
    
    setupReminders();
  }, [timetable, isWeekend]);

  // Animated style for ongoing badge
  const animatedBadgeStyle = useAnimatedStyle(() => {
    const rotation = gradientRotation.value;
    const opacity = 0.7 + Math.sin(rotation * Math.PI * 2) * 0.3;
    return {
      opacity: opacity,
    };
  });

  // Auto-scroll to highlighted card (only if user hasn't scrolled manually and today's classes are not done)
  useEffect(() => {
    if (nextClassInfo && 
        nextClassInfo.class && 
        nextClassInfo.day && 
        !nextClassInfo.allTodayClassesDone &&
        nextClassInfo.isToday &&
        autoScrollEnabledRef.current) {
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
  
  // Handle scroll events to detect user scrolling - memoized with useCallback
  const handleScrollBeginDrag = useCallback((day) => {
    userScrollingRef.current[day] = true;
    autoScrollEnabledRef.current = false;
    lastScrollTimeRef.current[day] = Date.now();
  }, []);
  
  const handleScroll = useCallback((day) => {
    // Track any scroll movement - throttled to avoid excessive updates
    const now = Date.now();
    const lastTime = lastScrollTimeRef.current[day] || 0;
    if (now - lastTime > 100) { // Throttle to 10fps
      lastScrollTimeRef.current[day] = now;
      userScrollingRef.current[day] = true;
      autoScrollEnabledRef.current = false;
    }
  }, []);
  
  const handleScrollEndDrag = useCallback((day) => {
    // Mark that user finished scrolling
    lastScrollTimeRef.current[day] = Date.now();
    // Keep auto-scroll disabled for this session
    // It will only re-enable if user switches days or app restarts
  }, []);
  
  const handleTabPress = useCallback((i) => {
    setCurrentIndex(i);
    if (pagerRef.current) {
      pagerRef.current.setPage(i);
    }
    // Reset scroll tracking for the new day to allow auto-scroll
    const newDay = displayDays[i];
    if (newDay) {
      userScrollingRef.current[newDay] = false;
      lastScrollTimeRef.current[newDay] = 0;
      autoScrollEnabledRef.current = true;
    }
  }, [displayDays]);

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <TopAppBar
        title="Timetable"
        onAvatarPress={() => setProfilePanelVisible(true)}
      />
      <DayTabs
        days={displayDays}
        currentIndex={currentIndex >= 0 ? currentIndex : -1}
        onPress={(i) => {
          setCurrentIndex(i);
          if (pagerRef.current) {
            pagerRef.current.setPage(i);
          }
          // Reset scroll tracking for the new day to allow auto-scroll
          const newDay = displayDays[i];
          if (newDay) {
            userScrollingRef.current[newDay] = false;
            lastScrollTimeRef.current[newDay] = 0;
            autoScrollEnabledRef.current = true;
          }
        }}
      />

      {/* Weekend Message Bar */}
      {isWeekend && (
        <View style={[
          styles.weekendMessageBar,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          }
        ]}>
          <View style={styles.weekendMessageContent}>
            <Ionicons 
              name="calendar-outline" 
              size={20} 
              color={colors.textSecondary}
              style={styles.weekendMessageIcon}
            />
            <Text style={[styles.weekendMessageText, { color: colors.textPrimary }]}>
              No classes today
            </Text>
          </View>
        </View>
      )}

      {/* Countdown Bar */}
      {!isWeekend && nextClassInfo && (
        nextClassInfo.allTodayClassesDone ? (
          <View style={[
            styles.countdownBar,
            {
              backgroundColor: colors.card,
              borderBottomColor: colors.border,
            }
          ]}>
            <View style={styles.countdownContent}>
              <Ionicons 
                name="checkmark-circle-outline" 
                size={18} 
                color={colors.textSecondary}
                style={styles.countdownIcon}
              />
              <Text style={[styles.countdownLabel, { color: colors.textSecondary }]}>
                No remaining classes for today
              </Text>
            </View>
          </View>
        ) : nextClassInfo.class ? (
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
        ) : null
      )}

      <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={currentIndex >= 0 ? currentIndex : 0} // Set initial page to current day or 0
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
              scrollEventThrottle={100}
              maxToRenderPerBatch={5}
              updateCellsBatchingPeriod={50}
              initialNumToRender={5}
              windowSize={5}
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

                // Only highlight if it's today's class and all today's classes are not done
                const isNextClassCard = !nextClassInfo?.allTodayClassesDone && 
                                       isNextClass(evt, nextClassInfo) && 
                                       day === nextClassInfo?.day &&
                                       nextClassInfo?.isToday;

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
                        darkMode={darkMode}
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
                      {/* Row 1: Course Name (left) + Slot Code (right) */}
                      <View style={styles.cardHeader}>
                        <Text
                          style={[styles.courseName, { color: colors.textPrimary }]}
                          numberOfLines={2}
                        >
                          {evt.courseName.replace(/\s*\(.*?\)/g, '')}
                        </Text>
                        <Text style={[styles.slotCode, { color: colors.textSecondary }]}>
                          {evt.slot}
                        </Text>
                      </View>

                      {/* Row 2 & 3: Three-column layout */}
                      <View style={styles.cardContent}>
                        {/* Left Column: Stacked Present/Absent buttons */}
                        <View style={styles.leftColumn}>
                          {(() => {
                            const today = new Date();
                            const todayDayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.getDay()];
                            const isToday = day === todayDayName;
                            
                            // Check if attendance was uploaded and if this class is on or after upload date
                            let canMarkAttendance = isToday;
                            if (attendanceUploadDate) {
                              const uploadDate = new Date(attendanceUploadDate);
                              const todayDate = new Date();
                              todayDate.setHours(0, 0, 0, 0);
                              uploadDate.setHours(0, 0, 0, 0);
                              // Only allow marking if today is on or after upload date
                              canMarkAttendance = isToday && todayDate >= uploadDate;
                            }
                            
                            const slotId = canMarkAttendance ? generateSlotId(evt.courseCode, evt.type, evt.slot, day, idx) : null;
                            const isMarked = slotId ? hasAttendanceBeenMarked(slotId) : false;
                            const markType = slotId ? getAttendanceMark(slotId) : null;

                            // Only show buttons for classes on or after upload date
                            if (!canMarkAttendance) {
                              return <View style={styles.buttonPlaceholder} />;
                            }

                            return (
                              <View style={styles.attendanceButtonsStack}>
                                <TouchableOpacity
                                  style={[
                                    styles.attendanceButtonCompact,
                                    isMarked && markType === 'present' 
                                      ? styles.presentButtonFilled 
                                      : styles.presentButtonOutline,
                                    isMarked && markType !== 'present' && styles.attendanceButtonDisabled,
                                  ]}
                                  onPress={async () => {
                                    if (slotId && !isMarked) {
                                      await markPresent(evt.courseCode, evt.type, slotId);
                                    }
                                  }}
                                  disabled={isMarked}
                                  activeOpacity={0.7}
                                >
                                  <Ionicons 
                                    name="checkmark" 
                                    size={14} 
                                    color={isMarked && markType === 'present' ? "#FFF" : "#10B981"}
                                  />
                                  <Text style={[
                                    styles.attendanceButtonTextCompact,
                                    { color: isMarked && markType === 'present' ? "#FFF" : "#10B981" }
                                  ]}>
                                    Present
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[
                                    styles.attendanceButtonCompact,
                                    isMarked && markType === 'absent' 
                                      ? styles.absentButtonFilled 
                                      : styles.absentButtonOutline,
                                    isMarked && markType !== 'absent' && styles.attendanceButtonDisabled,
                                  ]}
                                  onPress={async () => {
                                    if (slotId && !isMarked) {
                                      await markAbsent(evt.courseCode, evt.type, slotId);
                                    }
                                  }}
                                  disabled={isMarked}
                                  activeOpacity={0.7}
                                >
                                  <Ionicons 
                                    name="close" 
                                    size={14} 
                                    color={isMarked && markType === 'absent' ? "#FFF" : "#EF4444"}
                                  />
                                  <Text style={[
                                    styles.attendanceButtonTextCompact,
                                    { color: isMarked && markType === 'absent' ? "#FFF" : "#EF4444" }
                                  ]}>
                                    Absent
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            );
                          })()}
                        </View>

                        {/* Center Column: Time range */}
                        <View style={styles.centerColumn}>
                          <Text style={[styles.timeTextCompact, { color: colors.textPrimary }]}>
                            {evt.start} - {evt.end}
                          </Text>
                        </View>

                        {/* Right Column: Location */}
                        <View style={styles.rightColumn}>
                          <View style={styles.locationRow}>
                            <Ionicons 
                              name="location-outline" 
                              size={14}
                              color={colors.textSecondary} 
                            />
                            <Text style={[styles.locationTextCompact, { color: colors.textSecondary }]}>
                              {evt.venue}
                            </Text>
                          </View>
                        </View>
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
      <ProfilePanel
        visible={profilePanelVisible}
        onClose={() => setProfilePanelVisible(false)}
      />
    </SafeAreaView>
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
    marginBottom: 14,
  },
  gradientBorderContainer: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 17,
    zIndex: 1,
    overflow: 'hidden',
  },
  gradientEdgeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
  },
  gradientEdgeRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 4,
    borderTopRightRadius: 17,
    borderBottomRightRadius: 17,
  },
  gradientEdgeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
  },
  gradientEdgeLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
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
    minHeight: 150,
    maxHeight: 170,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  slotCode: {
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.7,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
  },
  leftColumn: {
    flex: 0,
    alignItems: 'flex-start',
  },
  centerColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightColumn: {
    flex: 0,
    alignItems: 'flex-end',
  },
  attendanceButtonsStack: {
    gap: 6,
  },
  buttonPlaceholder: {
    height: 56,
  },
  attendanceButtonCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 5,
    minWidth: 75,
    height: 30,
  },
  presentButtonFilled: {
    backgroundColor: '#10B981',
  },
  presentButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  absentButtonFilled: {
    backgroundColor: '#EF4444',
  },
  absentButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  attendanceButtonTextCompact: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeTextCompact: {
    fontSize: 14,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationTextCompact: {
    fontSize: 13,
    fontWeight: "500",
  },
  emptyText: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 15,
  },
  weekendMessageBar: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  weekendMessageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  weekendMessageIcon: {
    marginRight: 4,
  },
  weekendMessageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  attendanceButtonDisabled: {
    opacity: 0.5,
  },
});