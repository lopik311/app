from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.client import Client
from app.models.organization import Organization
from app.schemas.admin import OrganizationIn
from app.services.auth import get_current_manager

router = APIRouter(prefix="/api/admin/organizations", tags=["admin-organizations"])


@router.get("")
def list_organizations(db: Session = Depends(get_db), _=Depends(get_current_manager)):
    rows = (
        db.query(Organization, Client)
        .join(Client, Client.id == Organization.client_id)
        .order_by(Organization.id.asc())
        .all()
    )
    return [
        {
            "id": org.id,
            "client_id": org.client_id,
            "contact_person": client.username,
            "name": org.name,
            "inn": org.inn,
            "kpp": org.kpp,
            "ogrn": org.ogrn,
            "address": org.address,
            "settlement_account": org.settlement_account,
            "bik": org.bik,
            "correspondent_account": org.correspondent_account,
            "bank": org.bank,
            "director": org.director,
        }
        for org, client in rows
    ]


@router.post("")
def create_organization(payload: OrganizationIn, db: Session = Depends(get_db), _=Depends(get_current_manager)):
    client = db.query(Client).filter(Client.id == payload.client_id).first()
    if not client:
        raise HTTPException(status_code=400, detail="invalid client_id")
    exists = db.query(Organization).filter(Organization.client_id == payload.client_id).first()
    if exists:
        raise HTTPException(status_code=400, detail="organization for client already exists")

    row = Organization(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": row.id}


@router.patch("/{org_id}")
def patch_organization(org_id: int, payload: OrganizationIn, db: Session = Depends(get_db), _=Depends(get_current_manager)):
    row = db.query(Organization).filter(Organization.id == org_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="not found")
    if payload.client_id != row.client_id:
        duplicate = db.query(Organization).filter(Organization.client_id == payload.client_id, Organization.id != org_id).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="organization for client already exists")
    for key, value in payload.model_dump().items():
        setattr(row, key, value)
    db.commit()
    return {"ok": True}


@router.delete("/{org_id}")
def delete_organization(org_id: int, db: Session = Depends(get_db), _=Depends(get_current_manager)):
    row = db.query(Organization).filter(Organization.id == org_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="not found")
    db.delete(row)
    db.commit()
    return {"ok": True}
