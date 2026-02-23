"""
Messaging Rate Limiting Service (EP12-SEC-01)

Database-based rate limiting for messaging system.
Sliding window algorithm implementation.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.messaging import Message
from app.models.user import User, UserRole

logger = logging.getLogger(__name__)

# Rate limit configurations
RATE_LIMITS = {
    "send_message": {
        "student": {"max": 10, "window_seconds": 60},  # 10 mesaj/dakika
        "teacher": {"max": 10, "window_seconds": 60},
        "admin": {"max": 20, "window_seconds": 60},  # 20 mesaj/dakika
        "new_user": {"max": 5, "window_seconds": 60},  # 5 mesaj/dakika (ilk 7 gün)
    },
    "create_conversation": {
        "student": {"max": 5, "window_seconds": 3600},  # 5 konuşma/saat
        "teacher": {"max": 5, "window_seconds": 3600},
        "admin": {"max": 10, "window_seconds": 3600},
        "new_user": {"max": 3, "window_seconds": 3600},
    },
    "poll": {
        "student": {"max": 30, "window_seconds": 60},  # 30 request/dakika
        "teacher": {"max": 30, "window_seconds": 60},
        "admin": {"max": 60, "window_seconds": 60},
        "new_user": {"max": 15, "window_seconds": 60},
    },
    "search": {
        "student": {"max": 20, "window_seconds": 60},  # 20 request/dakika
        "teacher": {"max": 20, "window_seconds": 60},
        "admin": {"max": 40, "window_seconds": 60},
        "new_user": {"max": 10, "window_seconds": 60},
    },
}

# Spam detection thresholds
SPAM_THRESHOLDS = {
    "duplicate_content_minutes": 5,  # 5 dakika içinde
    "duplicate_content_count": 3,  # 3+ aynı mesaj
    "min_content_length": 1,  # Minimum 1 karakter
    "max_content_length": 10000,  # Maximum 10,000 karakter
    "max_urls_per_message": 5,  # 5+ URL spam
    "max_messages_per_user_per_hour": 10,  # Aynı kullanıcıya 1 saatte 10+ mesaj
    "max_conversations_per_recipient_per_hour": 5,  # Aynı recipient'a 1 saatte 5+ yeni konuşma
}


async def is_new_user(user_id: str, db: AsyncSession) -> bool:
    """Check if user account is less than 7 days old"""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        return False
    
    if not user.created_at:
        return False
    
    age_days = (datetime.now(timezone.utc) - user.created_at.replace(tzinfo=timezone.utc)).total_seconds() / 86400
    return age_days < 7


async def check_rate_limit(
    user_id: str,
    endpoint: str,
    user_role: str,
    db: AsyncSession,
) -> tuple[bool, int, int]:
    """
    Check rate limit for user and endpoint.
    
    Returns:
        (is_allowed, remaining_requests, reset_after_seconds)
    """
    # Get rate limit config
    if endpoint not in RATE_LIMITS:
        logger.warning(f"Unknown endpoint for rate limiting: {endpoint}")
        return True, 999, 0
    
    # Determine user type (new_user or role-based)
    is_new = await is_new_user(user_id, db)
    user_type = "new_user" if is_new else user_role
    
    config = RATE_LIMITS[endpoint].get(user_type, RATE_LIMITS[endpoint].get("student"))
    max_requests = config["max"]
    window_seconds = config["window_seconds"]
    
    # Calculate time window
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(seconds=window_seconds)
    
    # Count requests in the window
    if endpoint == "send_message":
        # Count messages sent by user in the window
        stmt = (
            select(func.count(Message.id))
            .where(
                and_(
                    Message.sender_id == user_id,
                    Message.created_at >= window_start,
                    Message.is_deleted.is_(False),
                )
            )
        )
    elif endpoint == "create_conversation":
        # Count conversations created by user in the window
        from app.models.messaging import Conversation
        
        stmt = (
            select(func.count(Conversation.id))
            .where(
                and_(
                    Conversation.participant1_id == user_id,
                    Conversation.created_at >= window_start,
                )
            )
        )
    elif endpoint == "poll":
        # For polling, we'll use a simpler approach - count recent poll requests
        # Since we don't have a poll log table, we'll use message reads as a proxy
        # This is not perfect but works for basic rate limiting
        stmt = select(func.count(Message.id)).where(
            and_(
                Message.sender_id == user_id,
                Message.created_at >= window_start,
            )
        )
    else:
        return True, max_requests, window_seconds
    
    result = await db.execute(stmt)
    count = result.scalar() or 0
    
    remaining = max(0, max_requests - count)
    is_allowed = count < max_requests
    
    if not is_allowed:
        logger.warning(
            f"Rate limit exceeded: user_id={user_id}, endpoint={endpoint}, "
            f"count={count}, max={max_requests}, window={window_seconds}s"
        )
    
    return is_allowed, remaining, window_seconds


async def check_content_spam(
    user_id: str,
    content: str,
    conversation_id: Optional[str],
    db: AsyncSession,
) -> tuple[bool, Optional[str]]:
    """
    Check if message content is spam.
    
    Returns:
        (is_spam, reason)
    """
    # Check content length
    if len(content.strip()) < SPAM_THRESHOLDS["min_content_length"]:
        return True, "Mesaj içeriği çok kısa"
    
    if len(content) > SPAM_THRESHOLDS["max_content_length"]:
        return True, f"Mesaj içeriği çok uzun (max: {SPAM_THRESHOLDS['max_content_length']} karakter)"
    
    # Check for duplicate content (same content sent multiple times recently)
    duplicate_window = datetime.now(timezone.utc) - timedelta(
        minutes=SPAM_THRESHOLDS["duplicate_content_minutes"]
    )
    
    stmt = (
        select(func.count(Message.id))
        .where(
            and_(
                Message.sender_id == user_id,
                Message.content == content,
                Message.created_at >= duplicate_window,
                Message.is_deleted.is_(False),
            )
        )
    )
    result = await db.execute(stmt)
    duplicate_count = result.scalar() or 0
    
    if duplicate_count >= SPAM_THRESHOLDS["duplicate_content_count"]:
        return True, "Aynı içerik çok kısa sürede tekrar gönderildi"
    
    # Check for URL spam
    import re
    
    url_pattern = r"https?://[^\s]+"
    urls = re.findall(url_pattern, content)
    
    if len(urls) > SPAM_THRESHOLDS["max_urls_per_message"]:
        return True, f"Mesajda çok fazla URL var (max: {SPAM_THRESHOLDS['max_urls_per_message']})"
    
    return False, None


async def check_conversation_spam(
    user_id: str,
    recipient_id: str,
    db: AsyncSession,
) -> tuple[bool, Optional[str]]:
    """
    Check if user is spamming conversations.
    
    Returns:
        (is_spam, reason)
    """
    # Check messages to same user in last hour
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    
    from app.models.messaging import Conversation
    
    # Count messages sent to recipient in last hour
    stmt = (
        select(func.count(Message.id))
        .join(Conversation, Message.conversation_id == Conversation.id)
        .where(
            and_(
                Message.sender_id == user_id,
                Message.created_at >= one_hour_ago,
                Message.is_deleted.is_(False),
                or_(
                    and_(
                        Conversation.participant1_id == user_id,
                        Conversation.participant2_id == recipient_id,
                    ),
                    and_(
                        Conversation.participant1_id == recipient_id,
                        Conversation.participant2_id == user_id,
                    ),
                ),
            )
        )
    )
    result = await db.execute(stmt)
    message_count = result.scalar() or 0
    
    if message_count >= SPAM_THRESHOLDS["max_messages_per_user_per_hour"]:
        return True, f"Aynı kullanıcıya çok fazla mesaj gönderildi (1 saatte {message_count} mesaj)"
    
    # Check new conversations to same recipient in last hour
    stmt = (
        select(func.count(Conversation.id))
        .where(
            and_(
                Conversation.participant1_id == user_id,
                Conversation.participant2_id == recipient_id,
                Conversation.created_at >= one_hour_ago,
            )
        )
    )
    result = await db.execute(stmt)
    conversation_count = result.scalar() or 0
    
    if conversation_count >= SPAM_THRESHOLDS["max_conversations_per_recipient_per_hour"]:
        return True, f"Aynı kullanıcıya çok fazla yeni konuşma başlatıldı (1 saatte {conversation_count} konuşma)"
    
    return False, None
