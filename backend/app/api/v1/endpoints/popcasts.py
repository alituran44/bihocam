from datetime import datetime
from pathlib import Path
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Request, status
from sqlalchemy import select, and_, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user, get_current_user_optional
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.popcast import Popcast, UserPopcastFavorite, PopcastStatus
from app.schemas.popcast import (
    PopcastCreate,
    PopcastUpdate,
    PopcastResponse,
    PopcastReview,
)
from app.services.storage_service import (
    StorageBackend,
    StorageNotFoundError,
    get_storage,
)

router = APIRouter()

ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".m4a", ".wav", ".aac", ".ogg", ".mp4"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_AUDIO_SIZE = 50 * 1024 * 1024  # 50MB
MAX_COVER_SIZE = 5 * 1024 * 1024  # 5MB


def require_teacher_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.TEACHER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için eğitmen veya admin yetkisi gereklidir",
        )
    return current_user


# ==================== Instructor Endpoints ====================

@router.post("", response_model=PopcastResponse, status_code=status.HTTP_201_CREATED)
async def create_popcast(
    popcast_in: PopcastCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Eğitmen için popcast oluşturur (Inceleme durumunda başlar)"""
    popcast = Popcast(
        title=popcast_in.title,
        description=popcast_in.description,
        audio_url=popcast_in.audio_url,
        cover_image_url=popcast_in.cover_image_url,
        duration=popcast_in.duration,
        status=PopcastStatus.PENDING_REVIEW,
        teacher_id=current_user.id,
    )
    db.add(popcast)
    await db.commit()
    await db.refresh(popcast)
    
    # Load teacher relationship
    result = await db.execute(
        select(Popcast)
        .options(selectinload(Popcast.teacher))
        .where(Popcast.id == popcast.id)
    )
    return result.scalar_one()


@router.get("/me", response_model=List[PopcastResponse])
async def get_my_popcasts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Eğitmenin kendi yüklediği popcast'leri listeler"""
    result = await db.execute(
        select(Popcast)
        .options(selectinload(Popcast.teacher))
        .where(Popcast.teacher_id == current_user.id)
        .order_by(Popcast.created_at.desc())
    )
    return result.scalars().all()


@router.patch("/{popcast_id}", response_model=PopcastResponse)
async def update_popcast(
    popcast_id: str,
    popcast_in: PopcastUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
):
    """Eğitmenin kendi popcast'ini güncellemesini sağlar"""
    result = await db.execute(
        select(Popcast)
        .options(selectinload(Popcast.teacher))
        .where(Popcast.id == popcast_id)
    )
    popcast = result.scalar_one_or_none()
    if not popcast:
        raise HTTPException(status_code=404, detail="Popcast bulunamadı")
    
    if popcast.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu popcast'i güncelleme yetkiniz yok")

    # Update fields
    update_data = popcast_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(popcast, field, value)

    # If updating audio/cover or fields, set status to pending review again
    if current_user.role != UserRole.ADMIN:
        popcast.status = PopcastStatus.PENDING_REVIEW

    await db.commit()
    await db.refresh(popcast)
    return popcast


@router.delete("/{popcast_id}")
async def delete_popcast(
    popcast_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """Eğitmenin kendi popcast'ini silmesini sağlar"""
    result = await db.execute(select(Popcast).where(Popcast.id == popcast_id))
    popcast = result.scalar_one_or_none()
    if not popcast:
        raise HTTPException(status_code=404, detail="Popcast bulunamadı")
    
    if popcast.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Bu popcast'i silme yetkiniz yok")

    # Delete files from storage
    if popcast.audio_url and not (popcast.audio_url.startswith("http://") or popcast.audio_url.startswith("https://")):
        try:
            await storage.delete(popcast.audio_url)
        except Exception:
            pass

    if popcast.cover_image_url and not (popcast.cover_image_url.startswith("http://") or popcast.cover_image_url.startswith("https://")):
        try:
            await storage.delete(popcast.cover_image_url)
        except Exception:
            pass

    await db.delete(popcast)
    await db.commit()
    return {"message": "Popcast başarıyla silindi"}


@router.post("/upload-audio")
async def upload_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """Eğitmen için popcast ses dosyası yükleme"""
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz ses formatı. İzin verilen formatlar: {', '.join(ALLOWED_AUDIO_EXTENSIONS)}"
        )
    
    file_content = await file.read()
    file_size = len(file_content)
    if file_size > MAX_AUDIO_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Ses dosyası çok büyük. Maksimum limit: {MAX_AUDIO_SIZE // (1024*1024)}MB"
        )
    
    # Save file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{current_user.id}_{timestamp}{file_ext}"
    destination_path = f"popcasts/audio/{filename}"
    
    upload_result = await storage.upload(
        file_content=file_content,
        destination_path=destination_path,
        content_type=file.content_type or "audio/mpeg"
    )
    
    return {
        "filename": filename,
        "path": upload_result.storage_key,
        "url": f"/api/v1/media/popcasts/audio/{filename}",
    }


@router.post("/upload-cover")
async def upload_cover(
    file: UploadFile = File(...),
    current_user: User = Depends(require_teacher_or_admin),
    storage: StorageBackend = Depends(get_storage),
):
    """Eğitmen için popcast kapak görseli yükleme"""
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz görsel formatı. İzin verilen formatlar: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )
    
    file_content = await file.read()
    file_size = len(file_content)
    if file_size > MAX_COVER_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Kapak görseli çok büyük. Maksimum limit: {MAX_COVER_SIZE // (1024*1024)}MB"
        )
    
    # Save file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{current_user.id}_{timestamp}{file_ext}"
    destination_path = f"popcasts/covers/{filename}"
    
    upload_result = await storage.upload(
        file_content=file_content,
        destination_path=destination_path,
        content_type=file.content_type or "image/png"
    )
    
    return {
        "filename": filename,
        "path": upload_result.storage_key,
        "url": f"/api/v1/media/popcasts/covers/{filename}",
    }


