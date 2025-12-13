// components/UnmarkedAttendanceModal.js

import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../stores/useStore";
import { useThemeColors } from "../theme/theme";

export default function UnmarkedAttendanceModal({ visible, onClose, navigation }) {
  const colors = useThemeColors();
  const timetable = useStore((s) => s.timetable);
  const attendanceMarks = useStore((s) => s.attendanceMarks);
  const generateSlotId = useStore((s) => s.generateSlotId);

  const [hasUnmarked, setHasUnmarked] = useState(false);

  useEffect(() => {
    if (!timetable || !visible) return;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][yesterday.getDay()];
    
    if (yesterdayDayName === "Saturday" || yesterdayDayName === "Sunday") {
      setHasUnmarked(false);
      return;
    }
    
    const yesterdayEvents = timetable[yesterdayDayName] || [];
    if (yesterdayEvents.length === 0) {
      setHasUnmarked(false);
      return;
    }
    
    // Generate slotId with yesterday's date
    const yesterdayDateStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    const unmarked = yesterdayEvents.some((evt, idx) => {
      const slotId = `${yesterdayDateStr}-${evt.courseCode}-${evt.slot}-${yesterdayDayName}-${idx}`;
      return !attendanceMarks[slotId];
    });
    
    setHasUnmarked(unmarked);
  }, [timetable, attendanceMarks, visible, generateSlotId]);

  const handleMarkNow = () => {
    onClose();
    // User can manually navigate to timetable to mark attendance
  };

  if (!hasUnmarked) {
    return null;
  }

  return (
    <Modal
      visible={visible && hasUnmarked}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.card }]}>
          <Ionicons
            name="alert-circle"
            size={48}
            color={colors.accent}
            style={styles.icon}
          />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Unmarked Attendance
          </Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            You have unmarked attendance from yesterday. Update now?
          </Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.skipButton, { borderColor: colors.border }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
                Skip
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.markButton, { backgroundColor: colors.accent }]}
              onPress={handleMarkNow}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark" size={18} color="#FFF" />
              <Text style={[styles.buttonText, { color: "#FFF" }]}>
                Mark Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 6,
  },
  skipButton: {
    borderWidth: 1,
  },
  markButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

