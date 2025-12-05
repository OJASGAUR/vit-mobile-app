// services/localStorage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "vitwise-app-state-v2";

export async function saveAppState(partial) {
  try {
    const existingRaw = await AsyncStorage.getItem(KEY);
    let existing = {};
    if (existingRaw) {
      try {
        existing = JSON.parse(existingRaw);
      } catch {
        existing = {};
      }
    }

    const merged = {
      ...existing,
      ...partial,
    };

    await AsyncStorage.setItem(KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn("saveAppState failed", e);
  }
}

export async function loadAppState() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("loadAppState failed", e);
    return null;
  }
}
