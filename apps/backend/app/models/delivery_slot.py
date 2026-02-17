from datetime import date, datetime, time
from typing import Optional

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class DeliverySlot(Base):
    __tablename__ = "delivery_slots"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    direction_id: Mapped[Optional[int]] = mapped_column(ForeignKey("directions.id"), nullable=True, index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    time_from: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    time_to: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    capacity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.utcnow())
