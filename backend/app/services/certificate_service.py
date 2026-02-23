"""Certificate generation and management service."""
import io
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
import base64

import qrcode
from jinja2 import Environment, FileSystemLoader
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.certificate import Certificate, CertificateTemplate
from app.models.course import Course
from app.models.lesson_progress import LessonProgress
from app.models.order import Enrollment
from app.models.user import User
from app.services.storage_service import get_storage


async def check_course_completion(enrollment_id: str, db: AsyncSession) -> dict:
    """
    Check if a course is completed based on lesson progress.
    
    Args:
        enrollment_id: Enrollment ID to check
        db: Database session
        
    Returns:
        Dictionary with completion info:
        {
            "is_completed": bool,
            "percentage": int,
            "total_lessons": int,
            "completed_lessons": int,
            "completion_date": datetime or None
        }
    """
    # Get enrollment with course relationship
    result = await db.execute(
        select(Enrollment)
        .where(Enrollment.id == enrollment_id)
        .options(selectinload(Enrollment.course))
    )
    enrollment = result.scalar_one_or_none()
    
    if not enrollment:
        raise ValueError(f"Enrollment not found: {enrollment_id}")
    
    # Get total lessons count for the course
    total_lessons_result = await db.execute(
        select(func.count())
        .select_from(Course)
        .join(Course.lessons)
        .where(Course.id == enrollment.course_id)
    )
    total_lessons = total_lessons_result.scalar() or 0
    
    if total_lessons == 0:
        return {
            "is_completed": False,
            "percentage": 0,
            "total_lessons": 0,
            "completed_lessons": 0,
            "completion_date": None,
        }
    
    # Get completed lessons count
    completed_lessons_result = await db.execute(
        select(func.count())
        .select_from(LessonProgress)
        .where(
            LessonProgress.enrollment_id == enrollment_id,
            LessonProgress.is_completed == True,
        )
    )
    completed_lessons = completed_lessons_result.scalar() or 0
    
    # Calculate percentage
    percentage = int((completed_lessons / total_lessons) * 100) if total_lessons > 0 else 0
    
    # Check if completed (80% threshold)
    is_completed = percentage >= 80
    
    # Get latest completion date
    completion_date = None
    if is_completed:
        latest_progress_result = await db.execute(
            select(LessonProgress)
            .where(
                LessonProgress.enrollment_id == enrollment_id,
                LessonProgress.is_completed == True,
            )
            .order_by(LessonProgress.completed_at.desc())
            .limit(1)
        )
        latest_progress = latest_progress_result.scalar_one_or_none()
        completion_date = latest_progress.completed_at if latest_progress else datetime.now(timezone.utc)
    
    return {
        "is_completed": is_completed,
        "percentage": percentage,
        "total_lessons": total_lessons,
        "completed_lessons": completed_lessons,
        "completion_date": completion_date,
    }


def generate_certificate_number(year: int, sequence: int) -> str:
    """
    Generate a unique certificate number in format: CERT-YYYY-XXXXXX
    
    Args:
        year: Year of issuance
        sequence: Sequence number (6 digits)
        
    Returns:
        Certificate number string
    """
    return f"CERT-{year}-{sequence:06d}"


async def get_next_certificate_sequence(db: AsyncSession, year: int) -> int:
    """Get the next certificate sequence number for the given year."""
    # Get the latest certificate number for this year
    result = await db.execute(
        select(Certificate)
        .where(Certificate.certificate_number.like(f"CERT-{year}-%"))
        .order_by(Certificate.certificate_number.desc())
        .limit(1)
    )
    latest_cert = result.scalar_one_or_none()
    
    if not latest_cert:
        return 1
    
    # Extract sequence number from certificate_number
    try:
        sequence_str = latest_cert.certificate_number.split("-")[-1]
        return int(sequence_str) + 1
    except (IndexError, ValueError):
        return 1


