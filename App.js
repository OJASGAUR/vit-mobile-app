// App.js
import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import TimetableScreen from './screens/TimetableScreen';
import SavedScreen from './screens/SavedScreen';
import { useStore } from './stores/useStore';
import { ThemeProvider } from './theme/theme';
import { loadDefaultTimetable, getDefaultTimetableId } from './services/storage';

const Stack = createNativeStackNavigator();

export default function App() {
  const dark = useStore(s => s.darkMode);
  const setTimetable = useStore(s => s.setTimetable);
  const setDefaultId = useStore(s => s.setDefaultTimetableId);

  useEffect(() => {
    (async () => {
      try {
        const id = await getDefaultTimetableId();
        setDefaultId(id);
        if (!id) return;
        const t = await loadDefaultTimetable();
        if (t) setTimetable(t);
      } catch (e) {
        console.warn('Auto-load default timetable failed', e.message);
      }
    })();
  }, []);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer theme={dark ? DarkTheme : DefaultTheme}>
          <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
          <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Timetable" component={TimetableScreen} />
            <Stack.Screen name="Saved" component={SavedScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
