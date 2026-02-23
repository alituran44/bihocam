"""
Security & Validation Service (EP10-BE-13)

Bu modül güvenlik ve validasyon işlemleri için merkezi bir servis sağlar:
- Magic-byte MIME type doğrulama
- Filename sanitization (Content-Disposition için)
- URL validation
- XSS sanitization (HTML sanitization)

EP10-BE-13: Security & Validation Service
"""

import re
import unicodedata
from pathlib import Path
from typing import Optional

try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False
    magic = None

try:
    import bleach
    BLEACH_AVAILABLE = True
except ImportError:
    BLEACH_AVAILABLE = False
    bleach = None


class SecurityValidationError(Exception):
    """Security validation hatası"""
    pass


class MimeTypeMismatchError(SecurityValidationError):
    """MIME type uyumsuzluğu (uzantı ile dosya içeriği eşleşmiyor)"""
    pass


class InvalidFilenameError(SecurityValidationError):
    """Geçersiz dosya adı"""
    pass


# MIME Type Mapping (uzantıdan beklenen MIME type)
MIME_TYPE_MAP = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".ogg": "video/ogg",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
}

# Magic-byte patterns (ilk birkaç byte'dan MIME type tespiti)
# python-magic kullanılamazsa fallback olarak kullanılır
MAGIC_BYTE_PATTERNS = {
    b"%PDF": "application/pdf",  # PDF
    b"PK\x03\x04": "application/zip",  # ZIP-based formats (DOCX, PPTX, XLSX)
    b"\xd0\xcf\x11\xe0": "application/msword",  # Old Office formats (DOC, PPT, XLS)
    b"\x00\x00\x00\x20ftyp": "video/mp4",  # MP4
    b"\x1a\x45\xdf\xa3": "video/webm",  # WebM
    b"RIFF": "video/avi",  # AVI
    b"\xff\xd8\xff": "image/jpeg",  # JPEG
    b"\x89PNG\r\n\x1a\n": "image/png",  # PNG
    b"GIF87a": "image/gif",  # GIF87a
    b"GIF89a": "image/gif",  # GIF89a
    b"RIFF": "image/webp",  # WebP (RIFF ile başlar, daha detaylı kontrol gerekir)
}


def validate_mime_type_magic_byte(
    file_content: bytes,
    expected_extension: str,
) -> str:
    """
    Magic-byte kullanarak MIME type doğrula
    
    Args:
        file_content: Dosya içeriği (ilk birkaç KB yeterli)
        expected_extension: Beklenen dosya uzantısı (örn: ".pdf")
    
    Returns:
        str: Tespit edilen MIME type
    
    Raises:
        MimeTypeMismatchError: Uzantı ile dosya içeriği eşleşmiyor
        SecurityValidationError: MIME type tespit edilemedi
    """
    if not file_content:
        raise SecurityValidationError("Dosya içeriği boş")
    
    # python-magic kullanılabilirse öncelikle onu kullan
    if MAGIC_AVAILABLE and magic:
        try:
            # python-magic ile MIME type tespit et
            detected_mime = magic.from_buffer(file_content, mime=True)
            
            # Beklenen MIME type'ı al
            expected_mime = MIME_TYPE_MAP.get(expected_extension.lower())
            
            if not expected_mime:
                # Bilinmeyen uzantı, tespit edilen MIME type'ı kabul et
                return detected_mime
            
            # MIME type eşleşmesi kontrolü
            # Bazı durumlarda python-magic daha genel bir type dönebilir
            # (örn: DOCX için "application/zip" dönebilir)
            if detected_mime == expected_mime:
                return detected_mime
            
            # DOCX, PPTX, XLSX için özel kontrol (ZIP-based)
            if expected_extension.lower() in [".docx", ".pptx", ".xlsx"]:
                if detected_mime == "application/zip":
                    # ZIP-based format, içerik kontrolü yapılabilir ama şimdilik kabul et
                    return expected_mime
            
            # Eşleşme yoksa hata fırlat
            raise MimeTypeMismatchError(
                f"MIME type uyumsuzluğu: Beklenen '{expected_mime}' (uzantı: {expected_extension}), "
                f"Tespit edilen '{detected_mime}'"
            )
        except Exception as e:
            if isinstance(e, MimeTypeMismatchError):
                raise
            # python-magic hatası, fallback'e geç
            pass
    
    # Fallback: Magic-byte pattern kontrolü
    file_start = file_content[:1024]  # İlk 1KB yeterli
    
    # Beklenen MIME type'ı al
    expected_mime = MIME_TYPE_MAP.get(expected_extension.lower())
    
    if not expected_mime:
        raise SecurityValidationError(f"Bilinmeyen dosya uzantısı: {expected_extension}")
    
    # Magic-byte pattern kontrolü
    detected_mime = None
    for pattern, mime_type in MAGIC_BYTE_PATTERNS.items():
        if file_start.startswith(pattern):
            detected_mime = mime_type
            break
    
    # DOCX, PPTX, XLSX için özel kontrol (ZIP signature)
    if expected_extension.lower() in [".docx", ".pptx", ".xlsx"]:
        if file_start.startswith(b"PK\x03\x04"):
            # ZIP-based format, beklenen MIME type'ı kabul et
            return expected_mime
    
    if not detected_mime:
        raise SecurityValidationError(
            f"MIME type tespit edilemedi (uzantı: {expected_extension})"
        )
    
    # MIME type eşleşmesi kontrolü
    if detected_mime != expected_mime:
        # Bazı durumlarda esnek ol (örn: DOCX için application/zip kabul edilebilir)
        if expected_extension.lower() in [".docx", ".pptx", ".xlsx"]:
            if detected_mime == "application/zip":
                return expected_mime
        
        raise MimeTypeMismatchError(
            f"MIME type uyumsuzluğu: Beklenen '{expected_mime}' (uzantı: {expected_extension}), "
            f"Tespit edilen '{detected_mime}'"
        )
    
    return detected_mime


