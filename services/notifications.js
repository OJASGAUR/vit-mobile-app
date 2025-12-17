import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleAttendanceReminder(lastClassEndTime) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  const triggerTime = new Date(lastClassEndTime.getTime() + 5 * 60 * 1000);
  
  if (triggerTime > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Mark Attendance",
        body: "Don't forget to mark today's attendance.",
        sound: true,
      },
      trigger: triggerTime,
    });
  }
}

export async function cancelReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

