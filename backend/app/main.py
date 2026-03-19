from contextlib import asynccontextmanager
import traceback
import asyncio
import logging

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.rate_limit import limiter

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import engine, AsyncSessionLocal
from app.db.base import Base
from app.models.user import User  # noqa: F401
from app.models.course import Course, Lesson  # noqa: F401
from app.models.cart import CartItem  # noqa: F401
from app.models.coupon import Coupon, CouponUsage  # noqa: F401
from app.models.order import Order, OrderItem, Enrollment  # noqa: F401
from app.models.quiz import Quiz, QuizQuestion, QuizAttempt, QuizAttemptAnswer  # noqa: F401
from app.models.lesson_progress import LessonProgress  # noqa: F401
from app.models.course_review import CourseReview  # noqa: F401
from app.models.category import Category, course_categories  # noqa: F401
from app.models.notification import Notification, NotificationPreferences  # noqa: F401
from app.models.site_settings import SiteSettings  # noqa: F401
from app.models.site_announcement import SiteAnnouncement  # noqa: F401
from app.models.popup_announcement import PopupAnnouncement  # noqa: F401
from app.models.email_log import EmailLog  # noqa: F401
from app.models.crm import CrmAudience, CrmAudienceMember, CrmEmailTemplate  # noqa: F401
from app.models.ad_placement import AdPlacement  # noqa: F401
from app.models.ad_campaign import AdCampaign  # noqa: F401
from app.models.ad_pricing import AdPricing  # noqa: F401
from app.models.ad_campaign_analytics import AdCampaignAnalytics  # noqa: F401
from app.models.blog_post import BlogPost  # noqa: F401
from app.models.blog_category import BlogCategory  # noqa: F401
from app.models.blog_tag import BlogTag  # noqa: F401
from app.models.messaging import Conversation, Message, UserBlock, MessageReport  # noqa: F401


async def run_ad_campaign_scheduler():
    """
    Background task: Reklam kampanyaları için scheduled jobs çalıştırır.
    Her saat başı çalışır.
    """
    logger = logging.getLogger(__name__)
    
    while True:
        try:
            await asyncio.sleep(3600)  # 1 saat bekle
            
            async with AsyncSessionLocal() as db:
                try:
                    from app.services.ad_scheduler import (
                        activate_scheduled_campaigns,
                        complete_expired_campaigns,
                        pause_over_budget_campaigns,
                    )
                    
                    # Aktif edilecek kampanyaları kontrol et
                    activated = await activate_scheduled_campaigns(db)
                    if activated:
                        logger.info(f"Activated {len(activated)} scheduled campaigns")
                    
                    # Süresi dolan kampanyaları tamamla
                    completed = await complete_expired_campaigns(db)
                    if completed:
                        logger.info(f"Completed {len(completed)} expired campaigns")
                    
                    # Bütçe biten kampanyaları duraklat
                    paused = await pause_over_budget_campaigns(db)
                    if paused:
                        logger.info(f"Paused {len(paused)} over-budget campaigns")
                        
                except Exception as e:
                    logger.error(f"Error in ad campaign scheduler: {e}", exc_info=True)
                    
        except asyncio.CancelledError:
            logger.info("Ad campaign scheduler cancelled")
            break
        except Exception as e:
            logger.error(f"Fatal error in ad campaign scheduler: {e}", exc_info=True)
            await asyncio.sleep(60)  # Hata durumunda 1 dakika bekle


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Seed default ad placements and pricing
    try:
        from app.services.ad_seed import seed_default_placements_and_pricing
        async with AsyncSessionLocal() as db:
            await seed_default_placements_and_pricing(db)
    except Exception as e:
        # Log error but don't fail startup
        logger = logging.getLogger(__name__)
        logger.warning(f"Failed to seed ad placements: {e}")
    
    # Start background task for ad campaign scheduler
    logger = logging.getLogger(__name__)
    scheduler_task = asyncio.create_task(run_ad_campaign_scheduler())
    logger.info("Ad campaign scheduler started")
    
    # İlk çalıştırmayı hemen yap (startup'ta)
    try:
        async with AsyncSessionLocal() as db:
            from app.services.ad_scheduler import (
                activate_scheduled_campaigns,
                complete_expired_campaigns,
                pause_over_budget_campaigns,
            )
            await activate_scheduled_campaigns(db)
            await complete_expired_campaigns(db)
            await pause_over_budget_campaigns(db)
            logger.info("Initial ad campaign scheduler run completed")
    except Exception as e:
        logger.warning(f"Initial ad campaign scheduler run failed: {e}")
    
    yield
    
    # Shutdown
    scheduler_task.cancel()
    try:
        await scheduler_task
    except asyncio.CancelledError:
        pass
    logger.info("Ad campaign scheduler stopped")
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
    redirect_slashes=False,
)


