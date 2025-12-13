// screens/UploadScreen.js

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { uploadTextAsync } from "../services/api";
import { useStore } from "../stores/useStore";
import { useThemeColors } from "../theme/theme";
import TopAppBar from "../components/TopAppBar";
import ProfilePanel from "../components/ProfilePanel";

const { width, height } = Dimensions.get('window');

export default function UploadScreen({ navigation }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const textInputRef = useRef(null);
  
  const setTimetable = useStore((s) => s.setTimetable);
  const uploadsRemaining = useStore((s) => s.uploadsRemaining);
  const setUploadsRemaining = useStore((s) => s.setUploadsRemaining);
  const darkMode = useStore((s) => s.darkMode);
  
  const colors = useThemeColors();

  const handleAvatarPress = React.useCallback(() => {
    setProfilePanelVisible(true);
  }, []);

  const handleSubmit = async () => {
    if (!text.trim()) {
      Alert.alert("Error", "Paste your timetable text first");
      return;
    }

    if (uploadsRemaining <= 0) {
      Alert.alert("Limit reached", "No uploads remaining");
      return;
    }

    try {
      setLoading(true);

      const result = await uploadTextAsync(text);

      // Validate timetable exists and has data
      if (!result || !result.timetable) {
        throw new Error("No timetable data received from server");
      }

      // Check if timetable has any classes
      const timetable = result.timetable;
      const hasClasses = Object.values(timetable).some(day => Array.isArray(day) && day.length > 0);
      
      if (!hasClasses) {
        throw new Error("Timetable appears to be empty. Please check your input.");
      }

      await setTimetable(timetable);
      await setUploadsRemaining(uploadsRemaining - 1);

      // Verify timetable was set correctly by reading from store
      const { timetable: storedTimetable } = useStore.getState();
      console.log("[UploadScreen] Timetable set, stored timetable:", storedTimetable ? "exists" : "missing");
      
      if (!storedTimetable) {
        throw new Error("Failed to save timetable. Please try again.");
      }

      // Verify stored timetable has classes (already validated before setting, but double-check)
      const storedHasClasses = Object.values(storedTimetable).some(day => Array.isArray(day) && day.length > 0);
      console.log("[UploadScreen] Stored timetable has classes:", storedHasClasses);

      // Wait for state to propagate and AppContent to re-render
      // Use multiple animation frames to ensure React has fully processed the update
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 300);
          });
        });
      });

      // Show success message
      Alert.alert(
        "Success", 
        "Timetable Generated Successfully",
        [
          { 
            text: "OK",
            onPress: () => {
              // Force a check after alert dismisses
              // The app should automatically switch, but if it doesn't, 
              // the user can reload (R) or the next render will catch it
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to parse");
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (newText) => {
    setText(newText);
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <TopAppBar
        title="Upload Timetable"
        onAvatarPress={handleAvatarPress}
        showBackButton={navigation.canGoBack()}
        onBackPress={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Main Content Area */}
            <View style={styles.mainContent}>
              
              {/* Instructions Card - Now at the very top */}
              <View style={[styles.instructionsCard, { 
                backgroundColor: darkMode ? '#1E293B' : colors.card,
                borderColor: darkMode ? 'rgba(255,255,255,0.15)' : colors.border,
                marginTop: 16, // Added margin to separate from top edge
              }]}>
                <View style={styles.instructionsContainer}>
                  {/* Point 1 */}
                  <View style={styles.instructionRow}>
                    <View style={[styles.numberBadge, { backgroundColor: colors.accent }]}>
                      <Text style={styles.numberText}>1</Text>
                    </View>
                    <Text style={[styles.instruction, { color: colors.textPrimary }]}>
                      Open VTOP in desktop mode
                    </Text>
                  </View>

                  {/* Point 2 */}
                  <View style={styles.instructionRow}>
                    <View style={[styles.numberBadge, { backgroundColor: colors.accent }]}>
                      <Text style={styles.numberText}>2</Text>
                    </View>
                    <Text style={[styles.instruction, { color: colors.textPrimary }]}>
                      Click Academics and Open timetable
                    </Text>
                  </View>

                  {/* Point 3 */}
                  <View style={styles.instructionRow}>
                    <View style={[styles.numberBadge, { backgroundColor: colors.accent }]}>
                      <Text style={styles.numberText}>3</Text>
                    </View>
                    <Text style={[styles.instruction, { color: colors.textPrimary }]}>
                      Copy the entire course list from Sl.No to Registered and Approved
                    </Text>
                  </View>

                  {/* Point 4 */}
                  <View style={styles.instructionRow}>
                    <View style={[styles.numberBadge, { backgroundColor: colors.accent }]}>
                      <Text style={styles.numberText}>4</Text>
                    </View>
                    <Text style={[styles.instruction, { color: colors.textPrimary }]}>
                      Paste it below
                    </Text>
                  </View>
                </View>
              </View>

              {/* Fixed Height Text Input */}
              <View style={[styles.inputContainer, { 
                borderColor: darkMode ? 'rgba(255,255,255,0.2)' : colors.border,
                backgroundColor: darkMode ? '#1E293B' : colors.card
              }]}>
                <ScrollView
                  ref={textInputRef}
                  style={styles.textScrollView}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                  removeClippedSubviews={true}
                  scrollEventThrottle={16}
                  onContentSizeChange={() => {
                    if (textInputRef.current) {
                      textInputRef.current.scrollToEnd({ animated: true });
                    }
                  }}
                >
                  <TextInput
                    value={text}
                    onChangeText={handleTextChange}
                    placeholder="Paste copied text here..."
                    placeholderTextColor={darkMode ? '#64748B' : colors.textSecondary}
                    style={[
                      styles.textInput,
                      { 
                        color: colors.textPrimary,
                      }
                    ]}
                    multiline
                    textAlignVertical="top"
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    scrollEnabled={true}
                  />
                </ScrollView>
              </View>
            </View>

            {/* Fixed Bottom Section */}
            <View style={[styles.bottomSection, { 
              backgroundColor: darkMode ? '#0F172A' : '#FFFFFF',
              borderTopColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
            }]}>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[
                  styles.actionButton, 
                  loading && { opacity: 0.6 },
                  { 
                    backgroundColor: colors.accent,
                    shadowColor: darkMode ? '#000' : colors.accent,
                    shadowOpacity: darkMode ? 0.3 : 0.2,
                  }
                ]}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={[styles.actionButtonText, {
                  textShadowColor: darkMode ? 'rgba(0,0,0,0.3)' : 'transparent',
                  textShadowOffset: darkMode ? { width: 0, height: 1 } : { width: 0, height: 0 },
                  textShadowRadius: darkMode ? 1 : 0
                }]}>
                  {loading ? "Processing..." : "Generate Timetable"}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.uploadInfo}>
                <Text style={[styles.uploadText, { 
                  color: darkMode ? '#94A3B8' : colors.textSecondary
                }]}>
                  Uploads remaining: 
                  <Text style={[styles.uploadCount, { color: colors.accent }]}>
                    {` ${uploadsRemaining}`}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
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
  safe: { 
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: { 
    flex: 1,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 120, // Removed paddingTop since no header
  },
  
  // Instructions Card - Now at the top
  instructionsCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionsContainer: {
    gap: 14,
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  numberText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  instruction: {
    fontSize: 14.5,
    lineHeight: 20,
    flex: 1,
    fontWeight: "500",
  },
  
  // Fixed Height Text Input
  inputContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
    minHeight: 220,
    maxHeight: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textScrollView: {
    flex: 1,
  },
  textInput: {
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: "top",
    padding: 16,
    minHeight: 220,
  },
  
  // Fixed Bottom Section
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  uploadInfo: {
    alignItems: "center",
    marginTop: 10,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: "500",
  },
  uploadCount: {
    fontWeight: "700",
  },
});