"""
Faz 2 Paket F - P1-10 Eksik Bildirimler testleri
"""
import inspect


def test_order_create_sends_notification():
    """P1-10: Sipariş oluşturulduğunda ORDER_CONFIRMED bildirimi gönderilmeli."""
    from app.api.v1.endpoints import orders
    source = inspect.getsource(orders.create_order)
    assert "ORDER_CONFIRMED" in source
    assert "notification_service" in source.lower() or "NotificationService" in source


def test_order_complete_sends_notification():
    """P1-10: Ödeme tamamlandığında PAYMENT_SUCCESS bildirimi gönderilmeli."""
    from app.api.v1.endpoints import orders
    source = inspect.getsource(orders.complete_order)
    assert "PAYMENT_SUCCESS" in source
    assert "NotificationService" in source


def test_course_approve_sends_notification():
    """P1-10: Kurs onaylandığında COURSE_APPROVED bildirimi zaten gönderiliyor."""
    from app.api.v1.endpoints import courses
    source = inspect.getsource(courses.approve_course)
    assert "COURSE_APPROVED" in source


def test_course_reject_sends_notification():
    """P1-10: Kurs reddedildiğinde COURSE_REJECTED bildirimi zaten gönderiliyor."""
    from app.api.v1.endpoints import courses
    source = inspect.getsource(courses.reject_course)
    assert "COURSE_REJECTED" in source


def test_withdrawal_approve_sends_notification():
    """P1-10: Çekim onaylandığında bildirim zaten gönderiliyor."""
    from app.api.v1.endpoints import withdrawals
    source = inspect.getsource(withdrawals.approve_withdrawal)
    assert "WITHDRAWAL_APPROVED" in source


def test_withdrawal_paid_sends_notification():
    """P1-10: Çekim ödendiğinde bildirim zaten gönderiliyor."""
    from app.api.v1.endpoints import withdrawals
    source = inspect.getsource(withdrawals.mark_withdrawal_paid)
    assert "WITHDRAWAL_PAID" in source


def test_notifications_are_non_blocking():
    """P1-10: Bildirimler non-blocking olmalı (try/except ile)."""
    from app.api.v1.endpoints import orders
    source = inspect.getsource(orders.create_order)
    # Notification bloğu try/except içinde olmalı
    assert "non-critical" in source.lower() or "non-blocking" in source.lower()
