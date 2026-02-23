"""
Course Reviews API tests
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Course, CourseStatus
from app.models.order import Enrollment
from app.models.user import User, UserRole
from app.core.security import get_password_hash


@pytest.mark.asyncio
async def test_get_course_reviews(
    client: AsyncClient, db_session: AsyncSession, test_teacher: User
):
    """Test getting course reviews"""
    # Create course
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
    
    response = await client.get(f"/api/v1/courses/{course.id}/reviews")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_get_course_review_stats(
    client: AsyncClient, db_session: AsyncSession, test_teacher: User
):
    """Test getting course review statistics"""
    course = Course(
        title="Test Course",
        slug="test-course-2",
        description="Test",
        price=100.0,
        teacher_id=test_teacher.id,
        status=CourseStatus.PUBLISHED,
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    
    response = await client.get(f"/api/v1/courses/{course.id}/reviews/stats")
    assert response.status_code == 200
    data = response.json()
    assert "average_rating" in data
    assert "total_reviews" in data
    assert data["average_rating"] == 0.0
    assert data["total_reviews"] == 0


@pytest.mark.asyncio
async def test_create_course_review(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    test_teacher: User,
    auth_headers_student,
):
    """Test creating a course review"""
    # Create course
    course = Course(
        title="Test Course",
        slug="test-course-3",
        description="Test",
        price=100.0,
        teacher_id=test_teacher.id,
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
    
    # Create review
    response = await client.post(
        f"/api/v1/courses/{course.id}/reviews",
        json={
            "rating": 5,
            "title": "Great Course!",
            "comment": "This course is amazing!",
        },
        headers=auth_headers_student,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["rating"] == 5
    assert data["title"] == "Great Course!"
    assert data["comment"] == "This course is amazing!"
    assert "user" in data
    assert data["user"]["full_name"] == test_user.full_name


@pytest.mark.asyncio
async def test_create_duplicate_review(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    test_teacher: User,
    auth_headers_student,
):
    """Test creating duplicate review"""
    course = Course(
        title="Test Course",
        slug="test-course-4",
        description="Test",
        price=100.0,
        teacher_id=test_teacher.id,
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
    
    # Create first review
    response1 = await client.post(
        f"/api/v1/courses/{course.id}/reviews",
        json={"rating": 5, "comment": "First review"},
        headers=auth_headers_student,
    )
    assert response1.status_code == 200
    
    # Try to create duplicate
    response2 = await client.post(
        f"/api/v1/courses/{course.id}/reviews",
        json={"rating": 4, "comment": "Second review"},
        headers=auth_headers_student,
    )
    assert response2.status_code == 400


@pytest.mark.asyncio
async def test_get_my_review(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    test_teacher: User,
    auth_headers_student,
):
    """Test getting my own review"""
    course = Course(
        title="Test Course",
        slug="test-course-5",
        description="Test",
        price=100.0,
        teacher_id=test_teacher.id,
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
    
    # Create review
    await client.post(
        f"/api/v1/courses/{course.id}/reviews",
        json={"rating": 5, "comment": "My review"},
        headers=auth_headers_student,
    )
    
    # Get my review
    response = await client.get(
        f"/api/v1/courses/{course.id}/reviews/me",
        headers=auth_headers_student,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["rating"] == 5
    assert data["comment"] == "My review"
