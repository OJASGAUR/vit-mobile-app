// services/localStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'vitwise_state_v1';

export async function saveAppState(partial) {
  try {
    const existingStr = await AsyncStorage.getItem(STORAGE_KEY);
    let existing = {};
    if (existingStr) {
      try {
        existing = JSON.parse(existingStr);
      } catch {
        existing = {};
      }
    }
    const merged = { ...existing, ...partial };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn('saveAppState failed', e);
  }
}

export async function loadAppState() {
  try {
    const str = await AsyncStorage.getItem(STORAGE_KEY);
    if (!str) return null;
    return JSON.parse(str);
  } catch (e) {
    console.warn('loadAppState failed', e);
    return null;
  }
}

export async function clearAppState() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('clearAppState failed', e);
  }
}
