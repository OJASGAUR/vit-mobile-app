import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { loadLocalTimetables, removeLocalTimetable } from '../services/storage';
import { useStore } from '../stores/useStore';

export default function SavedScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const setTimetable = useStore(s => s.setTimetable);

  useEffect(() => {
    (async () => { const list = await loadLocalTimetables(); setItems(list); })();
  }, []);

  async function del(i) {
    const remaining = await removeLocalTimetable(i);
    setItems(remaining);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Saved Timetables</Text></View>
      <FlatList data={items} keyExtractor={(_, i) => String(i)} renderItem={({ item, index }) => (
        <View style={styles.card}>
          <Text style={{ fontWeight: '700' }}>{new Date(item.createdAt).toLocaleString()}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TouchableOpacity style={styles.action} onPress={() => { setTimetable(item.timetable); navigation.navigate('Timetable') }}><Text>Open</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionDanger} onPress={() => del(index)}><Text style={{ color: '#fff' }}>Delete</Text></TouchableOpacity>
          </View>
        </View>
      )} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  header: { paddingBottom: 8 },
  title: { fontSize: 18, fontWeight: '800' },
  card: { padding: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 10 },
  action: { padding: 8, borderRadius: 8, backgroundColor: 'rgba(0,102,255,0.08)' },
  actionDanger: { padding: 8, borderRadius: 8, backgroundColor: '#ff4d4f' }
});
