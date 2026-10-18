/**
 * GovJobVault – Background Service Worker
 * Acts as API proxy between popup/content scripts and the backend.
 * Handles: LOGIN, LOGOUT, FETCH_PROFILES, GET_STATE, SET_ACTIVE_PROFILE
 */

const API_BASE = "http://localhost:8080/api";

// ── Listen for messages from popup and content scripts ──
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  handleMessage(msg).then(sendResponse).catch((err) =>
    sendResponse({ success: false, error: err.message || "Unknown error" })
  );
  return true; // keep channel open for async response
});

async function handleMessage(msg) {
  switch (msg.type) {
    case "LOGIN":
      return await handleLogin(msg.email, msg.password);
    case "LOGOUT":
      return await handleLogout();
    case "FETCH_PROFILES":
      return await fetchProfiles();
    case "SET_ACTIVE_PROFILE":
      await chrome.storage.local.set({ activeProfile: msg.profile });
      return { success: true };
    case "GET_STATE":
      return await getState();
    default:
      return { success: false, error: "Unknown message type" };
  }
}

// ── Login: call backend, store JWT + user ──
async function handleLogin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Login failed");
  }

  const { token, userId, fullName, email: userEmail, role } = data.data;
  await chrome.storage.local.set({
    token,
    user: { userId, fullName, email: userEmail, role },
  });

  // Auto-fetch profiles after login
  return await fetchProfiles();
}

// ── Logout: clear all stored data ──
async function handleLogout() {
  await chrome.storage.local.clear();
  return { success: true };
}

// ── Fetch profiles using stored JWT ──
async function fetchProfiles() {
  const { token } = await chrome.storage.local.get("token");
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/profiles`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Handle expired JWT
  if (res.status === 401) {
    await chrome.storage.local.clear();
    throw new Error("SESSION_EXPIRED");
  }

  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch profiles");

  const profiles = data.data || [];
  await chrome.storage.local.set({ profiles });

  // If no active profile set, use default or first
  const { activeProfile } = await chrome.storage.local.get("activeProfile");
  if (!activeProfile && profiles.length > 0) {
    const defaultProfile = profiles.find((p) => p.isDefault) || profiles[0];
    await chrome.storage.local.set({ activeProfile: defaultProfile });
  }

  return { success: true, profiles };
}

// ── Get current state (for popup and content script) ──
async function getState() {
  const data = await chrome.storage.local.get(["token", "user", "profiles", "activeProfile"]);
  return {
    success: true,
    isLoggedIn: !!data.token,
    user: data.user || null,
    profiles: data.profiles || [],
    activeProfile: data.activeProfile || null,
  };
}
