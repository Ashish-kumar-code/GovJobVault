# GovJobVault 🏛️

> **Your personal vault for managing government & private job applications, profiles, documents, and more.**

Built with Spring Boot 3 + React 18 — designed for students and job aspirants who apply to SSC, UPSC, IBPS, Railway, State PSC, and other competitive exams.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure register/login with BCrypt + JWT tokens |
| 👤 **Multi-Profile Vault** | Create multiple profiles for different exams (SSC, UPSC, Private, etc.) |
| 📋 **Job Application Tracker** | Track all applications with status, dates, and department filters |
| 🔔 **Smart Notifications** | Daily reminders for upcoming exams (7 days, 1 day, today) + admit card alerts |
| 📸 **Photo & Signature Resizer** | Resize images to exact dimensions + compress to target KB |
| 🪪 **Aadhaar Combiner** | Combine front + back into single image (with gap) or PDF |
| 📄 **Resume Builder** | Generate professional PDF resumes from profile data |
| 🧩 **Browser Extension** | Chrome/Edge extension with floating widget, one-click copy, and auto-fill |
| 📱 **Responsive UI** | Clean, modern interface that works on desktop and mobile |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Spring Boot 3.4.1, Java 21, Spring Security |
| **Frontend** | React 18, Vite, Tailwind CSS v3 |
| **Database** | PostgreSQL 16 |
| **Auth** | JWT (JJWT 0.13.0) |
| **Image Processing** | Thumbnailator 0.4.20 |
| **PDF Generation** | OpenPDF 1.3.39 |
| **API Docs** | Springdoc OpenAPI (Swagger) |
| **Extension** | Chrome Manifest V3, Shadow DOM |
| **Containerization** | Docker Compose |

---

## 📸 Screenshots

> Add your screenshots here after running the project.

| Page | Preview |
|------|---------|
| Login | *screenshot* |
| Dashboard | *screenshot* |
| Applications | *screenshot* |
| Tools (Resizer) | *screenshot* |
| Resume Builder | *screenshot* |
| Browser Extension | *screenshot* |

---

## 🚀 Getting Started

### Prerequisites

- **Java 21+** ([Download](https://adoptium.net/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL 16+** (or Docker)
- **Maven** (bundled with Spring Boot wrapper)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/GovJobVault.git
cd GovJobVault
```

### 2. Start PostgreSQL (Docker)

```bash
docker-compose up -d
```

This starts PostgreSQL 16 on port `5432` with database `GovJobvault`.

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your PostgreSQL password and JWT secret
```

### 4. Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

- **API:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger-ui.html

### 5. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

- **App:** http://localhost:5173

### 6. Load Browser Extension (Optional)

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `extension/` folder
4. Click the **G** icon in toolbar → Login → Select profile
5. Visit any page → floating button appears → copy fields or auto-fill

---

## 📁 Project Structure

```
GovJobVault/
├── backend/                    # Spring Boot API
│   └── src/main/java/com/govjobvault/
│       ├── config/             # Security, CORS
│       ├── controller/         # REST controllers
│       ├── dto/                # Request/Response DTOs
│       ├── entity/             # JPA entities
│       ├── enums/              # Status, Type enums
│       ├── repository/         # Spring Data repos
│       ├── scheduler/          # Daily reminder cron
│       ├── security/           # JWT filter, provider
│       └── service/            # Business logic
├── frontend/                   # React + Vite
│   └── src/
│       ├── components/         # Layout, ProtectedRoute
│       ├── context/            # AuthContext
│       ├── pages/              # All page components
│       └── services/           # Axios API client
├── extension/                  # Chrome/Edge extension
│   ├── manifest.json
│   ├── background.js           # Service worker
│   ├── content.js              # Floating widget (Shadow DOM)
│   ├── popup.html/js/css       # Login + profile selector
│   └── icons/
├── docker-compose.yml
└── .env.example
```

---

## 🔌 API Reference

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login → JWT token |
| `GET` | `/api/auth/me` | Get current user |

### Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/profiles` | Create profile |
| `GET` | `/api/profiles` | List all profiles |
| `PUT` | `/api/profiles/{id}` | Update profile |
| `DELETE` | `/api/profiles/{id}` | Delete profile |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/profiles/{id}/documents` | Upload document |
| `GET` | `/api/profiles/{id}/documents/{type}/download` | Download document |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/applications` | Create application |
| `GET` | `/api/applications` | List applications |
| `GET` | `/api/applications/upcoming` | Next 30 days |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications` | List notifications |
| `GET` | `/api/notifications/unread-count` | Unread count |
| `PUT` | `/api/notifications/read-all` | Mark all read |

### Tools
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tools/resize` | Resize image |
| `POST` | `/api/tools/combine-aadhaar` | Combine Aadhaar |
| `POST` | `/api/resume/generate` | Generate PDF resume |

> 📖 Full API docs available at `/swagger-ui.html` when the backend is running.

---

## 🗓️ Development Phases

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Auth + Multi-Profile Vault | ✅ Done |
| 2 | Document Tools (Resizer + Combiner) | ✅ Done |
| 3 | Browser Extension (Floating Widget) | ✅ Done |
| 4 | Job Application Tracker + Notifications | ✅ Done |
| 5 | Resume Builder | ✅ Done |
| 6 | Polish, README, Final Improvements | ✅ Done |

---

## 🔮 Future Improvements

- [ ] Email notifications (Spring Mail)
- [ ] OCR Document Scanner (Tesseract integration)
- [ ] Admin dashboard for user management
- [ ] Export applications to Excel/CSV
- [ ] PWA support for mobile
- [ ] Dark mode toggle
- [ ] Bulk profile import/export
- [ ] SSC/UPSC exam calendar integration

---

## 👨‍💻 Author

**Ashish Choubey**

- GitHub: [@your-github](https://github.com/your-github)
- LinkedIn: [your-linkedin](https://linkedin.com/in/your-linkedin)

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Made with ❤️ for government job aspirants
</p>
