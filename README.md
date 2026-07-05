# 🛡️ CyberAware — Cybersecurity Awareness Training Platform

A production-ready educational web application that teaches users about **phishing attacks** and **malware threats** through interactive quizzes, personalized feedback, and gamification.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Tailwind CSS v4, Vite, Recharts, React Router |
| **Backend** | Python, Django 4.2, Django REST Framework |
| **Auth** | JWT (SimpleJWT) — Access + Refresh tokens |
| **Database** | SQLite (dev) / PostgreSQL (prod) |

## 📁 Project Structure

```
Cyber_Security_AP/
├── backend/                # Django REST API
│   ├── accounts/           # Auth & user management
│   ├── quiz/               # Quiz engine, questions, scoring
│   ├── leaderboard/        # Rankings & badges
│   ├── seed/               # Seed data (55 questions)
│   └── core/               # Django settings
├── frontend/               # React SPA
│   └── src/
│       ├── pages/          # 12 page components
│       ├── components/     # Reusable UI components
│       ├── context/        # Auth state management
│       └── api/            # Axios instance
└── README.md
```

## ⚡ Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_questions
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Default Admin Login
- **Email:** admin@cyberaware.com
- **Password:** Admin@123

## 🎯 Features

- ✅ JWT Authentication (Register/Login/Refresh)
- ✅ Role-based quiz delivery (Student/Professional/Public)
- ✅ Smart question exclusion algorithm
- ✅ 20 or 50 question quiz modes with timer
- ✅ Auto-submit on timeout
- ✅ Phishing & Malware performance breakdown
- ✅ AI-powered personalized feedback
- ✅ Quiz history with answer review
- ✅ Global leaderboard (Top 10)
- ✅ Achievement badges (10 types)
- ✅ Certificate download (score ≥ 80%)
- ✅ Admin dashboard with analytics
- ✅ Question CRUD management
- ✅ Password reset flow
- ✅ Daily cybersecurity tips
- ✅ Fully responsive design
- ✅ 55 seed questions

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register/` | No | Register |
| POST | `/api/login/` | No | Login (JWT) |
| POST | `/api/token/refresh/` | No | Refresh token |
| GET/PUT | `/api/profile/` | Yes | Profile |
| POST | `/api/change-password/` | Yes | Change password |
| POST | `/api/forgot-password/` | No | Forgot password |
| POST | `/api/reset-password/` | No | Reset password |
| GET | `/api/quiz/start/` | Yes | Start quiz |
| POST | `/api/quiz/submit/` | Yes | Submit quiz |
| GET | `/api/quiz/history/` | Yes | Quiz history |
| GET | `/api/quiz/review/:id/` | Yes | Review answers |
| GET | `/api/leaderboard/` | Yes | Leaderboard |
| GET | `/api/badges/` | Yes | User badges |
| CRUD | `/api/questions/` | Admin | Manage questions |
| GET | `/api/admin/stats/` | Admin | Analytics |
| GET | `/api/admin/users/` | Admin | User list |

## 🔒 Security

- Password hashing (Django PBKDF2)
- JWT with token rotation & blacklisting
- CORS restricted to frontend origin
- CSRF protection enabled
- Rate limiting (30/min anon, 120/min user)
- Input validation on all endpoints
- Protected routes (frontend + backend)

## 📄 License

Built for educational purposes — MCA PBL Project.
