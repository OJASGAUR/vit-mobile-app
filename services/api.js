import { BACKEND_URL } from "./backend";

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

export async function getUserByRegNo(regNo) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/user/${regNo}`);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "User not found");
    }

    return json;
  } catch (err) {
    console.error("getUserByRegNo error:", err);
    throw err;
  }
}

export async function updateUserProfile(regNo, userData) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/user/${regNo}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Failed to update profile");
    }

    return json;
  } catch (err) {
    console.error("updateUserProfile error:", err);
    throw err;
  }
}

export async function sendFriendRequest(fromRegNo, toRegNo) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/friends/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fromRegNo, toRegNo }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Failed to send friend request");
    }

    return json;
  } catch (err) {
    console.error("sendFriendRequest error:", err);
    throw err;
  }
}

export async function acceptFriendRequest(fromRegNo, toRegNo) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/friends/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fromRegNo, toRegNo }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Failed to accept friend request");
    }

    return json;
  } catch (err) {
    console.error("acceptFriendRequest error:", err);
    throw err;
  }
}

export async function rejectFriendRequest(fromRegNo, toRegNo) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/friends/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fromRegNo, toRegNo }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Failed to reject friend request");
    }

    return json;
  } catch (err) {
    console.error("rejectFriendRequest error:", err);
    throw err;
  }
}

export async function removeFriend(fromRegNo, toRegNo) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/friends/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fromRegNo, toRegNo }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Failed to remove friend");
    }

    return json;
  } catch (err) {
    console.error("removeFriend error:", err);
    throw err;
  }
}

export async function getFriends(regNo) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/friends/${regNo}`);
    
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("getFriends: Backend returned non-JSON:", text.substring(0, 200));
      throw new Error("Backend endpoint not available. Please ensure backend is deployed.");
    }
    
    const json = await res.json();

    if (!res.ok) {
      if (json.error && json.error.includes("not found")) {
        throw new Error("User not found");
      }
      throw new Error(json.error || "Failed to get friends");
    }

    return json;
  } catch (err) {
    if (err.message && (err.message.includes("Backend endpoint") || err.message.includes("User not found"))) {
      throw err;
    }
    if (err instanceof SyntaxError) {
      console.error("getFriends: JSON parse error - backend may not be deployed");
      throw new Error("Backend endpoint not available. Please ensure backend is deployed with friends endpoints.");
    }
    console.error("getFriends error:", err);
    throw err;
  }
}