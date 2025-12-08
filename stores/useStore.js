// stores/useStore.js
import { create } from "zustand";
import { saveAppState } from "../services/localStorage";

export const useStore = create((set, get) => ({
  timetable: null,
  uploadsRemaining: 5,
  subscriptionCode: null,
  darkMode: false,
  hydrated: false,

  // Helper function to save state
  saveState: async () => {
    const state = get();
    await saveAppState({
      timetable: state.timetable,
      uploadsRemaining: state.uploadsRemaining,
      subscriptionCode: state.subscriptionCode,
      darkMode: state.darkMode,
    });
  },

  // Modified setTimetable to auto-save
  setTimetable: async (timetable) => {
    set({ timetable });
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

  resetAll: async () => {
    const resetState = {
      timetable: null,
      uploadsRemaining: 5,
      subscriptionCode: null,
      darkMode: false,
      hydrated: true,
    };
    set(resetState);
    await saveAppState(resetState);
  },
}));