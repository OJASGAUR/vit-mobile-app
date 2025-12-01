import Constants from 'expo-constants';
import { Platform } from 'react-native';

export default function getBackendUrl() {
  const extra = Constants?.expoConfig?.extra;

  if (extra?.BACKEND_URL) {
    return extra.BACKEND_URL;
  }

  // fallback for local dev
  if (Platform.OS === "android") return "http://10.0.2.2:3001";
  if (Platform.OS === "ios") return "http://localhost:3001";

  return "http://10.0.2.2:3001";
}