def sanitize_filename_for_content_disposition(filename: str) -> str:
    """
    Content-Disposition header için filename sanitize et
    
    Header injection ve unicode spoofing önleme:
    - Control karakterleri temizle
    - Unicode normalize et (NFD -> NFC)
    - Tehlikeli karakterleri kaldır veya replace et
    - Max length kontrolü
    
    Args:
        filename: Orijinal dosya adı
    
    Returns:
        str: Sanitize edilmiş dosya adı
    
    Raises:
        InvalidFilenameError: Dosya adı geçersiz
    """
    if not filename:
        raise InvalidFilenameError("Dosya adı boş olamaz")
    
    # Unicode normalize (NFD -> NFC)
    # Bu, unicode spoofing saldırılarını önler
    normalized = unicodedata.normalize("NFC", filename)
    
    # Control karakterleri ve tehlikeli karakterleri temizle
    # Control chars (0x00-0x1F, 0x7F-0x9F)
    # Tehlikeli karakterler: < > " / \ | ? * : 
    sanitized = re.sub(r'[\x00-\x1F\x7F-\x9F<>"/\\|?*:]', '', normalized)
    
    # Başta/sonda boşluk ve nokta temizle
    sanitized = sanitized.strip(' .')
    
    # Boş string kontrolü
    if not sanitized:
        raise InvalidFilenameError("Dosya adı geçersiz (temizleme sonrası boş)")
    
    # Max length kontrolü (255 karakter - HTTP header limit)
    if len(sanitized) > 255:
        # Uzantıyı koru, dosya adını kısalt
        path_obj = Path(sanitized)
        stem = path_obj.stem[:200]  # 200 karakter stem
        suffix = path_obj.suffix
        sanitized = stem + suffix
    
    # Path traversal karakterleri kontrolü (ekstra güvenlik)
    if ".." in sanitized or "/" in sanitized or "\\" in sanitized:
        raise InvalidFilenameError("Dosya adında path traversal karakterleri bulundu")
    
    return sanitized


def validate_url(url: str, allowed_schemes: list[str] = None, allowed_domains: list[str] = None) -> bool:
    """
    URL validation (ileride kullanılacak - EP10-BE-06 için)
    
    Args:
        url: Validasyon yapılacak URL
        allowed_schemes: İzin verilen şemalar (örn: ["https"])
        allowed_domains: İzin verilen domain'ler (örn: ["zoom.us", "meet.google.com"])
    
    Returns:
        bool: URL geçerli mi
    
    Raises:
        SecurityValidationError: URL geçersiz
    """
    if not url:
        raise SecurityValidationError("URL boş olamaz")
    
    # URL parse et
    from urllib.parse import urlparse
    parsed = urlparse(url)
    
    # Scheme kontrolü
    if allowed_schemes:
        if parsed.scheme not in allowed_schemes:
            raise SecurityValidationError(
                f"Geçersiz URL şeması: {parsed.scheme}. "
                f"İzin verilen şemalar: {', '.join(allowed_schemes)}"
            )
    
    # JavaScript ve data scheme engelleme
    if parsed.scheme in ["javascript", "data", "vbscript"]:
        raise SecurityValidationError(f"Tehlikeli URL şeması: {parsed.scheme}")
    
    # Domain kontrolü
    if allowed_domains:
        domain = parsed.netloc.lower()
        # Port'u kaldır
        if ":" in domain:
            domain = domain.split(":")[0]
        
        # Subdomain kontrolü (örn: zoom.us için *.zoom.us kabul et)
        allowed = False
        for allowed_domain in allowed_domains:
            if domain == allowed_domain.lower() or domain.endswith("." + allowed_domain.lower()):
                allowed = True
                break
        
        if not allowed:
            raise SecurityValidationError(
                f"Geçersiz domain: {domain}. "
                f"İzin verilen domain'ler: {', '.join(allowed_domains)}"
            )
    
    return True


