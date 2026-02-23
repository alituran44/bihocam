"""
Courses API tests
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Course, CourseStatus, Lesson
from app.models.user import User
from app.models.order import Enrollment


@pytest.mark.asyncio
async def test_list_courses(client: AsyncClient, db_session: AsyncSession, test_teacher: User):
    """Test listing published courses"""
    # Create a published course
    course = Course(
        title="Test Course",
        slug="test-course",
        description="Test description",
        price=100.0,
        teacher_id=test_teacher.id,
        status=CourseStatus.PUBLISHED,
    )
    db_session.add(course)
    await db_session.commit()
    
    response = await client.get("/api/v1/courses/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["title"] == "Test Course"


@pytest.mark.asyncio
async def test_list_courses_only_published(
    client: AsyncClient, db_session: AsyncSession, test_teacher: User
):
    """Test that only published courses are listed"""
    # Create published course
    published = Course(
        title="Published Course",
        slug="published-course",
        description="Published",
        price=100.0,
        teacher_id=test_teacher.id,
        status=CourseStatus.PUBLISHED,
    )
    # Create draft course
    draft = Course(
        title="Draft Course",
        slug="draft-course",
        description="Draft",
        price=100.0,
        teacher_id=test_teacher.id,
        status=CourseStatus.DRAFT,
    )
    db_session.add(published)
    db_session.add(draft)
    await db_session.commit()
    
    response = await client.get("/api/v1/courses/")
    assert response.status_code == 200
    data = response.json()
    titles = [c["title"] for c in data]
    assert "Published Course" in titles
    assert "Draft Course" not in titles


@pytest.mark.asyncio
async def test_get_course_by_slug(client: AsyncClient, db_session: AsyncSession, test_teacher: User):
    """Test getting course by slug"""
    course = Course(
        title="Test Course",
        slug="test-course",
        description="Test description",
        price=100.0,
        teacher_id=test_teacher.id,
        status=CourseStatus.PUBLISHED,
    )
    db_session.add(course)
    await db_session.commit()
    
    response = await client.get("/api/v1/courses/slug/test-course")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "test-course"
    assert data["title"] == "Test Course"


@pytest.mark.asyncio
async def test_get_draft_course_hidden_for_non_owner(
    client: AsyncClient,
    db_session: AsyncSession,
    test_teacher: User,
    auth_headers_teacher,
    auth_headers_student,
):
    """Draft course should be hidden (404) for non-owner, visible for owner."""
    course = Course(
        title="Draft Course",
        slug="draft-hidden",
        description="Draft description",
        price=100.0,
        teacher_id=test_teacher.id,
        status=CourseStatus.DRAFT,
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)

    # Non-owner (student) -> 404
    r1 = await client.get(f"/api/v1/courses/{course.id}", headers=auth_headers_student)
    assert r1.status_code == 404

    r2 = await client.get("/api/v1/courses/slug/draft-hidden", headers=auth_headers_student)
    assert r2.status_code == 404

    # Anonymous -> 404
    r3 = await client.get(f"/api/v1/courses/{course.id}")
    assert r3.status_code == 404

    # Owner teacher -> 200
    r4 = await client.get(f"/api/v1/courses/{course.id}", headers=auth_headers_teacher)
    assert r4.status_code == 200


@pytest.mark.asyncio
async def test_public_course_lessons_preview_only_when_not_enrolled(
    client: AsyncClient,
    db_session: AsyncSession,
    test_teacher: User,
    test_user: User,
    auth_headers_student,
):
    """Non-enrolled users should only see preview lessons in course detail and lessons list."""
    course = Course(
        title="Published With Lessons",
        slug="published-with-lessons",
        description="desc",
        price=100.0,
        teacher_id=test_teacher.id,
        status=CourseStatus.PUBLISHED,
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)

    lesson_preview = Lesson(
        title="Preview Lesson",
        course_id=course.id,
        order=1,
        is_preview=True,
        video_url="https://example.com/preview",
        duration_seconds=60,
    )
    lesson_full = Lesson(
        title="Full Lesson",
        course_id=course.id,
        order=2,
        is_preview=False,
        video_url="https://example.com/full",
        duration_seconds=120,
    )
    db_session.add_all([lesson_preview, lesson_full])
    await db_session.commit()

    # Anonymous: course detail returns only preview lessons
    r1 = await client.get("/api/v1/courses/slug/published-with-lessons")
    assert r1.status_code == 200
    lessons = r1.json().get("lessons", [])
    assert len(lessons) == 1
    assert lessons[0]["title"] == "Preview Lesson"
    assert lessons[0]["is_preview"] is True

    # Student not enrolled: lessons endpoint returns only preview lessons
    r2 = await client.get(f"/api/v1/courses/{course.id}/lessons", headers=auth_headers_student)
    assert r2.status_code == 200
    lessons2 = r2.json()
    assert len(lessons2) == 1
    assert lessons2[0]["title"] == "Preview Lesson"

    # Enroll student, then should see all lessons
    enrollment = Enrollment(user_id=test_user.id, course_id=course.id)
    db_session.add(enrollment)
    await db_session.commit()

    r3 = await client.get("/api/v1/courses/slug/published-with-lessons", headers=auth_headers_student)
    assert r3.status_code == 200
    lessons3 = r3.json().get("lessons", [])
    titles = [l["title"] for l in lessons3]
    assert "Preview Lesson" in titles
    assert "Full Lesson" in titles

    r4 = await client.get(f"/api/v1/courses/{course.id}/lessons", headers=auth_headers_student)
    assert r4.status_code == 200
    titles4 = [l["title"] for l in r4.json()]
    assert "Preview Lesson" in titles4
    assert "Full Lesson" in titles4


@pytest.mark.asyncio
async def test_get_course_by_slug_not_found(client: AsyncClient):
    """Test getting non-existent course"""
    response = await client.get("/api/v1/courses/slug/nonexistent")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_course(client: AsyncClient, auth_headers_teacher):
    """Test creating a course as teacher"""
    response = await client.post(
        "/api/v1/courses/",
        json={
            "title": "New Course",
            "slug": "new-course",
            "description": "Course description",
            "price": 199.99,
        },
        headers=auth_headers_teacher,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New Course"
    assert data["slug"] == "new-course"
    assert "id" in data


@pytest.mark.asyncio
async def test_create_course_duplicate_slug(
    client: AsyncClient, auth_headers_teacher, db_session: AsyncSession, test_teacher: User
):
    """Test creating course with duplicate slug"""
    # Create existing course
    existing = Course(
        title="Existing Course",
        slug="existing-slug",
        description="Existing",
        price=100.0,
        teacher_id=test_teacher.id,
        status=CourseStatus.PUBLISHED,
    )
    db_session.add(existing)
    await db_session.commit()
    
    # Try to create with same slug
    response = await client.post(
        "/api/v1/courses/",
        json={
            "title": "New Course",
            "slug": "existing-slug",
            "description": "Course description",
            "price": 199.99,
        },
        headers=auth_headers_teacher,
    )
    assert response.status_code == 400
    data = response.json()
    assert data["detail"]["code"] == "COURSE_SLUG_EXISTS"


@pytest.mark.asyncio
async def test_create_course_unauthorized(client: AsyncClient, auth_headers_student):
    """Test creating course as student (should fail)"""
    response = await client.post(
        "/api/v1/courses/",
        json={
            "title": "New Course",
            "slug": "new-course",
            "description": "Course description",
            "price": 199.99,
        },
        headers=auth_headers_student,
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_get_my_courses(
    client: AsyncClient, auth_headers_teacher, db_session: AsyncSession, test_teacher: User
):
    """Test getting teacher's own courses"""
    # Create courses for this teacher
    course1 = Course(
        title="My Course 1",
        slug="my-course-1",
        description="My course",
        price=100.0,
        teacher_id=test_teacher.id,
        status=CourseStatus.PUBLISHED,
    )
    course2 = Course(
        title="My Course 2",
        slug="my-course-2",
        description="My course",
        price=100.0,
        teacher_id=test_teacher.id,
        status=CourseStatus.DRAFT,
    )
    db_session.add(course1)
    db_session.add(course2)
    await db_session.commit()
    
    response = await client.get("/api/v1/courses/me", headers=auth_headers_teacher)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    titles = [c["title"] for c in data]
    assert "My Course 1" in titles
    assert "My Course 2" in titles