@app.middleware("http")
async def ensure_trailing_slash(request: Request, call_next):
    """
    API path'lerine trailing slash ekle — redirect olmadan.
    Router'lar "/" ile tanımlı, gelen istek slash'sız olabilir.
    """
    path = request.scope["path"]
    if path.startswith("/api/") and not path.endswith("/"):
        # Query string'li URL'lerde sadece path kısmına slash ekle
        request.scope["path"] = path + "/"
    return await call_next(request)

# P1-03: Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MaintenanceModeMiddleware(BaseHTTPMiddleware):
    """Bakım modu middleware - non-admin istekleri engeller"""

    async def dispatch(self, request: Request, call_next):
        # Health check ve static dosyalar muaf
        if request.url.path in ["/health", "/docs", "/openapi.json", "/redoc"]:
            return await call_next(request)

        # Static dosyalar (media, assets vb.) muaf
        if request.url.path.startswith(("/media/", "/static/", "/assets/")):
            return await call_next(request)

        # CORS preflight (OPTIONS) istekleri muaf
        if request.method == "OPTIONS":
            return await call_next(request)

        # Auth endpoint'leri muaf (login, me) - bakım modunda bile çalışmalı
        # P3-09: Register bakım modunda engellensin
        if request.url.path in ["/api/v1/auth/login", "/api/v1/auth/me"]:
            return await call_next(request)

        # PayTR callback — ödeme bildirimi bakım modunda da çalışmalı
        if request.url.path == "/api/v1/payments/callback":
            return await call_next(request)

        # Public settings endpoint muaf (maintenance mode kontrolü için gerekli)
        if request.url.path == "/api/v1/settings/public" or request.url.path == "/api/v1/public/settings":
            return await call_next(request)

        # Admin kontrolü - token varsa ve admin ise geç
        is_admin = False
        try:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                from jose import jwt
                from app.core.config import settings
                from sqlalchemy import select
                from app.models.user import User, UserRole

                try:
                    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                    user_id = payload.get("sub")
                    token_type = payload.get("type")
                    if user_id and token_type == "access":
                        async with AsyncSessionLocal() as db:
                            result = await db.execute(select(User).where(User.id == user_id))
                            user = result.scalar_one_or_none()
                            if user and user.role == UserRole.ADMIN and user.is_active:
                                is_admin = True
                except Exception:
                    pass  # Token geçersizse devam et
        except Exception:
            pass  # Hata olursa devam et

        # Maintenance mode kontrolü
        try:
            from sqlalchemy import select

            async with AsyncSessionLocal() as db:
                result = await db.execute(select(SiteSettings).limit(1))
                site_settings = result.scalar_one_or_none()
                if site_settings and site_settings.platform:
                    maintenance_mode = site_settings.platform.get("maintenance_mode", False)
                    if maintenance_mode and not is_admin:
                        maintenance_message = site_settings.platform.get(
                            "maintenance_message", "Site bakım modundadır."
                        )
                        estimated_end = site_settings.platform.get("maintenance_estimated_end")
                        # estimated_end datetime veya string olabilir
                        estimated_end_iso = None
                        if estimated_end:
                            if isinstance(estimated_end, str):
                                try:
                                    from datetime import datetime
                                    estimated_end_iso = datetime.fromisoformat(estimated_end.replace("Z", "+00:00")).isoformat()
                                except (ValueError, AttributeError):
                                    estimated_end_iso = estimated_end
                            elif hasattr(estimated_end, "isoformat"):
                                estimated_end_iso = estimated_end.isoformat()
                            else:
                                estimated_end_iso = str(estimated_end)

                        return JSONResponse(
                            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                            content={
                                "maintenance": True,
                                "message": maintenance_message,
                                "estimated_end": estimated_end_iso,
                            },
                        )
        except Exception:
            pass  # Hata olursa normal akışa devam et

        return await call_next(request)


app.add_middleware(MaintenanceModeMiddleware)
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import uuid
    error_id = str(uuid.uuid4())[:8]
    error_detail = traceback.format_exc()

    logger = logging.getLogger(__name__)
    logger.error(f"[{error_id}] Unhandled exception on {request.method} {request.url.path}: {error_detail}")

    if settings.DEBUG:
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc), "error_id": error_id, "traceback": error_detail}
        )

    return JSONResponse(
        status_code=500,
        content={"detail": "Sunucu hatası oluştu.", "error_id": error_id}
    )


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.VERSION}
