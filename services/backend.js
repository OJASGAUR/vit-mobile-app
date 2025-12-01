// services/backend.js
import { Platform } from "react-native";
import Constants from "expo-constants";

let cached = null;

export default function getBackendUrl() {
  if (cached) return cached;

  // 1. Global override (debug)
  if (global && global.__BACKEND_URL__) {
    cached = global.__BACKEND_URL__;
    return cached;
  }

  // 2. Expo extra config (production)
  try {
    const extra =
      Constants?.expoConfig?.extra ||
      Constants?.manifest?.extra;

    if (extra?.BACKEND_URL) {
      cached = extra.BACKEND_URL;
      return cached;
    }
  } catch (e) {}

  // 3. Local development fallbacks
  if (Platform.OS === "android") {
    cached = "http://10.0.2.2:3001";
    return cached;
  }

  if (Platform.OS === "ios") {
    cached = "http://localhost:3001";
    return cached;
  }

  // default fallback
  cached = "http://10.0.2.2:3001";
  return cached;
}
