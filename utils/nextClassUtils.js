// utils/nextClassUtils.js

/**
 * Find the ongoing class (if exists) or next upcoming class from the timetable
 * @param {Object} timetable - Timetable object with days as keys and arrays of events as values
 * @param {Date} currentTime - Optional current time (defaults to new Date())
 * @returns {Object|null} - { class, day, timeRemaining, minutesRemaining, secondsRemaining, isOngoing } or null
 */
export function findNextClass(timetable, currentTime = null) {
  if (!timetable || typeof timetable !== 'object') {
    return null;
  }

  const now = currentTime || new Date();
  const currentTimeMinutes = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
  const currentTimeSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds(); // Current time in seconds
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Map JavaScript day to weekday names
  const dayMap = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday"
  };

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weekdayOnly = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  // FIRST: Check for ongoing class (priority) - check today's classes directly
  const todayName = dayMap[currentDay];
  const todayEvents = timetable[todayName] || [];
  const isWeekend = currentDay === 0 || currentDay === 6; // Sunday or Saturday
  
  // If it's weekend, skip to next weekday
  if (isWeekend) {
    // Find next weekday class (skip weekend)
    let nextClass = null;
    let nextClassDay = null;
    let minSecondsRemaining = Infinity;
    
    // Calculate days until next Monday
    const daysUntilMonday = currentDay === 0 ? 1 : (8 - currentDay); // Sunday = 1 day, Saturday = 2 days
    const mondayIndex = weekdays.indexOf("Monday");
    
    // Check from Monday onwards (skip weekend)
    for (let dayOffset = daysUntilMonday; dayOffset < 7; dayOffset++) {
      const checkDayIndex = (mondayIndex + (dayOffset - daysUntilMonday)) % 7;
      const checkDayName = weekdays[checkDayIndex];
      
      // Skip weekends in the search
      if (checkDayName === "Saturday" || checkDayName === "Sunday") {
        continue;
      }
      
      const dayEvents = timetable[checkDayName] || [];
      const dayClasses = dayEvents.filter(event => event.start && event.end);
      
      for (const cls of dayClasses) {
        const [startHour, startMin] = cls.start.split(':').map(Number);
        const classStartSeconds = startHour * 3600 + startMin * 60;
        // Add days in seconds
        const classStartSecondsWithOffset = classStartSeconds + dayOffset * 24 * 3600;
        
        const secondsRemaining = classStartSecondsWithOffset - currentTimeSeconds;
        if (secondsRemaining < minSecondsRemaining) {
          minSecondsRemaining = secondsRemaining;
          nextClass = cls;
          nextClassDay = checkDayName;
        }
      }
      
      // If we found a class, break
      if (nextClass) {
        break;
      }
    }
    
    if (nextClass) {
      return {
        class: nextClass,
        day: nextClassDay,
        timeRemaining: formatTimeRemaining(minSecondsRemaining),
        minutesRemaining: Math.floor(minSecondsRemaining / 60),
        secondsRemaining: minSecondsRemaining,
        isOngoing: false,
        isToday: false,
        isWeekend: true,
      };
    }
    
    return null; // No classes found
  }
  
  if (todayEvents.length === 0 && Object.keys(timetable).length === 0) {
    return null;
  }

  // Check today's classes for ongoing class first (most common case)
  const todayClasses = todayEvents.filter(event => event.start && event.end);
  
  for (const cls of todayClasses) {
    const [startHour, startMin] = cls.start.split(':').map(Number);
    const [endHour, endMin] = cls.end.split(':').map(Number);
    const classStartMinutes = startHour * 60 + startMin;
    const classEndMinutes = endHour * 60 + endMin;
    
    // Check if class is currently ongoing
    if (currentTimeMinutes >= classStartMinutes && currentTimeMinutes < classEndMinutes) {
      const classStartSeconds = startHour * 3600 + startMin * 60;
      const classEndSeconds = endHour * 3600 + endMin * 60;
      const secondsRemaining = classEndSeconds - currentTimeSeconds;
      
      return {
        class: cls,
        day: todayName,
        timeRemaining: formatTimeRemaining(secondsRemaining),
        minutesRemaining: Math.floor(secondsRemaining / 60),
        secondsRemaining: secondsRemaining,
        isOngoing: true,
        isToday: true,
      };
    }
  }

  // SECOND: Find next upcoming class
  let nextClass = null;
  let nextClassDay = null;
  let minSecondsRemaining = Infinity;

  // Check today's classes for next class
  for (const cls of todayClasses) {
    const [startHour, startMin] = cls.start.split(':').map(Number);
    const classStartSeconds = startHour * 3600 + startMin * 60;
    
    if (classStartSeconds > currentTimeSeconds) {
      const secondsRemaining = classStartSeconds - currentTimeSeconds;
      if (secondsRemaining < minSecondsRemaining) {
        minSecondsRemaining = secondsRemaining;
        nextClass = cls;
        nextClassDay = todayName;
      }
    }
  }

  // Check if all classes for today are done
  let allTodayClassesDone = false;
  if (todayClasses.length > 0) {
    // Find the last class of the day
    const lastClass = todayClasses.reduce((latest, cls) => {
      const [endHour, endMin] = cls.end.split(':').map(Number);
      const [latestEndHour, latestEndMin] = latest.end.split(':').map(Number);
      const clsEndMinutes = endHour * 60 + endMin;
      const latestEndMinutes = latestEndHour * 60 + latestEndMin;
      return clsEndMinutes > latestEndMinutes ? cls : latest;
    });
    
    const [lastEndHour, lastEndMin] = lastClass.end.split(':').map(Number);
    const lastClassEndMinutes = lastEndHour * 60 + lastEndMin;
    
    // If current time is after the last class of the day
    if (currentTimeMinutes >= lastClassEndMinutes) {
      allTodayClassesDone = true;
    }
  }

  // If no class found today, check upcoming days (skip weekends)
  if (!nextClass) {
    const currentDayIndex = weekdays.indexOf(todayName);
    
    // Check next 7 days, but skip weekends
    for (let dayOffset = 1; dayOffset < 7; dayOffset++) {
      const checkDayIndex = (currentDayIndex + dayOffset) % 7;
      const checkDayName = weekdays[checkDayIndex];
      
      // Skip weekends
      if (checkDayName === "Saturday" || checkDayName === "Sunday") {
        continue;
      }
      
      const dayEvents = timetable[checkDayName] || [];
      const dayClasses = dayEvents.filter(event => event.start && event.end);
      
      for (const cls of dayClasses) {
        const [startHour, startMin] = cls.start.split(':').map(Number);
        const classStartSeconds = startHour * 3600 + startMin * 60;
        // Add days in seconds
        const classStartSecondsWithOffset = classStartSeconds + dayOffset * 24 * 3600;
        
        const secondsRemaining = classStartSecondsWithOffset - currentTimeSeconds;
        if (secondsRemaining < minSecondsRemaining) {
          minSecondsRemaining = secondsRemaining;
          nextClass = cls;
          nextClassDay = checkDayName;
        }
      }
      
      // If we found a class, break
      if (nextClass) {
        break;
      }
    }
  }

  // If all today's classes are done, return special flag
  if (allTodayClassesDone) {
    return {
      class: null,
      day: todayName,
      timeRemaining: null,
      minutesRemaining: null,
      secondsRemaining: null,
      isOngoing: false,
      isToday: true,
      allTodayClassesDone: true,
    };
  }

  if (!nextClass) {
    return null;
  }

  return {
    class: nextClass,
    day: nextClassDay,
    timeRemaining: formatTimeRemaining(minSecondsRemaining),
    minutesRemaining: Math.floor(minSecondsRemaining / 60),
    secondsRemaining: minSecondsRemaining,
    isOngoing: false,
    isToday: nextClassDay === todayName,
    allTodayClassesDone: false,
  };
}

