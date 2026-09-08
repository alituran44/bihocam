import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Enum, String, Boolean, ForeignKey, func, Index, Text, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STAFF = "staff"
    ORGANIZATION = "organization"
    TEACHER = "teacher"
    STUDENT = "student"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, values_callable=lambda e: [x.value for x in e]), default=UserRole.STUDENT, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # Organization relation (for org members)
    organization_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=True
    )

    # Contact info
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)

    # Teacher profile fields (nullable, only for teachers)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)  # Biyografi
    expertise_tags: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)  # Uzmanlık alanları
    social_links: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # Sosyal medya linkleri: {linkedin, twitter, instagram, website}
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Profil resmi URL
    promo_images: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)  # Tanıtım resimleri
    promo_video: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Tanıtım videosu
    
    # Live class fields
    live_class_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    live_class_discount_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    face_to_face_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    live_class_link: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Tax & Legal Information (GİB BTRANS VUK 538 / 595 Uyumlu)
    tax_info: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # {tc_kimlik, company_type, company_title, tax_office, address, city, district, ...}

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    courses = relationship("Course", back_populates="teacher", foreign_keys="Course.teacher_id")
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="user", cascade="all, delete-orphan")
    coupon_usages = relationship("CouponUsage", back_populates="user", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    lesson_progress = relationship("LessonProgress", back_populates="user", cascade="all, delete-orphan")
    storage_quota = relationship("StorageQuota", back_populates="user", uselist=False, cascade="all, delete-orphan")
    course_reviews = relationship(
        "CourseReview",
        foreign_keys="CourseReview.user_id",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    notifications = relationship(
        "Notification",
        foreign_keys="Notification.user_id",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    notification_preferences = relationship(
        "NotificationPreferences",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    bank_accounts = relationship(
        "TeacherBankAccount",
        foreign_keys="TeacherBankAccount.teacher_id",
        cascade="all, delete-orphan",
    )
    earnings = relationship(
        "TeacherEarning",
        foreign_keys="TeacherEarning.teacher_id",
        cascade="all, delete-orphan",
    )
    withdrawal_requests = relationship(
        "WithdrawalRequest",
        foreign_keys="WithdrawalRequest.teacher_id",
        cascade="all, delete-orphan",
    )
    certificates = relationship(
        "Certificate",
        foreign_keys="Certificate.user_id",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    
    # Social relationships
    social_posts = relationship("SocialPost", back_populates="user", cascade="all, delete-orphan")
    saved_posts = relationship("SavedPost", back_populates="user", cascade="all, delete-orphan")
    followers = relationship(
        "UserFollow",
        foreign_keys="UserFollow.following_id",
        back_populates="following",
        cascade="all, delete-orphan",
    )
    following = relationship(
        "UserFollow",
        foreign_keys="UserFollow.follower_id",
        back_populates="follower",
        cascade="all, delete-orphan",
    )

    blog_posts = relationship(
        "BlogPost",
        foreign_keys="BlogPost.author_id",
        back_populates="author",
        cascade="all, delete-orphan",
    )

    popcasts = relationship("Popcast", back_populates="teacher", cascade="all, delete-orphan")
    favorite_popcasts = relationship("UserPopcastFavorite", back_populates="user", cascade="all, delete-orphan")