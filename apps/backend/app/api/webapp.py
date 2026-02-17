from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_webapp_client
from app.db.session import get_db
from app.models.client import Client
from app.models.delivery_slot import DeliverySlot
from app.models.direction import Direction
from app.models.request import Request
from app.models.request_history import RequestHistory
from app.schemas.webapp import RequestCreate

router = APIRouter(prefix="/api/webapp", tags=["webapp"])


@router.get("/me")
def me(client: Client = Depends(get_webapp_client)):
    return {
        "telegram_id": client.telegram_id,
        "username": client.username,
        "consent_accepted_at": client.consent_accepted_at,
    }


@router.get("/directions")
def list_directions(db: Session = Depends(get_db)):
    rows = db.query(Direction).filter(Direction.active.is_(True)).order_by(Direction.name).all()
    return [{"id": r.id, "name": r.name} for r in rows]


@router.get("/delivery-slots")
def list_slots(direction_id: int | None = None, db: Session = Depends(get_db)):
    q = db.query(DeliverySlot).filter(DeliverySlot.active.is_(True))
    if direction_id:
        q = q.filter((DeliverySlot.direction_id == direction_id) | (DeliverySlot.direction_id.is_(None)))
    rows = q.order_by(DeliverySlot.date).all()
    return [
        {
            "id": s.id,
            "direction_id": s.direction_id,
            "label": f"{s.date} {s.time_from or ''}-{s.time_to or ''}".strip(),
        }
        for s in rows
    ]


@router.get("/requests")
def my_requests(client: Client = Depends(get_webapp_client), db: Session = Depends(get_db)):
    rows = (
        db.query(Request, Direction, DeliverySlot)
        .join(Direction, Direction.id == Request.direction_id)
        .join(DeliverySlot, DeliverySlot.id == Request.delivery_slot_id)
        .filter(Request.client_id == client.id)
        .order_by(Request.created_at.desc())
        .all()
    )
    return [
        {
            "id": req.id,
            "request_number": req.request_number,
            "direction": direction.name,
            "delivery_date": str(slot.date),
            "boxes_count": req.boxes_count,
            "weight_kg": float(req.weight_kg),
            "volume_m3": float(req.volume_m3),
            "telegram_id": client.telegram_id,
            "username": client.username,
            "comment": req.comment,
            "status": req.status.value,
            "created_at": req.created_at,
        }
        for req, direction, slot in rows
    ]


@router.post("/requests")
def create_request(payload: RequestCreate, client: Client = Depends(get_webapp_client), db: Session = Depends(get_db)):
    direction = db.query(Direction).filter(Direction.id == payload.direction_id, Direction.active.is_(True)).first()
    slot = db.query(DeliverySlot).filter(DeliverySlot.id == payload.delivery_slot_id, DeliverySlot.active.is_(True)).first()
    if not direction or not slot:
        raise HTTPException(status_code=400, detail="invalid direction or slot")

    next_number = (db.query(func.max(Request.request_number)).scalar() or 0) + 1
    req = Request(
        request_number=next_number,
        client_id=client.id,
        direction_id=payload.direction_id,
        delivery_slot_id=payload.delivery_slot_id,
        boxes_count=payload.boxes_count,
        weight_kg=payload.weight_kg,
        volume_m3=payload.volume_m3,
        comment=payload.comment,
    )
    db.add(req)
    db.flush()
    db.add(
        RequestHistory(
            request_id=req.id,
            event_type="CREATED",
            to_status=req.status.value,
            changed_by_type="client",
            changed_by_id=client.id,
        )
    )
    db.commit()
    return {"id": req.id, "request_number": req.request_number, "status": req.status.value}


@router.get("/requests/{request_id}")
def request_detail(request_id: int, client: Client = Depends(get_webapp_client), db: Session = Depends(get_db)):
    req = db.query(Request).filter(Request.id == request_id, Request.client_id == client.id).first()
    if not req:
        raise HTTPException(status_code=404, detail="not found")
    direction = db.query(Direction).filter(Direction.id == req.direction_id).first()
    slot = db.query(DeliverySlot).filter(DeliverySlot.id == req.delivery_slot_id).first()
    history = db.query(RequestHistory).filter(RequestHistory.request_id == req.id).order_by(RequestHistory.created_at.desc()).all()

    return {
        "id": req.id,
        "request_number": req.request_number,
        "direction": direction.name if direction else None,
        "delivery_slot": f"{slot.date} {slot.time_from or ''}-{slot.time_to or ''}" if slot else None,
        "boxes_count": req.boxes_count,
        "weight_kg": float(req.weight_kg),
        "volume_m3": float(req.volume_m3),
        "comment": req.comment,
        "telegram_id": client.telegram_id,
        "username": client.username,
        "status": req.status.value,
        "created_at": req.created_at,
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
