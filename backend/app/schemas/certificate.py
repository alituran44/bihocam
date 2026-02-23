"""Pydantic schemas for certificate management."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

from app.models.certificate import TemplateType


# ==================== Certificate Template Schemas ====================

class CertificateTemplateCreate(BaseModel):
    """Schema for creating a new certificate template."""
    name: str = Field(..., max_length=200, description="Template name")
    description: Optional[str] = Field(None, description="Template description")
    template_type: TemplateType = Field(default=TemplateType.DEFAULT, description="Template type")
    config: Optional[dict] = Field(None, description="Template configuration (fonts, colors, layout)")
    course_id: Optional[str] = Field(None, description="Course-specific template (null for global)")

    @field_validator("config")
    @classmethod
    def validate_config(cls, v):
        """Validate config structure if provided."""
        if v is None:
            return v
        
        # Define allowed config keys
        allowed_keys = {
            "font_family",
            "font_size_title",
            "font_size_body",
            "primary_color",
            "secondary_color",
            "text_align",
            "show_qr_code",
            "show_logo",
            "show_signature",
        }
        
        # Check for unknown keys
        unknown_keys = set(v.keys()) - allowed_keys
        if unknown_keys:
            raise ValueError(f"Unknown config keys: {unknown_keys}")
        
        return v


class CertificateTemplateUpdate(BaseModel):
    """Schema for updating a certificate template."""
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    template_type: Optional[TemplateType] = None
    config: Optional[dict] = None
    is_active: Optional[bool] = None

    @field_validator("config")
    @classmethod
    def validate_config(cls, v):
        """Validate config structure if provided."""
        if v is None:
            return v
        
        # Define allowed config keys
        allowed_keys = {
            "font_family",
            "font_size_title",
            "font_size_body",
            "primary_color",
            "secondary_color",
            "text_align",
            "show_qr_code",
            "show_logo",
            "show_signature",
        }
        
        # Check for unknown keys
        unknown_keys = set(v.keys()) - allowed_keys
        if unknown_keys:
            raise ValueError(f"Unknown config keys: {unknown_keys}")
        
        return v


class CertificateTemplateResponse(BaseModel):
    """Schema for certificate template response."""
    id: str
    name: str
    description: Optional[str]
    template_type: TemplateType
    background_image: Optional[str]
    logo_image: Optional[str]
    signature_image: Optional[str]
    config: Optional[dict]
    created_by_id: str
    is_system_template: bool
    is_active: bool
    course_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    # Optional nested data
    created_by_name: Optional[str] = None
    course_title: Optional[str] = None

    model_config = {"from_attributes": True}


# ==================== Certificate Schemas ====================

class CertificateResponse(BaseModel):
    """Schema for certificate response."""
    id: str
    certificate_number: str
    user_id: str
    course_id: str
    issued_at: datetime
    completion_date: datetime
    total_lessons: int
    completed_lessons: int
    completion_percentage: int
    pdf_path: Optional[str]
    pdf_generated_at: Optional[datetime]
    is_revoked: bool
    revoked_at: Optional[datetime]
    revocation_reason: Optional[str]
    
    # Nested data for better UX
    student_name: str
    student_email: Optional[str] = None
    course_title: str
    teacher_name: str
    
    model_config = {"from_attributes": True}


class CertificateVerificationResponse(BaseModel):
    """Schema for public certificate verification (limited info for privacy)."""
    is_valid: bool
    certificate_number: Optional[str] = None
    student_name: Optional[str] = None  # May be masked: "H**** E*"
    course_title: Optional[str] = None
    issued_at: Optional[datetime] = None
    is_revoked: bool
    revocation_reason: Optional[str] = None
    verified_at: datetime = Field(default_factory=datetime.now)

    model_config = {"from_attributes": True}


class CertificateGenerateRequest(BaseModel):
    """Schema for manual certificate generation request."""
    enrollment_id: str = Field(..., description="Enrollment ID to generate certificate for")


class CertificateRevokeRequest(BaseModel):
    """Schema for certificate revocation request."""
    reason: str = Field(..., min_length=10, max_length=500, description="Reason for revocation")


class CertificateListResponse(BaseModel):
    """Schema for paginated certificate list."""
    certificates: list[CertificateResponse]
    total: int
    page: int
    page_size: int
    has_more: bool

    model_config = {"from_attributes": True}


class CertificateUploadResponse(BaseModel):
    """Schema for template file upload response."""
    background_image: Optional[str] = None
    logo_image: Optional[str] = None
    signature_image: Optional[str] = None
    message: str = "File uploaded successfully"

    model_config = {"from_attributes": True}
