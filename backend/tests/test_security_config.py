"""
Paket A - P0-02, P0-03, P1-05, P1-09 güvenlik testleri
Config, exception handler ve DB pool ayarlarını doğrular.
"""
import json
import pytest
from unittest.mock import MagicMock, patch


@pytest.mark.asyncio
async def test_exception_handler_hides_traceback_in_production():
    """P0-03: Production'da (DEBUG=false) traceback response'da gizlenmeli."""
    from app.main import global_exception_handler

    mock_request = MagicMock()
    mock_request.method = "GET"
    mock_request.url = MagicMock()
    mock_request.url.path = "/test"

    with patch("app.main.settings") as mock_settings:
        mock_settings.DEBUG = False

        response = await global_exception_handler(mock_request, Exception("test error"))

        body = json.loads(response.body)
        assert response.status_code == 500
        assert "traceback" not in body
        assert body["detail"] == "Sunucu hatası oluştu."
        assert "error_id" in body


@pytest.mark.asyncio
async def test_exception_handler_shows_traceback_in_debug():
    """P0-03: DEBUG modunda traceback gösterilmeli (geliştirme kolaylığı)."""
    from app.main import global_exception_handler

    mock_request = MagicMock()
    mock_request.method = "GET"
    mock_request.url = MagicMock()
    mock_request.url.path = "/test"

    with patch("app.main.settings") as mock_settings:
        mock_settings.DEBUG = True

        response = await global_exception_handler(mock_request, Exception("debug error"))

        body = json.loads(response.body)
        assert response.status_code == 500
        assert "traceback" in body
        assert "debug error" in body["detail"]
        assert "error_id" in body


@pytest.mark.asyncio
async def test_exception_handler_error_id_is_unique():
    """P0-03: Her hata için benzersiz error_id üretilmeli."""
    from app.main import global_exception_handler

    mock_request = MagicMock()
    mock_request.method = "GET"
    mock_request.url = MagicMock()
    mock_request.url.path = "/test"

    with patch("app.main.settings") as mock_settings:
        mock_settings.DEBUG = False

        r1 = await global_exception_handler(mock_request, Exception("err1"))
        r2 = await global_exception_handler(mock_request, Exception("err2"))

        id1 = json.loads(r1.body)["error_id"]
        id2 = json.loads(r2.body)["error_id"]
        assert id1 != id2


def test_insecure_secret_key_blocked_in_production():
    """P0-02: Bilinen zayıf key'ler blocklist'te olmalı."""
    from app.core.config import _INSECURE_SECRET_KEYS

    assert "dev-secret-key-change-in-production" in _INSECURE_SECRET_KEYS
    assert "" in _INSECURE_SECRET_KEYS
    assert "secret" in _INSECURE_SECRET_KEYS
    assert "changeme" in _INSECURE_SECRET_KEYS


def test_secure_secret_key_not_in_blocklist():
    """P0-02: Güçlü key'ler blocklist'te olmamalı."""
    import secrets
    from app.core.config import _INSECURE_SECRET_KEYS

    strong_key = secrets.token_urlsafe(48)
    assert strong_key not in _INSECURE_SECRET_KEYS
    assert len(strong_key) >= 32


def test_db_pool_settings_exist():
    """P1-05: DB pool ayarları config'de tanımlı ve makul olmalı."""
    from app.core.config import settings

    assert settings.DB_POOL_SIZE >= 5
    assert settings.DB_MAX_OVERFLOW >= 10
    assert settings.DB_POOL_RECYCLE > 0
    assert settings.DB_POOL_PRE_PING is True


def test_debug_flag_exists():
    """Paket A: DEBUG flag'i config'de tanımlı olmalı."""
    from app.core.config import settings

    assert hasattr(settings, "DEBUG")
    assert isinstance(settings.DEBUG, bool)