@pytest.mark.asyncio
async def test_get_my_courses_unauthorized(client: AsyncClient, auth_headers_student):
    """Test getting my courses as student (should fail)"""
    response = await client.get("/api/v1/courses/me", headers=auth_headers_student)
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_update_course(
    client: AsyncClient, auth_headers_teacher, db_session: AsyncSession, test_teacher: User
):
    """Test updating own course"""
    course = Course(
        title="Original Title",
        slug="original-slug",
        description="Original",
        price=100.0,
        teacher_id=test_teacher.id,
        status=CourseStatus.PUBLISHED,
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    
    response = await client.patch(
        f"/api/v1/courses/{course.id}",
        json={"title": "Updated Title", "description": "Updated description"},
        headers=auth_headers_teacher,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["description"] == "Updated description"


@pytest.mark.asyncio
async def test_update_course_unauthorized(
    client: AsyncClient, auth_headers_student, db_session: AsyncSession, test_teacher: User
):
    """Test updating course as non-owner"""
    course = Course(
        title="Teacher's Course",
        slug="teacher-course",
        description="Teacher's course",
        price=100.0,
        teacher_id=test_teacher.id,
        status=CourseStatus.PUBLISHED,
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    
    response = await client.patch(
        f"/api/v1/courses/{course.id}",
        json={"title": "Hacked Title"},
        headers=auth_headers_student,
    )
    assert response.status_code == 403
