"""
Faz 3 (P2) testleri — Indexes, constraints, N+1 fix, pagination, cache, cascade
"""
import os
import pytest
import inspect
from decimal import Decimal


# === P2-01: Migration dosyası mevcut ===

def test_p2_migration_exists():
    """P2-01: Index ve constraint migration dosyası mevcut olmalı."""
    migration_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "alembic",
        "versions",
        "20260319_p2_indexes_and_constraints.py",
    )
    assert os.path.exists(migration_path)


def test_p2_migration_has_all_indexes():
    """P2-01: Migration 7 index içermeli."""
    migration_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "alembic",
        "versions",
        "20260319_p2_indexes_and_constraints.py",
    )
    with open(migration_path) as f:
        content = f.read()

    expected_indexes = [
        "idx_courses_teacher_status",
        "idx_lessons_course_type",
        "idx_notifications_user_read_date",
        "idx_messages_conversation_deleted",
        "idx_teacher_earnings_teacher_date",
        "idx_coupons_active_validity",
        "idx_orders_user_date",
    ]
    for idx in expected_indexes:
        assert idx in content, f"Index '{idx}' migration'da bulunamadı"


def test_p2_migration_has_check_constraints():
    """P2-04: Migration CHECK constraint'leri içermeli."""
    migration_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "alembic",
        "versions",
        "20260319_p2_indexes_and_constraints.py",
    )
    with open(migration_path) as f:
        content = f.read()

    expected_constraints = [
        "check_coupon_discount_positive",
        "check_order_item_final_price_non_negative",
        "check_order_item_commission_non_negative",
        "check_storage_used_non_negative",
        "check_storage_quota_positive",
        "check_enrollment_progress_range",
        "check_course_status_valid",
    ]
    for constraint in expected_constraints:
        assert constraint in content, f"Constraint '{constraint}' migration'da bulunamadı"


# === P2-02: N+1 Query Fix ===

def test_enrollments_uses_load_only():
    """P2-02: Enrollment listesinde lesson'lar load_only ile yüklenmeli."""
    from app.api.v1.endpoints import enrollments
    source = inspect.getsource(enrollments.get_my_enrollments)
    assert "load_only" in source


# === P2-03: Redis Cache ===

def test_cache_module_exists():
    """P2-03: Cache modülü mevcut olmalı."""
    from app.core.cache import cache_get, cache_set, cache_delete
    assert callable(cache_get)
    assert callable(cache_set)
    assert callable(cache_delete)


def test_cache_keys_defined():
    """P2-03: Cache key sabitleri tanımlı olmalı."""
    from app.core.cache import CACHE_SITE_SETTINGS, CACHE_CATEGORIES, CACHE_FEATURED_COURSES
    assert CACHE_SITE_SETTINGS == "site_settings"
    assert CACHE_CATEGORIES == "categories:all"
    assert CACHE_FEATURED_COURSES == "courses:featured"


def test_commission_service_uses_cache():
    """P2-03: Commission service cache kullanmalı."""
    from app.services import commission
    source = inspect.getsource(commission)
    assert "cache_get" in source
    assert "cache_set" in source


# === P2-06: Pagination ===

def test_enrollments_has_pagination():
    """P2-06: Enrollments endpoint'inde skip/limit olmalı."""
    from app.api.v1.endpoints import enrollments
    source = inspect.getsource(enrollments.get_my_enrollments)
    assert "skip" in source
    assert "limit" in source
    assert ".offset(" in source
    assert ".limit(" in source


# === P2-08: Cascade Delete ===

def test_order_coupon_usage_has_cascade():
    """P2-08: Order.coupon_usage cascade='all, delete-orphan' olmalı."""
    from app.models.order import Order
    coupon_usage_rel = Order.__mapper__.relationships.get("coupon_usage")
    assert coupon_usage_rel is not None
    assert "delete-orphan" in str(coupon_usage_rel.cascade)
