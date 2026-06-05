from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.call_request import CallRequestStatus

class CallRequestCreate(BaseModel):
    name: str
    phone: str

class CallRequestUpdateStatus(BaseModel):
    status: CallRequestStatus

class CallRequestResponse(BaseModel):
    id: str
    name: str
    phone: str
    status: CallRequestStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
