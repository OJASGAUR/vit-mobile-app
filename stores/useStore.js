// stores/useStore.js
import { create } from "zustand";
import { saveAppState } from "../services/localStorage";

export const useStore = create((set, get) => ({
  timetable: null,
  uploadsRemaining: 5,
  subscriptionCode: null,
  darkMode: false,
  hydrated: false,
  user: null, // { name, regNo, avatar, bio, phone, socialLinks: { instagram, twitter, facebook } }
  friends: [], // Array of friend user objects
  friendRequests: [], // Array of { incomingRequests: [], sentRequests: [] }
  attendance: {}, // { [subjectCode-type]: { baselineAttended: number, baselineMissed: number, dailyAttended: number, dailyMissed: number, requiredPercent: number } }
  attendanceMarks: {}, // { [slotId]: 'present' | 'absent' }
  attendanceUploadDate: null, // ISO date string of when attendance was last uploaded

  // Helper function to save state
  saveState: async () => {
    const state = get();
    await saveAppState({
      timetable: state.timetable,
      uploadsRemaining: state.uploadsRemaining,
      subscriptionCode: state.subscriptionCode,
      darkMode: state.darkMode,
      user: state.user,
      friends: state.friends,
      friendRequests: state.friendRequests,
      attendance: state.attendance,
      attendanceMarks: state.attendanceMarks,
      attendanceUploadDate: state.attendanceUploadDate,
    });
  },

  // Helper function to normalize timetable - ensure Saturday and Sunday are always present
  normalizeTimetable: (timetable) => {
    if (!timetable || typeof timetable !== 'object') {
      return timetable;
    }
    
    // Ensure Saturday and Sunday are always present
    const normalized = { ...timetable };
    if (!normalized.Saturday) {
      normalized.Saturday = [];
    }
    if (!normalized.Sunday) {
      normalized.Sunday = [];
    }
    
    return normalized;
  },

  // Modified setTimetable to auto-save and initialize attendance
  setTimetable: async (timetable) => {
    const normalized = get().normalizeTimetable(timetable);
    set({ timetable: normalized });
    
    // Initialize attendance for all subjects
    // Initialize attendance for all courseCode-type combinations
    await get().initializeAttendanceForSubjects(normalized);
    
    await get().saveState();
  },
  
  // Modified setUploadsRemaining to auto-save
  setUploadsRemaining: async (n) => {
    set({ uploadsRemaining: n });
    await get().saveState();
  },
  
  setSubscriptionCode: async (c) => {
    set({ subscriptionCode: c });
    await get().saveState();
  },
  
  setDarkMode: async (mode) => {
    set({ darkMode: mode });
    await get().saveState();
  },
  
  setHydrated: (val) => set({ hydrated: val }),

  toggleTheme: async () => {
    set((state) => ({ darkMode: !state.darkMode }));
    await get().saveState();
  },

  setUser: async (user) => {
    set({ user });
    await get().saveState();
  },

  updateUser: async (updates) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser, ...updates };
    set({ user: updatedUser });
    await get().saveState();
  },

  logout: async () => {
    // Clear all user-specific data on logout
    const currentDarkMode = get().darkMode; // Preserve theme preference
    const resetState = {
      timetable: null,
      uploadsRemaining: 5, // Reset to default
      subscriptionCode: null,
      darkMode: currentDarkMode, // Keep user's theme preference
      user: null,
      friends: [],
      friendRequests: [],
      attendance: {},
      attendanceMarks: {},
      attendanceUploadDate: null,
    };
    set(resetState);
    await get().saveState();
  },

  setFriends: async (friends) => {
    set({ friends });
    await get().saveState();
  },

  setFriendRequests: async (friendRequests) => {
    set({ friendRequests });
    await get().saveState();
  },

  syncFriendsFromBackend: async (regNo) => {
    if (!regNo) return;
    
    try {
      // First, ensure user is registered on backend
      const currentUser = get().user;
      if (currentUser && currentUser.regNo === regNo) {
        try {
          const { BACKEND_URL } = await import("../services/backend");
          await fetch(`${BACKEND_URL}/api/user/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: currentUser.name,
              regNo: currentUser.regNo,
              avatar: currentUser.avatar,
              bio: currentUser.bio || "",
              phone: currentUser.phone || "",
              socialLinks: currentUser.socialLinks || {},
            }),
          });
        } catch (registerErr) {
          console.warn("Failed to register user on backend:", registerErr);
          // Continue anyway - might already be registered
        }
      }
      
      const { getFriends } = await import("../services/api");
      const result = await getFriends(regNo);
      if (result.success) {
        set({ 
          friends: result.friends || [],
          friendRequests: {
            incomingRequests: result.incomingRequests || [],
            sentRequests: result.sentRequests || [],
          }
        });
        await get().saveState();
      }
    } catch (err) {
      // Handle "User not found" error gracefully
      if (err.message && err.message.includes("User not found")) {
        console.warn("User not found on backend - will retry after registration");
        // Don't log as error, just warn
      } else {
        console.error("syncFriendsFromBackend error:", err);
      }
      // Don't throw - allow app to continue with local data
      // If backend isn't available, use existing local state
    }
  },

  // Attendance functions
  setAttendance: async (attendance) => {
    set({ attendance });
    await get().saveState();
  },

  setAttendanceMarks: async (attendanceMarks) => {
    set({ attendanceMarks });
    await get().saveState();
  },

  setAttendanceUploadDate: async (attendanceUploadDate) => {
    set({ attendanceUploadDate });
    await get().saveState();
  },

  // Initialize attendance for all subjects when timetable is set
  initializeAttendanceForSubjects: async (timetable) => {
    const state = get();
    const attendance = { ...state.attendance };
    
    // Extract unique courseCode-type combinations from timetable
    const seenKeys = new Set();
    Object.keys(timetable).forEach(day => {
      const dayEvents = timetable[day] || [];
      dayEvents.forEach(event => {
        if (event.courseCode && event.type) {
          const attendanceKey = get().getAttendanceKey(event.courseCode, event.type);
          if (!seenKeys.has(attendanceKey)) {
            seenKeys.add(attendanceKey);
            if (!attendance[attendanceKey]) {
              attendance[attendanceKey] = {
                baselineAttended: 0,
                baselineMissed: 0,
                dailyAttended: 0,
                dailyMissed: 0,
                requiredPercent: 75,
              };
            }
          }
        }
      });
    });
    
    set({ attendance });
    await get().saveState();
  },

  // Initialize attendance for a single subject with baseline data
  initializeAttendanceForSubject: async (courseCode, courseType, baselineAttended, baselineMissed, isFirstUpload = false) => {
    const state = get();
    
    // If this is the first subject being uploaded, clear all existing data
    if (isFirstUpload) {
      // Clear all attendance data
      const attendance = {};
      const attendanceMarks = {};
      const attendanceUploadDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Clear old attendance marks (for classes before upload date)
      set({ 
        attendance, 
        attendanceMarks,
        attendanceUploadDate 
      });
      await get().saveState();
    }
    
    const currentState = get();
    const attendance = { ...currentState.attendance };
    
    // Get composite key
    const attendanceKey = get().getAttendanceKey(courseCode, courseType);
    
    // Create or update subject entry
    if (!attendance[attendanceKey]) {
      attendance[attendanceKey] = {
        baselineAttended: 0,
        baselineMissed: 0,
        dailyAttended: 0,
        dailyMissed: 0,
        requiredPercent: 75,
      };
    }
    
    // Set baseline values (don't reset daily values)
    attendance[attendanceKey].baselineAttended = baselineAttended || 0;
    attendance[attendanceKey].baselineMissed = baselineMissed || 0;
    
    set({ attendance });
    await get().saveState();
  },

  // Helper: Map timetable type to attendance type
  mapTimetableTypeToAttendanceType: (timetableType) => {
    if (!timetableType) return "ETH"; // Default to ETH
    const upper = timetableType.toUpperCase();
    if (upper === "LAB") return "ELA";
    // Check for "Theory Only" BEFORE general "THEORY" check
    if (upper.includes("THEORY ONLY")) return "TH";
    if (upper === "THEORY") return "ETH";
    // Handle other variations
    if (upper.includes("LAB")) return "ELA";
    if (upper.includes("THEORY")) return "ETH";
    return "ETH"; // Default
  },

  // Helper: Create composite key for attendance
  getAttendanceKey: (courseCode, type) => {
    // Normalize type: Theory/Lab -> ETH/ELA, or keep as-is if already ETH/ELA/TH
    let normalizedType = type;
    if (type === "Theory" || type === "theory") normalizedType = "ETH";
    else if (type === "Lab" || type === "lab") normalizedType = "ELA";
    else if (type && !["ETH", "ELA", "TH"].includes(type.toUpperCase())) {
      // Use mapping function for other formats
      normalizedType = get().mapTimetableTypeToAttendanceType(type);
    }
    return `${courseCode}-${normalizedType.toUpperCase()}`;
  },

  // Generate unique slotId: date + courseCode + type + slot + day + index
  generateSlotId: (courseCode, type, slot, day, index) => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const normalizedType = get().mapTimetableTypeToAttendanceType(type);
    return `${dateStr}-${courseCode}-${normalizedType}-${slot}-${day}-${index}`;
  },

  // Mark present
  markPresent: async (courseCode, type, slotId) => {
    const state = get();
    const attendance = { ...state.attendance };
    const attendanceMarks = { ...state.attendanceMarks };
    
    // Check if already marked
    if (attendanceMarks[slotId]) {
      return { success: false, error: "Already marked" };
    }
    
    // Get composite key
    const attendanceKey = get().getAttendanceKey(courseCode, type);
    
    // Initialize if doesn't exist
    if (!attendance[attendanceKey]) {
      attendance[attendanceKey] = {
        baselineAttended: 0,
        baselineMissed: 0,
        dailyAttended: 0,
        dailyMissed: 0,
        requiredPercent: 75,
      };
    }
    
    // Check if it's a lab class - labs count as 2 classes
    const normalizedType = get().mapTimetableTypeToAttendanceType(type);
    const isLab = normalizedType === "ELA";
    const incrementValue = isLab ? 2 : 1;
    
    // Increment daily attended (baseline stays unchanged)
    attendance[attendanceKey].dailyAttended = (attendance[attendanceKey].dailyAttended || 0) + incrementValue;
    attendanceMarks[slotId] = 'present';
    
    set({ attendance, attendanceMarks });
    await get().saveState();
    
    return { success: true };
  },

  // Mark absent
  markAbsent: async (courseCode, type, slotId) => {
    const state = get();
    const attendance = { ...state.attendance };
    const attendanceMarks = { ...state.attendanceMarks };
    
    // Check if already marked
    if (attendanceMarks[slotId]) {
      return { success: false, error: "Already marked" };
    }
    
    // Get composite key
    const attendanceKey = get().getAttendanceKey(courseCode, type);
    
    // Initialize if doesn't exist
    if (!attendance[attendanceKey]) {
      attendance[attendanceKey] = {
        baselineAttended: 0,
        baselineMissed: 0,
        dailyAttended: 0,
        dailyMissed: 0,
        requiredPercent: 75,
      };
    }
    
    // Check if it's a lab class - labs count as 2 classes
    const normalizedType = get().mapTimetableTypeToAttendanceType(type);
    const isLab = normalizedType === "ELA";
    const incrementValue = isLab ? 2 : 1;
    
    // Increment daily missed (baseline stays unchanged)
    attendance[attendanceKey].dailyMissed = (attendance[attendanceKey].dailyMissed || 0) + incrementValue;
    attendanceMarks[slotId] = 'absent';
    
    set({ attendance, attendanceMarks });
    await get().saveState();
    
    return { success: true };
  },

  // Set required percent
  setRequiredPercent: async (courseCode, type, value) => {
    const state = get();
    const attendance = { ...state.attendance };
    
    // Get composite key
    const attendanceKey = get().getAttendanceKey(courseCode, type);
    
    if (!attendance[attendanceKey]) {
      attendance[attendanceKey] = {
        baselineAttended: 0,
        baselineMissed: 0,
        dailyAttended: 0,
        dailyMissed: 0,
        requiredPercent: 75,
      };
    }
    
    attendance[attendanceKey].requiredPercent = Math.max(0, Math.min(100, value));
    
    set({ attendance });
    await get().saveState();
  },

  // Check if attendance has been marked for a slot
  hasAttendanceBeenMarked: (slotId) => {
    const state = get();
    return !!state.attendanceMarks[slotId];
  },

  // Get attendance mark for a slot
  getAttendanceMark: (slotId) => {
    const state = get();
    return state.attendanceMarks[slotId] || null;
  },

  // Get combined attendance (baseline + daily)
  getCombinedAttendance: (courseCode, type) => {
    const state = get();
    // Get composite key
    const attendanceKey = get().getAttendanceKey(courseCode, type);
    let attData = state.attendance[attendanceKey];
    
    // Fallback: If type is "Theory"/"ETH" and no data found, also check "TH" key
    // This handles cases where timetable has "Theory" but attendance was uploaded as "Theory Only"
    if (!attData) {
      const normalizedType = get().getAttendanceKey(courseCode, type).split('-')[1];
      if (normalizedType === "ETH") {
        const thKey = `${courseCode}-TH`;
        attData = state.attendance[thKey];
      }
    }
    
    if (!attData) {
      return {
        finalAttended: 0,
        finalMissed: 0,
        finalPercentage: null,
      };
    }

    const baselineAttended = attData.baselineAttended || 0;
    const baselineMissed = attData.baselineMissed || 0;
    const dailyAttended = attData.dailyAttended || 0;
    const dailyMissed = attData.dailyMissed || 0;

    const finalAttended = baselineAttended + dailyAttended;
    const finalMissed = baselineMissed + dailyMissed;
    const total = finalAttended + finalMissed;
    const finalPercentage = total > 0 
      ? Math.round((finalAttended / total) * 100) 
      : null;

    return {
      finalAttended,
      finalMissed,
      finalPercentage,
    };
  },

  resetAll: async () => {
    const resetState = {
      timetable: null,
      uploadsRemaining: 5,
      subscriptionCode: null,
      darkMode: false,
      hydrated: true,
      user: null,
      friends: [],
      friendRequests: [],
      attendance: {},
      attendanceMarks: {},
      attendanceUploadDate: null,
    };
    set(resetState);
    await saveAppState(resetState);
  },
}));