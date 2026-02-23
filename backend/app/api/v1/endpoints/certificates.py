"""Certificate management endpoints."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status, Request
from fastapi.responses import StreamingResponse, HTMLResponse
from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.certificate import Certificate, CertificateTemplate, TemplateType
from app.models.course import Course
from app.models.order import Enrollment
from app.models.user import User, UserRole
from app.schemas.certificate import (
    CertificateGenerateRequest,
    CertificateListResponse,
    CertificateResponse,
    CertificateRevokeRequest,
    CertificateTemplateCreate,
    CertificateTemplateResponse,
    CertificateTemplateUpdate,
    CertificateUploadResponse,
    CertificateVerificationResponse,
)
from app.services.certificate_service import (
    generate_certificate,
    generate_certificate_pdf,
    revoke_certificate,
    verify_certificate,
)
from app.services.storage_service import get_storage

router = APIRouter()


def _build_certificate_response(
    cert: Certificate,
    current_user: User,
    include_email: bool = False
) -> CertificateResponse:
    """Helper function to build CertificateResponse with all required fields."""
    cert_dict = {
        "id": cert.id,
        "certificate_number": cert.certificate_number,
        "user_id": cert.user_id,
        "course_id": cert.course_id,
        "issued_at": cert.issued_at,
        "completion_date": cert.completion_date,
        "total_lessons": cert.total_lessons,
        "completed_lessons": cert.completed_lessons,
        "completion_percentage": cert.completion_percentage,
        "pdf_path": cert.pdf_path,
        "pdf_generated_at": cert.pdf_generated_at,
        "is_revoked": cert.is_revoked,
        "revoked_at": cert.revoked_at,
        "revocation_reason": cert.revocation_reason,
        # Add required nested fields
        "student_name": cert.user.full_name if cert.user else "",
        "course_title": cert.course.title if cert.course else "",
        "teacher_name": cert.course.teacher.full_name if cert.course and cert.course.teacher else "",
        "student_email": cert.user.email if cert.user and include_email else None,
    }
    return CertificateResponse.model_validate(cert_dict)


# ==================== Certificate Template Endpoints ====================

@router.post("/templates", response_model=CertificateTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_certificate_template(
    template_data: CertificateTemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new certificate template (Admin/Teacher)."""
    # Authorization check
    if current_user.role not in [UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create certificate templates"
        )
    
    # If course_id is provided, verify user has access
    if template_data.course_id:
        if current_user.role == UserRole.TEACHER:
            # Teacher can only create templates for their own courses
            course_result = await db.execute(
                select(Course).where(
                    Course.id == template_data.course_id,
                    Course.teacher_id == current_user.id
                )
            )
            if not course_result.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to create template for this course"
                )
    
    # Create template
    template = CertificateTemplate(
        name=template_data.name,
        description=template_data.description,
        template_type=template_data.template_type,
        config=template_data.config,
        course_id=template_data.course_id,
        created_by_id=current_user.id,
        is_system_template=(current_user.role in [UserRole.ADMIN, UserRole.STAFF]),
    )
    
    db.add(template)
    await db.commit()
    await db.refresh(template)
    
    # Load relationships for response
    await db.refresh(template, ["created_by", "course"])
    
    # Prepare response
    response = CertificateTemplateResponse.model_validate(template)
    response.created_by_name = template.created_by.full_name if template.created_by else None
    response.course_title = template.course.title if template.course else None
    
    return response


