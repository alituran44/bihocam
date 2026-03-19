"""
Enrollments API tests
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Course, CourseStatus
from app.models.order import Enrollment, Order, OrderStatus, PaymentMethod
from app.models.user import User, UserRole
from app.core.security import get_password_hash


@pytest.mark.asyncio
async def test_get_my_enrollments(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    test_teacher: User,
    auth_headers_student,
):
    """Test getting my enrollments"""
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
    
    # Create order
    order = Order(
        user_id=test_user.id,
        order_number="ORD-123",
        subtotal=100.0,
        total=100.0,
        status=OrderStatus.PAID,
        payment_method=PaymentMethod.CREDIT_CARD,
    )
    db_session.add(order)
    await db_session.commit()
    await db_session.refresh(order)
    
    # Create enrollment
    enrollment = Enrollment(
        user_id=test_user.id,
        course_id=course.id,
        order_id=order.id,
        progress_percentage=0,
    )
    db_session.add(enrollment)
    await db_session.commit()
    
    # Get enrollments
    response = await client.get("/api/v1/enrollments/me", headers=auth_headers_student)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["course"]["id"] == course.id


@pytest.mark.asyncio
async def test_get_my_enrollments_empty(
    client: AsyncClient, auth_headers_student
):
    """Test getting enrollments when user has none"""
    response = await client.get("/api/v1/enrollments/me", headers=auth_headers_student)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


@pytest.mark.asyncio
async def test_get_my_enrollments_unauthorized(client: AsyncClient):
    """Test getting enrollments without auth"""
    response = await client.get("/api/v1/enrollments/me")
    assert response.status_code == 401
