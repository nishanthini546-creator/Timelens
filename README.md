# TimeLens — Full-Stack Digital Time & Productivity Intelligence Platform

TimeLens is a full-stack web application that helps users plan daily priorities, run deep-focus sessions, track productive vs. recreational digital time, visualize monthly productivity heatmaps, and receive real-time insights backed by PostgreSQL persistence.

---

## Architecture Overview

```text
TimeLens/
├── frontend/                  # React 19 + Vite + Three.js (@react-three/fiber) SPA
│   ├── public/                # Static assets (timelens-desert.mp4, icons)
│   ├── src/
│   │   ├── components/        # GlassCard, TimeLens3D (3D Hourglass), ProtectedRoute
│   │   ├── pages/             # Landing, Auth, Dashboard, PlanTrack, Calendar, Insights, Profile
│   │   ├── services/          # api.js (centralized REST API client)
│   │   ├── App.jsx            # React Router v7 routes
│   │   └── index.css          # Warm desert theme, glassmorphism & micro-interactions
│   ├── .env.example           # Frontend environment template
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   # Node.js + Express 5 REST API & Production Static Server
│   ├── config/
│   │   ├── db.js              # PostgreSQL connection pool with URI sanitization & SSL
│   │   └── initDb.js          # Auto-creates database, all 6 tables, constraints & indexes
│   ├── controllers/           # Auth, DailyEntries, Tasks, Activities, Goals, Notifications, Analytics
│   ├── middleware/            # JWT authentication middleware (authMiddleware.js)
│   ├── models/                # PostgreSQL SQL queries & analytics aggregation models
│   ├── routes/                # Express route definitions (/api/*)
│   ├── .env.example           # Backend environment template
│   ├── package.json
│   └── server.js              # Express entry point + SPA static serving + health check
│
├── database/
│   ├── schema.sql             # Standalone PostgreSQL DDL schema (tables, FKs, indexes)
│   └── clean_sample_data.sql  # Utility script to remove sample/demo rows safely
│
├── .env.example               # Root environment variables reference
├── render.yaml                # 1-Click Render Cloud Blueprint (Web Service + PostgreSQL)
├── package.json               # Root workspace build & production start scripts
└── README.md
```

---

## 1. Project Setup (Step-by-Step)

### Prerequisites
- **Node.js** v18+ (v20+ recommended)
- **PostgreSQL** v14+ running locally or in the cloud

### Step 1: Clone or Extract the Project
```bash
cd TimeLens
```

### Step 2: Install Dependencies
Install both backend and frontend dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```
*(Or from the root directory: `npm run install:all`)*

### Step 3: Configure Environment Variables
1. Copy `backend/.env.example` to `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env` with your PostgreSQL connection string and JWT secret:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/timelens
   JWT_SECRET=your_secure_random_jwt_secret_key
   CORS_ORIGINS=http://localhost:5173,http://localhost:5174
   CLIENT_URL=http://localhost:5173
   DB_SSL=false
   ```

2. Copy `frontend/.env.example` to `frontend/.env` (optional for local development):
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

### Step 4: Create PostgreSQL Database & Run Migrations
**Automatic Migration (Recommended):**
When you start the backend server (`npm run dev` or `npm start`), `backend/config/initDb.js` automatically:
1. Connects to PostgreSQL and creates the `timelens` database if it does not exist yet.
2. Creates all 6 required tables (`users`, `daily_entries`, `tasks`, `activities`, `goals`, `notifications`), foreign keys (`ON DELETE CASCADE`), and indexes.

**Manual SQL Schema Execution (Optional):**
If you prefer to apply the SQL schema manually via `psql`:
```bash
psql -U postgres -c "CREATE DATABASE timelens;"
psql -U postgres -d timelens -f database/schema.sql
```

---

## 2. Development Workflow

Open two terminals:

### Terminal 1 — Start Backend API (`http://localhost:5000`)
```bash
cd backend
npm run dev
```
- Runs `nodemon server.js` on port `5000`.
- Health check endpoint: `GET http://localhost:5000/api/health`

### Terminal 2 — Start Frontend Vite Dev Server (`http://localhost:5173`)
```bash
cd frontend
npm run dev
```
- Opens the React application at `http://localhost:5173`.

---

## 3. Production Build & Deployment

### Unified Full-Stack Production Build
From the project root directory:
```bash
# 1. Build the frontend production bundle into frontend/dist and install backend deps
npm run build

# 2. Start the production server (serves both frontend/dist SPA and /api/* routes)
npm start
```
In production (`import.meta.env.PROD`), `frontend/src/services/api.js` automatically routes API calls to `/api` on the same HTTPS domain (or to `VITE_API_BASE_URL` if deployed on separate frontend/backend domains).

### Required Production Environment Variables
| Variable | Description |
| :--- | :--- |
| `NODE_ENV` | Set to `production` |
| `PORT` | Port bound by Express (default `5000` or platform-injected `$PORT`) |
| `DATABASE_URL` | Production PostgreSQL connection string (`postgresql://user:pass@host:5432/dbname`) |
| `JWT_SECRET` | Cryptographically strong secret string for signing JWT tokens |
| `CORS_ORIGINS` | Comma-separated list of allowed HTTPS frontend origins (e.g. `https://your-domain.com`) |
| `VITE_API_BASE_URL` | *(Optional if serving frontend & backend together)* Full HTTPS backend API URL (`https://api.your-domain.com/api`) |
