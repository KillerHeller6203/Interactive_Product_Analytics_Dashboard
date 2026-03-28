# Interactive Product Analytics Dashboard

A full-stack analytics dashboard for tracking and visualizing user interactions with product features. Built with **React + Vite** (frontend) and **FastAPI** (backend), featuring JWT authentication, real-time tracking, interactive charts, and cookie-based filter persistence.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Chart.js, Axios |
| **Backend** | FastAPI, SQLAlchemy, SQLite |
| **Authentication** | JWT (python-jose), bcrypt (passlib) |
| **Deployment** | Render (backend), Vercel (frontend) |

---

## Features

- **JWT Authentication** — Secure register/login with token-based auth; expired tokens handled gracefully
- **Interactive Bar Chart** — Click any bar to drill down into that feature's time trend
- **Dynamic Line Chart** — Shows aggregate click trend by default; filters to specific feature on bar click
- **Demographic Filters** — Filter by date range, age group, and gender
- **Cookie Persistence** — Filter selections survive page reloads via cookies
- **Interaction Tracking** — Every user action (login, filter change, chart click, page load) is logged via `POST /track`
- **Loading States** — Spinners during data fetch, error banners with retry
- **Responsive Design** — Dark glassmorphism UI that works on all screen sizes

---

## Project Structure

```
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── auth.py                  # JWT + password utilities
│   ├── database.py              # SQLAlchemy engine/session
│   ├── models.py                # User + FeatureClick models
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── seed.py                  # Database seeder (80-100 records)
│   ├── requirements.txt         # Python dependencies
│   ├── Procfile                 # Gunicorn config for deployment
│   ├── .env                     # Environment variables (not committed)
│   ├── .env.example             # Env template
│   └── routers/
│       ├── auth_router.py       # /register, /login
│       ├── track_router.py      # /track
│       └── analytics_router.py  # /analytics
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env                     # VITE_API_URL (not committed)
│   ├── .env.example             # Env template
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Auth routing
│       ├── api.js               # Axios instance + interceptors
│       ├── cookies.js           # Cookie utilities for filter persistence
│       ├── index.css            # Global styles (dark glassmorphism)
│       └── components/
│           ├── Login.jsx        # Login/Register form
│           ├── Dashboard.jsx    # Main dashboard layout
│           ├── Filters.jsx      # Date/age/gender filters
│           ├── BarChart.jsx     # Feature usage bar chart
│           └── LineChart.jsx    # Click trend line chart
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your values (defaults work for development)

# Seed the database
python seed.py

# Start the server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit VITE_API_URL if your backend runs on a different port

# Start the dev server
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:8000`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | JWT signing key | *(dev key provided)* |
| `DATABASE_URL` | SQLAlchemy database URL | `sqlite:///./analytics.db` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173,http://localhost:3000` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token lifetime in minutes | `1440` (24 hours) |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

---

## How to Seed Data

The seed script creates **10 users** with diverse demographics and **80–100 feature click records** spread across 30 days and 8 feature types.

```bash
cd backend
python seed.py
```

**Seed users** (all have password `password123`):

| Username | Age | Gender |
|----------|-----|--------|
| alice | 15 | Female |
| bob | 22 | Male |
| charlie | 35 | Male |
| diana | 45 | Female |
| eve | 28 | Female |
| frank | 52 | Male |
| grace | 17 | Other |
| henry | 30 | Male |
| isla | 41 | Female |
| jack | 19 | Male |

**Feature types tracked**: `date_filter`, `gender_filter`, `age_filter`, `bar_chart_click`, `page_load`, `login`, `dashboard_view`, `export_data`

To re-seed, delete `analytics.db` and run `python seed.py` again.

---

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Register new user. Body: `{username, password, age, gender}`. Returns JWT. |
| `POST` | `/login` | ❌ | Login. Body: `{username, password}`. Returns JWT. |

### Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/analytics` | JWT | Get aggregated analytics. Query params: `start_date`, `end_date`, `age_group`, `gender`, `feature_name`. Returns `{feature_counts, time_series}`. |

