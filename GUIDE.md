# GovJobVault — Complete Personal Guide
### *Written for Ashish Choubey*

---

## 📖 What is GovJobVault?

GovJobVault is a **full-stack web application + browser extension** that you built from scratch. It solves a real problem — when students apply to government jobs (SSC, UPSC, IBPS, Railway, State PSC), they have to fill the **same personal details** (name, father name, DOB, Aadhaar, address, photo, signature) on dozens of different forms.

**GovJobVault stores all that data once**, and then lets you:
- One-click copy any field
- Auto-fill government forms using the browser extension
- Resize photos & signatures to exact dimensions
- Combine Aadhaar front + back into one file
- Track all your job applications with reminders
- Generate a PDF resume from your profile

It's like a **personal vault for form-filling data** — useful for students, job aspirants, and cyber café owners who help people fill forms.

---

## 🧱 What's Inside the Project

```
GovJobValut/
├── backend/          → Spring Boot 3.4.1 + Java 21 (REST API)
├── frontend/         → React 18 + Vite + Tailwind CSS (Web App)
├── extension/        → Chrome/Edge Browser Extension (Manifest V3)
├── docker-compose.yml → PostgreSQL database container
├── README.md         → Portfolio-ready README for GitHub
└── .env.example      → Environment variable template
```

### Tech Stack Summary

| What | Technology | Why |
|------|-----------|-----|
| Backend API | Spring Boot 3.4.1, Java 21 | Industry standard, scalable, secure |
| Database | PostgreSQL 16 | Reliable, free, great for production |
| Authentication | JWT + BCrypt | Stateless auth, password hashing |
| Frontend | React 18 + Tailwind CSS | Fast, component-based, beautiful UI |
| Image Processing | Thumbnailator | Simple Java library for resizing/compressing |
| PDF Generation | OpenPDF | Creates professional A4 resume PDFs |
| Browser Extension | Chrome Manifest V3 | Works on Chrome, Edge, Brave |
| Containerization | Docker Compose | One-command database setup |

---

## 🚀 Complete Setup Guide (Beginner-Friendly)

### Step 0: Software You Need to Install

Before anything, install these 3 things:

