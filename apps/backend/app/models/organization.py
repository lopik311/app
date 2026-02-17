from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), index=True, unique=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    inn: Mapped[str | None] = mapped_column(String(32), nullable=True)
    kpp: Mapped[str | None] = mapped_column(String(32), nullable=True)
    ogrn: Mapped[str | None] = mapped_column(String(32), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    settlement_account: Mapped[str | None] = mapped_column(String(64), nullable=True)
    bik: Mapped[str | None] = mapped_column(String(32), nullable=True)
    correspondent_account: Mapped[str | None] = mapped_column(String(64), nullable=True)
    bank: Mapped[str | None] = mapped_column(String(255), nullable=True)
    director: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contract: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
