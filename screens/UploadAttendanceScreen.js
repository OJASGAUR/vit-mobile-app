// screens/UploadAttendanceScreen.js

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../stores/useStore";
import { useThemeColors } from "../theme/theme";
import TopAppBar from "../components/TopAppBar";
import ProfilePanel from "../components/ProfilePanel";

export default function UploadAttendanceScreen({ navigation }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const initializeAttendanceForSubject = useStore((s) => s.initializeAttendanceForSubject);
  const textInputRef = useRef(null);
  
  const colors = useThemeColors();
  const darkMode = useStore((s) => s.darkMode);

  const handleAvatarPress = () => {
    setProfilePanelVisible(true);
  };

  // Map type description to attendance type code
  const mapTypeDescription = (typeDesc) => {
    if (!typeDesc) return "ETH"; // Default
    const upper = typeDesc.toUpperCase().trim();
    
    // Check for exact matches first
    if (upper === "ETH" || upper === "ELA" || upper === "TH") {
      return upper;
    }
    
    // Check for embedded theory
    if (upper.includes("EMBEDDED THEORY") || 
        (upper.includes("THEORY") && !upper.includes("ONLY"))) {
      return "ETH";
    }
    
    // Check for embedded lab
    if (upper.includes("EMBEDDED LAB") || 
        (upper.includes("LAB") && !upper.includes("THEORY"))) {
      return "ELA";
    }
    
    // Check for theory only
    if (upper.includes("THEORY ONLY")) {
      return "TH";
    }
    
    return "ETH"; // Default to ETH
  };

  // Parse VTOP attendance table (10-column format only)
  const parseAttendanceText = (rawText) => {
    if (!rawText || !rawText.trim()) {
      return [];
    }

    const lines = rawText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    // Headers to ignore
    const headerKeywords = [
      "Sl.No.", "Class Group", "Course Detail", "Class Detail", "Faculty Detail",
      "Attended Classes/Days", "Total Classes", "Attendance Percentage", 
      "Debar Status", "Attendance Detail", "CURRENT", "REGISTRATION", "WINSEM", 
      "#", "Remarks", "Attendance", "Code", "Course", "Type", "Percentage",
      "SEMESTER", "ACADEMIC", "YEAR", "BRANCH", "SECTION", "DETAILS"
    ];

    const results = [];
    const seenEntries = new Set(); // Prevent duplicates (code + type combination)

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Skip header lines - but be more specific
      // Only skip if line looks like a pure header (contains multiple header keywords or is very short)
      const upperLine = line.toUpperCase();
      const headerMatches = headerKeywords.filter(keyword => 
        upperLine.includes(keyword.toUpperCase())
      ).length;
      
      // Skip if it's clearly a header row (has many header keywords and no course codes)
      if (headerMatches >= 3 && !/[A-Z]{2,5}\d{3}/.test(line)) {
        continue;
      }
      
      // Skip if line is just header keywords with no data
      if (headerMatches >= 2 && !/\d+/.test(line)) {
        continue;
      }

      // Try to find course code pattern first (more reliable than splitting)
      // Pattern: "BACSE104 - Course Name - Embedded Theory" or similar
      // Handle both spaces and tabs in the pattern
      const courseCodeMatch = line.match(/([A-Z]{2,5}\d{3})[\s\t]*-[\s\t]*(.+?)[\s\t]*-[\s\t]*(Embedded Theory|Embedded Lab|Theory Only)/);
      
      if (courseCodeMatch) {
        const courseCode = courseCodeMatch[1];
        let courseName = courseCodeMatch[2].trim();
        const typeDescription = courseCodeMatch[3];
        
        // Map type description to code
        const courseType = mapTypeDescription(typeDescription);
        if (!courseType) continue;

        // Try to find the numbers: attended, total, percentage
        // Look for pattern: number number number% (attended, total, percentage)
        // Handle both tabs and spaces: [\s\t]+ matches any whitespace including tabs
        // Try multiple patterns to be robust
        let numbersMatch = line.match(/(\d+)[\s\t]+(\d+)[\s\t]+(\d+(?:\.\d+)?)%/);
        
        // If that doesn't work, try tab-only pattern
        if (!numbersMatch) {
          numbersMatch = line.match(/(\d+)\t+(\d+)\t+(\d+(?:\.\d+)?)%/);
        }
        
        // If still no match, try finding numbers anywhere in the line (more flexible)
        if (!numbersMatch) {
          // Find all number sequences and percentage in the line
          const allNumbers = line.match(/\b(\d+)\b/g);
          const percentageMatch = line.match(/(\d+(?:\.\d+)?)%/);
          
          if (allNumbers && allNumbers.length >= 2 && percentageMatch) {
            // Take the last two numbers before percentage as attended and total
            const attended = parseInt(allNumbers[allNumbers.length - 2]);
            const total = parseInt(allNumbers[allNumbers.length - 1]);
            const percentage = parseFloat(percentageMatch[1]);
            
            if (!isNaN(attended) && !isNaN(total) && !isNaN(percentage) &&
                attended >= 0 && total > 0 && percentage >= 0 && percentage <= 100) {
              
              // Clean course name
              courseName = courseName.replace(/[\s\t]+/g, " ").trim();
              if (courseName && courseName.length >= 3) {
                const missed = total - attended;
                const uniqueKey = `${courseCode}-${courseType}`;
                if (!seenEntries.has(uniqueKey)) {
                  seenEntries.add(uniqueKey);
                  results.push({
                    code: courseCode,
                    name: courseName,
                    type: courseType,
                    percentage: percentage,
                    attended: attended,
                    total: total,
                    missed: missed,
                  });
                  continue; // Successfully parsed, move to next line
                }
              }
            }
          }
          // If we reach here, fallback pattern matching also failed
          // Don't continue here - let it fall through to column splitting below
        }

        // Only proceed if we found numbersMatch
        if (!numbersMatch) continue;

        const attended = parseInt(numbersMatch[1]);
        const total = parseInt(numbersMatch[2]);
        const percentage = parseFloat(numbersMatch[3]);

        // Validate
        if (isNaN(attended) || attended < 0) continue;
        if (isNaN(total) || total <= 0) continue;
        if (isNaN(percentage) || percentage < 0 || percentage > 100) continue;

        // Clean course name
        courseName = courseName.replace(/[\s\t]+/g, " ").trim();
        if (!courseName || courseName.length < 3) continue;

        // Calculate missed
        const missed = total - attended;

        // Create unique key for code + type combination
        const uniqueKey = `${courseCode}-${courseType}`;
        if (seenEntries.has(uniqueKey)) continue;
        seenEntries.add(uniqueKey);

        results.push({
          code: courseCode,
          name: courseName,
          type: courseType,
          percentage: percentage,
          attended: attended,
          total: total,
          missed: missed,
        });
        continue;
      }

      // Fallback: Try tab-separated format (10-column format)
      let parts = line.split(/\t+/).filter(p => p.trim());
      
      // If tabs didn't work, try splitting by multiple spaces (2 or more)
      if (parts.length < 8) {
        parts = line.split(/\s{2,}/).filter(p => p.trim());
      }
      
      // If still not enough, try splitting by any whitespace and filter intelligently
      if (parts.length < 8) {
        // Split by any whitespace, then try to reconstruct columns
        const allParts = line.split(/[\s\t]+/).filter(p => p.trim());
        // If we have enough parts, use them (might work if format is consistent)
        if (allParts.length >= 8) {
          parts = allParts;
        }
      }
      
      if (parts.length >= 8) {
        // 10-column format: Sl.No., Class Group, Course Detail, Class Detail, 
        // Faculty Detail, Attended, Total, Percentage, Debar Status, Attendance Detail
        const rowNum = parts[0]?.trim() || "";
        const courseDetail = parts[2]?.trim() || ""; // Column 2: Course Detail
        const attendedStr = parts[5]?.trim() || ""; // Column 5: Attended Classes/Days
        const totalStr = parts[6]?.trim() || ""; // Column 6: Total Classes
        const percentStr = parts[7]?.trim() || ""; // Column 7: Attendance Percentage

        // Skip if row number is not a number (might be header)
        if (rowNum && !/^\d+$/.test(rowNum)) continue;

        // Parse Course Detail: "BACSE104 - Course Name - Type Description"
        // Handle both spaces and tabs
        const courseDetailMatch = courseDetail.match(/([A-Z]{2,5}\d{3})[\s\t]*-[\s\t]*(.+?)[\s\t]*-[\s\t]*(.+)$/);
        if (!courseDetailMatch) continue;

        const courseCode = courseDetailMatch[1];
        let courseName = courseDetailMatch[2].trim();
        const typeDescription = courseDetailMatch[3].trim();
        
        // Map type description to code
        const courseType = mapTypeDescription(typeDescription);
        if (!courseType) continue;

        // Parse attended classes
        const attended = parseInt(attendedStr);
        if (isNaN(attended) || attended < 0) continue;

        // Parse total classes
        const total = parseInt(totalStr);
        if (isNaN(total) || total <= 0) continue;

        // Parse percentage for validation
        const percentMatch = percentStr.match(/(\d+(\.\d+)?)/);
        if (!percentMatch) continue;
        const percentage = parseFloat(percentMatch[1]);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) continue;

        // Clean course name (handle both spaces and tabs)
        courseName = courseName.replace(/[\s\t]+/g, " ").trim();
        if (!courseName || courseName.length < 3) continue;

        // Calculate missed
        const missed = total - attended;

        // Create unique key for code + type combination
        const uniqueKey = `${courseCode}-${courseType}`;
        if (seenEntries.has(uniqueKey)) continue;
        seenEntries.add(uniqueKey);

        results.push({
          code: courseCode,
          name: courseName,
          type: courseType,
          percentage: percentage,
          attended: attended,
          total: total,
          missed: missed,
        });
        continue;
      }

      // Last resort: Try to find course code anywhere in line and extract numbers
      // This is the most flexible approach - works even with mixed formatting
      const anyCodeMatch = line.match(/([A-Z]{2,5}\d{3})/);
      if (anyCodeMatch) {
        const courseCode = anyCodeMatch[1];
        
        // Try to find the full course detail pattern near the code
        const escapedCode = courseCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const fullPattern = line.match(new RegExp(`${escapedCode}[\\s\\t]*-[\\s\\t]*(.+?)[\\s\\t]*-[\\s\\t]*(Embedded Theory|Embedded Lab|Theory Only)`));
        if (fullPattern) {
          let courseName = fullPattern[1].trim();
          const typeDescription = fullPattern[2];
          const courseType = mapTypeDescription(typeDescription);
          
          if (courseType) {
            // Find numbers: look for pattern like "3 3 100%" or "3\t3\t100%"
            let numbersMatch = line.match(/(\d+)[\s\t]+(\d+)[\s\t]+(\d+(?:\.\d+)?)%/);
            if (!numbersMatch) {
              // Try finding all numbers and percentage separately
              const allNums = line.match(/\b(\d+)\b/g);
              const pctMatch = line.match(/(\d+(?:\.\d+)?)%/);
              if (allNums && allNums.length >= 2 && pctMatch) {
                const attended = parseInt(allNums[allNums.length - 2]);
                const total = parseInt(allNums[allNums.length - 1]);
                const percentage = parseFloat(pctMatch[1]);
                
                if (!isNaN(attended) && !isNaN(total) && !isNaN(percentage) &&
                    attended >= 0 && total > 0 && percentage >= 0 && percentage <= 100) {
                  courseName = courseName.replace(/[\s\t]+/g, " ").trim();
                  if (courseName && courseName.length >= 3) {
                    const missed = total - attended;
                    const uniqueKey = `${courseCode}-${courseType}`;
                    if (!seenEntries.has(uniqueKey)) {
                      seenEntries.add(uniqueKey);
                      results.push({
                        code: courseCode,
                        name: courseName,
                        type: courseType,
                        percentage: percentage,
                        attended: attended,
                        total: total,
                        missed: missed,
                      });
                      continue;
                    }
                  }
                }
              }
            } else {
              const attended = parseInt(numbersMatch[1]);
              const total = parseInt(numbersMatch[2]);
              const percentage = parseFloat(numbersMatch[3]);
              
              if (!isNaN(attended) && !isNaN(total) && !isNaN(percentage) &&
                  attended >= 0 && total > 0 && percentage >= 0 && percentage <= 100) {
                courseName = courseName.replace(/[\s\t]+/g, " ").trim();
                if (courseName && courseName.length >= 3) {
                  const missed = total - attended;
                  const uniqueKey = `${courseCode}-${courseType}`;
                  if (!seenEntries.has(uniqueKey)) {
                    seenEntries.add(uniqueKey);
                    results.push({
                      code: courseCode,
                      name: courseName,
                      type: courseType,
                      percentage: percentage,
                      attended: attended,
                      total: total,
                      missed: missed,
                    });
                    continue;
                  }
                }
              }
            }
          }
        }
      }
    }

    return results;
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      Alert.alert("Error", "Please paste the attendance table first");
      return;
    }

    try {
      setLoading(true);
      const parsed = parseAttendanceText(text);

      if (parsed.length === 0) {
        // Try to provide more helpful error message
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        const hasCourseCode = lines.some(l => /[A-Z]{2,5}\d{3}/.test(l));
        const hasNumbers = lines.some(l => /\d+\s+\d+\s+\d+%/.test(l) || /\d+\t+\d+\t+\d+%/.test(l));
        
        let errorMsg = "Unable to parse attendance. ";
        if (!hasCourseCode) {
          errorMsg += "No course codes found. ";
        }
        if (!hasNumbers) {
          errorMsg += "No attendance numbers found. ";
        }
        errorMsg += "Please ensure you copied the full VTOP table with all 10 columns (including headers).";
        
        Alert.alert("Parse Error", errorMsg);
        setLoading(false);
        return;
      }

      // Validate all parsed subjects
      const invalidSubjects = parsed.filter(subject => 
        !subject.code || !subject.type || 
        subject.attended < 0 || subject.total <= 0 ||
        subject.attended > subject.total
      );

      if (invalidSubjects.length > 0) {
        Alert.alert(
          "Validation Error",
          `Found ${invalidSubjects.length} subject(s) with invalid data. Please check your input.`
        );
        setLoading(false);
        return;
      }

      // Auto-save all subjects
      // Clear all existing data on first subject (isFirstUpload = true)
      let savedCount = 0;
      for (const subject of parsed) {
        try {
          await initializeAttendanceForSubject(
            subject.code,
            subject.type,
            subject.attended,
            subject.missed,
            savedCount === 0 // isFirstUpload = true only for the first subject
          );
          savedCount++;
        } catch (err) {
          console.error(`Error saving ${subject.code}:`, err);
        }
      }

      // Clear input and show success
      setText("");
      Alert.alert(
        "Success",
        `Successfully uploaded attendance for ${savedCount} subject(s)!`,
        [
          { 
            text: "View Attendance", 
            onPress: () => navigation.navigate("Attendance") 
          },
          { text: "OK" }
        ]
      );
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to parse attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopAppBar
        title="Upload Attendance"
        onAvatarPress={handleAvatarPress}
        showBackButton={navigation.canGoBack()}
        onBackPress={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Instructions Card */}
            <View
              style={[
                styles.instructionsCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.instructionRow}>
                <View style={[styles.numberBadge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.numberText}>1</Text>
                </View>
                <Text style={[styles.instructionText, { color: colors.textPrimary }]}>
                  Open VTOP in desktop mode
                </Text>
              </View>
              <View style={styles.instructionRow}>
                <View style={[styles.numberBadge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.numberText}>2</Text>
                </View>
                <Text style={[styles.instructionText, { color: colors.textPrimary }]}>
                  Go to Academics then Class Attendance
                </Text>
              </View>
              <View style={styles.instructionRow}>
                <View style={[styles.numberBadge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.numberText}>3</Text>
                </View>
                <Text style={[styles.instructionText, { color: colors.textPrimary }]}>
                  Copy the entire table from Sl.No. to last
                </Text>
              </View>
              <View style={styles.instructionRow}>
                <View style={[styles.numberBadge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.numberText}>4</Text>
                </View>
                <Text style={[styles.instructionText, { color: colors.textPrimary }]}>
                  Paste it below
                </Text>
              </View>
            </View>

            {/* Text Input */}
            <View style={styles.inputContainer}>
              <TextInput
                ref={textInputRef}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="Paste attendance table here..."
                placeholderTextColor={colors.textSecondary}
                value={text}
                onChangeText={setText}
                multiline
                textAlignVertical="top"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={[
                styles.generateButton,
                {
                  backgroundColor: colors.accent,
                  opacity: loading ? 0.6 : 1,
                },
              ]}
              onPress={handleGenerate}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <Text style={styles.buttonText}>Parsing...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                  <Text style={styles.buttonText}>Generate Attendance</Text>
                </>
              )}
            </TouchableOpacity>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <ProfilePanel
        visible={profilePanelVisible}
        onClose={() => setProfilePanelVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  instructionsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  numberText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  instructionText: {
    fontSize: 15,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    minHeight: 200,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  previewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  previewItem: {
    fontSize: 13,
    marginBottom: 6,
  },
  previewMore: {
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 4,
  },
});