/**
 * Format seconds into HH:MM:SS format
 * @param {number} totalSeconds - Total seconds remaining
 * @returns {string} - Formatted time string (HH:MM:SS)
 */
function formatTimeRemaining(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

/**
 * Check if a class is the next upcoming class
 * @param {Object} event - Class event object (may be merged for labs)
 * @param {Object} nextClassInfo - Result from findNextClass
 * @returns {boolean}
 */
export function isNextClass(event, nextClassInfo) {
  if (!nextClassInfo || !nextClassInfo.class) {
    return false;
  }

  const next = nextClassInfo.class;
  
  // Match by course code, slot, and time range
  // For slots: handle merged lab slots (e.g., "L39+L40" should match "L39" or "L40")
  const slotsMatch = 
    event.slot === next.slot || // Exact match
    (event.slot && event.slot.includes('+') && event.slot.split('+').map(s => s.trim()).includes(next.slot)) || // Merged slot contains original
    (next.slot && next.slot.includes('+') && next.slot.split('+').map(s => s.trim()).includes(event.slot)); // Original contains merged (shouldn't happen but safe)
  
  if (!slotsMatch) {
    return false;
  }
  
  // For time matching: handle merged labs where the next class might be the second part
  // Merged labs have: start from first lab, end from last lab
  // So we check if the time ranges overlap or if the event contains the next class's time
  const eventStart = event.start;
  const eventEnd = event.end;
  const nextStart = next.start;
  const nextEnd = next.end;
  
  // Exact match
  if (eventStart === nextStart && eventEnd === nextEnd) {
    return true;
  }
  
  // Merged lab contains the next class (event starts before/at next start, ends after/at next end)
  if (eventStart <= nextStart && eventEnd >= nextEnd) {
    return true;
  }
  
  // Time ranges overlap (for edge cases)
  if (eventStart <= nextEnd && eventEnd >= nextStart) {
    return true;
  }
  
  return false;
}

