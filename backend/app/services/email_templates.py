from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping
import re

from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy.ext.asyncio import AsyncSession
import sqlalchemy as sa

from app.core.config import settings
from app.models.site_settings import SiteSettings


TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates" / "email"


TEMPLATE_REGISTRY: dict[str, dict[str, Any]] = {
    "welcome.html": {
        "title": "Hoş Geldin",
        "description": "Yeni kayıt olan kullanıcı için hoş geldin e-postası",
        "default_subject": "BiHocam'a Hoş Geldin!",
        "variables": ["user_name", "cta_url"],
    },
    "order_confirmation.html": {
        "title": "Sipariş Onayı",
        "description": "Sipariş sonrası ödeme onayı",
        "default_subject": "Siparişiniz Onaylandı",
        "variables": ["user_name", "order_number", "course_title", "amount", "invoice_url"],
    },
    "password_reset.html": {
        "title": "Şifre Sıfırlama",
        "description": "Şifre sıfırlama bağlantısı",
        "default_subject": "Şifre Sıfırlama Talebi",
        "variables": ["user_name", "reset_url", "expires_hours"],
    },
    "review_approved.html": {
        "title": "Yorum Onaylandı",
        "description": "Yorum onayı bildirimi",
        "default_subject": "Yorumunuz Onaylandı",
        "variables": ["user_name", "course_title"],
    },
    "review_rejected.html": {
        "title": "Yorum Reddedildi",
        "description": "Yorum reddi bildirimi",
        "default_subject": "Yorumunuz Reddedildi",
        "variables": ["user_name", "course_title", "reason"],
    },
    "teacher_new_sale.html": {
        "title": "Yeni Satış",
        "description": "Eğitmene yeni satış bildirimi",
        "default_subject": "Yeni Kurs Satışı",
        "variables": ["teacher_name", "course_title", "amount", "student_name"],
    },
    "crm_starter.html": {
        "title": "CRM Baslangic Sablonu",
        "description": "Kampanya ve duyuru e-postalari icin starter sablon",
        "default_subject": "Sana Ozel Firsatlar Hazir",
        "variables": ["full_name", "offer_title", "offer_deadline", "coupon_code", "cta_url"],
    },
}


@dataclass
class RenderedEmail:
    subject: str
    html_body: str
    plain_body: str | None = None


def _create_environment() -> Environment:
    return Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(["html", "xml"]),
    )


async def _get_site_context(db: AsyncSession) -> dict[str, Any]:
    result = await db.execute(sa.select(SiteSettings).limit(1))
    settings_row: SiteSettings | None = result.scalar_one_or_none()

    general = (settings_row.general if settings_row and settings_row.general else {}) or {}

    return {
        "site_title": general.get("site_title", "BiHocam"),
        "site_url": general.get("site_url", settings.FRONTEND_URL),
        "logo_url": general.get("logo_url"),
        "primary_color": general.get("primary_color", "#0f766e"),
        "secondary_color": general.get("secondary_color", "#f97316"),
        "contact_email": general.get("contact_email"),
        "contact_phone": general.get("contact_phone"),
        "footer_text": general.get("footer_text", "© BiHocam"),
    }


def _to_plain_text(html: str) -> str:
    text = re.sub(r"<\s*br\s*/?>", "\n", html, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def get_email_template_catalog() -> list[dict[str, Any]]:
    return [
        {
            "template_name": name,
            "title": meta["title"],
            "description": meta["description"],
            "default_subject": meta["default_subject"],
            "variables": meta["variables"],
        }
        for name, meta in TEMPLATE_REGISTRY.items()
    ]


async def render_email_template(
    db: AsyncSession,
    template_name: str,
    *,
    subject: str | None = None,
    context: Mapping[str, Any] | None = None,
    plain_body: str | None = None,
) -> RenderedEmail:
    env = _create_environment()
    template = env.get_template(template_name)

    site_ctx = await _get_site_context(db)
    registry_meta = TEMPLATE_REGISTRY.get(template_name, {})
    resolved_subject = subject or registry_meta.get("default_subject") or "BiHocam Bildirimi"

    merged_context = {
        "site": site_ctx,
        "subject": resolved_subject,
        **(context or {}),
    }

    html_body = template.render(**merged_context)
    effective_plain = plain_body if plain_body is not None else _to_plain_text(html_body)

    return RenderedEmail(subject=resolved_subject, html_body=html_body, plain_body=effective_plain)

