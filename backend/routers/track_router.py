from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from database import get_db
from models import User, FeatureClick
from schemas import TrackEvent
from auth import get_current_user

router = APIRouter(tags=["Tracking"])


@router.post("/track", status_code=status.HTTP_201_CREATED)
def track_event(
    event: TrackEvent,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Log a user interaction (feature click). 🔒 JWT required."""
    click = FeatureClick(
        user_id=current_user.id,
        feature_name=event.feature_name,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(click)
    db.commit()
    db.refresh(click)
    return {
        "message": "Event tracked",
        "id": click.id,
        "user_id": current_user.id,
        "feature_name": click.feature_name,
        "timestamp": click.timestamp.isoformat(),
    }
