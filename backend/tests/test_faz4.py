"""
Faz 4 (P3) testleri — Demo credentials, open redirect, maintenance bypass, CSP, auth sync
"""
import inspect


# === P3-01: Auth State Senkronizasyonu (P1-02'de yapıldı) ===

def test_api_interceptor_clears_auth_store():
    """P3-01: 401'de auth store temizlenmeli (api.ts interceptor)."""
    import os
    api_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "frontend",
        "src",
        "lib",
        "api.ts",
    )
    with open(api_path, encoding="utf-8") as f:
        content = f.read()
    assert "useAuthStore" in content, "401 interceptor'da auth store temizlenmeli"


# === P3-02: Demo Credentials ===

def test_demo_accounts_behind_env_flag():
    """P3-02: Demo hesaplar env flag'ine bağlı olmalı."""
    import os
    login_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "frontend",
        "src",
        "app",
        "(auth)",
        "login",
        "page.tsx",
    )
    with open(login_path, encoding="utf-8") as f:
        content = f.read()
    assert "NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS" in content
    assert "showDemoAccounts" in content


# === P3-03: CSP Headers ===

def test_csp_headers_configured():
    """P3-03: Next.js config'de security headers tanımlı olmalı."""
    import os
    config_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "frontend",
        "next.config.ts",
    )
    with open(config_path, encoding="utf-8") as f:
        content = f.read()
    assert "Content-Security-Policy" in content
    assert "X-Content-Type-Options" in content
    assert "X-Frame-Options" in content


# === P3-05: Open Redirect ===

def test_popup_announcement_validates_urls():
    """P3-05: PopupAnnouncement URL validation yapmalı."""
    import os
    popup_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "frontend",
        "src",
        "components",
        "PopupAnnouncement.tsx",
    )
    with open(popup_path, encoding="utf-8") as f:
        content = f.read()
    # URL validation - relative veya same-origin kontrolü olmalı
    assert "startsWith" in content or "origin" in content, \
        "PopupAnnouncement'da URL validation olmalı"


# === P3-09: Maintenance Mode Bypass ===

def test_maintenance_mode_blocks_register():
    """P3-09: Maintenance modunda register engellenmiş olmalı."""
    from app.main import MaintenanceModeMiddleware
    source = inspect.getsource(MaintenanceModeMiddleware.dispatch)
    # Yeni: sadece login ve me izinli (whitelist)
    assert '"/api/v1/auth/login"' in source
    assert '"/api/v1/auth/me"' in source
    # Eski broad bypass kaldırılmış olmalı
    assert 'startswith("/api/v1/auth/")' not in source