def generate_qr_code_base64(data: str) -> str:
    """
    Generate a QR code as base64 string.
    
    Args:
        data: Data to encode in QR code (typically verification URL)
        
    Returns:
        Base64-encoded PNG image of QR code
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.read()).decode()
    
    return f"data:image/png;base64,{img_base64}"


async def get_certificate_template(
    course_id: str,
    db: AsyncSession
) -> Optional[CertificateTemplate]:
    """
    Get the appropriate certificate template for a course.
    Priority: course-specific > global default
    
    Args:
        course_id: Course ID
        db: Database session
        
    Returns:
        CertificateTemplate or None
    """
    # First try to get course-specific template
    result = await db.execute(
        select(CertificateTemplate)
        .where(
            CertificateTemplate.course_id == course_id,
            CertificateTemplate.is_active == True,
        )
        .limit(1)
    )
    template = result.scalar_one_or_none()
    
    if template:
        return template
    
    # Fall back to global template
    result = await db.execute(
        select(CertificateTemplate)
        .where(
            CertificateTemplate.course_id.is_(None),
            CertificateTemplate.is_active == True,
            CertificateTemplate.is_system_template == True,
        )
        .limit(1)
    )
    return result.scalar_one_or_none()


def render_certificate_html(
    certificate: Certificate,
    student: User,
    course: Course,
    teacher: User,
    template: Optional[CertificateTemplate],
    qr_code_base64: str,
    verification_url: str,
) -> str:
    """
    Render certificate HTML from template.
    
    Args:
        certificate: Certificate model
        student: Student user
        course: Course model
        teacher: Teacher user
        template: Certificate template (optional)
        qr_code_base64: Base64-encoded QR code image
        verification_url: Verification URL
        
    Returns:
        Rendered HTML string
    """
    # Default config
    default_config = {
        "font_family": "Arial, sans-serif",
        "font_size_title": 48,
        "font_size_body": 24,
        "primary_color": "#0d9488",
        "secondary_color": "#14b8a6",
        "text_align": "center",
        "show_qr_code": True,
        "show_logo": False,
        "show_signature": False,
    }
    
    # Merge with template config if provided
    config = {**default_config, **(template.config if template else {})}
    
    # Prepare template context
    context = {
        "certificate_number": certificate.certificate_number,
        "student_name": student.full_name,
        "course_title": course.title,
        "teacher_name": teacher.full_name,
        "completion_date": certificate.completion_date.strftime("%d/%m/%Y"),
        "issued_at": certificate.issued_at.strftime("%d/%m/%Y"),
        "completion_percentage": certificate.completion_percentage,
        "qr_code_image": qr_code_base64,
        "verification_url": verification_url,
        "config": config,
        "background_image": template.background_image if template else None,
        "logo_image": template.logo_image if template else None,
        "signature_image": template.signature_image if template else None,
    }
    
    # Render template - Clean Professional Design
    html_template = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            {% if background_image %}
            background-image: url({{ background_image }});
            background-size: cover;
            background-position: center;
            {% else %}
            background: #f8fafc;
            {% endif %}
        }
        .certificate {
            width: 297mm;
            height: 210mm;
            position: relative;
            text-align: center;
            padding: 12mm;
            box-sizing: border-box;
            background: white;
            {% if not background_image %}
            background: white;
            {% endif %}
            overflow: hidden;
        }
        
        /* BiHocam Watermark */
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            opacity: 0.04;
            font-size: 140px;
            font-weight: 900;
            color: #0d9488;
            pointer-events: none;
            letter-spacing: 15px;
            white-space: nowrap;
        }
        
        /* Decorative Border */
        .border-frame {
            position: absolute;
            top: 8mm;
            left: 8mm;
            right: 8mm;
            bottom: 8mm;
            border: 3px solid {{ config.primary_color }};
            border-radius: 8px;
        }
        
        /* Header Section */
        .header {
            position: relative;
            width: 100%;
            padding: 0;
            margin-bottom: 25px;
            text-align: left;
        }
        
        .bihocam-logo {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }
        .logo-icon {
            width: 45px;
            height: 45px;
            background: #e5e7eb;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 900;
            color: #1f2937;
        }
        .logo-text {
            font-size: 24px;
            font-weight: 900;
            color: #1f2937;
            letter-spacing: 0.5px;
        }
        .logo-text span {
            color: #6b7280;
            font-weight: 700;
        }
        
        .title {
            font-size: 44px;
            color: #1f2937;
            font-weight: 900;
            margin: 0 0 5px 0;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        .subtitle {
            font-size: 14px;
            color: #6b7280;
            margin: 0;
            font-weight: 400;
            letter-spacing: 0.5px;
        }
        
        /* Main Content */
        .content {
            position: relative;
            padding: 25px 30px;
            min-height: 90mm;
            display: table;
            width: 100%;
        }
        .content-inner {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
        }
        
        .declaration {
            font-size: 17px;
            color: #4b5563;
            margin: 12px 0;
            font-weight: 500;
        }
        
        .student-name {
            font-size: 38px;
            color: {{ config.primary_color }};
            font-weight: 900;
            margin: 18px 0;
            padding: 18px 60px;
            border: 2px solid {{ config.primary_color }};
            border-radius: 8px;
            display: inline-block;
            background: transparent;
            letter-spacing: 1.5px;
        }
        
        .course-section {
            margin: 22px 0;
        }
        
        .course-label {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 8px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .course-title {
            font-size: 28px;
            font-weight: 800;
            color: #1f2937;
            margin: 8px 0;
            max-width: 90%;
            line-height: 1.4;
            padding: 18px 35px;
            background: #f9fafb;
            border-radius: 10px;
            border-left: 5px solid {{ config.primary_color }};
            display: inline-block;
        }
        
        /* Footer Info Section */
        .footer-info {
            position: absolute;
            bottom: 65mm;
            left: 12mm;
            right: 12mm;
            padding: 15px 0;
            border-top: 1px solid {{ config.secondary_color }};
            display: table;
            width: calc(100% - 24mm);
            table-layout: fixed;
        }
        
        .info-left, .info-right {
            display: table-cell;
            vertical-align: top;
            width: 50%;
            padding: 0 10px;
        }
        .info-left {
            text-align: left;
        }
        .info-right {
            text-align: right;
        }
        
        .info-item {
            margin: 8px 0;
            font-size: 14px;
        }
        .info-label {
            color: {{ config.primary_color }};
            font-weight: 600;
            margin-right: 5px;
        }
        .info-value {
            color: #1f2937;
            font-weight: 500;
        }
        
        .certificate-number {
            font-size: 13px;
            color: #1f2937;
            margin: 8px 0;
            font-family: 'Courier New', monospace;
        }
        .certificate-number .info-label {
            color: #1f2937;
        }
        .certificate-number .info-value {
            text-decoration: underline;
        }
        
        /* Footer Section */
        .footer {
            position: absolute;
            bottom: 10mm;
            left: 12mm;
            right: 12mm;
            padding: 18px 0;
            border-top: 1px solid {{ config.secondary_color }};
            display: table;
            width: calc(100% - 24mm);
            table-layout: fixed;
        }
        
        .signature-block {
            display: table-cell;
            text-align: left;
            width: 50%;
            vertical-align: top;
            padding: 0 15px;
        }
        .signature-image {
            max-width: 140px;
            max-height: 55px;
            margin-bottom: 8px;
            border-radius: 6px;
        }
        .signature-line {
            width: 180px;
            border-top: 1px solid #374151;
            margin: 8px 0 6px 0;
        }
        .signature-name {
            font-size: 15px;
            font-weight: 600;
            margin-top: 6px;
            color: #1f2937;
        }
        .signature-title {
            font-size: 12px;
            color: #6b7280;
            margin-top: 3px;
            font-weight: 400;
        }
        
        /* QR Code */
        .qr-code {
            position: absolute;
            bottom: 12mm;
            right: 12mm;
            text-align: center;
            background: white;
            padding: 8px;
            border-radius: 6px;
            border: 2px solid {{ config.primary_color }};
            z-index: 10;
        }
        .qr-code img {
            width: 80px;
            height: 80px;
            display: block;
            margin: 0 auto;
        }
        .qr-code-label {
            font-size: 10px;
            color: #1f2937;
            margin-bottom: 6px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .qr-code-text {
            font-size: 10px;
            color: #1f2937;
            margin-top: 6px;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <!-- BiHocam Watermark -->
        <div class="watermark">BiHocam</div>
        
        <!-- Decorative Border -->
        <div class="border-frame"></div>
        
        <!-- Header with BiHocam Branding -->
        <div class="header">
            <div class="bihocam-logo">
                <div class="logo-icon">B</div>
                <div class="logo-text">Bi<span>Hocam</span></div>
            </div>
            <div class="title">Başarı Sertifikası</div>
            <div class="subtitle">Course Completion Certificate</div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <div class="content-inner">
                <p class="declaration">Bu belge ile</p>
                
                <div class="student-name">{{ student_name }}</div>
                
                <p class="declaration">adlı kişinin aşağıdaki kursu başarıyla tamamladığını belgeleriz</p>
                
                <div class="course-section">
                    <div class="course-label">Kurs Adı</div>
                    <div class="course-title">{{ course_title }}</div>
                </div>
            </div>
        </div>
        
        <!-- Footer Info Section -->
        <div class="footer-info">
            <div class="info-left">
                <div class="info-item">
                    <span class="info-label">Tamamlanma Tarihi:</span>
                    <span class="info-value">{{ completion_date }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Başarı Oranı:</span>
                    <span class="info-value">%{{ completion_percentage }}</span>
                </div>
            </div>
            <div class="info-right">
                <div class="certificate-number">
                    <span class="info-label">Sertifika No:</span>
                    <span class="info-value">{{ certificate_number }}</span>
                </div>
            </div>
        </div>
        
        <!-- Footer with Signatures -->
        <div class="footer">
            <div class="signature-block">
                {% if signature_image and config.show_signature %}
                <img src="{{ signature_image }}" alt="İmza" class="signature-image">
                {% endif %}
                <div class="signature-line"></div>
                <div class="signature-name">{{ teacher_name }}</div>
                <div class="signature-title">Eğitmen</div>
            </div>
            
            <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-name">BiHocam Platform Yönetimi</div>
                <div class="signature-title">Resmi Onay</div>
            </div>
        </div>
        
        <!-- QR Code for Verification -->
        {% if config.show_qr_code %}
        <div class="qr-code">
            <div class="qr-code-label">Doğrula</div>
            <img src="{{ qr_code_image }}" alt="QR Code">
            <div class="qr-code-text">Sertifika Doğrulama</div>
        </div>
        {% endif %}
    </div>
</body>
</html>
    """
    
    # Use Jinja2 to render
    from jinja2 import Template
    template_obj = Template(html_template)
    return template_obj.render(**context)


