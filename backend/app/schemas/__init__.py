from app.schemas.user import UserCreate, UserUpdate, UserResponse, Token, TokenPayload
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse, LessonCreate, LessonResponse
from app.schemas.cart import CartItemCreate, CartItemResponse
from app.schemas.coupon import CouponCreate, CouponResponse, CouponValidateRequest, CouponValidateResponse
from app.schemas.order import OrderCreate, OrderResponse, OrderItemResponse
from app.schemas.quiz import (
    QuizCreate,
    QuizResponse,
    QuizQuestionCreate,
    QuizQuestionResponse,
    QuizAttemptCreate,
    QuizAttemptResponse,
    QuizAttemptAnswerCreate,
    QuizAttemptAnswerResponse,
)
from app.schemas.enrollment import EnrollmentResponse
from app.schemas.certificate import (
    CertificateTemplateCreate,
    CertificateTemplateUpdate,
    CertificateTemplateResponse,
    CertificateResponse,
    CertificateVerificationResponse,
    CertificateGenerateRequest,
    CertificateRevokeRequest,
    CertificateListResponse,
    CertificateUploadResponse,
)
from app.schemas.popup_announcement import (
    PopupAnnouncementCreate,
    PopupAnnouncementUpdate,
    PopupAnnouncementResponse,
    PopupAnnouncementListResponse,
)
from app.schemas.ad_campaign import (
    AdCampaignCreate,
    AdCampaignUpdate,
    AdCampaignResponse,
    AdCampaignListResponse,
    AdCampaignAnalyticsResponse,
)
from app.schemas.ad_placement import (
    AdPlacementCreate,
    AdPlacementUpdate,
    AdPlacementResponse,
    AdPlacementListResponse,
)
from app.schemas.ad_pricing import (
    AdPricingCreate,
    AdPricingUpdate,
    AdPricingResponse,
    AdPricingListResponse,
    CampaignCostCalculationResponse,
)
from app.schemas.blog_post import (
    BlogPostBase,
    BlogPostCreate,
    BlogPostUpdate,
    BlogPostResponse,
    BlogPostListResponse,
    BlogPostSEO,
    AuthorInfo,
    CategoryInfo,
    TagInfo,
    generate_slug as generate_blog_slug,
)
from app.schemas.blog_category import (
    BlogCategoryBase,
    BlogCategoryCreate,
    BlogCategoryUpdate,
    BlogCategoryResponse,
)
from app.schemas.blog_tag import (
    BlogTagBase,
    BlogTagCreate,
    BlogTagUpdate,
    BlogTagResponse,
)
from app.schemas.messaging import (
    ConversationCreate,
    ConversationResponse,
    ConversationListResponse,
    MessageCreate,
    MessageResponse,
    MessageListResponse,
    MessageRecipient,
    UnreadCountResponse,
    UserBlockCreate,
    MessageReportCreate,
)
from app.schemas.education_program import EducationProgramCreate, EducationProgramUpdate, EducationProgramResponse
from app.schemas.mock_exam import (
    MockExamCreate,
    MockExamResponse,
    MockExamAttemptSubmit,
    MockExamAttemptResponse,
    MockExamAttemptAnalysis,
    MockExamAttemptListResponse,
)

__all__ = [
    "UserCreate", "UserUpdate", "UserResponse", "Token", "TokenPayload",
    "CourseCreate", "CourseUpdate", "CourseResponse", "LessonCreate", "LessonResponse",
    "CartItemCreate", "CartItemResponse",
    "CouponCreate", "CouponResponse", "CouponValidateRequest", "CouponValidateResponse",
    "OrderCreate", "OrderResponse", "OrderItemResponse",
    "QuizCreate", "QuizResponse", "QuizQuestionCreate", "QuizQuestionResponse",
    "QuizAttemptCreate", "QuizAttemptResponse", "QuizAttemptAnswerCreate", "QuizAttemptAnswerResponse",
    "EnrollmentResponse",
    "CertificateTemplateCreate", "CertificateTemplateUpdate", "CertificateTemplateResponse",
    "CertificateResponse", "CertificateVerificationResponse", "CertificateGenerateRequest",
    "CertificateRevokeRequest", "CertificateListResponse", "CertificateUploadResponse",
    "PopupAnnouncementCreate", "PopupAnnouncementUpdate", "PopupAnnouncementResponse",
    "PopupAnnouncementListResponse",
    "AdCampaignCreate", "AdCampaignUpdate", "AdCampaignResponse",
    "AdCampaignListResponse", "AdCampaignAnalyticsResponse",
    "AdPlacementCreate", "AdPlacementUpdate", "AdPlacementResponse",
    "AdPlacementListResponse",
    "AdPricingCreate", "AdPricingUpdate", "AdPricingResponse",
    "AdPricingListResponse", "CampaignCostCalculationResponse",
    "BlogPostBase", "BlogPostCreate", "BlogPostUpdate", "BlogPostResponse",
    "BlogPostListResponse", "BlogPostSEO", "AuthorInfo", "CategoryInfo", "TagInfo",
    "generate_blog_slug",
    "BlogCategoryBase", "BlogCategoryCreate", "BlogCategoryUpdate", "BlogCategoryResponse",
    "BlogTagBase", "BlogTagCreate", "BlogTagUpdate", "BlogTagResponse",
    "ConversationCreate", "ConversationResponse", "ConversationListResponse",
    "MessageCreate", "MessageResponse", "MessageListResponse",
    "MessageRecipient", "UnreadCountResponse",
    "UserBlockCreate", "MessageReportCreate",
    "EducationProgramCreate", "EducationProgramUpdate", "EducationProgramResponse",
    "MockExamCreate", "MockExamResponse", "MockExamAttemptSubmit", "MockExamAttemptResponse", "MockExamAttemptAnalysis", "MockExamAttemptListResponse",
]

