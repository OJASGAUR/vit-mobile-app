// vit-mobile-app/services/storage.js
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMETABLES_FILE = FileSystem.documentDirectory + 'vit_timetables.json';
const DEFAULT_ID_KEY = 'vit_default_timetable_id';

// Read timetables file (returns array)
export async function loadLocalTimetables() {
  try {
    const exists = await FileSystem.getInfoAsync(TIMETABLES_FILE);
    if (!exists.exists) return [];
    const raw = await FileSystem.readAsStringAsync(TIMETABLES_FILE, { encoding: FileSystem.EncodingType.UTF8 });
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.warn('loadLocalTimetables failed', e);
    return [];
  }
}

// Save timetables array to file
export async function saveLocalTimetables(list) {
  try {
    await FileSystem.writeAsStringAsync(TIMETABLES_FILE, JSON.stringify(list || []), { encoding: FileSystem.EncodingType.UTF8 });
    return true;
  } catch (e) {
    console.warn('saveLocalTimetables failed', e);
    return false;
  }
}

// Add a timetable; returns { list, index }
export async function addLocalTimetable(item) {
  const list = await loadLocalTimetables();
  list.push(item);
  await saveLocalTimetables(list);
  return { list, index: list.length - 1 };
}

export async function removeLocalTimetable(index) {
  const list = await loadLocalTimetables();
  if (index >= 0 && index < list.length) {
    list.splice(index, 1);
    await saveLocalTimetables(list);
  }
  return list;
}

// Default timetable id (small, safe to store in AsyncStorage)
export async function setDefaultTimetableId(id) {
  try {
    if (id === null || id === undefined) {
      await AsyncStorage.removeItem(DEFAULT_ID_KEY);
      return;
    }
    await AsyncStorage.setItem(DEFAULT_ID_KEY, String(id));
  } catch (e) {
    console.warn('setDefaultTimetableId failed', e);
  }
}

export async function getDefaultTimetableId() {
  try {
    const v = await AsyncStorage.getItem(DEFAULT_ID_KEY);
    if (v == null) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  } catch (e) {
    console.warn('getDefaultTimetableId failed', e);
    return null;
  }
}

// Load the default timetable object (or null)
export async function loadDefaultTimetable() {
  try {
    const id = await getDefaultTimetableId();
    if (id === null) return null;
    const list = await loadLocalTimetables();
    return list[id] ? list[id].timetable : null;
  } catch (e) {
    console.warn('loadDefaultTimetable failed', e);
    return null;
  }
}
