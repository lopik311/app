from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.client import Client
from app.services.telegram import validate_init_data


def get_webapp_client(
    x_telegram_init_data: str = Header(default="", alias="X-Telegram-Init-Data"),
    db: Session = Depends(get_db),
) -> Client:
    if not x_telegram_init_data:
        raise HTTPException(status_code=401, detail="missing initData")
    try:
        tg_user = validate_init_data(x_telegram_init_data)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc

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
