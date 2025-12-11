import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveAppState(state) {
  try {
    await AsyncStorage.setItem("vitwise-storage", JSON.stringify(state));
  } catch (err) {
    console.error("saveAppState error:", err);
  }
}

export async function loadAppState() {
  try {
    const json = await AsyncStorage.getItem("vitwise-storage");
    return json ? JSON.parse(json) : null;
  } catch (err) {
    console.error("loadAppState error:", err);
    return null;
  }
}

export async function clearAppState() {
  try {
    await AsyncStorage.removeItem("vitwise-storage");
  } catch (err) {
    console.error("clearAppState error:", err);
  }
}

export async function saveUserData(userData) {
  try {
    await AsyncStorage.setItem("vitwise-user", JSON.stringify(userData));
  } catch (err) {
    console.error("saveUserData error:", err);
  }
}

export async function loadUserData() {
  try {
    const json = await AsyncStorage.getItem("vitwise-user");
    return json ? JSON.parse(json) : null;
  } catch (err) {
    console.error("loadUserData error:", err);
    return null;
  }
}

export async function clearUserData() {
  try {
    await AsyncStorage.removeItem("vitwise-user");
  } catch (err) {
    console.error("clearUserData error:", err);
  }
}