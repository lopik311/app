from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.manager_user import ManagerUser
from app.schemas.admin import LoginIn
from app.services.auth import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/admin/auth", tags=["admin-auth"])


@router.post("/bootstrap")
def bootstrap_admin(email: str, password: str, db: Session = Depends(get_db)):
    if db.query(ManagerUser).count() > 0:
        raise HTTPException(status_code=400, detail="already initialized")
    manager = ManagerUser(email=email, password_hash=hash_password(password), role="admin")
    db.add(manager)
    db.commit()
    return {"ok": True}


@router.post("/login")
def login(payload: LoginIn, response: Response, db: Session = Depends(get_db)):
    user = db.query(ManagerUser).filter(ManagerUser.email == payload.email, ManagerUser.active.is_(True)).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="invalid credentials")
    token = create_access_token(str(user.id))
    user.last_login_at = datetime.utcnow()
    db.commit()
    response.set_cookie("admin_token", token, httponly=True, samesite="lax")
    return {"ok": True}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("admin_token")
    return {"ok": True}
