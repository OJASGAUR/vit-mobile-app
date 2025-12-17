import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveAppState(state) {
  try {
    await AsyncStorage.setItem(
      "vitwise-storage",
      JSON.stringify({
        timetable: state.timetable,
        uploadsRemaining: state.uploadsRemaining,
        subscriptionCode: state.subscriptionCode,
        darkMode: state.darkMode,
        user: state.user,
        friends: state.friends,
        friendRequests: state.friendRequests,
        attendance: state.attendance || {},
        attendanceMarks: state.attendanceMarks || {},
        attendanceUploadDate: state.attendanceUploadDate || null,
      })
    );
  } catch (err) {
    console.error("saveAppState error:", err);
  }
}

export async function loadAppState() {
  try {
    const json = await AsyncStorage.getItem("vitwise-storage");
    const saved = json ? JSON.parse(json) : null;
    if (saved) {
      saved.attendance = saved.attendance || {};
      saved.attendanceMarks = saved.attendanceMarks || {};
      saved.attendanceUploadDate = saved.attendanceUploadDate || null;
    }
    return saved;
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