async def generate_certificate(
    enrollment_id: str,
    db: AsyncSession,
    force_regenerate: bool = False,
) -> Certificate:
    """
    Generate a certificate for a completed course enrollment.
    
    Args:
        enrollment_id: Enrollment ID
        db: Database session
        force_regenerate: Force regenerate even if certificate exists
        
    Returns:
        Generated Certificate model
        
    Raises:
        ValueError: If enrollment not found or course not completed
    """
    # Check if certificate already exists
    existing_cert_result = await db.execute(
        select(Certificate).where(Certificate.enrollment_id == enrollment_id)
    )
    existing_cert = existing_cert_result.scalar_one_or_none()
    
    if existing_cert and not force_regenerate:
        return existing_cert
    
    # Get enrollment with relationships
    enrollment_result = await db.execute(
        select(Enrollment)
        .where(Enrollment.id == enrollment_id)
        .options(
            selectinload(Enrollment.user),
            selectinload(Enrollment.course).selectinload(Course.teacher),
        )
    )
    enrollment = enrollment_result.scalar_one_or_none()
    
    if not enrollment:
        raise ValueError(f"Enrollment not found: {enrollment_id}")
    
    # Check course completion
    completion_status = await check_course_completion(enrollment_id, db)
    
    if not completion_status["is_completed"]:
        raise ValueError(
            f"Course not completed. Completion: {completion_status['percentage']}% (minimum 80% required)"
        )
    
    # Generate certificate if regenerating
    if existing_cert and force_regenerate:
        certificate = existing_cert
        # Update completion info
        certificate.completion_date = completion_status["completion_date"] or datetime.now(timezone.utc)
        certificate.total_lessons = completion_status["total_lessons"]
        certificate.completed_lessons = completion_status["completed_lessons"]
        certificate.completion_percentage = completion_status["percentage"]
    else:
        # Generate certificate number
        current_year = datetime.now().year
        sequence = await get_next_certificate_sequence(db, current_year)
        certificate_number = generate_certificate_number(current_year, sequence)
        
        # Create certificate record
        certificate = Certificate(
            user_id=enrollment.user_id,
            course_id=enrollment.course_id,
            enrollment_id=enrollment_id,
            certificate_number=certificate_number,
            completion_date=completion_status["completion_date"] or datetime.now(timezone.utc),
            total_lessons=completion_status["total_lessons"],
            completed_lessons=completion_status["completed_lessons"],
            completion_percentage=completion_status["percentage"],
        )
        
        db.add(certificate)
        await db.flush()  # Get certificate ID
    
    # Generate QR code data (verification URL)
    # TODO: Replace with actual domain
    verification_url = f"https://yourdomain.com/verify-certificate/{certificate.id}"
    certificate.qr_code_data = verification_url
    
    await db.commit()
    await db.refresh(certificate)
    
    return certificate


