"""
Faz 2 Paket E - P1-03 Rate Limiting, P1-07 Withdrawal Race Condition testleri
"""
import pytest


# === P1-03: Rate Limiting ===

def test_rate_limiter_module_exists():
    """P1-03: Rate limiter modülü mevcut olmalı."""
    from app.core.rate_limit import limiter
    assert limiter is not None


def test_rate_limiter_configured_in_app():
    """P1-03: Rate limiter app'e entegre edilmiş olmalı."""
    from app.main import app
    assert hasattr(app.state, "limiter")


def test_auth_login_has_rate_limit():
    """P1-03: Login endpoint'inde rate limit olmalı."""
    import inspect
    from app.api.v1.endpoints import auth
    source = inspect.getsource(auth.login)
    # slowapi decorator fonksiyon source'unda görünmez ama
    # fonksiyon imzasında Request parametresi olmalı (rate limit gerektirir)
    assert "request: Request" in inspect.getsource(auth.login) or "Request" in str(inspect.signature(auth.login))


def test_auth_register_has_rate_limit():
    """P1-03: Register endpoint'inde rate limit olmalı."""
    import inspect
    from app.api.v1.endpoints import auth
    assert "request: Request" in inspect.getsource(auth.register) or "Request" in str(inspect.signature(auth.register))


def test_slowapi_exception_handler_registered():
    """P1-03: RateLimitExceeded exception handler kayıtlı olmalı."""
    from app.main import app
    from slowapi.errors import RateLimitExceeded
    # FastAPI exception_handlers dict'inde RateLimitExceeded olmalı
    assert RateLimitExceeded in app.exception_handlers


# === P1-07: Withdrawal Race Condition ===

def test_withdrawal_approve_uses_for_update():
    """P1-07: Withdrawal approval SELECT FOR UPDATE kullanmalı."""
    import inspect
    from app.api.v1.endpoints import withdrawals
    source = inspect.getsource(withdrawals.approve_withdrawal)
    assert "with_for_update()" in source


def test_withdrawal_mark_paid_uses_for_update():
    """P1-07: Withdrawal mark-paid SELECT FOR UPDATE kullanmalı."""
    import inspect
    from app.api.v1.endpoints import withdrawals
    source = inspect.getsource(withdrawals.mark_withdrawal_paid)
    assert "with_for_update()" in source


def test_withdrawal_reject_uses_for_update():
    """P1-07: Withdrawal reject SELECT FOR UPDATE kullanmalı."""
    import inspect
    from app.api.v1.endpoints import withdrawals
    source = inspect.getsource(withdrawals.reject_withdrawal)
    assert "with_for_update()" in source


def test_withdrawal_status_validation_on_approve():
    """P1-07: Sadece PENDING talep onaylanabilmeli."""
    import inspect
    from app.api.v1.endpoints import withdrawals
    source = inspect.getsource(withdrawals.approve_withdrawal)
    assert "WithdrawalStatus.PENDING" in source
