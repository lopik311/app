from pydantic import BaseModel, Field


class RequestCreate(BaseModel):
    direction_id: int
    delivery_slot_id: int
    boxes_count: int = Field(gt=0)
    weight_kg: float = Field(gt=0)
    volume_m3: float = Field(gt=0)
