// stores/useStore.js
import { create } from "zustand";

export const useStore = create((set, get) => ({
  // timetable
  timetable: null,

  // theme
  darkMode: true, // default to dark

  // UI state
  currentDay: "Monday",
  weekView: false,

  // uploads / subscription
  uploadsRemaining: 1, // 1 free upload for everyone
  subscriptionCode: null,

  // hydration flag (App.js sets this after loading from storage)
  hydrated: false,

  // --- actions ---
  setTimetable: (t) => set({ timetable: t }),

  setUploadsRemaining: (n) => set({ uploadsRemaining: n }),
  setSubscriptionCode: (code) => set({ subscriptionCode: code }),

  setDarkMode: (v) => set({ darkMode: v }),
  toggleTheme: () => set((s) => ({ darkMode: !s.darkMode })),

  setCurrentDay: (d) => set({ currentDay: d }),
  toggleWeekView: () => set((state) => ({ weekView: !state.weekView })),

  setHydrated: (v) => set({ hydrated: v }),
}));
