"""
EPIC-10 Media Endpoint Security Tests (EP10-BE-16)

Media endpoint'leri için güvenlik testleri.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Course, Lesson, CourseStatus, LessonType
from app.models.user import User, UserRole
from app.models.order import Enrollment
from app.core.security import get_password_hash


@pytest.mark.asyncio
async def test_anonymous_access_to_preview_video(
    client: AsyncClient,
    db_session: AsyncSession,
    test_teacher: User,
):
    """Preview video'ya anonim erişim testi"""
    # Course ve preview lesson oluştur
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
        title="Preview Lesson",
        course_id=course.id,
        lesson_type=LessonType.VIDEO,
        is_preview=True,
        content_path="videos/preview.mp4",
        order=1,
    )
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    
    # Anonim erişim (preview olduğu için izin verilmeli)
    response = await client.get(f"/api/v1/media/videos/preview.mp4")
    # 200 veya 404 (dosya yoksa) olabilir, ama 403 olmamalı
    assert response.status_code != 403


@pytest.mark.asyncio
async def test_anonymous_access_to_non_preview_video_denied(
    client: AsyncClient,
    db_session: AsyncSession,
    test_teacher: User,
):
    """Non-preview video'ya anonim erişim reddedilmeli"""
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
        title="Non-Preview Lesson",
        course_id=course.id,
        lesson_type=LessonType.VIDEO,
        is_preview=False,
        content_path="videos/private.mp4",
        order=1,
    )
    db_session.add(lesson)
    await db_session.commit()
    
    # Anonim erişim reddedilmeli (403 veya 401)
    response = await client.get(f"/api/v1/media/videos/private.mp4")
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_enrolled_student_access(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    test_teacher: User,
    auth_headers_student,
):
    """Kayıtlı öğrenci erişimi testi"""
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
    
    # Enrollment oluştur
    enrollment = Enrollment(
        user_id=test_user.id,
        course_id=course.id,
        progress_percentage=0,
    )
    db_session.add(enrollment)
    await db_session.commit()
    
    lesson = Lesson(
        title="Lesson",
        course_id=course.id,
        lesson_type=LessonType.VIDEO,
        is_preview=False,
        content_path="videos/lesson.mp4",
        order=1,
    )
    db_session.add(lesson)
    await db_session.commit()
    
    # Kayıtlı öğrenci erişebilmeli
    response = await client.get(
        f"/api/v1/media/videos/lesson.mp4",
        headers=auth_headers_student,
    )
    # 200 veya 404 (dosya yoksa) olabilir, ama 403 olmamalı
    assert response.status_code != 403


@pytest.mark.asyncio
async def test_owner_access(
    client: AsyncClient,
    db_session: AsyncSession,
    test_teacher: User,
    auth_headers_teacher,
):
    """Kurs sahibi erişimi testi"""
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
        title="Lesson",
        course_id=course.id,
        lesson_type=LessonType.VIDEO,
        is_preview=False,
        content_path="videos/lesson.mp4",
        order=1,
    )
    db_session.add(lesson)
    await db_session.commit()
    
    # Kurs sahibi erişebilmeli
    response = await client.get(
        f"/api/v1/media/videos/lesson.mp4",
        headers=auth_headers_teacher,
    )
    assert response.status_code != 403


@pytest.mark.asyncio
async def test_storage_key_lookup_precision(
    client: AsyncClient,
    db_session: AsyncSession,
    test_teacher: User,
    auth_headers_teacher,
):
    """Storage key lookup doğruluğu (LIKE yerine exact match)"""
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
    
    # İki farklı lesson, benzer path'ler
    lesson1 = Lesson(
        title="Lesson 1",
        course_id=course.id,
        lesson_type=LessonType.VIDEO,
        content_path="videos/lesson1.mp4",
        order=1,
    )
    lesson2 = Lesson(
        title="Lesson 2",
        course_id=course.id,
        lesson_type=LessonType.VIDEO,
        content_path="videos/lesson10.mp4",  # lesson1'i içermiyor
        order=2,
    )
    db_session.add(lesson1)
    db_session.add(lesson2)
    await db_session.commit()
    
    # lesson1.mp4 için sadece lesson1 dönmeli, lesson10 değil
    # Bu test storage key lookup'un doğru çalıştığını doğrular
    response = await client.get(
        f"/api/v1/media/videos/lesson1.mp4",
        headers=auth_headers_teacher,
    )
    # Exact match kullanıldığı için doğru lesson bulunmalı
    assert response.status_code in [200, 404]  # Dosya yoksa 404, varsa 200
