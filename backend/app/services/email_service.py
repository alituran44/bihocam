from __future__ import annotations

"""
Basit SMTP Email Servisi

NOTIFV2-BE-01 kapsamında:
- aiosmtplib ile async SMTP gönderimi
- TLS/SSL port'a ve config'e göre otomatik seçim
- SiteSettings entegrasyonu için hazır, şimdilik env tabanlı config (Settings)
"""

from dataclasses import dataclass
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Iterable, Sequence

import aiosmtplib
import sqlalchemy as sa

from app.core.config import settings
from app.models.site_settings import SiteSettings
from sqlalchemy.ext.asyncio import AsyncSession


@dataclass
class EmailAttachment:
    filename: str
    content: bytes
    mimetype: str | None = None  # Örn: "application/pdf"


@dataclass
class SMTPConfig:
    host: str
    port: int
    username: str | None = None
    password: str | None = None
    use_tls: bool = True
    use_ssl: bool = False
    default_from: str | None = None

    @classmethod
    def from_settings(cls) -> "SMTPConfig":
        """
        Şimdilik config'i env tabanlı `Settings`'ten okuyoruz.
        İleride SiteSettings modelinden okuma eklenecek.
        """
        return cls(
            host=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME,
            password=settings.SMTP_PASSWORD,
            use_tls=settings.SMTP_USE_TLS,
            use_ssl=settings.SMTP_USE_SSL,
            default_from=settings.SMTP_DEFAULT_FROM,
        )


class EmailService:
    """
    SMTP tabanlı email gönderim servisi.

    - TLS/SSL seçimi port + config'e göre otomatik yapılır.
    - HTML + plain text body desteği.
    - CC / BCC desteği.
    - Attachment desteği (opsiyonel).
    """

    def __init__(self, config: SMTPConfig | None = None):
        self.config = config or SMTPConfig.from_settings()

    def _build_message(
        self,
        to: Sequence[str] | str,
        subject: str,
        html_body: str,
        plain_body: str | None = None,
        *,
        cc: Sequence[str] | None = None,
        bcc: Sequence[str] | None = None,
        from_email: str | None = None,
        attachments: Iterable[EmailAttachment] | None = None,
    ) -> tuple[MIMEMultipart, list[str]]:
        if isinstance(to, str):
            to_list = [to]
        else:
            to_list = list(to)

        cc_list = list(cc or [])
        bcc_list = list(bcc or [])

        msg = MIMEMultipart("alternative")

        from_addr = from_email or self.config.default_from
        if not from_addr:
            raise ValueError("From email address must be provided or configured in SMTP_DEFAULT_FROM")

        msg["From"] = from_addr
        msg["To"] = ", ".join(to_list)
        if cc_list:
            msg["Cc"] = ", ".join(cc_list)
        msg["Subject"] = subject

        # Plain text fallback
        if plain_body:
            msg.attach(MIMEText(plain_body, "plain", "utf-8"))

        # HTML body
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        # Attachments (ileri kullanım için)
        if attachments:
            for attachment in attachments:
                part = MIMEApplication(
                    attachment.content,
                    Name=attachment.filename,
                )
                part["Content-Disposition"] = f'attachment; filename="{attachment.filename}"'
                msg.attach(part)

        # Tüm gerçek alıcılar (To + Cc + Bcc)
        all_recipients = to_list + cc_list + bcc_list
        return msg, all_recipients

    def _resolve_security(self) -> tuple[bool, bool]:
        """
        TLS/SSL seçimi:
        - 465 → genelde implicit SSL
        - 587 → starttls (TLS)
        - Aksi halde config'deki flag'ler kullanılır.
        """
        if self.config.port == 465:
            return False, True  # use_tls, use_ssl
        if self.config.port == 587:
            return True, False
        return self.config.use_tls, self.config.use_ssl

    @classmethod
    async def from_db(cls, db: AsyncSession) -> "EmailService":
        """
        Veritabanındaki SiteSettings tablosundan SMTP config'i yükleyerek
        EmailService instance'ı oluşturur.

        - Eğer kayıt yoksa veya smtp alanı boşsa env tabanlı Settings fallback.
        - Şifre alanı (password_encrypted) henüz gerçek encryption kullanmıyor;
          EP9 kapsamında AES ile şifreleme eklenecek.
        """
        result = await db.execute(sa.select(SiteSettings).limit(1))
        settings_row: SiteSettings | None = result.scalar_one_or_none()

        if not settings_row or not settings_row.smtp:
            # Fallback: env config
            return cls(config=SMTPConfig.from_settings())

        smtp_data = settings_row.smtp or {}
        config = SMTPConfig(
            host=smtp_data.get("host") or settings.SMTP_HOST,
            port=int(smtp_data.get("port") or settings.SMTP_PORT),
            username=smtp_data.get("username") or settings.SMTP_USERNAME,
            # TODO: EP9'da gerçek encryption/decryption eklenecek
            password=smtp_data.get("password_encrypted") or settings.SMTP_PASSWORD,
            use_tls=bool(smtp_data.get("use_tls", settings.SMTP_USE_TLS)),
            use_ssl=bool(smtp_data.get("use_ssl", settings.SMTP_USE_SSL)),
            default_from=smtp_data.get("from_email") or settings.SMTP_DEFAULT_FROM,
        )
        return cls(config=config)

    async def send_email(
        self,
        to: Sequence[str] | str,
        subject: str,
        html_body: str,
        plain_body: str | None = None,
        *,
        cc: Sequence[str] | None = None,
        bcc: Sequence[str] | None = None,
        from_email: str | None = None,
        attachments: Iterable[EmailAttachment] | None = None,
    ) -> None:
        """
        Ana gönderim fonksiyonu.

        Başarısızlık durumunda aiosmtplib hatalarını bubble up eder;
        böylece çağıran katman (NotificationService / worker) retry
        mekanizmasını yönetebilir.
        """
        msg, recipients = self._build_message(
            to=to,
            subject=subject,
            html_body=html_body,
            plain_body=plain_body,
            cc=cc,
            bcc=bcc,
            from_email=from_email,
            attachments=attachments,
        )

        use_tls, use_ssl = self._resolve_security()

        # aiosmtplib: use_tls → STARTTLS, use_ssl → implicit SSL
        await aiosmtplib.send(
            msg,
            hostname=self.config.host,
            port=self.config.port,
            username=self.config.username,
            password=self.config.password,
            start_tls=use_tls,
            use_tls=use_ssl,
            recipients=recipients,
        )

