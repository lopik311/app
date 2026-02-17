from pydantic import BaseModel, EmailStr

from app.models.request import RequestStatus


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class RequestUpdateIn(BaseModel):
    direction_id: int | None = None
    delivery_slot_id: int | None = None
    boxes_count: int | None = None
    weight_kg: float | None = None
    volume_m3: float | None = None
    status: RequestStatus | None = None
    comment: str | None = None


class DirectionIn(BaseModel):
    name: str


class DeliverySlotIn(BaseModel):
    direction_id: int | None = None
    date: str


class OrganizationIn(BaseModel):
    client_id: int
    name: str
    inn: str | None = None
    kpp: str | None = None
    ogrn: str | None = None
    address: str | None = None
    settlement_account: str | None = None
    bik: str | None = None
    correspondent_account: str | None = None
    bank: str | None = None
    director: str | None = None