@router.get("/templates", response_model=List[CertificateTemplateResponse])
async def list_certificate_templates(
    course_id: Optional[str] = Query(None, description="Filter by course ID"),
    template_type: Optional[TemplateType] = Query(None, description="Filter by template type"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List certificate templates."""
    # Authorization check
    if current_user.role not in [UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view certificate templates"
        )
    
    # Build query
    query = select(CertificateTemplate).options(
        selectinload(CertificateTemplate.created_by),
        selectinload(CertificateTemplate.course),
    )
    
    # Apply filters
    conditions = []
    
    if current_user.role == UserRole.TEACHER:
        # Teachers can only see their own templates or system templates
        conditions.append(
            or_(
                CertificateTemplate.created_by_id == current_user.id,
                CertificateTemplate.is_system_template == True,
            )
        )
    
    if course_id:
        conditions.append(CertificateTemplate.course_id == course_id)
    
    if template_type:
        conditions.append(CertificateTemplate.template_type == template_type)
    
    if is_active is not None:
        conditions.append(CertificateTemplate.is_active == is_active)
    
    if conditions:
        query = query.where(*conditions)
    
    query = query.order_by(CertificateTemplate.created_at.desc())
    
    result = await db.execute(query)
    templates = result.scalars().all()
    
    # Prepare responses
    responses = []
    for template in templates:
        response = CertificateTemplateResponse.model_validate(template)
        response.created_by_name = template.created_by.full_name if template.created_by else None
        response.course_title = template.course.title if template.course else None
        responses.append(response)
    
    return responses


@router.get("/templates/{template_id}", response_model=CertificateTemplateResponse)
async def get_certificate_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get certificate template details."""
    result = await db.execute(
        select(CertificateTemplate)
        .where(CertificateTemplate.id == template_id)
        .options(
            selectinload(CertificateTemplate.created_by),
            selectinload(CertificateTemplate.course),
        )
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Authorization check
    if current_user.role == UserRole.TEACHER:
        if template.created_by_id != current_user.id and not template.is_system_template:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this template"
            )
    
    response = CertificateTemplateResponse.model_validate(template)
    response.created_by_name = template.created_by.full_name if template.created_by else None
    response.course_title = template.course.title if template.course else None
    
    return response


@router.put("/templates/{template_id}", response_model=CertificateTemplateResponse)
async def update_certificate_template(
    template_id: str,
    template_data: CertificateTemplateUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update certificate template."""
    result = await db.execute(
        select(CertificateTemplate).where(CertificateTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Authorization check
    if current_user.role == UserRole.TEACHER:
        if template.created_by_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this template"
            )
    
    # Update fields
    if template_data.name is not None:
        template.name = template_data.name
    if template_data.description is not None:
        template.description = template_data.description
    if template_data.template_type is not None:
        template.template_type = template_data.template_type
    if template_data.config is not None:
        template.config = template_data.config
    if template_data.is_active is not None:
        template.is_active = template_data.is_active
    
    await db.commit()
    await db.refresh(template, ["created_by", "course"])
    
    response = CertificateTemplateResponse.model_validate(template)
    response.created_by_name = template.created_by.full_name if template.created_by else None
    response.course_title = template.course.title if template.course else None
    
    return response


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_certificate_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete certificate template."""
    result = await db.execute(
        select(CertificateTemplate).where(CertificateTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Authorization check
    if current_user.role == UserRole.TEACHER:
        if template.created_by_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this template"
            )
    
    # Check if template is in use
    cert_count_result = await db.execute(
        select(func.count()).select_from(Certificate).where(Certificate.template_id == template_id)
    )
    cert_count = cert_count_result.scalar()
    
    if cert_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete template: {cert_count} certificates are using it"
        )
    
    await db.delete(template)
    await db.commit()


@router.post("/templates/{template_id}/upload-background", response_model=CertificateUploadResponse)
async def upload_template_background(
    template_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload background image for template."""
    # Get template
    result = await db.execute(
        select(CertificateTemplate).where(CertificateTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Authorization check
    if current_user.role == UserRole.TEACHER:
        if template.created_by_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this template"
            )
    
    # Validate file type
    allowed_types = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )
    
    # Upload file
    storage = get_storage()
    file_path = f"certificates/templates/backgrounds/{template_id}_{file.filename}"
    
    # TODO: Implement actual file upload with storage service
    # For now, just set the path
    template.background_image = file_path
    
    await db.commit()
    
    return CertificateUploadResponse(
        background_image=file_path,
        message="Background image uploaded successfully"
    )


@router.post("/templates/{template_id}/upload-logo", response_model=CertificateUploadResponse)
async def upload_template_logo(
    template_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload logo image for template."""
    # Similar to upload_background
    result = await db.execute(
        select(CertificateTemplate).where(CertificateTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Authorization check
    if current_user.role == UserRole.TEACHER:
        if template.created_by_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this template"
            )
    
    # Validate file type
    allowed_types = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )
    
    # Upload file
    file_path = f"certificates/templates/logos/{template_id}_{file.filename}"
    template.logo_image = file_path
    
    await db.commit()
    
    return CertificateUploadResponse(
        logo_image=file_path,
        message="Logo image uploaded successfully"
    )


@router.post("/templates/{template_id}/upload-signature", response_model=CertificateUploadResponse)
async def upload_template_signature(
    template_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload signature image for template."""
    result = await db.execute(
        select(CertificateTemplate).where(CertificateTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Authorization check
    if current_user.role == UserRole.TEACHER:
        if template.created_by_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this template"
            )
    
    # Validate file type
    allowed_types = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )
    
    # Upload file
    file_path = f"certificates/templates/signatures/{template_id}_{file.filename}"
    template.signature_image = file_path
    
    await db.commit()
    
    return CertificateUploadResponse(
        signature_image=file_path,
        message="Signature image uploaded successfully"
    )


# ==================== Certificate Management Endpoints ====================

@router.post("/generate/{enrollment_id}", response_model=CertificateResponse, status_code=status.HTTP_201_CREATED)
async def generate_certificate_endpoint(
    enrollment_id: str,
    force_regenerate: bool = Query(False, description="Force regenerate if exists"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate certificate for a completed course enrollment."""
    # Get enrollment
    enrollment_result = await db.execute(
        select(Enrollment)
        .where(Enrollment.id == enrollment_id)
        .options(selectinload(Enrollment.course))
    )
    enrollment = enrollment_result.scalar_one_or_none()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    
    # Authorization check
    if current_user.role == UserRole.STUDENT:
        if enrollment.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to generate certificate for this enrollment"
            )
    elif current_user.role == UserRole.TEACHER:
        if enrollment.course.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to generate certificate for this course"
            )
    
    # Generate certificate
    try:
        certificate = await generate_certificate(enrollment_id, db, force_regenerate)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Load relationships for response
    await db.refresh(certificate, ["user", "course"])
    
    # Prepare response
    include_email = current_user.role in [UserRole.ADMIN, UserRole.STAFF]
    return _build_certificate_response(certificate, current_user, include_email)


@router.get("/my-certificates", response_model=List[CertificateResponse])
async def list_my_certificates(
    course_id: Optional[str] = Query(None, description="Filter by course ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List current user's certificates (Student)."""
    query = select(Certificate).where(
        Certificate.user_id == current_user.id
    ).options(
        selectinload(Certificate.user),
        selectinload(Certificate.course).selectinload(Course.teacher),
    )
    
    if course_id:
        query = query.where(Certificate.course_id == course_id)
    
    query = query.order_by(Certificate.issued_at.desc())
    
    result = await db.execute(query)
    certificates = result.scalars().all()
    
    # Prepare responses
    include_email = current_user.role in [UserRole.ADMIN, UserRole.STAFF]
    responses = []
    for cert in certificates:
        responses.append(_build_certificate_response(cert, current_user, include_email))
    
    return responses


@router.get("/{certificate_id}", response_model=CertificateResponse)
async def get_certificate(
    certificate_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get certificate details."""
    result = await db.execute(
        select(Certificate)
        .where(Certificate.id == certificate_id)
        .options(
            selectinload(Certificate.user),
            selectinload(Certificate.course).selectinload(Course.teacher),
        )
    )
    certificate = result.scalar_one_or_none()
    
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    # Authorization check
    if current_user.role == UserRole.STUDENT:
        if certificate.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this certificate"
            )
    elif current_user.role == UserRole.TEACHER:
        if certificate.course.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this certificate"
            )
    
    # Prepare response
    include_email = current_user.role in [UserRole.ADMIN, UserRole.STAFF]
    return _build_certificate_response(certificate, current_user, include_email)


@router.get("/{certificate_id}/download")
async def download_certificate(
    certificate_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download certificate PDF."""
    result = await db.execute(
        select(Certificate)
        .where(Certificate.id == certificate_id)
        .options(
            selectinload(Certificate.user),
            selectinload(Certificate.course).selectinload(Course.teacher),
        )
    )
    certificate = result.scalar_one_or_none()
    
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    # Authorization check
    if current_user.role == UserRole.STUDENT:
        if certificate.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to download this certificate"
            )
    elif current_user.role == UserRole.TEACHER:
        if certificate.course.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to download this certificate"
            )
    
    # Generate PDF HTML content
    from app.services.certificate_service import (
        get_certificate_template,
        generate_qr_code_base64,
        render_certificate_html,
    )
    
    # Get template
    template = await get_certificate_template(certificate.course_id, db)
    
    # Generate QR code
    verification_url = f"{request.base_url}verify-certificate/{certificate.id}"
    qr_code_base64 = generate_qr_code_base64(verification_url)
    
    # Render HTML
    html_content = render_certificate_html(
        certificate=certificate,
        student=certificate.user,
        course=certificate.course,
        teacher=certificate.course.teacher,
        template=template,
        qr_code_base64=qr_code_base64,
        verification_url=verification_url,
    )
    
    # Return HTML response (browser will handle PDF conversion via print)
    from fastapi.responses import HTMLResponse
    return HTMLResponse(content=html_content)


@router.get("/verify/{certificate_id}", response_model=CertificateVerificationResponse)
async def verify_certificate_endpoint(
    certificate_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Public endpoint to verify a certificate (no auth required)."""
    verification_result = await verify_certificate(certificate_id, db)
    return CertificateVerificationResponse(**verification_result)


@router.post("/{certificate_id}/revoke", response_model=CertificateResponse)
async def revoke_certificate_endpoint(
    certificate_id: str,
    revoke_data: CertificateRevokeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Revoke a certificate (Admin only)."""
    if current_user.role not in [UserRole.ADMIN, UserRole.STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to revoke certificates"
        )
    
    try:
        certificate = await revoke_certificate(
            certificate_id,
            current_user.id,
            revoke_data.reason,
            db
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
    # Load relationships
    await db.refresh(certificate, ["user", "course"])
    
    # Prepare response (admin/staff can see email)
    return _build_certificate_response(certificate, current_user, include_email=True)


@router.get("/courses/{course_id}/certificates", response_model=List[CertificateResponse])
async def list_course_certificates(
    course_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List certificates for a course (Teacher/Admin)."""
    # Get course
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Authorization check
    if current_user.role == UserRole.TEACHER:
        if course.teacher_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view certificates for this course"
            )
    
    # Get certificates
    query = select(Certificate).where(
        Certificate.course_id == course_id
    ).options(
        selectinload(Certificate.user),
        selectinload(Certificate.course).selectinload(Course.teacher),
    ).order_by(Certificate.issued_at.desc())
    
    # Pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    certificates = result.scalars().all()
    
    # Prepare responses
    include_email = current_user.role in [UserRole.ADMIN, UserRole.STAFF]
    responses = []
    for cert in certificates:
        responses.append(_build_certificate_response(cert, current_user, include_email))
    
    return responses
