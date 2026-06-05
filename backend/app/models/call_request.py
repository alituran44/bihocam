import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, String

from app.db.base import Base

class CallRequestStatus(str, enum.Enum):
    PENDING = "pending"
    CALLED = "called"
    REJECTED = "rejected"

class CallRequest(Base):
    __tablename__ = "call_requests"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    status = Column(Enum(CallRequestStatus), default=CallRequestStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
