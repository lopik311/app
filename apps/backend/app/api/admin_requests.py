from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import String, cast
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.client import Client
from app.models.delivery_slot import DeliverySlot
from app.models.direction import Direction
from app.models.request import Request, RequestStatus
from app.models.request_history import RequestHistory
from app.schemas.admin import RequestUpdateIn
from app.services.auth import get_current_manager
from app.services.telegram import send_telegram_message

router = APIRouter(prefix="/api/admin/requests", tags=["admin-requests"])


@router.get("")
def list_requests(
    status: RequestStatus | None = None,
    direction_id: int | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_manager),
):
    query = (
        db.query(Request, Client, Direction, DeliverySlot)
        .join(Client, Client.id == Request.client_id)
        .join(Direction, Direction.id == Request.direction_id)
        .join(DeliverySlot, DeliverySlot.id == Request.delivery_slot_id)
    )
    if status:
        query = query.filter(Request.status == status)
    if direction_id:
        query = query.filter(Request.direction_id == direction_id)
    if q:
        query = query.filter((Client.username.ilike(f"%{q}%")) | (cast(Client.telegram_id, String).ilike(f"%{q}%")))
    rows = query.order_by(Request.created_at.desc()).all()

    return [
        {
            "id": req.id,
            "request_number": req.request_number,
            "telegram_id": client.telegram_id,
            "username": client.username,
            "direction": direction.name,
            "delivery_date": str(slot.date),
            "status": req.status.value,
        }
        for req, client, direction, slot in rows
    ]


@router.get("/{request_id}")
def request_detail(request_id: int, db: Session = Depends(get_db), _=Depends(get_current_manager)):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="not found")
    history = db.query(RequestHistory).filter(RequestHistory.request_id == request_id).order_by(RequestHistory.created_at.desc()).all()
    return {
        "id": req.id,
        "request_number": req.request_number,
        "direction_id": req.direction_id,
        "delivery_slot_id": req.delivery_slot_id,
        "boxes_count": req.boxes_count,
        "weight_kg": float(req.weight_kg),
        "volume_m3": float(req.volume_m3),
        "status": req.status.value,
        "history": [
            {
                "event_type": h.event_type,
                "from_status": h.from_status,
                "to_status": h.to_status,
                "comment": h.comment,
                "created_at": h.created_at,
            }
            for h in history
        ],
    }


@router.patch("/{request_id}")
async def update_request(
    request_id: int,
    payload: RequestUpdateIn,
    db: Session = Depends(get_db),
    manager=Depends(get_current_manager),
):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="not found")

    previous_status = req.status
    for key in ["direction_id", "delivery_slot_id", "boxes_count", "weight_kg", "volume_m3"]:
        value = getattr(payload, key)
        if value is not None:
            setattr(req, key, value)

    if payload.status is not None:
        allowed = {
            RequestStatus.OPEN: {RequestStatus.IN_PROGRESS},
            RequestStatus.IN_PROGRESS: {RequestStatus.OPEN, RequestStatus.DONE},
            RequestStatus.DONE: set(),
        }
        if payload.status != req.status and payload.status not in allowed[req.status]:
            raise HTTPException(status_code=400, detail="invalid status transition")
        req.status = payload.status

    status_changed = previous_status != req.status
    db.add(
        RequestHistory(
            request_id=req.id,
            event_type="STATUS_CHANGED" if status_changed else "UPDATED",
            from_status=previous_status.value if status_changed else None,
            to_status=req.status.value if status_changed else None,
            changed_by_type="manager",
            changed_by_id=manager.id,
            comment=payload.comment,
        )
    )
    db.commit()

    if status_changed:
        client = db.query(Client).filter(Client.id == req.client_id).first()
        if client:
            await send_telegram_message(client.telegram_id, f"Заявка #{req.request_number}: статус изменен на {req.status.value}")
    return {"ok": True}
