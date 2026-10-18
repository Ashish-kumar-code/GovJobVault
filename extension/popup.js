/**
 * GovJobVault – Popup Script
 * Handles login, profile selection, and state display.
 */

const $ = (sel) => document.querySelector(sel);

// ── Elements ──
const loginView = $("#login-view");
const dashboardView = $("#dashboard-view");
const loginForm = $("#login-form");
const loginBtn = $("#login-btn");
const loginText = $("#login-text");
const loginLoading = $("#login-loading");
const loginError = $("#login-error");
const profileSelect = $("#profile-select");
const profileSummary = $("#profile-summary");

// ── Init: check state ──
document.addEventListener("DOMContentLoaded", async () => {
  const state = await sendMsg({ type: "GET_STATE" });
  if (state.isLoggedIn) {
    showDashboard(state);
  } else {
    showLogin();
  }
});

// ── Login Form ──
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.classList.add("hidden");
  loginBtn.disabled = true;
  loginText.classList.add("hidden");
  loginLoading.classList.remove("hidden");

  const email = $("#email").value;
  const password = $("#password").value;

  const res = await sendMsg({ type: "LOGIN", email, password });

  if (res.success) {
    const state = await sendMsg({ type: "GET_STATE" });
    showDashboard(state);
  } else {
    loginError.textContent = res.error === "SESSION_EXPIRED" ? "Session expired. Please login again." : (res.error || "Login failed");
    loginError.classList.remove("hidden");
  }

  loginBtn.disabled = false;
  loginText.classList.remove("hidden");
  loginLoading.classList.add("hidden");
});

// ── Profile Selection ──
profileSelect.addEventListener("change", async () => {
  const state = await sendMsg({ type: "GET_STATE" });
  const selected = state.profiles.find((p) => p.id === parseInt(profileSelect.value));
  if (selected) {
    await sendMsg({ type: "SET_ACTIVE_PROFILE", profile: selected });
    renderSummary(selected);
    // Notify content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { type: "PROFILE_UPDATED", profile: selected });
    });
  }
});

// ── Logout ──
$("#logout-btn").addEventListener("click", async () => {
  await sendMsg({ type: "LOGOUT" });
  showLogin();
});

// ── Refresh ──
$("#refresh-btn").addEventListener("click", async () => {
  const res = await sendMsg({ type: "FETCH_PROFILES" });
  if (res.success) {
    const state = await sendMsg({ type: "GET_STATE" });
    renderProfiles(state.profiles, state.activeProfile);
  } else if (res.error === "SESSION_EXPIRED") {
    showLogin("Session expired. Please login again.");
  }
});

// ── UI Helpers ──
function showLogin(errorMsg) {
  loginView.classList.remove("hidden");
  dashboardView.classList.add("hidden");
  if (errorMsg) {
    loginError.textContent = errorMsg;
    loginError.classList.remove("hidden");
  }
}

function showDashboard(state) {
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  $("#user-name").textContent = state.user?.fullName || "User";
  $("#user-email").textContent = state.user?.email || "";
  renderProfiles(state.profiles, state.activeProfile);
}

function renderProfiles(profiles, activeProfile) {
  profileSelect.innerHTML = profiles
    .map((p) => `<option value="${p.id}" ${activeProfile?.id === p.id ? "selected" : ""}>${p.profileName}${p.isDefault ? " ★" : ""}</option>`)
    .join("");
  if (activeProfile) renderSummary(activeProfile);
  else if (profiles.length > 0) renderSummary(profiles[0]);
}

function renderSummary(p) {
  const rows = [
    ["Name", p.fullName], ["Father", p.fatherName], ["DOB", p.dateOfBirth],
    ["Gender", p.gender], ["Category", p.category], ["Phone", p.phone],
    ["Email", p.email], ["Aadhaar", p.aadhaarNumber], ["State", p.state],
  ].filter(([, v]) => v);

  profileSummary.innerHTML = rows
    .map(([l, v]) => `<div class="row"><span class="label">${l}</span><span class="value">${v}</span></div>`)
    .join("");
}

function sendMsg(msg) {
  return new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
}
