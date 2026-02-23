"""
Content Metadata Backfill Script (EP10-BE-15)

Mevcut eski içerikler için `original_filename`, `mime_type`, `file_size_bytes` 
gibi metadata alanlarını dolduran backfill script'i.

Kullanım:
    cd backend
    python -m scripts.backfill_content_metadata [--dry-run] [--batch-size=1000]

Parametreler:
    --dry-run: Sadece rapor göster, değişiklik yapma
    --batch-size: Batch update boyutu (default: 1000)
"""

import asyncio
import sys
import argparse
from pathlib import Path
from typing import Optional

# Windows terminal encoding sorununu çöz
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Proje root dizinini path'e ekle
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal
from app.models.course import Lesson
from app.services.storage_service import get_storage_backend, StorageBackend, StorageNotFoundError
from app.services.security_service import MIME_TYPE_MAP
from app.core.config import settings


BATCH_SIZE = 1000


async def extract_filename_from_path(content_path: str) -> Optional[str]:
    """
    Storage path'ten orijinal dosya adını çıkarmaya çalış
    
    Örnek: "videos/lesson_123_20240209_120000.mp4" -> "lesson_123_20240209_120000.mp4"
    """
    if not content_path:
        return None
    
    # Path'ten dosya adını al
    path_obj = Path(content_path)
    filename = path_obj.name
    
    # Eğer UUID veya timestamp içeriyorsa, orijinal adı tahmin etmeye çalış
    # Şimdilik path'teki dosya adını kullan
    return filename


async def get_file_metadata(
    storage: StorageBackend,
    content_path: str
) -> dict[str, Optional[str | int]]:
    """
    StorageService üzerinden dosya metadata'sını al
    
    Returns:
        dict: {
            "file_size_bytes": int | None,
            "mime_type": str | None,
            "original_filename": str | None
        }
    """
    metadata = {
        "file_size_bytes": None,
        "mime_type": None,
        "original_filename": None,
    }
    
    try:
        # Dosya var mı kontrol et
        if not await storage.exists(content_path):
            return metadata
        
        # Dosya boyutu
        try:
            file_size = await storage.get_file_size(content_path)
            metadata["file_size_bytes"] = file_size
        except Exception:
            pass
        
        # MIME type (path'ten tahmin et)
        path_obj = Path(content_path)
        file_ext = path_obj.suffix.lower()
        if file_ext in MIME_TYPE_MAP:
            metadata["mime_type"] = MIME_TYPE_MAP[file_ext]
        
        # Orijinal dosya adı (path'ten çıkar)
        metadata["original_filename"] = await extract_filename_from_path(content_path)
        
    except StorageNotFoundError:
        # Dosya bulunamadı, metadata boş kalacak
        pass
    except Exception as e:
        print(f"⚠️  Dosya metadata okuma hatası ({content_path}): {e}")
    
    return metadata


async def backfill_lesson_metadata(
    db: AsyncSession,
    storage: StorageBackend,
    lesson: Lesson,
    dry_run: bool = False
) -> bool:
    """
    Tek bir lesson için metadata backfill
    
    Returns:
        bool: Metadata güncellendi mi?
    """
    # Sadece content_path olan lesson'ları işle
    if not lesson.content_path:
        return False
    
    # Zaten metadata dolu mu kontrol et
    if lesson.original_filename and lesson.mime_type and lesson.file_size_bytes:
        return False  # Zaten dolu, atla
    
    # Metadata al
    metadata = await get_file_metadata(storage, lesson.content_path)
    
    # Güncellenecek alanları belirle
    updated = False
    
    if metadata["file_size_bytes"] and not lesson.file_size_bytes:
        if not dry_run:
            lesson.file_size_bytes = metadata["file_size_bytes"]
        updated = True
    
    if metadata["mime_type"] and not lesson.mime_type:
        if not dry_run:
            lesson.mime_type = metadata["mime_type"]
        updated = True
    
    if metadata["original_filename"] and not lesson.original_filename:
        if not dry_run:
            lesson.original_filename = metadata["original_filename"]
        updated = True
    
    return updated


