"""
EPIC-10 Storage Service Tests (EP10-BE-16)

Storage Service için güvenlik ve fonksiyonellik testleri.
"""

import pytest
from pathlib import Path
from uuid import uuid4

from app.services.storage_service import (
    LocalStorageBackend,
    StorageBackend,
    StorageNotFoundError,
    StoragePermissionDeniedError,
    get_storage_backend,
)
from app.core.config import settings


@pytest.fixture
def temp_media_root(tmp_path):
    """Geçici media root dizini"""
    media_root = tmp_path / "media"
    media_root.mkdir()
    return media_root


@pytest.fixture
def storage_backend(temp_media_root, monkeypatch):
    """Test için storage backend"""
    monkeypatch.setattr(settings, "MEDIA_ROOT", str(temp_media_root))
    backend = LocalStorageBackend()
    return backend


@pytest.mark.asyncio
async def test_upload_and_download(storage_backend: StorageBackend):
    """Temel upload ve download testi"""
    content = b"test file content"
    destination = "test/test_file.txt"
    
    # Upload
    result = await storage_backend.upload(content, destination, "text/plain")
    assert result.storage_key == destination
    assert result.file_size_bytes == len(content)
    assert result.checksum is not None
    
    # Download
    downloaded = await storage_backend.download(destination)
    assert downloaded == content


@pytest.mark.asyncio
async def test_path_traversal_protection(storage_backend: StorageBackend):
    """Path traversal saldırılarına karşı koruma"""
    malicious_paths = [
        "../../../etc/passwd",
        "..\\..\\..\\windows\\system32",
        "/etc/passwd",
        "videos/../../../etc/passwd",
        "videos/..\\..\\..\\windows\\system32",
    ]
    
    for malicious_path in malicious_paths:
        with pytest.raises(StoragePermissionDeniedError):
            await storage_backend.upload(b"malicious", malicious_path, "text/plain")


@pytest.mark.asyncio
async def test_unicode_filename(storage_backend: StorageBackend):
    """Unicode karakterli dosya adları desteği"""
    content = b"test content"
    destination = "test/测试文件_файл_ファイル.txt"
    
    result = await storage_backend.upload(content, destination, "text/plain")
    assert result.storage_key == destination
    
    downloaded = await storage_backend.download(destination)
    assert downloaded == content


@pytest.mark.asyncio
async def test_exists_check(storage_backend: StorageBackend):
    """Dosya varlık kontrolü"""
    destination = "test/exists_test.txt"
    
    # Dosya yok
    assert not await storage_backend.exists(destination)
    
    # Dosya yükle
    await storage_backend.upload(b"content", destination, "text/plain")
    
    # Dosya var
    assert await storage_backend.exists(destination)


@pytest.mark.asyncio
async def test_delete_file(storage_backend: StorageBackend):
    """Dosya silme testi"""
    destination = "test/delete_test.txt"
    
    # Dosya yükle
    await storage_backend.upload(b"content", destination, "text/plain")
    assert await storage_backend.exists(destination)
    
    # Dosya sil
    deleted = await storage_backend.delete(destination)
    assert deleted is True
    assert not await storage_backend.exists(destination)


@pytest.mark.asyncio
async def test_delete_nonexistent_file(storage_backend: StorageBackend):
    """Var olmayan dosya silme testi"""
    with pytest.raises(StorageNotFoundError):
        await storage_backend.delete("nonexistent/file.txt")


@pytest.mark.asyncio
async def test_get_file_size(storage_backend: StorageBackend):
    """Dosya boyutu alma testi"""
    content = b"test content" * 100
    destination = "test/size_test.txt"
    
    await storage_backend.upload(content, destination, "text/plain")
    
    file_size = await storage_backend.get_file_size(destination)
    assert file_size == len(content)


@pytest.mark.asyncio
async def test_get_url(storage_backend: StorageBackend):
    """URL oluşturma testi"""
    destination = "videos/test_video.mp4"
    await storage_backend.upload(b"video content", destination, "video/mp4")
    
    url = await storage_backend.get_url(destination)
    assert url is not None
    assert "videos" in url
    assert "test_video.mp4" in url


@pytest.mark.asyncio
async def test_upload_stream(storage_backend: StorageBackend):
    """Stream upload testi"""
    async def content_stream():
        chunks = [b"chunk1", b"chunk2", b"chunk3"]
        for chunk in chunks:
            yield chunk
    
    destination = "test/stream_test.txt"
    result = await storage_backend.upload_stream(
        content_stream(), destination, "text/plain"
    )
    
    assert result.storage_key == destination
    assert result.file_size_bytes == 18  # 6 + 6 + 6
    
    downloaded = await storage_backend.download(destination)
    assert downloaded == b"chunk1chunk2chunk3"


@pytest.mark.asyncio
async def test_upload_max_size_limit(storage_backend: StorageBackend):
    """Maksimum dosya boyutu limiti testi"""
    large_content = b"x" * (10 * 1024 * 1024)  # 10MB
    destination = "test/large_file.txt"
    
    # 5MB limit ile upload dene
    with pytest.raises(Exception):  # StorageError veya benzeri
        await storage_backend.upload_stream(
            (chunk for chunk in [large_content]),
            destination,
            "text/plain",
            max_file_size=5 * 1024 * 1024,
        )
