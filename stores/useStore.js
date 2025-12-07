// stores/useStore.js

import { create } from "zustand";

export const useStore = create((set) => ({
  timetable: null,
  uploadsRemaining: 5,
  subscriptionCode: null,

  setTimetable: (timetable) => set({ timetable }),
  setUploadsRemaining: (n) => set({ uploadsRemaining: n }),
  setSubscriptionCode: (c) => set({ subscriptionCode: c }),

  resetAll: () =>
    set({
      timetable: null,
      uploadsRemaining: 5,
      subscriptionCode: null,
    }),
}));
