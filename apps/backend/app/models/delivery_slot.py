from datetime import date, datetime, time

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class DeliverySlot(Base):
    __tablename__ = "delivery_slots"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    direction_id: Mapped[int | None] = mapped_column(ForeignKey("directions.id"), nullable=True, index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    time_from: Mapped[time | None] = mapped_column(Time, nullable=True)
    time_to: Mapped[time | None] = mapped_column(Time, nullable=True)
    capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
