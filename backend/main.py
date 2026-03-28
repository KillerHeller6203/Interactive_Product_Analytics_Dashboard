import os
from dotenv import load_dotenv

# Load .env BEFORE any other imports that read env vars
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import auth_router, track_router, analytics_router

# ── Create tables ─────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── App ───────────────────────────────────────────────
app = FastAPI(
    title="Product Analytics Dashboard API",
    description="Backend API for the Interactive Product Analytics Dashboard",
    version="1.0.0",
)

# ── CORS (configurable via env) ───────────────────────
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────
app.include_router(auth_router.router)
app.include_router(track_router.router)
app.include_router(analytics_router.router)


@app.get("/")
def root():
    return {"message": "Product Analytics Dashboard API is running"}


@app.get("/health")
def health():
    """Health check endpoint for deployment platforms."""
    return {"status": "healthy"}
