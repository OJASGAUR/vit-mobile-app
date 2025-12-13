// components/BaselineAttendanceModal.js

import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../stores/useStore";
import { useThemeColors } from "../theme/theme";

export default function BaselineAttendanceModal({ visible, subjects, onComplete, onCancel }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalClasses, setTotalClasses] = useState("");
  const [values, setValues] = useState({});
  
  const colors = useThemeColors();
  const initializeAttendanceForSubject = useStore((s) => s.initializeAttendanceForSubject);

  const currentSubject = subjects[currentIndex];

  const handleSave = async () => {
    const total = parseInt(totalClasses);
    
    if (!totalClasses.trim() || isNaN(total) || total < 0) {
      Alert.alert("Error", "Please enter a valid number of total classes");
      return;
    }

    const percentage = currentSubject.percentage;
    const attended = Math.round((percentage / 100) * total);
    const missed = total - attended;

    // Save to store
    await initializeAttendanceForSubject(
      currentSubject.code,
      currentSubject.type,
      attended,
      missed
    );

    // Store values for this subject
    setValues({
      ...values,
      [currentSubject.code]: { total, attended, missed },
    });

    // Move to next or complete
    if (currentIndex < subjects.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTotalClasses("");
    } else {
      onComplete();
    }
  };

  const handleSkip = async () => {
    // Set baseline to 0
    await initializeAttendanceForSubject(
      currentSubject.code,
      currentSubject.type,
      0,
      0
    );

    setValues({
      ...values,
      [currentSubject.code]: { total: 0, attended: 0, missed: 0 },
    });

    // Move to next or complete
    if (currentIndex < subjects.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTotalClasses("");
    } else {
      onComplete();
    }
  };

  if (!visible || !currentSubject) return null;

  const percentage = currentSubject.percentage;
  const total = parseInt(totalClasses) || 0;
  const calculatedAttended = total > 0 ? Math.round((percentage / 100) * total) : 0;
  const calculatedMissed = total - calculatedAttended;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Baseline Attendance
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {currentIndex + 1} of {subjects.length}
            </Text>
          </View>

          <View style={styles.content}>
            <Text style={[styles.courseLabel, { color: colors.textSecondary }]}>
              Course:
            </Text>
            <Text style={[styles.courseName, { color: colors.textPrimary }]}>
              {currentSubject.name} ({currentSubject.type})
            </Text>
            <Text style={[styles.courseCode, { color: colors.textSecondary }]}>
              {currentSubject.code}
            </Text>

            <View style={[styles.percentageBadge, { backgroundColor: `${colors.accent}15` }]}>
              <Text style={[styles.percentageText, { color: colors.accent }]}>
                VTOP Attendance: {currentSubject.percentage}%
              </Text>
            </View>

            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                Enter total classes conducted:
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                value={totalClasses}
                onChangeText={setTotalClasses}
                keyboardType="number-pad"
              />
            </View>

            {total > 0 && (
              <View style={styles.calculationSection}>
                <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>
                  Auto-calculated:
                </Text>
                <View style={styles.calcRow}>
                  <Text style={[styles.calcText, { color: "#10B981" }]}>
                    Attended: {calculatedAttended}
                  </Text>
                  <Text style={[styles.calcText, { color: "#EF4444" }]}>
                    Missed: {calculatedMissed}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.skipButton, { borderColor: colors.border }]}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
                Skip
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.accent }]}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, { color: "#FFF" }]}>
                {currentIndex < subjects.length - 1 ? "Save & Next" : "Save & Finish"}
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
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  content: {
    marginBottom: 24,
  },
  courseLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  courseName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 14,
    marginBottom: 16,
  },
  percentageBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  percentageText: {
    fontSize: 16,
    fontWeight: "700",
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  calculationSection: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  calcLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 8,
  },
  calcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  calcText: {
    fontSize: 14,
    fontWeight: "600",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButton: {
    borderWidth: 1,
  },
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

