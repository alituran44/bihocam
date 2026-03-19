"""
Faz 2 Paket D - P1-01 XSS, P1-04 Fiyat Validasyonu, P1-06 Enum Fix testleri
"""
import pytest
from decimal import Decimal
from pydantic import ValidationError


# === P1-04: Fiyat Validasyonu ===

def test_course_create_rejects_negative_price():
    """P1-04: Negatif fiyat reddedilmeli."""
    from app.schemas.course import CourseCreate
    with pytest.raises(ValidationError) as exc_info:
        CourseCreate(
            title="Test Course",
            slug="test-course",
            price=Decimal("-10.00"),
        )
    assert "negatif" in str(exc_info.value).lower()


def test_course_create_accepts_zero_price():
    """P1-04: Ücretsiz kurs (fiyat=0) kabul edilmeli."""
    from app.schemas.course import CourseCreate
    course = CourseCreate(
        title="Free Course",
        slug="free-course",
        price=Decimal("0"),
    )
    assert course.price == Decimal("0")


def test_course_create_accepts_positive_price():
    """P1-04: Pozitif fiyat kabul edilmeli."""
    from app.schemas.course import CourseCreate
    course = CourseCreate(
        title="Paid Course",
        slug="paid-course",
        price=Decimal("99.99"),
    )
    assert course.price == Decimal("99.99")


def test_course_create_rejects_negative_discount_price():
    """P1-04: Negatif indirimli fiyat reddedilmeli."""
    from app.schemas.course import CourseCreate
    with pytest.raises(ValidationError):
        CourseCreate(
            title="Test",
            slug="test",
            price=Decimal("100"),
            discount_price=Decimal("-5"),
        )


def test_course_create_rejects_discount_exceeding_price():
    """P1-04: İndirimli fiyat normal fiyattan büyük olamamalı."""
    from app.schemas.course import CourseCreate
    with pytest.raises(ValidationError) as exc_info:
        CourseCreate(
            title="Test",
            slug="test",
            price=Decimal("50"),
            discount_price=Decimal("100"),
        )
    assert "büyük" in str(exc_info.value).lower()


def test_course_create_accepts_valid_discount():
    """P1-04: Geçerli indirim kabul edilmeli."""
    from app.schemas.course import CourseCreate
    course = CourseCreate(
        title="Discounted",
        slug="discounted",
        price=Decimal("100"),
        discount_price=Decimal("75"),
    )
    assert course.discount_price == Decimal("75")


def test_course_update_rejects_negative_price():
    """P1-04: Güncelleme sırasında da negatif fiyat reddedilmeli."""
    from app.schemas.course import CourseUpdate
    with pytest.raises(ValidationError):
        CourseUpdate(price=Decimal("-1"))


def test_course_update_accepts_none_price():
    """P1-04: Güncelleme sırasında fiyat None olabilir (değiştirilmedi)."""
    from app.schemas.course import CourseUpdate
    update = CourseUpdate(title="New Title")
    assert update.price is None


# === P1-06: EarningType Enum ===

def test_earning_type_has_ad_spend():
    """P1-06: EarningType enum'unda AD_SPEND değeri olmalı."""
    from app.models.teacher_earning import EarningType
    assert hasattr(EarningType, "AD_SPEND")
    assert EarningType.AD_SPEND.value == "ad_spend"


def test_earning_type_all_values():
    """P1-06: Tüm EarningType değerleri mevcut olmalı."""
    from app.models.teacher_earning import EarningType
    expected = {"earning", "withdrawal", "adjustment", "commission", "ad_spend"}
    actual = {e.value for e in EarningType}
    assert actual == expected


def test_migration_file_exists():
    """P1-06: ad_spend enum migration dosyası mevcut olmalı."""
    import os
    migration_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "alembic",
        "versions",
        "20260319_add_ad_spend_to_earningtype.py",
    )
    assert os.path.exists(migration_path), "ad_spend enum migration dosyası eksik"
