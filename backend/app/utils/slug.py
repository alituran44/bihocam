"""
Slug generation utility with Turkish character support and collision management.
"""
import re
import unicodedata
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category


# Türkçe karakter mapping
TURKISH_CHAR_MAP = {
    'ğ': 'g', 'Ğ': 'G',
    'ü': 'u', 'Ü': 'U',
    'ş': 's', 'Ş': 'S',
    'ı': 'i', 'İ': 'i',  # İ -> i (lowercase)
    'ö': 'o', 'Ö': 'O',
    'ç': 'c', 'Ç': 'C',
    'I': 'i',  # Büyük I -> i (Türkçe'de I -> ı ama slug için i kullanıyoruz)
}


def _slugify(text: str) -> str:
    """
    Metni slug formatına çevir (Türkçe karakter desteği ile).
    
    Args:
        text: Slug'a çevrilecek metin
        
    Returns:
        Slug string (lowercase, hyphens, no special chars)
    """
    # Türkçe karakterleri değiştir (önce bunu yapmalıyız)
    # Mapping'deki tüm karakterleri (büyük/küçük) değiştir
    for turkish_char, english_char in TURKISH_CHAR_MAP.items():
        text = text.replace(turkish_char, english_char)
    
    # Lowercase (Türkçe karakterler zaten değiştirildi)
    text = text.lower()
    
    # ASCII olmayan karakterleri kaldır (Türkçe karakterler zaten değiştirildi)
    # Normalize etmeden direkt ASCII'ye çevir - bu daha güvenli
    text = text.encode('ascii', 'ignore').decode('ascii')
    
    # Special characters'ı kaldır, sadece alphanumeric ve space bırak
    text = re.sub(r'[^a-z0-9\s]+', '', text)
    
    # Space'leri hyphen'e çevir
    text = re.sub(r'\s+', '-', text)
    
    # Multiple hyphens'ı single hyphen'a çevir
    text = re.sub(r'-+', '-', text)
    
    # Baştan ve sondan hyphen'ları kaldır
    text = text.strip('-')
    
    return text


async def _check_slug_exists(
    db: AsyncSession,
    table: str,
    slug: str,
    exclude_id: str | None = None
) -> bool:
    """
    Slug'un database'de var olup olmadığını kontrol et.
    
    Args:
        db: Database session
        table: Tablo adı (şimdilik sadece "categories")
        slug: Kontrol edilecek slug
        exclude_id: Bu ID'yi kontrol dışı bırak (update için)
        
    Returns:
        True eğer slug varsa, False yoksa
    """
    if table == "categories":
        query = select(Category).where(Category.slug == slug)
        if exclude_id:
            query = query.where(Category.id != exclude_id)
        
        result = await db.execute(query)
        return result.scalar_one_or_none() is not None
    
    # İleride başka tablolar için genişletilebilir
    raise ValueError(f"Unsupported table: {table}")


async def generate_slug(
    name: str,
    db: AsyncSession,
    table: str = "categories",
    exclude_id: str | None = None,
    max_attempts: int = 100
) -> str:
    """
    Slug oluştur ve collision yönetimi yap.
    Eğer slug zaten varsa, sonuna -1, -2, -3 ekle.
    
    Args:
        name: Slug'a çevrilecek isim
        db: Database session
        table: Tablo adı (default: "categories")
        exclude_id: Bu ID'yi kontrol dışı bırak (update için)
        max_attempts: Maksimum deneme sayısı
        
    Returns:
        Unique slug string
        
    Raises:
        ValueError: Eğer max_attempts aşılırsa
    """
    # Base slug oluştur
    base_slug = _slugify(name)
    
    if not base_slug:
        raise ValueError("Slug oluşturulamadı: Boş string")
    
    # İlk deneme
    slug = base_slug
    attempt = 0
    
    while attempt < max_attempts:
        # Database'de kontrol et
        exists = await _check_slug_exists(db, table, slug, exclude_id)
        if not exists:
            return slug
        
        # Collision var, numara ekle
        attempt += 1
        slug = f"{base_slug}-{attempt}"
    
    raise ValueError(f"Slug oluşturulamadı: {name} (max attempts: {max_attempts})")