def sanitize_html_content(html_content: str, allowed_tags: list[str] | None = None) -> str:
    """
    HTML içeriği sanitize et (XSS koruması)
    
    EP10-BE-13: content_text alanı için HTML sanitization
    
    Args:
        html_content: Sanitize edilecek HTML içeriği
        allowed_tags: İzin verilen HTML tag'leri (None ise default list kullanılır)
    
    Returns:
        str: Sanitize edilmiş HTML içeriği
    
    Raises:
        SecurityValidationError: Sanitization başarısız
    """
    if not html_content:
        return ""
    
    # Default allowed tags (EP10-BE-13 gereksinimleri)
    if allowed_tags is None:
        allowed_tags = [
            "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4", "h5", "h6",
            "ul", "ol", "li", "a", "blockquote", "code", "pre"
        ]
    
    # Default allowed attributes
    allowed_attributes = {
        "a": ["href", "title", "target", "rel"],
        "code": ["class"],
        "pre": ["class"],
    }
    
    # Allowed protocols (sadece HTTPS)
    allowed_protocols = ["https", "http"]  # HTTP de izin verilebilir (backward compatibility)
    
    if BLEACH_AVAILABLE and bleach:
        try:
            # Bleach ile sanitize et
            sanitized = bleach.clean(
                html_content,
                tags=allowed_tags,
                attributes=allowed_attributes,
                protocols=allowed_protocols,
                strip=True,  # İzin verilmeyen tag'leri kaldır
            )
            return sanitized
        except Exception as e:
            raise SecurityValidationError(f"HTML sanitization başarısız: {str(e)}")
    else:
        # Fallback: Basit HTML escape (bleach yoksa)
        # Bu ideal değil ama en azından XSS koruması sağlar
        from html import escape
        # Basit tag temizleme (script, iframe, object, embed)
        dangerous_tags = ["script", "iframe", "object", "embed", "form", "input", "button"]
        for tag in dangerous_tags:
            # Case-insensitive tag temizleme
            pattern = re.compile(rf"<{tag}[^>]*>.*?</{tag}>", re.IGNORECASE | re.DOTALL)
            html_content = pattern.sub("", html_content)
            pattern = re.compile(rf"<{tag}[^>]*/?>", re.IGNORECASE)
            html_content = pattern.sub("", html_content)
        
        # JavaScript scheme engelleme
        html_content = re.sub(r'javascript:', '', html_content, flags=re.IGNORECASE)
        html_content = re.sub(r'data:', '', html_content, flags=re.IGNORECASE)
        
        # HTML escape (güvenli karakterler hariç)
        # Bu basit bir yaklaşım, bleach kullanılması önerilir
        return escape(html_content)


def validate_and_sanitize_content_text(content_text: str | None) -> str | None:
    """
    content_text alanı için validation ve sanitization (EP10-BE-13)
    
    Args:
        content_text: Sanitize edilecek rich text içerik
    
    Returns:
        str | None: Sanitize edilmiş içerik (None ise None döner)
    
    Raises:
        SecurityValidationError: İçerik geçersiz veya sanitization başarısız
    """
    if content_text is None:
        return None
    
    if not isinstance(content_text, str):
        raise SecurityValidationError("content_text string olmalı")
    
    # Max length kontrolü (10MB limit - çok büyük HTML içerikler için)
    MAX_CONTENT_TEXT_LENGTH = 10 * 1024 * 1024  # 10MB
    if len(content_text) > MAX_CONTENT_TEXT_LENGTH:
        raise SecurityValidationError(
            f"content_text çok uzun. Maksimum: {MAX_CONTENT_TEXT_LENGTH} karakter"
        )
    
    # HTML sanitization
    sanitized = sanitize_html_content(content_text)
    
    return sanitized
