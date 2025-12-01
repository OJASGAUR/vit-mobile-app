// stores/useStore.js
import { create } from 'zustand';

export const useStore = create((set, get) => ({
  timetable: null,         // full timetable object: { Monday: [...], Tuesday: [...], ... }
  defaultTimetableId: null,
  darkMode: true,
  currentDay: 'Monday',    // selected day shown in single-day view
  weekView: false,         // false = single-day stacked view; true = week horizontal
  setTimetable: (t) => set({ timetable: t }),
  setDefaultTimetableId: (id) => set({ defaultTimetableId: id }),
  toggleDark: () => set(state => ({ darkMode: !state.darkMode })),
  setCurrentDay: (d) => set({ currentDay: d }),
  toggleWeekView: () => set(state => ({ weekView: !state.weekView })),
}));
