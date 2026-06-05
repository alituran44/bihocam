import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from app.core.config import settings
from app.db.base import Base
from app.models.user import User  # noqa: F401
from app.models.course import Course, Lesson  # noqa: F401
from app.models.cart import CartItem  # noqa: F401
from app.models.coupon import Coupon, CouponUsage  # noqa: F401
from app.models.order import Order, OrderItem, Enrollment  # noqa: F401
from app.models.quiz import Quiz, QuizQuestion, QuizAttempt, QuizAttemptAnswer  # noqa: F401
from app.models.lesson_progress import LessonProgress  # noqa: F401
from app.models.course_review import CourseReview  # noqa: F401
from app.models.course_review_history import CourseReviewHistory  # noqa: F401
from app.models.category import Category, course_categories  # noqa: F401
from app.models.notification import Notification, NotificationPreferences  # noqa: F401
from app.models.site_settings import SiteSettings  # noqa: F401
from app.models.email_log import EmailLog  # noqa: F401
from app.models.crm import CrmAudience, CrmAudienceMember, CrmEmailTemplate  # noqa: F401
from app.models.call_request import CallRequest  # noqa: F401

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
