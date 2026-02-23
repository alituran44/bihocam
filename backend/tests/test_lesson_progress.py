"""
Lesson Progress API tests
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Course, Lesson, CourseStatus, LessonType
from app.models.order import Enrollment
from app.models.user import User


@pytest.mark.asyncio
async def test_get_lesson_progress(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    auth_headers_student,
):
    """Test getting lesson progress"""
    # Create teacher
    from app.models.user import UserRole
    from app.core.security import get_password_hash
    
    teacher = User(
        email="teacher@test.com",
        hashed_password=get_password_hash("password123"),
        full_name="Teacher",
        role=UserRole.TEACHER,
        is_active=True,
        is_verified=True,
    )
    db_session.add(teacher)
    await db_session.commit()
    await db_session.refresh(teacher)
    
    # Create course
    course = Course(
        title="Test Course",
        slug="test-course",
        description="Test",
        price=100.0,
        teacher_id=teacher.id,
        status=CourseStatus.PUBLISHED,
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    
    # Create enrollment
    enrollment = Enrollment(
        user_id=test_user.id,
        course_id=course.id,
        progress_percentage=0,
    )
    db_session.add(enrollment)
    await db_session.commit()
    await db_session.refresh(enrollment)
    
    # Create lesson
    lesson = Lesson(
        title="Test Lesson",
        course_id=course.id,
        lesson_type=LessonType.VIDEO,
        order=1,
    )
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    
    # Get progress (should return None if not exists)
    response = await client.get(
        f"/api/v1/courses/{course.id}/lessons/{lesson.id}/progress",
        headers=auth_headers_student,
    )
    assert response.status_code == 200
    # Should return None if no progress exists
    data = response.json()
    assert data is None or "id" in data


@pytest.mark.asyncio
async def test_get_lesson_progress_not_enrolled(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    auth_headers_student,
):
    """Test getting progress without enrollment"""
    from app.models.user import UserRole
    from app.core.security import get_password_hash
    
    teacher = User(
        email="teacher2@test.com",
        hashed_password=get_password_hash("password123"),
        full_name="Teacher",
        role=UserRole.TEACHER,
        is_active=True,
        is_verified=True,
    )
    db_session.add(teacher)
    await db_session.commit()
    await db_session.refresh(teacher)
    
    course = Course(
        title="Test Course",
        slug="test-course-2",
        description="Test",
        price=100.0,
        teacher_id=teacher.id,
        status=CourseStatus.PUBLISHED,
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    
    lesson = Lesson(
        title="Test Lesson",
        course_id=course.id,
        lesson_type=LessonType.VIDEO,
        order=1,
    )
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    
    response = await client.get(
        f"/api/v1/courses/{course.id}/lessons/{lesson.id}/progress",
        headers=auth_headers_student,
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_update_lesson_progress(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    auth_headers_student,
):
    """Test updating lesson progress"""
    from app.models.user import UserRole
    from app.core.security import get_password_hash
    
    teacher = User(
        email="teacher3@test.com",
        hashed_password=get_password_hash("password123"),
        full_name="Teacher",
        role=UserRole.TEACHER,
        is_active=True,
        is_verified=True,
    )
    db_session.add(teacher)
    await db_session.commit()
    await db_session.refresh(teacher)
    
    course = Course(
        title="Test Course",
        slug="test-course-3",
        description="Test",
        price=100.0,
        teacher_id=teacher.id,
        status=CourseStatus.PUBLISHED,
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    
    enrollment = Enrollment(
        user_id=test_user.id,
        course_id=course.id,
        progress_percentage=0,
    )
    db_session.add(enrollment)
    await db_session.commit()
    await db_session.refresh(enrollment)
    
    lesson = Lesson(
        title="Test Lesson",
        course_id=course.id,
        lesson_type=LessonType.VIDEO,
        order=1,
    )
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    
    # Update progress
    response = await client.post(
        f"/api/v1/courses/{course.id}/lessons/{lesson.id}/progress",
        json={"watched_seconds": 300, "is_completed": False},
        headers=auth_headers_student,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["watched_seconds"] == 300
    assert data["is_completed"] is False
    assert "id" in data


@pytest.mark.asyncio
async def test_complete_lesson(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    auth_headers_student,
):
    """Test completing a lesson"""
    from app.models.user import UserRole
    from app.core.security import get_password_hash
    
    teacher = User(
        email="teacher4@test.com",
        hashed_password=get_password_hash("password123"),
        full_name="Teacher",
        role=UserRole.TEACHER,
        is_active=True,
        is_verified=True,
    )
    db_session.add(teacher)
    await db_session.commit()
    await db_session.refresh(teacher)
    
    course = Course(
        title="Test Course",
        slug="test-course-4",
        description="Test",
        price=100.0,
        teacher_id=teacher.id,
        status=CourseStatus.PUBLISHED,
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    
    enrollment = Enrollment(
        user_id=test_user.id,
        course_id=course.id,
        progress_percentage=0,
    )
    db_session.add(enrollment)
    await db_session.commit()
    await db_session.refresh(enrollment)
    
    lesson = Lesson(
        title="Test Lesson",
        course_id=course.id,
        lesson_type=LessonType.VIDEO,
        order=1,
    )
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    
    # Complete lesson
    response = await client.post(
        f"/api/v1/courses/{course.id}/lessons/{lesson.id}/progress",
        json={"watched_seconds": 600, "is_completed": True},
        headers=auth_headers_student,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_completed"] is True
    assert data["completed_at"] is not None
