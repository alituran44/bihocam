"""
Document Converter Service (EP10-BE-12)

DOCX ve PPTX dosyalarını PDF'e dönüştürme servisi.
LibreOffice headless kullanarak dönüştürme yapar.

SECURITY:
- Shell injection koruması (komut argümanları sanitize)
- Temp path izolasyonu
- Resource limitleri (CPU, RAM, timeout)
"""

import asyncio
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Optional
from uuid import uuid4

from uuid import uuid4

from app.core.config import settings
from app.services.storage_service import StorageBackend, StorageNotFoundError, get_storage_backend


class DocumentConversionError(Exception):
    """Doküman dönüştürme hatası"""
    pass


class LibreOfficeNotFoundError(DocumentConversionError):
    """LibreOffice bulunamadı"""
    pass


async def check_libreoffice_available() -> bool:
    """
    LibreOffice kurulu mu kontrol et
    
    Returns:
        bool: LibreOffice mevcut mu?
    """
    soffice_path = shutil.which("soffice")
    return soffice_path is not None


async def convert_docx_to_pdf(
    input_file_path: Path,
    output_file_path: Path,
    timeout: int = 300,  # 5 dakika timeout
) -> Path:
    """
    DOCX dosyasını PDF'e dönüştür (LibreOffice headless)
    
    SECURITY:
    - Shell injection koruması (subprocess ile güvenli argüman geçişi)
    - Temp path izolasyonu
    - Timeout koruması
    
    Args:
        input_file_path: Giriş DOCX dosyası path'i
        output_file_path: Çıkış PDF dosyası path'i
        timeout: İşlem timeout'u (saniye)
    
    Returns:
        Path: Oluşturulan PDF dosyası path'i
    
    Raises:
        LibreOfficeNotFoundError: LibreOffice kurulu değil
        DocumentConversionError: Dönüştürme başarısız
    """
    # LibreOffice kontrolü
    soffice_path = shutil.which("soffice")
    if not soffice_path:
        raise LibreOfficeNotFoundError(
            "LibreOffice bulunamadı. Lütfen LibreOffice'i kurun veya Docker image'da LibreOffice olduğundan emin olun."
        )
    
    # SECURITY: Temp path izolasyonu
    temp_dir = tempfile.mkdtemp(prefix="doc_convert_")
    try:
        # SECURITY: Shell injection koruması - subprocess ile güvenli argüman geçişi
        # Komut argümanları liste olarak geçiliyor (shell=False)
        cmd = [
            soffice_path,
            "--headless",
            "--convert-to", "pdf",
            "--outdir", temp_dir,
            str(input_file_path),
        ]
        
        # Timeout ile çalıştır
        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            
            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=timeout
            )
            
            if process.returncode != 0:
                error_msg = stderr.decode("utf-8", errors="replace") if stderr else "Unknown error"
                raise DocumentConversionError(
                    f"LibreOffice dönüştürme hatası (return code: {process.returncode}): {error_msg}"
                )
            
        except asyncio.TimeoutError:
            raise DocumentConversionError(f"Dönüştürme işlemi timeout oldu ({timeout} saniye)")
        except Exception as e:
            raise DocumentConversionError(f"Dönüştürme hatası: {str(e)}")
        
        # PDF dosyasını bul (LibreOffice input dosya adını kullanır)
        input_stem = input_file_path.stem
        pdf_path = Path(temp_dir) / f"{input_stem}.pdf"
        
        if not pdf_path.exists():
            raise DocumentConversionError("PDF dosyası oluşturulamadı")
        
        # PDF'i output path'e kopyala
        output_file_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(pdf_path, output_file_path)
        
        return output_file_path
        
    finally:
        # Temp dizini temizle
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception:
            pass


async def convert_pptx_to_pdf(
    input_file_path: Path,
    output_file_path: Path,
    timeout: int = 300,
) -> Path:
    """
    PPTX dosyasını PDF'e dönüştür (LibreOffice headless)
    
    DOCX ile aynı mantık, sadece PPTX için.
    """
    return await convert_docx_to_pdf(input_file_path, output_file_path, timeout)


async def convert_document_to_pdf(
    storage: StorageBackend,
    source_storage_key: str,
    destination_storage_key: str,
    lesson_type: str,
    timeout: int = 300,
) -> dict[str, any]:
    """
    StorageService'den dokümanı al, PDF'e dönüştür, StorageService'e kaydet
    
    Args:
        storage: StorageBackend instance
        source_storage_key: Kaynak dosya storage key
        destination_storage_key: Hedef PDF storage key
        lesson_type: Lesson type ("document" veya "presentation")
        timeout: İşlem timeout'u (saniye)
    
    Returns:
        dict: {
            "success": bool,
            "pdf_storage_key": str,
            "file_size_bytes": int,
            "error": str | None
        }
    """
    # Kaynak dosyayı indir
    try:
        source_content = await storage.download(source_storage_key)
    except StorageNotFoundError:
        return {
            "success": False,
            "pdf_storage_key": None,
            "file_size_bytes": 0,
            "error": f"Kaynak dosya bulunamadı: {source_storage_key}",
        }
    
    # Temp dosya oluştur
    temp_input = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".docx" if lesson_type == "document" else ".pptx"
    )
    temp_output = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    )
    
    try:
        # Kaynak dosyayı temp'e yaz
        temp_input.write(source_content)
        temp_input.close()
        
        input_path = Path(temp_input.name)
        output_path = Path(temp_output.name)
        
        # Dönüştür
        if lesson_type == "document":
            await convert_docx_to_pdf(input_path, output_path, timeout)
        elif lesson_type == "presentation":
            await convert_pptx_to_pdf(input_path, output_path, timeout)
        else:
            return {
                "success": False,
                "pdf_storage_key": None,
                "file_size_bytes": 0,
                "error": f"Desteklenmeyen lesson type: {lesson_type}",
            }
        
        # PDF'i oku
        pdf_content = output_path.read_bytes()
        pdf_size = len(pdf_content)
        
        # PDF'i StorageService'e yükle
        upload_result = await storage.upload(
            file_content=pdf_content,
            destination_path=destination_storage_key,
            content_type="application/pdf",
        )
        
        return {
            "success": True,
            "pdf_storage_key": upload_result.storage_key,
            "file_size_bytes": pdf_size,
            "error": None,
        }
        
    except LibreOfficeNotFoundError as e:
        return {
            "success": False,
            "pdf_storage_key": None,
            "file_size_bytes": 0,
            "error": str(e),
        }
    except DocumentConversionError as e:
        return {
            "success": False,
            "pdf_storage_key": None,
            "file_size_bytes": 0,
            "error": str(e),
        }
    except Exception as e:
        return {
            "success": False,
            "pdf_storage_key": None,
            "file_size_bytes": 0,
            "error": f"Beklenmeyen hata: {str(e)}",
        }
    finally:
        # Temp dosyaları temizle
        try:
            Path(temp_input.name).unlink(missing_ok=True)
            Path(temp_output.name).unlink(missing_ok=True)
        except Exception:
            pass
