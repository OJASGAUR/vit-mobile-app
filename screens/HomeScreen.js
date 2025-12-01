// vit-mobile-app/screens/HomeScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageAsync } from '../services/api';
import getBackendUrl from '../services/backend';
import { useStore } from '../stores/useStore';
import TimetableGrid from '../components/TimetableGrid';
import { addLocalTimetable, setDefaultTimetableId } from '../services/storage';

export default function HomeScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [pickedInfo, setPickedInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const setTimetable = useStore(s => s.setTimetable);
  const setDefaultId = useStore(s => s.setDefaultTimetableId);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission required', 'Please allow photo access in settings.');

    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    const normalized = { ...res };
    if ('cancelled' in normalized && !('canceled' in normalized)) {
      normalized.canceled = normalized.cancelled;
      try { delete normalized.cancelled } catch (e) {}
    }
    console.log('[Home] ImagePicker assetCount=', (normalized.assets || []).length, 'canceled=', normalized.canceled);
    if (normalized.canceled) return;
    const asset = normalized.assets && normalized.assets[0];
    if (!asset) return Alert.alert('No image selected');

    setImage(asset.uri);
    setPickedInfo({ uri: asset.uri, fileName: asset.fileName || asset.uri.split('/').pop(), type: asset.type || asset.mimeType || 'image/jpeg' });
  }

  async function send() {
    if (!pickedInfo && !image) return Alert.alert('Choose an image first');
    setLoading(true);
    try {
      const backendUrl = getBackendUrl();
      console.log('[Home] sending to backend:', backendUrl);
      const data = await uploadImageAsync(pickedInfo || { uri: image });
      console.log('[Home] upload result', data);
      if (data.warnings) setWarnings(data.warnings || []);
      setTimetable(data.timetable);

      // Save locally and make this the default (so user doesn't need to upload again)
      const item = { createdAt: Date.now(), timetable: data.timetable };
      const { index } = await addLocalTimetable(item);
      await setDefaultTimetableId(index);     // persisted in AsyncStorage
      setDefaultId(index);                    // update zustand
      // navigate to Timetable screen
      navigation.navigate('Timetable');
    } catch (e) {
      console.error('[Home] upload error', e);
      Alert.alert('Upload failed', e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Vitwise — Mobile</Text>
      <Text style={styles.subtitle}>Upload a timetable screenshot to extract courses</Text>

      <TouchableOpacity style={styles.pick} onPress={pickImage}>
        {image ? <Image source={{ uri: image }} style={styles.preview} /> : <Text style={styles.pickText}>Pick image</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#444' }]} onPress={() => Alert.alert('Backend', getBackendUrl())}>
        <Text style={{ color: '#fff' }}>Show Backend URL</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={send} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Upload & Generate</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondary} onPress={() => navigation.navigate('Saved')}>
        <Text style={styles.secondaryText}>View Saved Timetables</Text>
      </TouchableOpacity>

      <View style={{ width: '100%', marginTop: 18 }}>
        <Text style={{ fontWeight: '700', marginBottom: 8 }}>Preview</Text>
        <TimetableGrid compact />
      </View>

      {warnings.length > 0 && (
        <View style={styles.warnings}>
          <Text style={{ fontWeight: '700' }}>Warnings</Text>
          {warnings.map((w, i) => <Text key={i}>{w.type}: {w.slot || ''} {w.course || ''}</Text>)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 20, gap: 12, backgroundColor: 'transparent' },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  subtitle: { color: '#9fb6d6', marginBottom: 12 },
  pick: { width: '100%', height: 220, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pickText: { color: '#9fb6d6' },
  preview: { width: '100%', height: '100%', resizeMode: 'cover' },
  button: { marginTop: 12, backgroundColor: '#0066ff', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '700' },
  secondary: { marginTop: 8 },
  secondaryText: { color: '#66b0ff' },
  warnings: { width: '100%', marginTop: 12, padding: 12, backgroundColor: 'rgba(255,230,230,0.04)', borderRadius: 8 }
});
