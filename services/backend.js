// services/backend.js
import { Platform } from "react-native";
import Constants from "expo-constants";

export default function getBackendUrl() {
  //
  // 1) Global override (optional for debugging)
  //
  if (global && global.__BACKEND_URL__) {
    console.log("[backend] using global override:", global.__BACKEND_URL__);
    return global.__BACKEND_URL__;
  }

  //
  // 2) Expo extra env (used for production)
  //
  try {
    const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra;
    if (extra?.BACKEND_URL) {
      console.log("[backend] using production BACKEND_URL:", extra.BACKEND_URL);
      return extra.BACKEND_URL;
    }
  } catch (e) {
    console.log("[backend] expo extra failed:", e);
  }

  //
  // 3) Local development defaults
  //
  if (Platform.OS === "android") {
    // Android Emulator → host machine
    return "http://10.0.2.2:3001";
  }

  if (Platform.OS === "ios") {
    // iOS simulator
    return "http://localhost:3001";
  }

  //
  // 4) Fallback (safe default)
  //
  return "http://localhost:3001";
}
