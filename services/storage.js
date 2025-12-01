// vit-mobile-app/services/storage.js
import * as SecureStore from "expo-secure-store";

const TIMETABLES_KEY = "vit_timetables"; // NO ":" allowed

export async function saveLocalTimetables(list) {
  await SecureStore.setItemAsync(TIMETABLES_KEY, JSON.stringify(list));
}

export async function loadLocalTimetables() {
  const v = await SecureStore.getItemAsync(TIMETABLES_KEY);
  if (!v) return [];
  try {
    return JSON.parse(v);
  } catch {
    return [];
  }
}

export async function addLocalTimetable(item) {
  const list = await loadLocalTimetables();
  list.unshift(item);
  await saveLocalTimetables(list);
  return list;
}

export async function removeLocalTimetable(index) {
  const list = await loadLocalTimetables();
  list.splice(index, 1);
  await saveLocalTimetables(list);
  return list;
}