| Software | What it does | Download |
|----------|-------------|----------|
| **Java 21 (JDK)** | Runs the backend | [adoptium.net](https://adoptium.net/) → Download Temurin 21 → Install → Check: `java -version` |
| **Node.js 18+** | Runs the frontend | [nodejs.org](https://nodejs.org/) → Download LTS → Install → Check: `node -v` |
| **Docker Desktop** | Runs the database | [docker.com](https://www.docker.com/products/docker-desktop/) → Download → Install → Open it |

> **Tip:** After installing each one, open a **new terminal** and run the check command to confirm it works.

---

### Step 1: Start the Database

Open **Docker Desktop** first (make sure it's running — you'll see the whale icon in your taskbar).

Then open a terminal (PowerShell or Command Prompt):

```bash
cd "e:\Ashish Choubey\GovJobValut"
docker-compose up -d
```

**What this does:**
- Downloads PostgreSQL 16 (first time only, ~100MB)
- Creates a database called `GovJobvault`
- Runs it on port 5432 in the background

**Check it worked:**
```bash
docker ps
```
You should see `govjobvault-db` with status `Up`.

---

### Step 2: Start the Backend (API Server)

Open a **new terminal** (keep the first one open):

```bash
cd "e:\Ashish Choubey\GovJobValut\backend"
.\mvnw.cmd spring-boot:run
```

**First time:** This downloads all Java dependencies (~3–5 minutes). Be patient.
**After that:** Starts in ~10 seconds.

**You'll know it worked when you see:**
```
Started GovJobVaultApplication in X.XX seconds
```

**Your API is now live at:** http://localhost:8080
**Swagger docs at:** http://localhost:8080/swagger-ui.html

> **Important:** The backend automatically creates all database tables for you. No SQL commands needed.

---

### Step 3: Start the Frontend (Website)

Open a **third terminal**:

```bash
cd "e:\Ashish Choubey\GovJobValut\frontend"
npm install       # Only needed the first time
npm run dev
```

**You'll see:**
```
Local:   http://localhost:5173/
```

**Open http://localhost:5173 in your browser** — the app is live! 🎉

---

### Step 4: Create Your Account

1. Open **http://localhost:5173** in Chrome/Edge
2. Click **Register**
3. Fill in:
   - **Full Name:** Your real name
   - **Email:** Your email (this is your login ID)
   - **Password:** At least 6 characters
   - **Phone:** Optional
4. Click **Create Account**
5. You're logged in and on the Dashboard!

---

## 👤 How to Use — New User Guide

### Feature 1: Creating Profiles

A **Profile** stores all your form-filling data. You can create multiple profiles for different exams.

**Example profiles:**
- "SSC CGL 2026" — with SSC-specific details
- "IBPS PO" — with banking exam details  
- "Private Jobs" — with different email/phone

**How to create:**
1. Dashboard → Click **+ New Profile**
2. Give it a name (e.g., "SSC CGL 2026")
3. Fill in your details:

| Section | Fields |
|---------|--------|
| **Personal** | Full Name, Father Name, Mother Name, DOB, Gender, Category, Aadhaar, Phone, Email |
| **Address** | Full Address, State, Pincode |
| **Education** | Roll Number, Roll Code, Marks, Board, Passing Year |
| **Professional** | LinkedIn URL, Skills (comma-separated), Certificates |
| **Other** | Body Marks / Identification |

4. Click **Create Profile**

> **Tip:** Fill in as many fields as possible — the more data you have, the more useful auto-fill and resume generation become.

---

### Feature 2: Uploading Documents (Photo, Signature, Aadhaar)

When editing a profile, you'll see a **Documents** section:

| Document | What to upload | Common requirements |
|----------|---------------|-------------------|
| **Photo** | Passport-size photo | 3.5cm × 4.5cm, under 100KB |
| **Signature** | Your signature on white paper | Under 50KB |
| **Aadhaar Front** | Front side of Aadhaar card | JPEG/PNG |
| **Aadhaar Back** | Back side of Aadhaar card | JPEG/PNG |

**How:**
1. Go to Dashboard → click **Edit** on any profile
2. Scroll to **Documents** section
3. Click **Choose File** → Select image → It uploads automatically
4. You'll see a green ✓ and a **Download** button

---

### Feature 3: Photo & Signature Resizer (🛠️ Tools)

Government forms require photos in **exact dimensions** and **under certain KB**. This tool handles that.

**How:**
1. Click **🛠️ Tools** in the navigation bar
2. **Tab 1: Photo Resizer**
3. Upload any photo
4. Set dimensions:
   - **Width:** e.g., 200 (pixels)
   - **Height:** e.g., 230 (pixels)
   - **Max Size:** e.g., 50 (KB)
5. Click **Resize & Download**
6. The resized image downloads automatically

**Common government photo sizes:**

| Exam/Portal | Width × Height | Max Size |
|------------|---------------|----------|
| SSC | 200 × 230 px | 100 KB |
| UPSC | 413 × 531 px | 300 KB |
| IBPS | 200 × 230 px | 50 KB |
| Railway | 200 × 230 px | 50 KB |
| Passport | 413 × 531 px | 300 KB |

---

### Feature 4: Aadhaar Combiner (🛠️ Tools)

Some forms need front + back of Aadhaar in **one single file**. This tool combines them.

**How:**
1. Go to **🛠️ Tools** → **Tab 2: Aadhaar Combiner**
2. Upload **Aadhaar Front** image
3. Upload **Aadhaar Back** image
4. Choose output format:
   - **IMAGE** — Single JPEG with front on top, back on bottom, white gap between
   - **PDF** — Both sides in one PDF page
5. Click **Combine & Download**

---

### Feature 5: Job Application Tracker (📋 Applications)

Track every government job you've applied to — dates, status, and reminders.

**How to add:**
1. Click **📋 Applications** in the nav
2. Click **+ Add Application**
3. Fill in:

| Field | Example |
|-------|---------|
| Job Title | SSC CGL 2026 |
| Department | SSC |
| Post Name | Tax Assistant |
| Application ID | Your registration number |
| Application Date | When you applied |
| Exam Date | When the exam is |
| Admit Card Date | When admit card releases |
| Status | Applied |

4. Click **Add Application**

**Quick Status Update:**
- Each application has a **dropdown** right in the list
- Change from "Applied" → "Admit Card Released" → "Exam Completed" → "Result Out" instantly

**Status Colors:**

| Status | Color | Meaning |
|--------|-------|---------|
| 🔵 Applied | Blue | Form submitted |
| 🟡 Admit Card Released | Amber | Admit card is available |
| 🟣 Exam Completed | Purple | You've taken the exam |
| 🟢 Result Out | Green | Results are announced |
| 🔴 Rejected | Red | Application rejected |

---

### Feature 6: Smart Notifications (🔔)

The app **automatically** creates reminders:

| When | Notification |
|------|-------------|
| **7 days before exam** | "Exam in 7 days: SSC CGL" |
| **1 day before exam** | "Exam TOMORROW: SSC CGL" |
| **Exam day** | "Exam TODAY: SSC CGL. All the best!" |
| **Admit card date passed, status still Applied** | "Please check if your admit card is available" |

> These run automatically every day at 8:00 AM via the backend scheduler.

**How to view:**
1. Click **🔔** bell icon in nav (shows unread count)
2. See all notifications with relative time ("2 hours ago", "3 days ago")
3. Click **Mark read** on each, or **Mark All as Read**

---

### Feature 7: Resume Builder (📄 Resume)

Generate a professional PDF resume from your profile data — suitable for both government and private jobs.

**How:**
1. Click **📄 Resume** in the nav
2. Select a profile from the dropdown
3. See a **live preview** of what will be in the resume
4. Click **📄 Generate & Download Resume**
5. PDF downloads to your computer

**What's in the PDF:**
- Header with your name (bold) + blue underline
- Contact info (phone, email, location)
- Personal Details (Father Name, DOB, Gender, Category, Aadhaar)
- Education (Board, Marks, Roll Number, Passing Year)
- Skills
- Certificates & Courses
- Declaration + Signature line

> **Tip:** You can also generate a resume directly from the **Edit Profile** page — there's a green **📄 Generate Resume** button at the bottom.

> **Tip:** If a profile has very little data, the page shows a warning. Fill in more fields for a better resume.

---

## 🧩 Browser Extension — Complete Guide

The extension is the **most powerful feature**. It puts a floating widget on every website that lets you copy profile fields and auto-fill government forms.

### Installing the Extension

1. Open **`chrome://extensions/`** in Chrome (or `edge://extensions/` in Edge)
2. Toggle **Developer mode** ON (top-right corner)
3. Click **Load unpacked**
4. Browse to `e:\Ashish Choubey\GovJobValut\extension\` and select the folder
5. The **G** icon appears in your browser toolbar
6. Click the puzzle piece icon → Pin **GovJobVault** for easy access

### Logging In

1. Click the **G** icon in toolbar
2. Enter the **same email + password** you use on the website
3. Click **Login**
4. Select a profile from the dropdown
5. Done! The floating widget is now active on every page.

### Using the Floating Widget

Once logged in, a **blue G button** appears at the bottom-right of every webpage.

**Features:**
| Action | How |
|--------|-----|
| **Open panel** | Click the blue G button |
| **Move button** | Drag it anywhere on the screen |
| **Copy any field** | Click **Copy** next to any field → clipboard |
| **Auto-fill form** | Click **⚡ Auto Fill Form** → fills matching fields |
| **Refresh data** | Click **↻** button in footer |
| **Close panel** | Click **×** or **−** button |

### Auto-Fill — How It Works

When you click **⚡ Auto Fill Form** on any page, the extension:

1. Scans all input fields on the page
2. Matches them by `name`, `id`, `placeholder`, `label` text, and `aria-label`
3. Fills matching fields with your profile data
4. **Does NOT overwrite** fields that already have values
5. Shows a toast: **"Filled 8 fields"** (or however many matched)

**What it tries to match:**

| Your Profile Field | Form fields it recognizes |
|-------------------|--------------------------|
| Full Name | name, fullname, applicant_name, candidate_name |
| Father Name | father, father_name, fathername |
| Mother Name | mother, mother_name, mothername |
| DOB | dob, date_of_birth, birthdate |
| Gender | gender, sex |
| Category | category, caste, reservation |
| Aadhaar | aadhaar, aadhar, uid |
| Phone | mobile, phone, contact, telephone |
| Email | email, email_id, e_mail |
| Address | address, permanent_address, residential_address |
| State | state, home_state, domicile |
| Pincode | pincode, pin, zip, postal_code |
| Roll Number | roll_no, rollno, roll_number |
| Marks | marks, percentage, cgpa, score |

> **Note:** Auto-fill works best on government portals like SSC, IBPS, UPSC, and Railway recruitment sites. It matches common field naming patterns.

---

## 🖥️ Cyber Café Use Case

This is one of the **most practical uses** of GovJobVault.

### The Problem
Students come to cyber cafés to fill government job forms. They:
- Bring details on paper (messy, incomplete)
- Dictate to the café operator who types slowly
- Forget important details (roll number, Aadhaar, exact address)
- Need photo/signature resized every time (costs ₹20-50 per resize)

### The Solution with GovJobVault

**Setup once at the café:**
1. Install the browser extension on the café computer
2. Each student creates their own GovJobVault account (free)

**When a student comes to fill a form:**
1. Student logs into the extension with their account
2. Selects their profile (e.g., "SSC CGL")
3. Opens the government form website
4. Clicks **⚡ Auto Fill Form** → most fields filled in seconds
5. Remaining fields → click **Copy** from the widget panel → paste
6. Photo/Signature → already resized and stored, just download

**Benefits for café owners:**
- **Faster form filling** → serve more customers
- **No resizing charges needed** → student already has correctly sized files
- **No mistakes** → data comes from their saved profile
- **Repeat customers** → they save their data, come back to you

**Benefits for students:**
- **Save time** — no re-typing the same data 50 times
- **No errors** — Aadhaar number, address, father name always correct
- **Documents ready** — photo, signature, Aadhaar already uploaded and resized
- **Track applications** — know which forms you've already filled

---

## 🏛️ Form Filling Workflow — Step by Step

Here's the complete workflow when filling a government job form:

### Before the form opens (One-time setup)

```
1. Register on GovJobVault
2. Create a profile → fill ALL personal details
3. Upload Photo (passport size)
4. Upload Signature (on white paper)
5. Upload Aadhaar Front + Back
6. Use Tools → Resize photo to required dimensions
7. Install browser extension → Login → Select profile
```

### When you open a job form

```
1. Open the government recruitment website
2. Click the blue G button (bottom-right)
3. Click ⚡ Auto Fill Form
4. Review what was filled → correct if needed
5. For unfilled fields → open the widget → Copy value → Paste
6. For Photo upload → download from your profile (already resized)
7. For Signature upload → download from your profile
8. Submit the form
9. Go to 📋 Applications → Add this application
10. Set the exam date → you'll get automatic reminders!
```

---

## 🔒 Data Security

### How Your Data is Protected

| Layer | Protection | Details |
|-------|-----------|---------|
| **Authentication** | JWT Tokens | You get a token on login, expires in 24 hours. No sessions stored on server. |
| **Passwords** | BCrypt Hashing | Your password is **never stored as plain text**. It's hashed with BCrypt (industry standard, same as banks use). Even if someone gets the database, they can't read your password. |
| **API Access** | Every endpoint protected | All APIs (except login/register) require a valid JWT token. Without it → 403 Forbidden. |
| **User Isolation** | Data is user-scoped | You can **only see your own** profiles, applications, and notifications. The backend checks `user_id` on every query. One user can never access another user's data. |
| **File Storage** | UUID filenames | Uploaded files (photo, signature, Aadhaar) are stored with random UUID names like `a3b2c1d4-e5f6.jpg`. The original filename is never exposed. Real file paths are never sent to the frontend. |
| **Extension Storage** | chrome.storage.local | JWT and profile data in the extension are stored in Chrome's local storage — isolated per extension, not accessible by websites. |
| **CORS** | Origin-restricted | The backend only accepts requests from `http://localhost:5173` (your frontend) and `chrome-extension://*` (your extension). Random websites cannot call your API. |
| **Input Validation** | Server-side validation | All inputs are validated on the backend — required fields, email format, etc. |

### What is NOT encrypted (and why)

- **Profile fields in the database** (name, DOB, Aadhaar, etc.) are stored as plain text in PostgreSQL. This is normal for a local/self-hosted app. If you deploy to production, you'd add database encryption.
- **Files on disk** (photos, signatures) are stored as regular files in the `./uploads/` folder. They're protected by the API (you need JWT to download), but the files themselves aren't encrypted.

### If You Want More Security (Future)

- Enable PostgreSQL SSL
- Encrypt sensitive columns (Aadhaar number) with AES
- Add rate limiting to prevent brute-force login attempts
- Add 2-factor authentication (OTP via email/SMS)
- Deploy behind HTTPS with a proper domain

---

## 🛑 Stopping the Application

When you're done working:

```bash
# Stop Frontend:  Press Ctrl+C in the frontend terminal
# Stop Backend:   Press Ctrl+C in the backend terminal
# Stop Database:
cd "e:\Ashish Choubey\GovJobValut"
docker-compose down            # Stops the container (data preserved)
docker-compose down -v         # Stops AND deletes all data (clean start)
```

### Restarting Later

Just repeat Steps 1-3:
```bash
docker-compose up -d              # Start DB
cd backend && .\mvnw.cmd spring-boot:run   # Start API
cd frontend && npm run dev         # Start website
```
No need to `npm install` again (only first time).

---

## 🐛 Common Problems & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| `Port 5432 already in use` | Another PostgreSQL running | Stop the other one, or change port in `docker-compose.yml` + `application.yml` |
| `mvnw.cmd is not recognized` | Wrong directory | Make sure you're in the `backend/` folder |
| Backend fails to start | Database not running | Run `docker-compose up -d` first, then start backend |
| `npm install` fails | Corrupted node_modules | Delete `node_modules/` and `package-lock.json`, run `npm install` again |
| Frontend shows blank page | Backend not running | Start backend first, then frontend |
| Extension popup says "Login failed" | Backend not running | Start backend on port 8080, then try again |
| Auto-fill doesn't fill any fields | Field names don't match | Use the Copy button manually for those fields |
| "Session expired" in extension | JWT expired (24h) | Click the G icon in toolbar → Login again |
| Docker not starting | Docker Desktop not running | Open Docker Desktop app first, wait for it to start |

---

## 📊 Complete Feature Summary

| # | Feature | Where | What it does |
|---|---------|-------|-------------|
| 1 | Register/Login | `/login`, `/register` | Create account with email + password |
| 2 | Multi-Profile | Dashboard | Store different data sets for different exams |
| 3 | Document Upload | Edit Profile | Upload photo, signature, Aadhaar (front + back) |
| 4 | Photo Resizer | 🛠️ Tools Tab 1 | Resize to exact pixels + compress to target KB |
| 5 | Aadhaar Combiner | 🛠️ Tools Tab 2 | Front + back → single image or PDF |
| 6 | Application Tracker | 📋 Applications | CRUD for all job applications with status |
| 7 | Quick Status Update | Applications list | Change status from dropdown without opening edit |
| 8 | Smart Notifications | 🔔 Bell icon | Auto reminders for exams (7d, 1d, today) |
| 9 | Resume Builder | 📄 Resume | Generate A4 PDF resume from profile |
| 10 | Browser Extension | Chrome/Edge | Floating widget + copy + auto-fill on any site |
| 11 | Dashboard | Home page `/` | Stats, upcoming exams, quick actions |

---

## 🔮 What You Could Add Next

If you want to keep improving the project:

| Feature | Difficulty | Impact |
|---------|-----------|--------|
| Dark mode toggle | Easy | UI polish |
| Export applications to Excel | Easy | Useful for tracking |
| Email notifications (Spring Mail) | Medium | Real reminders |
| OCR document scanner | Medium | Scan text from images |
| Admin dashboard | Medium | Manage users |
| Deploy online (Railway / Render) | Medium | Access from anywhere |
| PWA (Progressive Web App) | Medium | Works offline on mobile |
| 2FA authentication | Hard | More security |

---

> **This project demonstrates:** Full-stack development, REST API design, JWT authentication, file handling, PDF generation, image processing, browser extension development, and responsive UI design.
>
> **Built by Ashish Choubey** 🚀
