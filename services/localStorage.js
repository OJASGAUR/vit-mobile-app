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
