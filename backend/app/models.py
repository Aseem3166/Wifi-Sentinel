
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime

from .database import Base


class ScanSession(Base):
    __tablename__ = "scan_sessions"

    id = Column(Integer, primary_key=True, index=True)

    status = Column(
        String(30),
        default="initialized",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
