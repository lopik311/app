from datetime import datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Time
from sqlalchemy.orm import mapped_column

from app.db.base import Base


class DeliverySlot(Base):
    __tablename__ = "delivery_slots"

    id = mapped_column(Integer, primary_key=True, autoincrement=True)
    direction_id = mapped_column(Integer, ForeignKey("directions.id"), nullable=True, index=True)
    date = mapped_column(Date, index=True)
    time_from = mapped_column(Time, nullable=True)
    time_to = mapped_column(Time, nullable=True)
    capacity = mapped_column(Integer, nullable=True)
    active = mapped_column(Boolean, default=True, index=True)
    created_at = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
