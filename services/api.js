// vit-mobile-app/services/api.js
import getBackendUrl from "./backend";
import * as FileSystem from 'expo-file-system';

// Basic helpers for fetching JSON-based endpoints and multipart uploads
const BASE_URL = getBackendUrl();

export async function ping() {
  console.log("[api] ping ->", BASE_URL + "/ping");
  const r = await fetch(BASE_URL + "/ping");
  const text = await r.text();
  try {
    const j = JSON.parse(text);
    return j;
  } catch (e) {
    // If the endpoint returned non-JSON but status is OK, surface the text
    if (r.ok) {
      console.warn('[api] ping returned non-JSON body, returning text:', text && text.slice ? text.slice(0, 1000) : text);
      return { ok: true, text };
    }
    // Non-OK + non-JSON -> throw with useful context
    const snippet = (text || '').slice(0, 1000);
    throw new Error(`Ping failed: status=${r.status} body=${snippet}`);
  }
}

export async function saveTimetable(token, timetable) {
  const resp = await fetch(BASE_URL + "/api/save-timetable", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ timetable }),
  });
  return resp.json();
}

export async function loadTimetable(token) {
  const resp = await fetch(BASE_URL + "/api/load-timetable", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  return resp.json();
}

// Upload file using RN FormData (works in Expo + Android emulator + device)
export async function uploadImageAsync(image) {
  const backend = BASE_URL;
  console.log("[api] uploadImageAsync backend =", backend, "image=", image);

  if (!image || !image.uri) throw new Error("Image must be provided");

  const uri = image.uri;
  const filename = image.fileName || image.name || uri.split("/").pop();
  const extMatch = /\.(\w+)$/.exec(filename || "");
  const type = image.type || image.mimeType || (extMatch ? `image/${extMatch[1]}` : "image/jpeg");

  // Quick reachability check
  try {
    const pingResult = await ping();
    if (pingResult && pingResult.text) {
      // non-JSON ping response returned text (likely HTML)
      console.warn('[api] ping returned non-JSON text before upload:', pingResult.text && pingResult.text.slice ? pingResult.text.slice(0, 1000) : pingResult.text);
    }
  } catch (e) {
    console.error('[api] ping failed before upload', e.message || e);
    throw new Error('Backend not reachable: ' + (e.message || e));
  }

  try {
    // Use Expo FileSystem.uploadAsync for reliable multipart uploads on Android/iOS
    const uploadUrl = backend + '/api/upload';
    console.log('[api] Using FileSystem.uploadAsync ->', uploadUrl);

    const res = await FileSystem.uploadAsync(uploadUrl, uri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'image',
      mimeType: type,
      headers: { Accept: 'application/json' },
    });

    // res has { status, headers, body }
    console.log('[api] upload result status=', res.status, 'body=', res.body);
    if (res.status < 200 || res.status >= 300) {
      let message = `Upload failed: ${res.status}`;
      try { const j = JSON.parse(res.body || ''); if (j && j.error) message = j.error; } catch (e){}
      throw new Error(message);
    }

    return JSON.parse(res.body || '{}');
  } catch (err) {
    console.error('[api] uploadImageAsync error:', err);
    // normalize errors for the app
    throw new Error(err.message || 'Network request failed');
  }
}
