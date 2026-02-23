"""
EPIC-10 Quota System Tests (EP10-BE-16)

Storage quota sistemi için testler.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from io import BytesIO

from app.models.course import Course, Lesson, CourseStatus, LessonType
from app.models.user import User, UserRole
from app.models.storage_quota import StorageQuota
from app.services.quota_service import QuotaExceededError, reserve_quota, release_quota


@pytest.mark.asyncio
async def test_quota_exceeded_rejection(
    client: AsyncClient,
    db_session: AsyncSession,
    test_teacher: User,
    auth_headers_teacher,
):
    """Quota aşımı reddetme testi"""
    # Quota oluştur (1MB limit)
    quota = StorageQuota(
        user_id=test_teacher.id,
        quota_bytes=1 * 1024 * 1024,  # 1MB
        used_bytes=0,
    )
    db_session.add(quota)
    await db_session.commit()
    
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
    
    lesson = Lesson(title="Lesson", course_id=course.id, order=1, lesson_type=LessonType.DOCUMENT)
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    
    # 2MB dosya yükle (1MB limit aşılacak)
    large_content = b"x" * (2 * 1024 * 1024)
    large_file = ("large.pdf", BytesIO(large_content), "application/pdf")
    
    # Quota kontrolü yapılmalı (upload endpoint'inde)
    # Bu test quota kontrolünün çalıştığını doğrular
    # Gerçek implementasyonda upload endpoint'ine quota kontrolü eklenmeli
    with pytest.raises(QuotaExceededError):
        await reserve_quota(db_session, test_teacher.id, 2 * 1024 * 1024)


@pytest.mark.asyncio
async def test_quota_update_on_upload(
    db_session: AsyncSession,
    test_teacher: User,
):
    """Upload sonrası quota güncelleme testi"""
    quota = StorageQuota(
        user_id=test_teacher.id,
        quota_bytes=10 * 1024 * 1024,  # 10MB
        used_bytes=0,
    )
    db_session.add(quota)
    await db_session.commit()
    
    # 5MB dosya için quota rezerve et
    updated_quota = await reserve_quota(db_session, test_teacher.id, 5 * 1024 * 1024)
    
    assert updated_quota.used_bytes == 5 * 1024 * 1024
    assert updated_quota.available_bytes == 5 * 1024 * 1024


@pytest.mark.asyncio
async def test_quota_update_on_delete(
    db_session: AsyncSession,
    test_teacher: User,
):
    """Delete sonrası quota güncelleme testi"""
    quota = StorageQuota(
        user_id=test_teacher.id,
        quota_bytes=10 * 1024 * 1024,  # 10MB
        used_bytes=5 * 1024 * 1024,  # 5MB kullanılmış
    )
    db_session.add(quota)
    await db_session.commit()
    
    # 3MB dosya sil
    updated_quota = await release_quota(db_session, test_teacher.id, 3 * 1024 * 1024)
    
    assert updated_quota.used_bytes == 2 * 1024 * 1024
    assert updated_quota.available_bytes == 8 * 1024 * 1024


@pytest.mark.asyncio
async def test_admin_quota_management(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    test_admin: User,
    auth_headers_admin,
):
    """Admin quota yönetimi testi"""
    # Kullanıcı için quota oluştur
    quota = StorageQuota(
        user_id=test_user.id,
        quota_bytes=1 * 1024 * 1024,  # 1MB
        used_bytes=0,
    )
    db_session.add(quota)
    await db_session.commit()
    
    # Admin quota güncelle
    response = await client.put(
        f"/api/v1/admin/users/{test_user.id}/storage-quota",
        headers=auth_headers_admin,
        json={"quota_mb": 5, "notes": "Test quota increase"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["quota_bytes"] == 5 * 1024 * 1024


@pytest.mark.asyncio
async def test_admin_list_quotas(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
    test_teacher: User,
    test_admin: User,
    auth_headers_admin,
):
    """Admin quota listesi testi"""
    # İki kullanıcı için quota oluştur
    quota1 = StorageQuota(
        user_id=test_user.id,
        quota_bytes=1 * 1024 * 1024,
        used_bytes=500 * 1024,
    )
    quota2 = StorageQuota(
        user_id=test_teacher.id,
        quota_bytes=2 * 1024 * 1024,
        used_bytes=1 * 1024 * 1024,
    )
    db_session.add_all([quota1, quota2])
    await db_session.commit()
    
    # Admin quota listesi al
    response = await client.get(
        "/api/v1/admin/users/storage-quotas",
        headers=auth_headers_admin,
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert len(data["quotas"]) >= 2
