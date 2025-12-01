import * as FileSystem from 'expo-file-system';
import getBackendUrl from './backend';

const BASE_URL = getBackendUrl();

// Simple GET requests (working already)
export async function ping() {
  console.log('[api] ping ->', BASE_URL + '/ping');
  const r = await fetch(BASE_URL + '/ping');
  return r.json();
}

export async function saveTimetable(token, timetable) {
  console.log('[api] saveTimetable ->', BASE_URL + '/api/save-timetable');

  const resp = await fetch(BASE_URL + '/api/save-timetable', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ timetable }),
  });

  return resp.json();
}

export async function loadTimetable(token) {
  console.log('[api] loadTimetable ->', BASE_URL + '/api/load-timetable');

  const resp = await fetch(BASE_URL + '/api/load-timetable', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  return resp.json();
}

// ---------------------------------------------------------
// FULLY FIXED UPLOAD — Expo + Android + Multer compatible
// NO BLOB, NO DATA URL, NO axios
// ---------------------------------------------------------
export async function uploadImageAsync(image) {
  const backend = BASE_URL;
  console.log('[api] uploadImageAsync backend =', backend);
  console.log('[api] image =', image);

  try {
    const uri = image.uri;
    const filename = image.fileName || uri.split('/').pop() || 'upload.jpg';

    // Try to detect image type
    const match = /\.(\w+)$/.exec(filename);
    const type = image.mimeType || (match ? `image/${match[1]}` : 'image/jpeg');

    console.log('[api] form-data:', { uri, filename, type });

    // Proper FormData
    const form = new FormData();
    form.append('image', {
      uri,
      name: filename,
      type,
    });

    const resp = await fetch(backend + '/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
      body: form,
    });

    const text = await resp.text();
    console.log('[api] upload response status =', resp.status, 'content:', text);

    if (!resp.ok) {
      let msg = `Upload failed: ${resp.status}`;
      try {
        const json = JSON.parse(text);
        if (json.error) msg = json.error;
      } catch {}
      throw new Error(msg);
    }

    return JSON.parse(text);
  } catch (err) {
    console.error('[api] uploadImageAsync error:', err);
    throw new Error('Network request failed');
  }
}

export default {
  ping,
  saveTimetable,
  loadTimetable,
  uploadImageAsync,
};
