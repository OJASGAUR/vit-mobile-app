// vit-mobile-app/components/TimetableGrid.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function EventCard({ event }) {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.code}>{event.courseCode}</Text>
        <View style={styles.pill}><Text style={styles.pillText}>{event.slot || ''}</Text></View>
      </View>
      <Text style={styles.name} numberOfLines={2}>{event.courseName}</Text>
      <Text style={styles.meta}>{event.start} - {event.end} • {event.venue || 'NIL'}</Text>
    </View>
  );
}

export default function TimetableGrid({ timetable = {}, weekView = false, singleDay = false, day }) {
  // singleDay: render one selected day vertically (no flexGrow forcing)
  if (singleDay) {
    const dayName = day || 'Monday';
    const events = timetable[dayName] || [];
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {events.length === 0 ? (<Text style={styles.emptyLarge}>No classes</Text>) : (
          events.map((ev, i) => <EventCard key={`${ev.courseCode}-${i}`} event={ev} />)
        )}
      </ScrollView>
    );
  }

  // weekView: horizontal columns, each column scrolls vertically
  if (weekView) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 6 }}>
        {DAYS.map(d => (
          <View key={d} style={styles.col}>
            <Text style={styles.colTitle}>{d.slice(0,3)}</Text>
            <ScrollView style={styles.colBody} contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}>
              {(timetable[d] || []).length === 0 ? (
                <Text style={styles.empty}>—</Text>
              ) : (
                (timetable[d] || []).map((ev, i) => <EventCard key={`${d}-${i}`} event={ev} />)
              )}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    );
  }

  // compact default: two columns overview
  return (
    <View style={styles.gridWrap}>
      {DAYS.map(d => (
        <View key={d} style={styles.gridCol}>
          <Text style={styles.dayTitle}>{d.slice(0,3)}</Text>
          <View style={styles.dayBody}>
            {(timetable[d] || []).slice(0, 4).map((ev, i) => <EventCard key={`${d}-${i}`} event={ev} />)}
            {(timetable[d] || []).length === 0 && <Text style={styles.empty}>—</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}

const W = Dimensions.get('window').width;
const colW = Math.min(300, Math.floor(W * 0.72));

const styles = StyleSheet.create({
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingTop: 8 },
  gridCol: { width: '48%', marginBottom: 12 },
  dayTitle: { fontWeight: '800', color: '#fff', marginBottom: 8 },
  dayBody: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 12, minHeight: 80 },

  col: { width: colW, marginRight: 12 },
  colTitle: { fontWeight: '900', color: '#fff', marginBottom: 8 },
  colBody: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 12, minHeight: 100 },

  card: {
    backgroundColor: 'rgba(7,20,30,0.95)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(0,122,255,0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },
  code: { fontWeight: '900', color: '#d7f0ff', fontSize: 12 },
  name: { marginTop: 6, color: '#eaf4ff', fontSize: 15, fontWeight: '800' },
  meta: { marginTop: 8, color: '#b7d6ef', fontSize: 12 },

  pill: { backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pillText: { color: '#dbefff', fontWeight: '700' },

  empty: { color: '#99aab3' },
  emptyLarge: { color: '#99aab3', padding: 24, textAlign: 'center' }
});
