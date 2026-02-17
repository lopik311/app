import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class RequestStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"


class Request(Base):
    __tablename__ = "requests"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    request_number: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), index=True)
    direction_id: Mapped[int] = mapped_column(ForeignKey("directions.id"), index=True)
    delivery_slot_id: Mapped[int] = mapped_column(ForeignKey("delivery_slots.id"), index=True)
    boxes_count: Mapped[int] = mapped_column(Integer)
    weight_kg: Mapped[float] = mapped_column(Numeric(10, 2))
    volume_m3: Mapped[float] = mapped_column(Numeric(10, 2))
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[RequestStatus] = mapped_column(Enum(RequestStatus), default=RequestStatus.OPEN, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
