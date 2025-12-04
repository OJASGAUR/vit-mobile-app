// stores/useStore.js
import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Timetable data (full object: { Monday: [...], Tuesday: [...], ... })
  timetable: null,

  // UI preferences
  defaultTimetableId: null,
  darkMode: true,
  currentDay: 'Monday',
  weekView: false,

  // Upload limits & subscription
  // In dev builds you get many uploads, in release APK it will be 1.
  uploadsRemaining: __DEV__ ? 999 : 1,
  subscriptionCode: null,

  // Hydration status (when we load from AsyncStorage)
  hydrated: false,

  // --- actions ---
  setTimetable: (t) => set({ timetable: t }),
  setDefaultTimetableId: (id) => set({ defaultTimetableId: id }),
  toggleDark: () => set(state => ({ darkMode: !state.darkMode })),
  setCurrentDay: (d) => set({ currentDay: d }),
  toggleWeekView: () => set(state => ({ weekView: !state.weekView })),

  setUploadsRemaining: (n) => set({ uploadsRemaining: n }),
  setSubscriptionCode: (code) => set({ subscriptionCode: code }),

  setHydrated: (v) => set({ hydrated: v }),
}));
