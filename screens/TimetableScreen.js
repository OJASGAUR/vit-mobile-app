// vit-mobile-app/screens/TimetableScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../stores/useStore';
import TimetableGrid from '../components/TimetableGrid';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function TimetableScreen({ navigation }) {
  const timetable = useStore(s => s.timetable);
  const currentDay = useStore(s => s.currentDay);
  const setCurrentDay = useStore(s => s.setCurrentDay);
  const weekView = useStore(s => s.weekView);
  const toggleWeekView = useStore(s => s.toggleWeekView);

  if (!timetable) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex:1, padding: 24 }}>
          <Text style={{ color: '#fff' }}>No timetable loaded. Go to Home to upload.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top","left","right","bottom"]}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.link}>Back</Text></TouchableOpacity>
          <Text style={styles.title}>Schedule</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Saved')}><Text style={styles.link}>Saved</Text></TouchableOpacity>
        </View>

        {/* Day tabs */}
        <View style={styles.tabsWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {DAYS.map(d => {
              const active = currentDay === d;
              return (
                <TouchableOpacity key={d} onPress={() => setCurrentDay(d)} style={[styles.tab, active && styles.tabActive]}>
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{d.slice(0,3)}</Text>
                  {active && <View style={styles.activeDot} />}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity onPress={toggleWeekView} style={styles.viewToggle}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>{weekView ? 'Week' : 'Day'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.bodyWrap}>
          {weekView ? (
            <TimetableGrid timetable={timetable} weekView />
          ) : (
            <TimetableGrid timetable={timetable} singleDay day={currentDay} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#06121a' },
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6 },
  title: { fontSize: 26, fontWeight: '900', color: '#fff' },
  link: { color: '#66b0ff', fontWeight: '700' },

  tabsWrap: { borderBottomColor: 'rgba(255,255,255,0.03)', borderBottomWidth: 1 },
  tabsScroll: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, alignItems: 'center' },
  tabActive: { /* no extra background; underline + dot used */ },
  tabText: { color: '#9fb6d6', fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  activeDot: { width: 8, height: 8, borderRadius: 8, backgroundColor: '#1e90ff', marginTop: 6 },

  viewToggle: { marginLeft: 8, backgroundColor: '#1e90ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },

  bodyWrap: { flex: 1, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12 }
});