# ==================== Student & General Endpoints ====================

@router.get("", response_model=List[PopcastResponse])
async def get_approved_popcasts(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = Query(None),
    teacher_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Tüm onaylanmış popcast'leri listeler (öğrenciler ve ziyaretçiler için)"""
    query = select(Popcast).options(selectinload(Popcast.teacher)).where(Popcast.status == PopcastStatus.APPROVED)
    
    if teacher_id:
        query = query.where(Popcast.teacher_id == teacher_id)
    
    if search:
        query = query.where(
            and_(
                Popcast.title.ilike(f"%{search}%") | Popcast.description.ilike(f"%{search}%")
            )
        )
        
    query = query.order_by(Popcast.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    popcasts = result.scalars().all()
    
    # Check favorites if logged in
    if current_user:
        # Get user's favorites
        fav_result = await db.execute(
            select(UserPopcastFavorite.popcast_id)
            .where(UserPopcastFavorite.user_id == current_user.id)
        )
        fav_ids = set(fav_result.scalars().all())
        for p in popcasts:
            p.is_favorited = p.id in fav_ids
            
    return popcasts


@router.post("/{popcast_id}/favorite", response_model=dict)
async def favorite_popcast(
    popcast_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Kullanıcının popcast'i favorilerine eklemesini sağlar"""
    # Check if popcast exists
    popcast_result = await db.execute(select(Popcast).where(Popcast.id == popcast_id))
    popcast = popcast_result.scalar_one_or_none()
    if not popcast:
        raise HTTPException(status_code=404, detail="Popcast bulunamadı")
        
    # Check if already favorited
    fav_result = await db.execute(
        select(UserPopcastFavorite).where(
            and_(
                UserPopcastFavorite.user_id == current_user.id,
                UserPopcastFavorite.popcast_id == popcast_id
            )
        )
    )
    existing_fav = fav_result.scalar_one_or_none()
    if existing_fav:
        return {"message": "Zaten favorilerinizde", "success": True}
        
    fav = UserPopcastFavorite(user_id=current_user.id, popcast_id=popcast_id)
    db.add(fav)
    await db.commit()
    return {"message": "Favorilere başarıyla eklendi", "success": True}


@router.post("/{popcast_id}/unfavorite", response_model=dict)
@router.delete("/{popcast_id}/favorite", response_model=dict)
async def unfavorite_popcast(
    popcast_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Kullanıcının popcast'i favorilerinden çıkarmasını sağlar"""
    await db.execute(
        delete(UserPopcastFavorite).where(
            and_(
                UserPopcastFavorite.user_id == current_user.id,
                UserPopcastFavorite.popcast_id == popcast_id
            )
        )
    )
    await db.commit()
    return {"message": "Favorilerden başarıyla çıkarıldı", "success": True}


@router.get("/favorites", response_model=List[PopcastResponse])
async def get_my_favorites(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Kullanıcının favoriye aldığı popcast'leri listeler"""
    result = await db.execute(
        select(Popcast)
        .join(UserPopcastFavorite, UserPopcastFavorite.popcast_id == Popcast.id)
        .options(selectinload(Popcast.teacher))
        .where(UserPopcastFavorite.user_id == current_user.id)
        .order_by(UserPopcastFavorite.created_at.desc())
    )
    popcasts = result.scalars().all()
    for p in popcasts:
        p.is_favorited = True
    return popcasts


# ==================== Admin Endpoints ====================

@router.get("/admin/all", response_model=List[PopcastResponse])
async def get_all_popcasts_admin(
    status_filter: Optional[PopcastStatus] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin için tüm popcast'leri listeler (filtre seçeneğiyle)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Sadece admin yetkisi olanlar erişebilir")
        
    query = select(Popcast).options(selectinload(Popcast.teacher))
    if status_filter:
        query = query.where(Popcast.status == status_filter)
        
    query = query.order_by(Popcast.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/{popcast_id}/review", response_model=PopcastResponse)
async def review_popcast(
    popcast_id: str,
    review_in: PopcastReview,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin'in popcast başvurularını onaylamasını veya reddetmesini sağlar"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Sadece admin yetkisi olanlar erişebilir")

    result = await db.execute(
        select(Popcast)
        .options(selectinload(Popcast.teacher))
        .where(Popcast.id == popcast_id)
    )
    popcast = result.scalar_one_or_none()
    if not popcast:
        raise HTTPException(status_code=404, detail="Popcast bulunamadı")

    popcast.status = review_in.status
    popcast.admin_note = review_in.admin_note
    await db.commit()
    await db.refresh(popcast)
    return popcast
