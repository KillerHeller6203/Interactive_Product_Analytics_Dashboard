from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Auth ──────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    password: str
    age: int
    gender: str


class UserOut(BaseModel):
    id: int
    username: str
    age: int
    gender: str

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str


# ── Tracking ──────────────────────────────────────────
class TrackEvent(BaseModel):
    feature_name: str


# ── Analytics ─────────────────────────────────────────
class FeatureCount(BaseModel):
    feature_name: str
    count: int


class TimeSeriesPoint(BaseModel):
    period: str
    count: int


class AnalyticsResponse(BaseModel):
    feature_counts: List[FeatureCount]
    time_series: List[TimeSeriesPoint]
