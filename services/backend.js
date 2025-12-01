import { Platform } from 'react-native';
import Constants from 'expo-constants';

export default function getBackendUrl() {
  // 1. Allow overriding for debugging
  if (global && global.__BACKEND_URL__) {
    console.log('[backend] override:', global.__BACKEND_URL__);
    return global.__BACKEND_URL__;
  }

  // 2. Use expo extra BACKEND_URL (correct for real devices + APK)
  try {
    const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra;
    if (extra?.BACKEND_URL) {
      return extra.BACKEND_URL;
    }
  } catch (e) {}

  // 3. Fallbacks for development only
  if (Platform.OS === 'android') return 'http://10.0.2.2:3001';
  if (Platform.OS === 'ios') return 'http://localhost:3001';

  return 'http://10.0.2.2:3001';
}
