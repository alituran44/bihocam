"""
EPIC-10 Lesson Management Tests (EP10-BE-16)

Ders yönetimi endpoint'leri için testler.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.models.course import Course, Lesson, CourseStatus, LessonType
from app.models.user import User, UserRole


@pytest.mark.asyncio
async def test_reorder_lessons(
    client: AsyncClient,
    db_session: AsyncSession,
    test_teacher: User,
    auth_headers_teacher,
):
    """Ders sıralama testi"""
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
    
    # 3 ders oluştur
    lesson1 = Lesson(title="Lesson 1", course_id=course.id, order=1, lesson_type=LessonType.VIDEO)
    lesson2 = Lesson(title="Lesson 2", course_id=course.id, order=2, lesson_type=LessonType.VIDEO)
    lesson3 = Lesson(title="Lesson 3", course_id=course.id, order=3, lesson_type=LessonType.VIDEO)
    db_session.add_all([lesson1, lesson2, lesson3])
    await db_session.commit()
    await db_session.refresh(lesson1)
    await db_session.refresh(lesson2)
    await db_session.refresh(lesson3)
    
    # Sıralamayı değiştir (3, 1, 2)
    response = await client.put(
        f"/api/v1/courses/{course.id}/lessons/reorder",
        headers=auth_headers_teacher,
        json={"lesson_ids": [lesson3.id, lesson1.id, lesson2.id]},
    )
    
    assert response.status_code == 200
    
    # Sıralama güncellenmiş olmalı
    await db_session.refresh(lesson1)
    await db_session.refresh(lesson2)
    await db_session.refresh(lesson3)
    assert lesson3.order == 1
    assert lesson1.order == 2
    assert lesson2.order == 3


@pytest.mark.asyncio
async def test_reorder_duplicate_lesson_ids_rejected(
    client: AsyncClient,
    db_session: AsyncSession,
    test_teacher: User,
    auth_headers_teacher,
):
    """Duplicate lesson_id validasyonu"""
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
    
    lesson1 = Lesson(title="Lesson 1", course_id=course.id, order=1, lesson_type=LessonType.VIDEO)
    db_session.add(lesson1)
    await db_session.commit()
    await db_session.refresh(lesson1)
    
    # Duplicate ID ile reorder dene
    response = await client.put(
        f"/api/v1/courses/{course.id}/lessons/reorder",
        headers=auth_headers_teacher,
        json={"lesson_ids": [lesson1.id, lesson1.id]},
    )
    
    assert response.status_code == 400
    assert "duplicate" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_url_validation_phishing(
    client: AsyncClient,
    db_session: AsyncSession,
    test_teacher: User,
    auth_headers_teacher,
):
    """URL validation - phishing domain engelleme"""
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
    
    lesson = Lesson(title="Lesson", course_id=course.id, order=1, lesson_type=LessonType.LIVE_LESSON)
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    
    # Phishing domain ile update dene
    response = await client.patch(
        f"/api/v1/courses/{course.id}/lessons/{lesson.id}",
        headers=auth_headers_teacher,
        json={"live_lesson_url": "https://zoom-m33t.com/fake"},
    )
    
    # Phishing domain reddedilmeli
    assert response.status_code == 400
    assert "url" in response.json()["detail"].lower() or "domain" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_url_validation_javascript_scheme(
    client: AsyncClient,
    db_session: AsyncSession,
    test_teacher: User,
    auth_headers_teacher,
):
    """URL validation - JavaScript scheme engelleme"""
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
    
    lesson = Lesson(title="Lesson", course_id=course.id, order=1, lesson_type=LessonType.LIVE_LESSON)
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    
    # JavaScript scheme ile update dene
    response = await client.patch(
        f"/api/v1/courses/{course.id}/lessons/{lesson.id}",
        headers=auth_headers_teacher,
        json={"live_lesson_url": "javascript:alert('xss')"},
    )
    
    # JavaScript scheme reddedilmeli
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_timezone_aware_datetime(
    client: AsyncClient,
    db_session: AsyncSession,
    test_teacher: User,
    auth_headers_teacher,
):
    """Timezone-aware datetime testi"""
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
    
    # UTC timezone ile live lesson oluştur
    future_time = datetime.now(timezone.utc).replace(hour=14, minute=0, second=0, microsecond=0)
    future_time = future_time.replace(day=future_time.day + 1)  # Yarın
    
    response = await client.post(
        f"/api/v1/courses/{course.id}/lessons/live",
        headers=auth_headers_teacher,
        json={
            "title": "Live Lesson",
            "live_lesson_url": "https://zoom.us/j/123456789",
            "live_lesson_at": future_time.isoformat(),
        },
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Timezone bilgisi korunmuş olmalı
    assert data["live_lesson_at"] is not None
    # ISO format timezone içermeli (Z veya +00:00)
