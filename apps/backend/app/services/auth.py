from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, Request
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.manager_user import ManagerUser

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def create_access_token(sub: str) -> str:
    exp = datetime.utcnow() + timedelta(minutes=settings.jwt_exp_minutes)
    payload = {"sub": sub, "exp": exp}
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except Exception as exc:
        raise HTTPException(status_code=401, detail="invalid token") from exc


def get_current_manager(request: Request, db: Session = Depends(get_db)) -> ManagerUser:
    token = request.cookies.get("admin_token")
    if not token:
        raise HTTPException(status_code=401, detail="unauthorized")
    payload = decode_access_token(token)
    manager = db.query(ManagerUser).filter(ManagerUser.id == int(payload["sub"]), ManagerUser.active.is_(True)).first()
    if not manager:
        raise HTTPException(status_code=401, detail="unauthorized")
    return manager
