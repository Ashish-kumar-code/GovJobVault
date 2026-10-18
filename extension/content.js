/**
 * GovJobVault – Content Script (Floating Widget)
 * Injects a draggable floating button + expandable profile panel with
 * one-click copy and auto-fill. All UI inside Shadow DOM.
 */

(() => {
  // Prevent double-injection
  if (document.getElementById("gjv-widget-host")) return;

  // ════════════════════════════════════════
  // 1. CREATE SHADOW DOM HOST
  // ════════════════════════════════════════
  const host = document.createElement("div");
  host.id = "gjv-widget-host";
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "closed" });

  // ════════════════════════════════════════
  // 2. INJECT STYLES INTO SHADOW DOM
  // ════════════════════════════════════════
  const style = document.createElement("style");
  style.textContent = `
    * { margin: 0; padding: 0; box-sizing: border-box; }

    /* ── Floating Button ── */
    .gjv-fab {
      position: fixed; bottom: 24px; right: 24px;
      width: 52px; height: 52px;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      border-radius: 16px; border: none;
      color: #fff; font-size: 22px; font-weight: 800;
      cursor: grab; user-select: none;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 24px rgba(37, 99, 235, 0.4);
      transition: box-shadow 0.2s, transform 0.2s;
      z-index: 999999;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    .gjv-fab:hover { box-shadow: 0 8px 32px rgba(37, 99, 235, 0.5); transform: scale(1.05); }
    .gjv-fab:active { cursor: grabbing; }

    /* ── Panel ── */
    .gjv-panel {
      position: fixed; bottom: 84px; right: 24px;
      width: 340px; max-height: 520px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.15);
      display: none; flex-direction: column;
      overflow: hidden;
      font-family: 'Segoe UI', system-ui, sans-serif;
      z-index: 999998;
      animation: gjv-slideIn 0.2s ease-out;
    }
    .gjv-panel.open { display: flex; }

    @keyframes gjv-slideIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Panel Header ── */
    .gjv-header {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #fff; padding: 14px 16px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .gjv-header-left { display: flex; align-items: center; gap: 8px; }
    .gjv-header-logo {
      width: 28px; height: 28px; background: rgba(255,255,255,0.2);
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 800;
    }
    .gjv-header-title { font-size: 13px; font-weight: 700; }
    .gjv-header-profile { font-size: 11px; opacity: 0.8; margin-top: 1px; }
    .gjv-header-actions { display: flex; gap: 4px; }
    .gjv-header-btn {
      background: rgba(255,255,255,0.15); border: none; color: #fff;
      width: 26px; height: 26px; border-radius: 6px;
      cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
    }
    .gjv-header-btn:hover { background: rgba(255,255,255,0.3); }

    /* ── Panel Body ── */
    .gjv-body {
      flex: 1; overflow-y: auto; padding: 12px 14px;
      max-height: 370px;
    }
    .gjv-body::-webkit-scrollbar { width: 4px; }
    .gjv-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

    /* ── Field Row ── */
    .gjv-field {
      display: flex; align-items: center; justify-content: space-between;
      padding: 7px 0; border-bottom: 1px solid #f1f5f9;
    }
    .gjv-field:last-child { border-bottom: none; }
    .gjv-field-label { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; min-width: 80px; }
    .gjv-field-value { font-size: 13px; color: #1e293b; font-weight: 500; flex: 1; text-align: right; margin: 0 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .gjv-copy-btn {
      background: #f1f5f9; border: none; color: #64748b;
      padding: 4px 8px; border-radius: 6px; font-size: 11px;
      cursor: pointer; white-space: nowrap; transition: all 0.15s;
    }
    .gjv-copy-btn:hover { background: #e2e8f0; color: #2563eb; }
    .gjv-copy-btn.copied { background: #dcfce7; color: #16a34a; }

    /* ── Login Prompt ── */
    .gjv-login-prompt {
      padding: 32px 16px; text-align: center;
    }
    .gjv-login-prompt p { font-size: 13px; color: #64748b; margin-bottom: 12px; }
    .gjv-login-prompt .hint { font-size: 11px; color: #94a3b8; }

    /* ── Footer Actions ── */
    .gjv-footer {
      padding: 12px 14px; border-top: 1px solid #f1f5f9;
      display: flex; gap: 8px;
    }
    .gjv-fill-btn {
      flex: 1; padding: 9px; background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #fff; border: none; border-radius: 8px;
      font-size: 12px; font-weight: 700; cursor: pointer;
      transition: opacity 0.15s;
    }
    .gjv-fill-btn:hover { opacity: 0.9; }
    .gjv-refresh-btn {
      padding: 9px 12px; background: #f1f5f9; border: 1px solid #e2e8f0;
      color: #475569; border-radius: 8px; font-size: 12px; font-weight: 600;
      cursor: pointer; transition: background 0.15s;
    }
    .gjv-refresh-btn:hover { background: #e2e8f0; }

    /* ── Toast ── */
    .gjv-toast {
      position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
      background: #0f172a; color: #fff; padding: 10px 20px;
      border-radius: 10px; font-size: 13px; font-weight: 600;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      animation: gjv-fadeInOut 2.5s ease-in-out forwards;
      z-index: 999999;
    }
    @keyframes gjv-fadeInOut {
      0% { opacity: 0; transform: translateX(-50%) translateY(8px); }
      15% { opacity: 1; transform: translateX(-50%) translateY(0); }
      80% { opacity: 1; }
      100% { opacity: 0; }
    }
  `;
  shadow.appendChild(style);

  // ════════════════════════════════════════
  // 3. CREATE FLOATING BUTTON (Draggable)
  // ════════════════════════════════════════
  const fab = document.createElement("button");
  fab.className = "gjv-fab";
  fab.textContent = "G";
  fab.title = "GovJobVault";
  shadow.appendChild(fab);

  // ── Drag Logic ──
  let isDragging = false, wasDragged = false, dragStartX, dragStartY, fabStartX, fabStartY;

  fab.addEventListener("mousedown", (e) => {
    isDragging = true; wasDragged = false;
    dragStartX = e.clientX; dragStartY = e.clientY;
    const rect = fab.getBoundingClientRect();
    fabStartX = rect.left; fabStartY = rect.top;
    fab.style.transition = "none";
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX, dy = e.clientY - dragStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) wasDragged = true;
    fab.style.position = "fixed";
    fab.style.left = (fabStartX + dx) + "px";
    fab.style.top = (fabStartY + dy) + "px";
    fab.style.right = "auto"; fab.style.bottom = "auto";
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      fab.style.transition = "box-shadow 0.2s, transform 0.2s";
    }
  });

  // ════════════════════════════════════════
  // 4. CREATE PANEL
  // ════════════════════════════════════════
  const panel = document.createElement("div");
  panel.className = "gjv-panel";
  shadow.appendChild(panel);

  // ── Panel Header ──
  const header = document.createElement("div");
  header.className = "gjv-header";
  header.innerHTML = `
    <div class="gjv-header-left">
      <div class="gjv-header-logo">G</div>
      <div>
        <div class="gjv-header-title">GovJobVault</div>
        <div class="gjv-header-profile" id="gjv-profile-name">No profile</div>
      </div>
    </div>
    <div class="gjv-header-actions">
      <button class="gjv-header-btn" id="gjv-minimize" title="Minimize">−</button>
      <button class="gjv-header-btn" id="gjv-close" title="Close">×</button>
    </div>
  `;
  panel.appendChild(header);

  // ── Panel Body ──
  const body = document.createElement("div");
  body.className = "gjv-body";
  panel.appendChild(body);

  // ── Panel Footer ──
  const footer = document.createElement("div");
  footer.className = "gjv-footer";
  footer.innerHTML = `
    <button class="gjv-fill-btn" id="gjv-autofill">⚡ Auto Fill Form</button>
    <button class="gjv-refresh-btn" id="gjv-refresh" title="Refresh Profile">↻</button>
  `;
  panel.appendChild(footer);

  // ════════════════════════════════════════
  // 5. STATE & PROFILE DATA
  // ════════════════════════════════════════
  let activeProfile = null;
  let panelOpen = false;

  // ── Profile field definitions ──
  const PROFILE_FIELDS = [
    { key: "fullName", label: "Full Name" },
    { key: "fatherName", label: "Father Name" },
    { key: "motherName", label: "Mother Name" },
    { key: "dateOfBirth", label: "Date of Birth" },
    { key: "gender", label: "Gender" },
    { key: "category", label: "Category" },
    { key: "aadhaarNumber", label: "Aadhaar No." },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
    { key: "state", label: "State" },
    { key: "pincode", label: "Pincode" },
    { key: "rollNumber", label: "Roll No." },
    { key: "rollCode", label: "Roll Code" },
    { key: "marks", label: "Marks" },
    { key: "board", label: "Board" },
    { key: "passingYear", label: "Passing Year" },
  ];

  // ════════════════════════════════════════
  // 6. RENDER FUNCTIONS
  // ════════════════════════════════════════
  function renderPanel() {
    body.innerHTML = "";
    const profileName = shadow.getElementById("gjv-profile-name");

    if (!activeProfile) {
      profileName.textContent = "Not logged in";
      body.innerHTML = `<div class="gjv-login-prompt">
        <p>Please login via the extension popup</p>
        <p class="hint">Click the GovJobVault icon in your browser toolbar</p>
      </div>`;
      return;
    }

    profileName.textContent = activeProfile.profileName || "Profile";

    PROFILE_FIELDS.forEach(({ key, label }) => {
      const value = activeProfile[key];
      if (!value) return;

      const row = document.createElement("div");
      row.className = "gjv-field";

      const labelEl = document.createElement("span");
      labelEl.className = "gjv-field-label";
      labelEl.textContent = label;

      const valueEl = document.createElement("span");
      valueEl.className = "gjv-field-value";
      valueEl.textContent = value;
      valueEl.title = value;

      const copyBtn = document.createElement("button");
      copyBtn.className = "gjv-copy-btn";
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(String(value)).then(() => {
          copyBtn.textContent = "✓";
          copyBtn.classList.add("copied");
          setTimeout(() => { copyBtn.textContent = "Copy"; copyBtn.classList.remove("copied"); }, 1200);
        });
      });

      row.appendChild(labelEl);
      row.appendChild(valueEl);
      row.appendChild(copyBtn);
      body.appendChild(row);
    });

    if (body.children.length === 0) {
      body.innerHTML = `<div class="gjv-login-prompt"><p>This profile has no fields filled yet</p></div>`;
    }
  }

  // ════════════════════════════════════════
  // 7. EVENT HANDLERS
  // ════════════════════════════════════════

  // Toggle panel on fab click (not drag)
  fab.addEventListener("click", () => {
    if (wasDragged) return;
    panelOpen = !panelOpen;
    panel.classList.toggle("open", panelOpen);
    if (panelOpen) loadProfile();
  });

  // Minimize & Close
  shadow.getElementById("gjv-minimize").addEventListener("click", () => {
    panelOpen = false;
    panel.classList.remove("open");
  });
  shadow.getElementById("gjv-close").addEventListener("click", () => {
    panelOpen = false;
    panel.classList.remove("open");
  });

  // Refresh Profile
  shadow.getElementById("gjv-refresh").addEventListener("click", async () => {
    const res = await sendMsg({ type: "FETCH_PROFILES" });
    if (res.error === "SESSION_EXPIRED") {
      activeProfile = null;
      renderPanel();
      showToast("Session expired — please login again");
      return;
    }
    await loadProfile();
    showToast("Profile refreshed");
  });

  // Auto Fill
  shadow.getElementById("gjv-autofill").addEventListener("click", () => {
    if (!activeProfile) { showToast("No profile selected"); return; }
    const count = autoFillForm(activeProfile);
    showToast(count > 0 ? `Filled ${count} field${count > 1 ? "s" : ""}` : "No matching fields found");
  });

  // Listen for profile updates from popup
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "PROFILE_UPDATED" && msg.profile) {
      activeProfile = msg.profile;
      renderPanel();
    }
  });

  // ════════════════════════════════════════
  // 8. LOAD PROFILE FROM STORAGE
  // ════════════════════════════════════════
  async function loadProfile() {
    const state = await sendMsg({ type: "GET_STATE" });
    if (state.error === "SESSION_EXPIRED" || !state.isLoggedIn) {
      activeProfile = null;
    } else {
      activeProfile = state.activeProfile || null;
    }
    renderPanel();
  }

  // Initial load
  loadProfile();

  // ════════════════════════════════════════
  // 9. AUTO-FILL LOGIC
  // ════════════════════════════════════════
  const FIELD_MAP = [
    { key: "fullName",      patterns: ["name", "full_name", "fullname", "applicant_name", "candidate_name", "cand_name"] },
    { key: "fatherName",    patterns: ["father", "father_name", "fathername", "fathers_name", "father_s_name"] },
    { key: "motherName",    patterns: ["mother", "mother_name", "mothername", "mothers_name", "mother_s_name"] },
    { key: "dateOfBirth",   patterns: ["dob", "date_of_birth", "birth_date", "birthdate", "dateofbirth"] },
    { key: "gender",        patterns: ["gender", "sex"] },
    { key: "category",      patterns: ["category", "caste", "reservation"] },
    { key: "aadhaarNumber", patterns: ["aadhaar", "aadhar", "uid", "aadhaar_number", "aadhar_no", "aadhaar_no"] },
    { key: "phone",         patterns: ["mobile", "phone", "contact", "mobile_number", "mobile_no", "phonenumber", "telephone", "mob"] },
    { key: "email",         patterns: ["email", "email_id", "email_address", "emailid", "e_mail"] },
    { key: "address",       patterns: ["address", "permanent_address", "correspondence_address", "full_address", "residential_address"] },
    { key: "state",         patterns: ["state", "home_state", "domicile"] },
    { key: "pincode",       patterns: ["pincode", "pin", "zip", "postal_code", "pin_code", "zipcode"] },
    { key: "rollNumber",    patterns: ["roll_no", "rollno", "roll_number", "rollnumber"] },
    { key: "marks",         patterns: ["marks", "percentage", "cgpa", "score", "total_marks"] },
    { key: "board",         patterns: ["board", "university", "board_university"] },
    { key: "passingYear",   patterns: ["passing_year", "year_of_passing", "pass_year", "yop"] },
  ];

  function autoFillForm(profile) {
    const inputs = document.querySelectorAll("input, textarea, select");
    let filled = 0;

    inputs.forEach((input) => {
      // Skip if already has a value (improvement #5)
      if (input.value && input.value.trim() !== "") return;
      // Skip hidden/submit/button types
      if (["hidden", "submit", "button", "reset", "file", "image"].includes(input.type)) return;

      // Gather all matchable text for this input
      const matchTexts = [
        input.name, input.id, input.placeholder,
        input.getAttribute("aria-label"),
        input.getAttribute("data-field"),
      ].filter(Boolean).map((t) => t.toLowerCase().replace(/[\s-]+/g, "_"));

      // Also check associated <label> text (improvement #4)
      const labelEl = input.id ? document.querySelector(`label[for="${input.id}"]`) : null;
      if (labelEl) matchTexts.push(labelEl.textContent.toLowerCase().replace(/[\s-]+/g, "_"));
      // Parent label
      const parentLabel = input.closest("label");
      if (parentLabel) matchTexts.push(parentLabel.textContent.toLowerCase().replace(/[\s-]+/g, "_"));

      for (const { key, patterns } of FIELD_MAP) {
        const value = profile[key];
        if (!value) continue;

        const matched = patterns.some((p) =>
          matchTexts.some((t) => t.includes(p) || p.includes(t))
        );

        if (matched) {
          // For select elements, try to match option value/text
          if (input.tagName === "SELECT") {
            const options = Array.from(input.options);
            const match = options.find((o) =>
              o.value.toLowerCase() === String(value).toLowerCase() ||
              o.textContent.toLowerCase().includes(String(value).toLowerCase())
            );
            if (match) { input.value = match.value; triggerChange(input); filled++; }
          } else {
            input.value = value;
            triggerChange(input);
            filled++;
          }
          break; // Only fill each input once
        }
      }
    });

    return filled;
  }

  // Trigger change/input events so frameworks detect the change
  function triggerChange(el) {
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // ════════════════════════════════════════
  // 10. TOAST NOTIFICATION
  // ════════════════════════════════════════
  function showToast(message) {
    const existing = shadow.querySelector(".gjv-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "gjv-toast";
    toast.textContent = message;
    shadow.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  // ── Message helper ──
  function sendMsg(msg) {
    return new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
  }
})();
