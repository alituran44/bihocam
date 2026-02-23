"""
EPIC-10 Content Upload Tests (EP10-BE-16)

İçerik yükleme endpoint'leri için testler.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from io import BytesIO

from app.models.course import Course, Lesson, CourseStatus, LessonType
from app.models.user import User, UserRole
from app.core.security import get_password_hash


@pytest.mark.asyncio
async def test_magic_byte_mime_validation(
    client: AsyncClient,
    db_session: AsyncSession,
    test_teacher: User,
    auth_headers_teacher,
):
    """Magic-byte MIME doğrulama testi (uzantı bypass önleme)"""
    course = Course(
        title="Test Course",
        slug="test-course",
        description="Test",
        price=100.0,
        teacher_id=test_teacher.id,
        status=CourseStatus.PUBLISHED,
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    
    lesson = Lesson(
        title="Test Lesson",
        course_id=course.id,
        lesson_type=LessonType.DOCUMENT,
        order=1,
    )
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    
    # PDF uzantılı ama gerçekte JPEG içeriği
    fake_pdf_content = b"\xFF\xD8\xFF\xE0" + b"fake jpeg content"  # JPEG magic bytes
    fake_pdf_file = ("fake.pdf", BytesIO(fake_pdf_content), "application/pdf")
    
    response = await client.post(
        f"/api/v1/media/lessons/{lesson.id}/upload-document",
        headers=auth_headers_teacher,
        files={"file": fake_pdf_file},
    )
    
    # Magic-byte mismatch tespit edilmeli
    assert response.status_code == 400
    assert "MIME type" in response.json()["detail"].lower() or "mime" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_oversize_upload_rejection(
    client: AsyncClient,
    db_session: AsyncSession,
    test_teacher: User,
    auth_headers_teacher,
):
    """Oversize upload reddetme testi"""
    course = Course(
        title="Test Course",
        slug="test-course",
        description="Test",
        price=100.0,
        teacher_id=test_teacher.id,
        status=CourseStatus.PUBLISHED,
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    
    lesson = Lesson(
        title="Test Lesson",
        course_id=course.id,
        lesson_type=LessonType.DOCUMENT,
        order=1,
    )
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    
    # 100MB dosya (limit 50MB)
    large_content = b"x" * (100 * 1024 * 1024)
    large_file = ("large.pdf", BytesIO(large_content), "application/pdf")
    
    response = await client.post(
        f"/api/v1/media/lessons/{lesson.id}/upload-document",
        headers=auth_headers_teacher,
        files={"file": large_file},
    )
    
    # Oversize reddedilmeli
    assert response.status_code == 400
    assert "size" in response.json()["detail"].lower() or "limit" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_old_file_cleanup(
    client: AsyncClient,
    db_session: AsyncSession,
    test_teacher: User,
    auth_headers_teacher,
):
    """Eski dosya cleanup testi"""
    course = Course(
        title="Test Course",
        slug="test-course",
        description="Test",
        price=100.0,
        teacher_id=test_teacher.id,
        status=CourseStatus.PUBLISHED,
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    
    lesson = Lesson(
        title="Test Lesson",
        course_id=course.id,
        lesson_type=LessonType.DOCUMENT,
        content_path="documents/old_file.pdf",  # Eski dosya
        order=1,
    )
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    
    # Yeni dosya yükle
    new_file_content = b"%PDF-1.4\nnew content"
    new_file = ("new.pdf", BytesIO(new_file_content), "application/pdf")
    
    response = await client.post(
        f"/api/v1/media/lessons/{lesson.id}/upload-document",
        headers=auth_headers_teacher,
        files={"file": new_file},
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Yeni dosya path'i farklı olmalı
    assert data["storage_key"] != "documents/old_file.pdf"
    # Eski dosya path'i güncellenmiş olmalı
    await db_session.refresh(lesson)
    assert lesson.content_path != "documents/old_file.pdf"
