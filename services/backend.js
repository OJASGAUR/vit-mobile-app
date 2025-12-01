import { Platform } from 'react-native';
import Constants from 'expo-constants';

export default function getBackendUrl() {
  // 1. Allow overriding via global for debugging
  if (global && global.__BACKEND_URL__) {
    console.log('[backend] using global override:', global.__BACKEND_URL__);
    return global.__BACKEND_URL__;
  }

  // 2. expo-constants (if provided)
  try {
    const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra;
    if (extra?.BACKEND_URL) {
      console.log('[backend] using expo extra BACKEND_URL:', extra.BACKEND_URL);
      return extra.BACKEND_URL;
    }
  } catch (e) {}

  // 3. Automatic device detection
  if (Platform.OS === 'android') {
    // Android emulator mapping
    return 'http://10.0.2.2:3001';
  }

  if (Platform.OS === 'ios') {
    return 'http://localhost:3001';
  }

  return 'http://10.0.2.2:3001';
}