### Tracking

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/track` | JWT | Log user interaction. Body: `{feature_name}`. Returns `{id, user_id, feature_name, timestamp}`. |

### System

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ❌ | API status check |
| `GET` | `/health` | ❌ | Health check for deployment platforms |

### Error Responses

- `401 Unauthorized` — Missing, invalid, or expired JWT token
- `400 Bad Request` — Duplicate username on registration

---

## Architecture Decisions

### Why SQLite?
SQLite is zero-configuration and sufficient for a demo/assignment. The `DATABASE_URL` env var supports swapping to PostgreSQL for production without code changes.

### Why cookies for filter persistence?
Cookies persist across tabs and page reloads without requiring backend storage. They keep filter state client-side, avoiding unnecessary API calls.

### Why client-side JWT storage?
JWTs are stored in `localStorage` and attached via Axios interceptor. A response interceptor auto-clears the token and redirects to login on 401 responses (expired/invalid tokens).

### Why Chart.js?
Lightweight, well-documented, and supports click event handlers for chart interactivity — critical for the bar→line chart drill-down feature.

### Tracking Architecture
Every user interaction fires `POST /track` with the feature name. The backend records `user_id` (from JWT), `feature_name`, and `timestamp`. This data feeds back into the analytics API for the dashboard visualizations.

---

## Deployment

### Backend → Render

1. Push backend code to a GitHub repo
2. Create a new **Web Service** on [Render](https://render.com)
3. Set:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
   - **Root Directory**: `backend`
4. Add environment variables:
   - `SECRET_KEY` — generate a secure random key
   - `DATABASE_URL` — use Render's PostgreSQL add-on
   - `CORS_ORIGINS` — your Vercel frontend URL
   - `ACCESS_TOKEN_EXPIRE_MINUTES` — `1440`

### Frontend → Vercel

1. Push frontend code to a GitHub repo
2. Create a new project on [Vercel](https://vercel.com)
3. Set:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   - `VITE_API_URL` — your Render backend URL (e.g., `https://your-app.onrender.com`)

---

## Scalability: Handling 1 Million Write Events Per Minute

> **Question**: *"If this dashboard had to handle 1 million write events per minute, how would you redesign the backend architecture?"*

### Current Bottleneck

The current architecture uses synchronous SQLite writes — each `POST /track` directly inserts into the database. At ~16,667 writes/second, this would saturate SQLite immediately.

### Redesigned Architecture

```
Clients → API Gateway (Rate Limit + Auth)
              ↓
         Kafka / Redis Streams  ← Message Queue (buffer writes)
              ↓
         Consumer Workers (N)   ← Batch insert into DB
              ↓
         PostgreSQL / TimescaleDB (Partitioned by timestamp)
              ↓
         Materialized Views / Pre-aggregated tables
              ↓
         Analytics API (reads from pre-computed data)
```

#### Key Changes:

1. **Message Queue (Kafka/Redis Streams)**
   - `POST /track` publishes to a queue and returns `202 Accepted` immediately
   - Decouples write ingestion from database persistence
   - Provides natural backpressure and durability

2. **Consumer Workers**
   - Consume events in micro-batches (e.g., 1000 events per batch insert)
   - Batch inserts are 50–100x faster than individual inserts
   - Horizontally scalable — add more consumers as needed

3. **TimescaleDB (PostgreSQL extension)**
   - Automatic time-based partitioning for efficient range queries
   - Built-in compression for old data (10–20x storage reduction)
   - Continuous aggregates for pre-computed rollups

4. **Pre-aggregated Analytics**
   - Materialized views for hourly/daily aggregates
   - Analytics API reads from pre-computed tables, not raw events
   - Sub-100ms response times regardless of data volume

5. **Caching Layer (Redis)**
   - Cache analytics responses with short TTL (30–60s)
   - Invalidate on new aggregate computation
   - Reduces database load for repeated dashboard queries

6. **Infrastructure**
   - Kubernetes for auto-scaling API pods and consumers
   - API Gateway for rate limiting, auth validation, and load balancing
   - Monitoring: Prometheus + Grafana for throughput and latency alerts

#### Expected Performance:
- **Write latency**: <10ms (queue publish)
- **End-to-end latency**: 5–30s (event to queryable aggregate)
- **Read latency**: <100ms (pre-aggregated + cached)
- **Throughput**: 1M+ writes/min sustainable

---

## License

This project is built as a full-stack challenge submission.