async def backfill_all_lessons(
    db: AsyncSession,
    storage: StorageBackend,
    dry_run: bool = False,
    batch_size: int = BATCH_SIZE
) -> dict[str, int]:
    """
    Tüm lesson'lar için metadata backfill
    
    Returns:
        dict: İstatistikler (total, updated, skipped, errors)
    """
    stats = {
        "total": 0,
        "updated": 0,
        "skipped": 0,
        "errors": 0,
    }
    
    # Tüm lesson'ları getir
    result = await db.execute(
        select(Lesson).where(Lesson.content_path.isnot(None))
    )
    lessons = result.scalars().all()
    
    stats["total"] = len(lessons)
    
    print(f"\n📊 Toplam {stats['total']} lesson bulundu (content_path olan)")
    print(f"{'🔍 DRY-RUN MODU' if dry_run else '✅ GERÇEK MOD'}\n")
    
    # Batch'ler halinde işle
    for i in range(0, len(lessons), batch_size):
        batch = lessons[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(lessons) + batch_size - 1) // batch_size
        
        print(f"📦 Batch {batch_num}/{total_batches} ({len(batch)} lesson)...")
        
        batch_updated = 0
        batch_errors = 0
        
        for lesson in batch:
            try:
                updated = await backfill_lesson_metadata(db, storage, lesson, dry_run)
                if updated:
                    batch_updated += 1
                    stats["updated"] += 1
                else:
                    stats["skipped"] += 1
            except Exception as e:
                batch_errors += 1
                stats["errors"] += 1
                print(f"  ❌ Hata (lesson_id={lesson.id}): {e}")
        
        # Batch commit (dry-run değilse)
        if not dry_run and batch_updated > 0:
            try:
                await db.commit()
                print(f"  ✅ {batch_updated} lesson güncellendi, commit edildi")
            except Exception as e:
                await db.rollback()
                print(f"  ❌ Commit hatası: {e}")
                stats["errors"] += batch_updated
                stats["updated"] -= batch_updated
        elif dry_run and batch_updated > 0:
            print(f"  🔍 {batch_updated} lesson güncellenecek (dry-run)")
        
        if batch_errors > 0:
            print(f"  ⚠️  {batch_errors} hata oluştu")
        
        # Progress
        processed = min(i + batch_size, len(lessons))
        progress = (processed / len(lessons)) * 100
        print(f"  📈 İlerleme: {processed}/{len(lessons)} ({progress:.1f}%)\n")
    
    return stats


async def main() -> None:
    """Ana fonksiyon"""
    parser = argparse.ArgumentParser(
        description="Content Metadata Backfill Script (EP10-BE-15)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Sadece rapor göster, değişiklik yapma"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=BATCH_SIZE,
        help=f"Batch update boyutu (default: {BATCH_SIZE})"
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("📝 Content Metadata Backfill Script (EP10-BE-15)")
    print("=" * 60)
    
    # Storage backend al
    storage = get_storage_backend()
    
    # Database session
    async with AsyncSessionLocal() as db:
        try:
            # Backfill işlemi
            stats = await backfill_all_lessons(
                db, storage,
                dry_run=args.dry_run,
                batch_size=args.batch_size
            )
            
            # Özet rapor
            print("\n" + "=" * 60)
            print("📊 ÖZET RAPOR")
            print("=" * 60)
            print(f"Toplam lesson: {stats['total']}")
            print(f"Güncellenen: {stats['updated']}")
            print(f"Atlanan (zaten dolu): {stats['skipped']}")
            print(f"Hatalar: {stats['errors']}")
            
            if args.dry_run:
                print("\n🔍 DRY-RUN MODU: Hiçbir değişiklik yapılmadı")
                print("   Gerçek güncelleme için --dry-run parametresini kaldırın")
            else:
                print("\n✅ Backfill işlemi tamamlandı!")
            
        except Exception as e:
            await db.rollback()
            print(f"\n❌ Kritik hata: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
