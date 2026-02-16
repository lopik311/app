from datetime import datetime

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.client import Client


def apply_start(db: Session, tg_user: dict) -> Client:
    client = db.query(Client).filter(Client.telegram_id == tg_user["id"]).first()
    if not client:
        client = Client(
            telegram_id=tg_user["id"],
            username=tg_user.get("username"),
            first_name=tg_user.get("first_name"),
            last_name=tg_user.get("last_name"),
        )
        db.add(client)
        db.commit()
        db.refresh(client)
    return client


def apply_consent(db: Session, telegram_id: int) -> None:
    client = db.query(Client).filter(Client.telegram_id == telegram_id).first()
    if not client:
        return
    client.consent_accepted_at = datetime.utcnow()
    client.consent_version = settings.consent_version
    db.commit()
