"""
Faz 2 Paket G - P1-02 HttpOnly Cookie Auth, P1-08 CSRF testleri
"""
import pytest
import inspect


# === P1-02: HttpOnly Cookie Auth ===

def test_auth_supports_cookie_extraction():
    """P1-02: Token cookie'den çıkarılabilmeli."""
    from app.api.v1.endpoints.auth import _extract_token
    from unittest.mock import MagicMock

    # Cookie'li request simülasyonu
    mock_request = MagicMock()
    mock_request.cookies = {"access_token": "cookie-token-123"}

    token = _extract_token(mock_request, None)
    assert token == "cookie-token-123"


def test_auth_cookie_takes_priority_over_header():
    """P1-02: Cookie, header'dan öncelikli olmalı."""
    from app.api.v1.endpoints.auth import _extract_token
    from unittest.mock import MagicMock

    mock_request = MagicMock()
    mock_request.cookies = {"access_token": "cookie-token"}

    token = _extract_token(mock_request, "header-token")
    assert token == "cookie-token"  # Cookie öncelikli


def test_auth_falls_back_to_header():
    """P1-02: Cookie yoksa header token kullanılmalı."""
    from app.api.v1.endpoints.auth import _extract_token
    from unittest.mock import MagicMock

    mock_request = MagicMock()
    mock_request.cookies = {}

    token = _extract_token(mock_request, "header-token")
    assert token == "header-token"


def test_auth_returns_none_when_no_token():
    """P1-02: Ne cookie ne header varsa None dönmeli."""
    from app.api.v1.endpoints.auth import _extract_token
    from unittest.mock import MagicMock

    mock_request = MagicMock()
    mock_request.cookies = {}

    token = _extract_token(mock_request, None)
    assert token is None


def test_set_auth_cookies_function_exists():
    """P1-02: Cookie set fonksiyonu mevcut olmalı."""
    from app.api.v1.endpoints.auth import _set_auth_cookies
    assert callable(_set_auth_cookies)


def test_clear_auth_cookies_function_exists():
    """P1-02: Cookie temizleme fonksiyonu mevcut olmalı."""
    from app.api.v1.endpoints.auth import _clear_auth_cookies
    assert callable(_clear_auth_cookies)


def test_logout_endpoint_exists():
    """P1-02: Logout endpoint'i mevcut olmalı."""
    from app.api.v1.endpoints.auth import logout
    assert callable(logout)


def test_login_sets_cookies():
    """P1-02: Login endpoint'i cookie set etmeli."""
    from app.api.v1.endpoints import auth
    source = inspect.getsource(auth.login)
    assert "_set_auth_cookies" in source


def test_cookie_httponly_flag():
    """P1-02: Cookie'ler HttpOnly olmalı."""
    from app.api.v1.endpoints.auth import _COOKIE_HTTPONLY
    assert _COOKIE_HTTPONLY is True


def test_cookie_samesite_flag():
    """P1-08: Cookie'ler SameSite=lax olmalı (CSRF koruması)."""
    from app.api.v1.endpoints.auth import _COOKIE_SAMESITE
    assert _COOKIE_SAMESITE == "lax"


def test_cookie_secure_depends_on_debug():
    """P1-02: Secure flag DEBUG moduna bağlı olmalı."""
    from app.api.v1.endpoints.auth import _cookie_secure
    from app.core.config import settings
    # DEBUG=True ise secure=False (development HTTP çalışır)
    if settings.DEBUG:
        assert _cookie_secure() is False
    else:
        assert _cookie_secure() is True


def test_oauth2_scheme_auto_error_false():
    """P1-02: OAuth2 scheme auto_error=False olmalı (cookie fallback için)."""
    from app.api.v1.endpoints.auth import oauth2_scheme
    assert oauth2_scheme.auto_error is False
