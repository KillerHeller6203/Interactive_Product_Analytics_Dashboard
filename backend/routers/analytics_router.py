from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, String
from typing import Optional
from datetime import datetime

from database import get_db
from models import User, FeatureClick
from schemas import AnalyticsResponse, FeatureCount, TimeSeriesPoint
from auth import get_current_user

router = APIRouter(tags=["Analytics"])


def _parse_age_group(age_group: Optional[str]):
    """Convert age group string to min/max age tuple."""
    if not age_group or age_group == "all":
        return None, None
    if age_group == "<18":
        return 0, 17
    elif age_group == "18-40":
        return 18, 40
    elif age_group == ">40":
        return 41, 200
    return None, None


@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    start_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    age_group: Optional[str] = Query(None, description="<18, 18-40, >40, or all"),
    gender: Optional[str] = Query(None, description="Male, Female, Other, or all"),
    feature_name: Optional[str] = Query(
        None, description="Filter time_series by feature"
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return aggregated analytics data. 🔒 JWT required.

    Returns:
    - feature_counts: total clicks per feature (for bar chart)
    - time_series: clicks over time, optionally filtered by feature_name (for line chart)
    """
    # ── Base query with user join for demographic filters ──
    base_query = db.query(FeatureClick).join(User, FeatureClick.user_id == User.id)

    # ── Apply filters ──
    if start_date:
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            base_query = base_query.filter(FeatureClick.timestamp >= start_dt)
        except ValueError:
            pass

    if end_date:
        try:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59
            )
            base_query = base_query.filter(FeatureClick.timestamp <= end_dt)
        except ValueError:
            pass

    min_age, max_age = _parse_age_group(age_group)
    if min_age is not None:
        base_query = base_query.filter(User.age >= min_age, User.age <= max_age)

    if gender and gender.lower() != "all":
        base_query = base_query.filter(User.gender == gender)

    # ── Feature Counts (bar chart) ──
    feature_counts_query = (
        base_query.with_entities(
            FeatureClick.feature_name, func.count(FeatureClick.id).label("count")
        )
        .group_by(FeatureClick.feature_name)
        .order_by(func.count(FeatureClick.id).desc())
        .all()
    )

    feature_counts = [
        FeatureCount(feature_name=row[0], count=row[1]) for row in feature_counts_query
    ]

    # ── Time Series (line chart) — filtered by selected feature ──
    ts_query = base_query
    if feature_name:
        ts_query = ts_query.filter(FeatureClick.feature_name == feature_name)

    # Group by day using date string extraction (SQLite compatible)
    time_series_query = (
        ts_query.with_entities(
            func.strftime("%Y-%m-%d", FeatureClick.timestamp).label("period"),
            func.count(FeatureClick.id).label("count"),
        )
        .group_by("period")
        .order_by("period")
        .all()
    )

    time_series = [
        TimeSeriesPoint(period=row[0], count=row[1]) for row in time_series_query
    ]

    return AnalyticsResponse(feature_counts=feature_counts, time_series=time_series)
