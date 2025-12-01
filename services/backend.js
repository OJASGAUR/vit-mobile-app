import Constants from "expo-constants";

export default function getBackendUrl() {
  // 1. Read from app.json → extra.BACKEND_URL (this is what works in production)
  const extra = Constants?.expoConfig?.extra;
  if (extra?.BACKEND_URL) {
    console.log("[backend] using production BACKEND_URL:", extra.BACKEND_URL);
    return extra.BACKEND_URL;
  }

  // 2. Fallback for local tests
  return "http://10.0.2.2:3001";  // Android emulator fallback
}
