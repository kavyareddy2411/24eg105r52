# College Parking Slot Manager

Full-stack web app to view, book and manage campus parking slots.

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite, **.jsx only** (styling is done with JS style objects, no .css files) |
| Backend | Java 17, Spring Boot 3, REST APIs, Spring Security + JWT, Spring Data JPA |
| Database | MySQL 8 |
| Tools | Maven, Docker, Git |

## Features
- Register / log in (JWT). Self-registration always creates a normal user.
- Parking layout: **green = available, red = occupied, gray = closed by admin**, for any time window you choose.
- Book a slot with vehicle number + time range; cancel your own bookings.
- **No double booking**: the slot row is locked while the conflict check runs, so two simultaneous requests cannot both succeed. A vehicle also cannot hold two overlapping bookings.
- Admin dashboard: stats, add / close / reopen / delete slots, view and cancel every booking.

Default admin (created on first start): `admin@college.edu` / `Admin@123`. **Change `ADMIN_PASSWORD` in production.**
20 starter slots (zones A, B, C) are created automatically on an empty database.

## Project structure
```
parking-slot-manager/
├── backend/                 Spring Boot API
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/college/parking/{model,repository,service,controller,security,dto,exception,config}
├── frontend/                React app
│   ├── Dockerfile  nginx.conf  netlify.toml
│   └── src/{pages,components}/*.jsx
├── docker-compose.yml       MySQL + backend + frontend in one command
├── render.yaml              Render blueprint (backend)
└── .github/workflows/ci.yml GitHub Actions build + tests
```

## Run locally

### Option A: Docker (easiest)
```bash
docker compose up --build
```
Open http://localhost:3000 (API on http://localhost:8080).

### Option B: without Docker
1. Start MySQL and make sure root/root works (or set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`). The database `parking_db` is created automatically.
2. Backend:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
3. Frontend:
   ```bash
   cd frontend
   cp .env.example .env     # VITE_API_URL=http://localhost:8080
   npm install
   npm run dev
   ```
   Open http://localhost:5173.

## Deploy

Order matters: **database -> backend (Render) -> frontend (Netlify) -> set CORS**.

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "College Parking Slot Manager"
git branch -M main
git remote add origin https://github.com/<you>/parking-slot-manager.git
git push -u origin main
```
GitHub Actions (`ci.yml`) then builds and tests both apps on every push.

### 2. MySQL database
Render does not offer managed MySQL, so use a free/cheap hosted MySQL, for example **Aiven for MySQL**, **TiDB Cloud**, **Railway** or **Clever Cloud**. Create a database and note host, port, user, password. Your JDBC URL looks like:
```
jdbc:mysql://HOST:PORT/DBNAME?sslMode=REQUIRED
```
(Tables are created automatically on first start.)

### 3. Backend on Render
1. Render dashboard -> **New + -> Blueprint** -> choose your GitHub repo (it reads `render.yaml`).
   Or **New + -> Web Service** -> Runtime **Docker**, Dockerfile path `./backend/Dockerfile`, Docker context `./backend`, health check path `/api/health`.
2. Set environment variables:

| Variable | Value |
|---|---|
| `DB_URL` | the JDBC URL from step 2 |
| `DB_USERNAME` / `DB_PASSWORD` | your MySQL credentials |
| `JWT_SECRET` | 32+ random characters (the blueprint generates one) |
| `ADMIN_PASSWORD` | a strong admin password |
| `CORS_ORIGINS` | your Netlify URL (set after step 4) |

3. After deploy, check `https://<your-service>.onrender.com/api/health` returns `{"status":"UP"}`.

Note: Render's free plan sleeps after inactivity, so the first request can take ~30-60 seconds.

### 4. Frontend on Netlify
1. Netlify -> **Add new site -> Import from Git** -> pick the repo. `netlify.toml` already sets base `frontend`, build `npm run build`, publish `dist`, and the SPA redirect.
2. **Site settings -> Environment variables**: add
   `VITE_API_URL = https://<your-service>.onrender.com` (no trailing slash), then redeploy.
3. Copy the Netlify URL into the backend's `CORS_ORIGINS` on Render (e.g. `https://your-site.netlify.app`; wildcards like `https://*.netlify.app` also work for preview deploys).

## API summary
| Method | Path | Access |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | public |
| GET | `/api/slots?start=&end=` (ISO-8601) | logged in |
| POST | `/api/bookings` | logged in |
| GET | `/api/bookings/my` | logged in |
| DELETE | `/api/bookings/{id}` (cancel) | owner or admin |
| GET | `/api/admin/stats`, `/api/admin/bookings` | admin |
| POST / PATCH / DELETE | `/api/admin/slots`, `/api/admin/slots/{id}/toggle`, `/api/admin/slots/{id}` | admin |

## Notes
- `frontend/index.html` is the single mount-point file Vite requires; it has no UI in it. All pages are `.jsx`.
- Environment variables are read by the backend with safe local defaults (`application.properties`); never commit real secrets.
