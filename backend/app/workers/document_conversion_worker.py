"""
Document Conversion Worker (EP10-BE-12)

Background worker for document conversion tasks.
Runs as a separate process, processes conversion jobs from Redis queue.
"""

from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any

from sqlalchemy import select

from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.models.course import Lesson, LessonType
from app.services.document_conversion_queue import (
    dequeue_conversion_job,
    enqueue_conversion_job,
    get_job_status,
    move_due_delayed_jobs,
    queue_health,
    set_job_status,
)
from app.services.document_converter import convert_document_to_pdf
from app.services.storage_service import get_storage_backend

BACKOFF_SECONDS = [60, 300, 900]  # 1 dakika, 5 dakika, 15 dakika


async def _process_job(job: dict[str, Any]) -> None:
    """Tek bir conversion job'u işle"""
    job_id = job.get("job_id")
    lesson_id = job.get("lesson_id")
    source_storage_key = job.get("source_storage_key")
    destination_storage_key = job.get("destination_storage_key")
    lesson_type = job.get("lesson_type")
    
    if not all([job_id, lesson_id, source_storage_key, destination_storage_key, lesson_type]):
        print(f"❌ Geçersiz job: {job}")
        return
    
    # Job durumunu "processing" olarak işaretle
    await set_job_status(job_id, {
        "status": "processing",
        "lesson_id": lesson_id,
        "started_at": datetime.utcnow().isoformat(),
    })
    
    async with AsyncSessionLocal() as db:
        # Lesson'ı getir
        result = await db.execute(
            select(Lesson).where(Lesson.id == lesson_id)
        )
        lesson = result.scalar_one_or_none()
        
        if not lesson:
            await set_job_status(job_id, {
                "status": "failed",
                "error": f"Lesson bulunamadı: {lesson_id}",
                "completed_at": datetime.utcnow().isoformat(),
            })
            return
        
        # Storage backend al
        storage = get_storage_backend()
        
        try:
            # Dönüştürme işlemi
            result = await convert_document_to_pdf(
                storage=storage,
                source_storage_key=source_storage_key,
                destination_storage_key=destination_storage_key,
                lesson_type=lesson_type,
                timeout=300,  # 5 dakika timeout
            )
            
            if result["success"]:
                # Lesson'ı güncelle (PDF path'i ekle, orijinal dosya korunur)
                # Orijinal dosyayı saklamak için yeni bir alan eklenebilir (original_content_path)
                # Şimdilik content_path'i PDF'e güncelliyoruz, orijinal dosya storage'da kalır
                lesson.content_path = result["pdf_storage_key"]
                lesson.file_size_bytes = result["file_size_bytes"]
                lesson.mime_type = "application/pdf"
                
                await db.commit()
                
                await set_job_status(job_id, {
                    "status": "completed",
                    "lesson_id": lesson_id,
                    "pdf_storage_key": result["pdf_storage_key"],
                    "file_size_bytes": result["file_size_bytes"],
                    "completed_at": datetime.utcnow().isoformat(),
                })
                
                print(f"✅ Dönüştürme tamamlandı: {lesson_id} -> {result['pdf_storage_key']}")
            else:
                # Hata durumu
                error_msg = result.get("error", "Bilinmeyen hata")
                await set_job_status(job_id, {
                    "status": "failed",
                    "error": error_msg,
                    "completed_at": datetime.utcnow().isoformat(),
                })
                
                # Retry logic (opsiyonel)
                retry_count = job.get("retry_count", 0)
                if retry_count < len(BACKOFF_SECONDS):
                    delay = BACKOFF_SECONDS[retry_count]
                    await enqueue_conversion_job({
                        **job,
                        "retry_count": retry_count + 1,
                    }, delay_seconds=delay)
                    print(f"🔄 Retry scheduled: {lesson_id} (attempt {retry_count + 1})")
                else:
                    print(f"❌ Dönüştürme başarısız (max retry): {lesson_id} - {error_msg}")
        
        except Exception as e:
            await db.rollback()
            error_msg = str(e)
            await set_job_status(job_id, {
                "status": "failed",
                "error": error_msg,
                "completed_at": datetime.utcnow().isoformat(),
            })
            print(f"❌ Dönüştürme hatası: {lesson_id} - {error_msg}")


async def run_worker_loop() -> None:
    """Worker ana döngüsü"""
    print("🚀 Document Conversion Worker başlatıldı")
    
    while True:
        try:
            # Gecikmiş job'ları taşı
            moved = await move_due_delayed_jobs()
            if moved > 0:
                print(f"📦 {moved} gecikmiş job ana kuyruğa taşındı")
            
            # Job al ve işle
            job = await dequeue_conversion_job(timeout=5)
            if job:
                await _process_job(job)
            else:
                # Job yok, kısa bir bekleme
                await asyncio.sleep(1)
        
        except KeyboardInterrupt:
            print("\n🛑 Worker durduruluyor...")
            break
        except Exception as e:
            print(f"❌ Worker hatası: {e}")
            await asyncio.sleep(5)  # Hata durumunda bekle


async def healthcheck() -> dict[str, int | bool]:
    """Worker health check"""
    return await queue_health()


if __name__ == "__main__":
    asyncio.run(run_worker_loop())
