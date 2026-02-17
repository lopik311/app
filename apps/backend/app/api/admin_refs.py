from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.delivery_slot import DeliverySlot
from app.models.direction import Direction
from app.schemas.admin import DeliverySlotIn, DirectionIn
from app.services.auth import get_current_manager

router = APIRouter(prefix="/api/admin", tags=["admin-refs"])


@router.get("/directions")
def list_directions(db: Session = Depends(get_db), _=Depends(get_current_manager)):
    rows = db.query(Direction).order_by(Direction.id.desc()).all()
    return [{"id": d.id, "name": d.name} for d in rows]


@router.post("/directions")
def create_direction(payload: DirectionIn, db: Session = Depends(get_db), _=Depends(get_current_manager)):
    row = Direction(name=payload.name)
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": row.id}


@router.patch("/directions/{direction_id}")
def patch_direction(direction_id: int, payload: DirectionIn, db: Session = Depends(get_db), _=Depends(get_current_manager)):
    row = db.query(Direction).filter(Direction.id == direction_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="not found")
    row.name = payload.name
    db.commit()
    return {"ok": True}


@router.get("/delivery-slots")
def list_slots(db: Session = Depends(get_db), _=Depends(get_current_manager)):
    rows = db.query(DeliverySlot).order_by(DeliverySlot.date.desc()).all()
    return [
        {
            "id": s.id,
            "direction_id": s.direction_id,
            "date": str(s.date),
        }
        for s in rows
    ]


@router.post("/delivery-slots")
def create_slot(payload: DeliverySlotIn, db: Session = Depends(get_db), _=Depends(get_current_manager)):
    slot = DeliverySlot(
        direction_id=payload.direction_id,
        date=datetime.strptime(payload.date, "%Y-%m-%d").date(),
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return {"id": slot.id}


@router.patch("/delivery-slots/{slot_id}")
def patch_slot(slot_id: int, payload: DeliverySlotIn, db: Session = Depends(get_db), _=Depends(get_current_manager)):
    slot = db.query(DeliverySlot).filter(DeliverySlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="not found")
    slot.direction_id = payload.direction_id
    slot.date = datetime.strptime(payload.date, "%Y-%m-%d").date()
    db.commit()
    return {"ok": True}


@router.delete("/delivery-slots/{slot_id}")
def delete_slot(slot_id: int, db: Session = Depends(get_db), _=Depends(get_current_manager)):
    slot = db.query(DeliverySlot).filter(DeliverySlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="not found")
    db.delete(slot)
    db.commit()
    return {"ok": True}