async def generate_certificate_pdf(
    certificate_id: str,
    db: AsyncSession,
) -> str:
    """
    Generate PDF for a certificate.
    
    Args:
        certificate_id: Certificate ID
        db: Database session
        
    Returns:
        PDF file path in storage
        
    Raises:
        ValueError: If certificate not found
    """
    # Get certificate with relationships
    cert_result = await db.execute(
        select(Certificate)
        .where(Certificate.id == certificate_id)
        .options(
            selectinload(Certificate.user),
            selectinload(Certificate.course).selectinload(Course.teacher),
            selectinload(Certificate.template),
        )
    )
    certificate = cert_result.scalar_one_or_none()
    
    if not certificate:
        raise ValueError(f"Certificate not found: {certificate_id}")
    
    # Get template
    template = await get_certificate_template(certificate.course_id, db)
    
    # Generate QR code
    qr_code_base64 = generate_qr_code_base64(certificate.qr_code_data or "")
    
    # Render HTML
    html_content = render_certificate_html(
        certificate=certificate,
        student=certificate.user,
        course=certificate.course,
        teacher=certificate.course.teacher,
        template=template,
        qr_code_base64=qr_code_base64,
        verification_url=certificate.qr_code_data or "",
    )
    
    # Note: WeasyPrint requires installation: pip install weasyprint
    # For now, we'll just save the HTML (PDF generation can be added later)
    # TODO: Implement actual PDF generation with WeasyPrint
    
    # Save HTML temporarily (replace with PDF generation)
    storage = get_storage()
    filename = f"certificates/{certificate.certificate_number}.html"
    
    # Upload to storage
    # For now, we'll just set the path
    certificate.pdf_path = filename
    certificate.pdf_generated_at = datetime.now(timezone.utc)
    
    await db.commit()
    
    return filename


