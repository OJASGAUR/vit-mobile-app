// components/ProfilePanel.js

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useThemeColors } from "../theme/theme";
import { useStore } from "../stores/useStore";
import UserAvatar from "./UserAvatar";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const PANEL_WIDTH = width * 0.85;

export default function ProfilePanel({ visible, onClose }) {
  const colors = useThemeColors();
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const navigation = useNavigation();
  const slideAnim = React.useRef(new Animated.Value(PANEL_WIDTH)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: PANEL_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleMenuItem = (screen) => {
    onClose();
    setTimeout(() => {
      if (screen === "Account") {
        navigation.navigate("Account");
      } else if (screen === "Subscription") {
        navigation.navigate("Subscription");
      } else if (screen === "Upload") {
        navigation.navigate("Upload");
      } else if (screen === "UploadAttendance") {
        navigation.navigate("UploadAttendance");
      }
    }, 300);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            onClose();
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: "person-outline",
      label: "Account",
      screen: "Account",
    },
    {
      icon: "star-outline",
      label: "Subscription",
      screen: "Subscription",
    },
    {
      icon: "cloud-upload-outline",
      label: "Upload Timetable",
      screen: "Upload",
    },
    {
      icon: "document-text-outline",
      label: "Upload Attendance",
      screen: "UploadAttendance",
    },
    {
      icon: "log-out-outline",
      label: "Logout",
      action: handleLogout,
      destructive: true,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: opacityAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            {
              backgroundColor: colors.card,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <UserAvatar size={80} />
              <Text style={[styles.userName, { color: colors.textPrimary }]}>
                {user?.name || "User"}
              </Text>
              <Text style={[styles.userRegNo, { color: colors.textSecondary }]}>
                {user?.regNo || ""}
              </Text>
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    {
                      backgroundColor: colors.background,
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      handleMenuItem(item.screen);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons
                      name={item.icon}
                      size={24}
                      color={item.destructive ? "#EF4444" : colors.textPrimary}
                    />
                    <Text
                      style={[
                        styles.menuItemText,
                        {
                          color: item.destructive ? "#EF4444" : colors.textPrimary,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  panel: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    ...Platform.select({
      android: {
        elevation: 10,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 4,
  },
  userRegNo: {
    fontSize: 14,
  },
  menuSection: {
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

