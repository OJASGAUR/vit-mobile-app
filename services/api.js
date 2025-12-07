// services/api.js

import { BACKEND_URL } from "./backend";

/**
 * Upload pasted text to backend
 * backend returns:
 *  { timetable, courses, warnings }
 */
export async function uploadTextAsync(text) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/upload-text`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: text,
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Upload failed");
    }

    return json;

  } catch (err) {
    console.error("uploadTextAsync error:", err);
    throw err;
  }
}
