from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.client import Client
from app.models.request import Request
from app.services.auth import get_current_manager

router = APIRouter(prefix="/api/admin/clients", tags=["admin-clients"])


@router.get("")
def list_clients(db: Session = Depends(get_db), _=Depends(get_current_manager)):
    rows = (
        db.query(
            Client.id,
            Client.telegram_id,
            Client.username,
            Client.consent_accepted_at,
            func.count(Request.id).label("requests_count"),
        )
        .outerjoin(Request, Request.client_id == Client.id)
        .group_by(Client.id)
        .order_by(Client.id.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "telegram_id": r.telegram_id,
            "username": r.username,
            "consent_accepted_at": r.consent_accepted_at,
            "requests_count": r.requests_count,
        }
        for r in rows
    ]
