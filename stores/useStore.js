import { create } from "zustand";
import { saveAppState } from "../services/localStorage";

export const useStore = create((set, get) => ({
  timetable: null,
  uploadsRemaining: 5,
  subscriptionCode: null,
  darkMode: false,
  hydrated: false,
  user: null,
  friends: [],
  friendRequests: [],
  attendance: {},
  attendanceMarks: {},
  attendanceUploadDate: null,

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

  normalizeTimetable: (timetable) => {
    if (!timetable || typeof timetable !== 'object') {
      return timetable;
    }
    
    const normalized = { ...timetable };
    if (!normalized.Saturday) {
      normalized.Saturday = [];
    }
    if (!normalized.Sunday) {
      normalized.Sunday = [];
    }
    
    return normalized;
  },

  setTimetable: async (timetable) => {
    const normalized = get().normalizeTimetable(timetable);
    set({ timetable: normalized });
    
    await get().initializeAttendanceForSubjects(normalized);
    
    await get().saveState();
  },
  
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
    const currentDarkMode = get().darkMode;
    const resetState = {
      timetable: null,
      uploadsRemaining: 5,
      subscriptionCode: null,
      darkMode: currentDarkMode,
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
      if (err.message && err.message.includes("User not found")) {
        console.warn("User not found on backend - will retry after registration");
      } else {
        console.error("syncFriendsFromBackend error:", err);
      }
    }
  },

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

  initializeAttendanceForSubjects: async (timetable) => {
    const state = get();
    const attendance = { ...state.attendance };
    
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

  initializeAttendanceForSubject: async (courseCode, courseType, baselineAttended, baselineMissed, isFirstUpload = false) => {
    const state = get();
    
    if (isFirstUpload) {
      const attendance = {};
      const attendanceMarks = {};
      const attendanceUploadDate = new Date().toISOString().split('T')[0];
      
      set({ 
        attendance, 
        attendanceMarks,
        attendanceUploadDate 
      });
      await get().saveState();
    }
    
    const currentState = get();
    const attendance = { ...currentState.attendance };
    
    const attendanceKey = get().getAttendanceKey(courseCode, courseType);
    
    if (!attendance[attendanceKey]) {
      attendance[attendanceKey] = {
        baselineAttended: 0,
        baselineMissed: 0,
        dailyAttended: 0,
        dailyMissed: 0,
        requiredPercent: 75,
      };
    }
    
    attendance[attendanceKey].baselineAttended = baselineAttended || 0;
    attendance[attendanceKey].baselineMissed = baselineMissed || 0;
    
    set({ attendance });
    await get().saveState();
  },

  mapTimetableTypeToAttendanceType: (timetableType) => {
    if (!timetableType) return "ETH";
    const upper = timetableType.toUpperCase();
    if (upper === "LAB") return "ELA";
    if (upper.includes("THEORY ONLY")) return "TH";
    if (upper === "THEORY") return "ETH";
    if (upper.includes("LAB")) return "ELA";
    if (upper.includes("THEORY")) return "ETH";
    return "ETH";
  },

  getAttendanceKey: (courseCode, type) => {
    let normalizedType = type;
    if (type === "Theory" || type === "theory") normalizedType = "ETH";
    else if (type === "Lab" || type === "lab") normalizedType = "ELA";
    else if (type && !["ETH", "ELA", "TH"].includes(type.toUpperCase())) {
      normalizedType = get().mapTimetableTypeToAttendanceType(type);
    }
    return `${courseCode}-${normalizedType.toUpperCase()}`;
  },

  generateSlotId: (courseCode, type, slot, day, index) => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const normalizedType = get().mapTimetableTypeToAttendanceType(type);
    return `${dateStr}-${courseCode}-${normalizedType}-${slot}-${day}-${index}`;
  },

  markPresent: async (courseCode, type, slotId) => {
    const state = get();
    const attendance = { ...state.attendance };
    const attendanceMarks = { ...state.attendanceMarks };
    
    if (attendanceMarks[slotId]) {
      return { success: false, error: "Already marked" };
    }
    
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
    
    const normalizedType = get().mapTimetableTypeToAttendanceType(type);
    const isLab = normalizedType === "ELA";
    const incrementValue = isLab ? 2 : 1;
    
    attendance[attendanceKey].dailyAttended = (attendance[attendanceKey].dailyAttended || 0) + incrementValue;
    attendanceMarks[slotId] = 'present';
    
    set({ attendance, attendanceMarks });
    await get().saveState();
    
    return { success: true };
  },

  markAbsent: async (courseCode, type, slotId) => {
    const state = get();
    const attendance = { ...state.attendance };
    const attendanceMarks = { ...state.attendanceMarks };
    
    if (attendanceMarks[slotId]) {
      return { success: false, error: "Already marked" };
    }
    
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
    
    const normalizedType = get().mapTimetableTypeToAttendanceType(type);
    const isLab = normalizedType === "ELA";
    const incrementValue = isLab ? 2 : 1;
    
    attendance[attendanceKey].dailyMissed = (attendance[attendanceKey].dailyMissed || 0) + incrementValue;
    attendanceMarks[slotId] = 'absent';
    
    set({ attendance, attendanceMarks });
    await get().saveState();
    
    return { success: true };
  },

  setRequiredPercent: async (courseCode, type, value) => {
    const state = get();
    const attendance = { ...state.attendance };
    
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

  hasAttendanceBeenMarked: (slotId) => {
    const state = get();
    return !!state.attendanceMarks[slotId];
  },

  getAttendanceMark: (slotId) => {
    const state = get();
    return state.attendanceMarks[slotId] || null;
  },

  getCombinedAttendance: (courseCode, type) => {
    const state = get();
    const attendanceKey = get().getAttendanceKey(courseCode, type);
    let attData = state.attendance[attendanceKey];
    
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