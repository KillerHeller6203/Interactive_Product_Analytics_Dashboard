"""
Seed script — populates the database with realistic dummy data.

Creates:
- 10 users with diverse age/gender
- 80-100 FeatureClick records across:
  - Multiple dates (past 30 days)
  - All feature types
  - Multiple users
"""

import random
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

from database import engine, SessionLocal, Base
from models import User, FeatureClick
from auth import hash_password

# ── Configuration ─────────────────────────────────────
USERS = [
    {"username": "alice", "password": "password123", "age": 15, "gender": "Female"},
    {"username": "bob", "password": "password123", "age": 22, "gender": "Male"},
    {"username": "charlie", "password": "password123", "age": 35, "gender": "Male"},
    {"username": "diana", "password": "password123", "age": 45, "gender": "Female"},
    {"username": "eve", "password": "password123", "age": 28, "gender": "Female"},
    {"username": "frank", "password": "password123", "age": 52, "gender": "Male"},
    {"username": "grace", "password": "password123", "age": 17, "gender": "Other"},
    {"username": "henry", "password": "password123", "age": 30, "gender": "Male"},
    {"username": "isla", "password": "password123", "age": 41, "gender": "Female"},
    {"username": "jack", "password": "password123", "age": 19, "gender": "Male"},
]

FEATURE_NAMES = [
    "date_filter",
    "gender_filter",
    "age_filter",
    "bar_chart_click",
    "page_load",
    "login",
    "dashboard_view",
    "export_data",
]

NUM_CLICKS = random.randint(80, 100)
DAYS_BACK = 30


def seed():
    """Create tables, insert users and feature clicks."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).first():
            print("⚠️  Database already seeded. Skipping.")
            return

        # ── Create Users ──
        user_models = []
        for u in USERS:
            user = User(
                username=u["username"],
                hashed_password=hash_password(u["password"]),
                age=u["age"],
                gender=u["gender"],
            )
            db.add(user)
            user_models.append(user)

        db.commit()
        for u in user_models:
            db.refresh(u)

        print(f"✅ Created {len(user_models)} users")

        # ── Create FeatureClicks ──
        now = datetime.now(timezone.utc)
        clicks = []
        for _ in range(NUM_CLICKS):
            user = random.choice(user_models)
            feature = random.choice(FEATURE_NAMES)
            days_ago = random.randint(0, DAYS_BACK)
            hours = random.randint(0, 23)
            minutes = random.randint(0, 59)
            timestamp = now - timedelta(days=days_ago, hours=hours, minutes=minutes)

            click = FeatureClick(
                user_id=user.id,
                feature_name=feature,
                timestamp=timestamp,
            )
            clicks.append(click)
            db.add(click)

        db.commit()
        print(f"✅ Created {len(clicks)} feature click records")
        print(f"📊 Features covered: {', '.join(set(c.feature_name for c in clicks))}")
        print("\n🔑 All users have password: password123")
        print("   Try logging in with username: bob")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