async def revoke_certificate(
    certificate_id: str,
    revoked_by_id: str,
    reason: str,
    db: AsyncSession,
) -> Certificate:
    """
    Revoke a certificate.
    
    Args:
        certificate_id: Certificate ID to revoke
        revoked_by_id: User ID who is revoking
        reason: Reason for revocation
        db: Database session
        
    Returns:
        Revoked Certificate model
        
    Raises:
        ValueError: If certificate not found
    """
    result = await db.execute(
        select(Certificate).where(Certificate.id == certificate_id)
    )
    certificate = result.scalar_one_or_none()
    
    if not certificate:
        raise ValueError(f"Certificate not found: {certificate_id}")
    
    certificate.is_revoked = True
    certificate.revoked_at = datetime.now(timezone.utc)
    certificate.revoked_by_id = revoked_by_id
    certificate.revocation_reason = reason
    
    await db.commit()
    await db.refresh(certificate)
    
    return certificate


async def verify_certificate(certificate_id: str, db: AsyncSession) -> dict:
    """
    Verify a certificate (public endpoint - limited info).
    
    Args:
        certificate_id: Certificate ID to verify
        db: Database session
        
    Returns:
        Dictionary with verification info (privacy-protected)
    """
    result = await db.execute(
        select(Certificate)
        .where(Certificate.id == certificate_id)
        .options(
            selectinload(Certificate.user),
            selectinload(Certificate.course),
        )
    )
    certificate = result.scalar_one_or_none()
    
    if not certificate:
        return {
            "is_valid": False,
            "is_revoked": False,
            "message": "Certificate not found",
        }
    
    # Mask student name for privacy (show only initials)
    def mask_name(full_name: str) -> str:
        parts = full_name.split()
        if len(parts) == 1:
            return parts[0][0] + "*" * (len(parts[0]) - 1)
        return " ".join([part[0] + "*" * (len(part) - 1) for part in parts])
    
    return {
        "is_valid": not certificate.is_revoked,
        "is_revoked": certificate.is_revoked,
        "certificate_number": certificate.certificate_number,
        "student_name": mask_name(certificate.user.full_name),
        "course_title": certificate.course.title,
        "issued_at": certificate.issued_at,
        "revocation_reason": certificate.revocation_reason if certificate.is_revoked else None,
    }
