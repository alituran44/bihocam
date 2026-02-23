"""Pydantic schemas for course approval endpoints"""
from pydantic import BaseModel, field_validator


class CourseApproveRequest(BaseModel):
    """Request schema for approving a course"""
    note: str | None = None
    
    @field_validator('note')
    @classmethod
    def validate_note(cls, v: str | None) -> str | None:
        """Validate note if provided"""
        if v is not None and len(v.strip()) > 0 and len(v.strip()) < 10:
            raise ValueError("Admin notu en az 10 karakter olmalıdır (veya boş bırakılabilir)")
        return v.strip() if v else None


class CourseRejectRequest(BaseModel):
    """Request schema for rejecting a course"""
    note: str
    
    @field_validator('note')
    @classmethod
    def validate_note(cls, v: str) -> str:
        """Validate rejection note - must be at least 10 characters"""
        if not v or len(v.strip()) < 10:
            raise ValueError("Red sebebi zorunludur ve en az 10 karakter olmalıdır")
        return v.strip()
