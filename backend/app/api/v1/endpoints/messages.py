"""
Messaging Endpoints (EPIC-12)

REST API endpoints for messaging system.
KVKK compliant recipient filtering, conversation management, message sending.
"""

import asyncio
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from fastapi.responses import JSONResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.messaging import Conversation, Message
from app.schemas.messaging import (
    ConversationCreate,
    ConversationResponse,
    ConversationListResponse,
    MessageCreate,
    MessageResponse,
    MessageListResponse,
    MessageRecipient,
    UnreadCountResponse,
    MessageReportCreate,
)
from app.services.messaging_service import (
    get_or_create_conversation,
    get_available_message_recipients,
    send_message,
    get_conversation_messages,
    mark_messages_as_read,
    get_user_conversations,
    archive_conversation,
    delete_message,
    validate_conversation_access,
    get_unread_count,
    block_user,
    unblock_user,
    get_blocked_users,
    is_user_blocked,
    check_blocked_before_send,
    report_message,
    get_flagged_messages,
    moderate_message,
)
from app.services.messaging_rate_limit import (
    check_rate_limit,
    check_content_spam,
    check_conversation_spam,
)
from app.services.storage_service import StorageBackend, get_storage

router = APIRouter()


def _build_message_response(message: Message) -> dict:
    """Message objesini response dict'e dönüştür"""
    return {
        "id": message.id,
        "conversation_id": message.conversation_id,
        "sender_id": message.sender_id,
        "sender_role": message.sender_role,
        "content": message.content,
        "attachment_url": message.attachment_url,
        "attachment_filename": message.attachment_filename,
        "attachment_size": message.attachment_size,
        "is_read": message.is_read,
        "read_at": message.read_at,
        "is_deleted": message.is_deleted,
        "deleted_at": message.deleted_at,
        "is_flagged": message.is_flagged,
        "flag_reason": message.flag_reason,
        "created_at": message.created_at,
        "sender_name": message.sender.full_name if message.sender else "Unknown",
        "sender_avatar": message.sender.avatar_url if message.sender else None,
    }


def _build_conversation_response(conversation: Conversation, current_user_id: str) -> dict:
    """Conversation objesini response dict'e dönüştür"""
    # Determine which participant is the "other" one
    if current_user_id == conversation.participant1_id:
        other_participant = conversation.participant2
        other_participant_id = conversation.participant2_id
        other_participant_role = conversation.participant2_role
        unread_count = conversation.unread_count_participant1
        is_archived = conversation.is_archived_participant1
    else:
        other_participant = conversation.participant1
        other_participant_id = conversation.participant1_id
        other_participant_role = conversation.participant1_role
        unread_count = conversation.unread_count_participant2
        is_archived = conversation.is_archived_participant2

    # Label for admin (Support)
    other_participant_label = (
        "Support" if other_participant_role == "admin" else (other_participant.full_name if other_participant else "Unknown")
    )

    return {
        "id": conversation.id,
        "participant1_id": conversation.participant1_id,
        "participant2_id": conversation.participant2_id,
        "participant1_role": conversation.participant1_role,
        "participant2_role": conversation.participant2_role,
        "course_id": conversation.course_id,
        "subject": conversation.subject,
        "conversation_type": conversation.conversation_type,
        "last_message_at": conversation.last_message_at,
        "last_message_preview": conversation.last_message_preview,
        "unread_count": unread_count,
        "is_archived": is_archived,
        "is_closed": conversation.is_closed,
        "created_at": conversation.created_at,
        "participant1_name": conversation.participant1.full_name if conversation.participant1 else "Unknown",
        "participant1_avatar": conversation.participant1.avatar_url if conversation.participant1 else None,
        "participant2_name": conversation.participant2.full_name if conversation.participant2 else "Unknown",
        "participant2_avatar": conversation.participant2.avatar_url if conversation.participant2 else None,
        "other_participant_id": other_participant_id,
        "other_participant_name": other_participant.full_name if other_participant else "Unknown",
        "other_participant_avatar": other_participant.avatar_url if other_participant else None,
        "other_participant_role": other_participant_role,
        "other_participant_label": other_participant_label,
        "course_title": conversation.course.title if conversation.course else None,
        "latest_messages": None,  # Will be populated if needed
    }


@router.get("/recipients", response_model=list[MessageRecipient])
async def get_recipients(
    search: Optional[str] = Query(None, description="Search by name or email"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get available message recipients (KVKK Compliant)
    Student: Enrolled course teachers + Admin (as "Support")
    Teacher: Own course students + Admin
    Admin: All teachers + all students
    """
    recipients = await get_available_message_recipients(
        current_user.id, current_user.role.value, db
    )

    # Search filter
    if search:
        search_lower = search.lower()
        recipients = [
            r
            for r in recipients
            if search_lower in r.full_name.lower() or search_lower in (r.email.lower() if r.email else "")
        ]

    # Build response
    result = []
    for recipient in recipients:
        label = "Support" if recipient.role == UserRole.ADMIN else recipient.full_name
        result.append(
            MessageRecipient(
                id=recipient.id,
                full_name=recipient.full_name,
                avatar=recipient.avatar_url,
                role=recipient.role.value,
                label=label,
            )
        )

    return result


@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    data: ConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get or create conversation
    KVKK validation: recipient_id must be in available recipients list
    """
    # KVKK validation: Check if recipient is in available recipients
    available = await get_available_message_recipients(
        current_user.id, current_user.role.value, db
    )
    recipient_ids = [r.id for r in available]

    if data.recipient_id not in recipient_ids:
        raise HTTPException(
            status_code=403,
            detail="Bu kullanıcıya mesaj gönderme yetkiniz yok (KVKK uyumluluğu)",
        )

    # Rate limiting check (new conversation creation)
    is_allowed, remaining, reset_after = await check_rate_limit(
        current_user.id, "create_conversation", current_user.role.value, db
    )
    if not is_allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Çok fazla yeni konuşma başlattınız. Lütfen {reset_after // 60} dakika sonra tekrar deneyin.",
            headers={
                "X-RateLimit-Limit": "5",
                "X-RateLimit-Remaining": str(remaining),
                "X-RateLimit-Reset": str(reset_after),
            },
        )

    # Conversation spam check
    is_spam, spam_reason = await check_conversation_spam(
        current_user.id, data.recipient_id, db
    )
    if is_spam:
        raise HTTPException(status_code=400, detail=f"Spam tespit edildi: {spam_reason}")

    # Blocking check
    try:
        await check_blocked_before_send(current_user.id, data.recipient_id, db)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

    # Get or create conversation (normalization is done inside the function)
    conversation = await get_or_create_conversation(
        participant1_id=current_user.id,
        participant2_id=data.recipient_id,
        course_id=data.course_id,
        db=db,
    )

    # Commit to ensure conversation is persisted
    await db.commit()
    
    # Refresh to ensure we have the latest state
    await db.refresh(conversation)

    # Load relationships
    await db.refresh(conversation, ["participant1", "participant2", "course"])

    return _build_conversation_response(conversation, current_user.id)


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    include_archived: bool = Query(False, description="Include archived conversations"),
    limit: int = Query(50, ge=1, le=100, description="Limit"),
    offset: int = Query(0, ge=0, description="Offset"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List user's conversations
    """
    conversations = await get_user_conversations(
        current_user.id, current_user.role.value, include_archived, db
    )

    # Pagination
    total = len(conversations)
    paginated = conversations[offset : offset + limit]

    # Build response
    result = [
        _build_conversation_response(conv, current_user.id) for conv in paginated
    ]

    return ConversationListResponse(conversations=result, total=total)


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get conversation details
    Authorization: Participant only
    """
    # Validate access
    has_access = await validate_conversation_access(
        conversation_id, current_user.id, db, current_user.role.value
    )
    if not has_access:
        raise HTTPException(status_code=403, detail="Bu conversation'a erişim yetkiniz yok")

    # Get conversation
    from sqlalchemy import select

    stmt = (
        select(Conversation)
        .where(Conversation.id == conversation_id)
        .options(
            selectinload(Conversation.participant1),
            selectinload(Conversation.participant2),
            selectinload(Conversation.course),
        )
    )
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation bulunamadı")

    # Get latest messages (optional)
    latest_messages = await get_conversation_messages(conversation_id, limit=10, offset=0, db=db)
    latest_messages_response = [_build_message_response(msg) for msg in latest_messages]

    response = _build_conversation_response(conversation, current_user.id)
    response["latest_messages"] = latest_messages_response

    return response


@router.get("/conversations/{conversation_id}/messages", response_model=MessageListResponse)
async def get_messages(
    conversation_id: str,
    limit: int = Query(50, ge=1, le=100, description="Limit"),
    offset: int = Query(0, ge=0, description="Offset"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get conversation messages (paginated)
    Authorization: Participant only
    """
    # Validate access
    has_access = await validate_conversation_access(
        conversation_id, current_user.id, db, current_user.role.value
    )
    if not has_access:
        raise HTTPException(status_code=403, detail="Bu conversation'a erişim yetkiniz yok")

    # Get messages
    messages = await get_conversation_messages(conversation_id, limit, offset, db)

    # Get total count
    from sqlalchemy import select, func

    stmt = (
        select(func.count(Message.id))
        .where(Message.conversation_id == conversation_id)
        .where(Message.is_deleted.is_(False))
    )
    result = await db.execute(stmt)
    total = result.scalar() or 0

    # Build response
    messages_response = [_build_message_response(msg) for msg in messages]

    return MessageListResponse(
        messages=messages_response, total=total, limit=limit, offset=offset
    )


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def create_message(
    conversation_id: str,
    content: str = Form(..., description="Message content"),
    attachment: Optional[UploadFile] = File(None, description="Optional attachment"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage: StorageBackend = Depends(get_storage),
):
    """
    Send message
    Authorization: Participant only
    Rate limiting: 10 messages/minute (normal users), 20 messages/minute (admin)
    """
    # Validate access
    has_access = await validate_conversation_access(
        conversation_id, current_user.id, db, current_user.role.value
    )
    if not has_access:
        raise HTTPException(status_code=403, detail="Bu conversation'a erişim yetkiniz yok")

    # Rate limiting check
    is_allowed, remaining, reset_after = await check_rate_limit(
        current_user.id, "send_message", current_user.role.value, db
    )
    if not is_allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Çok fazla mesaj gönderdiniz. Lütfen {reset_after} saniye sonra tekrar deneyin.",
            headers={
                "X-RateLimit-Limit": "10",
                "X-RateLimit-Remaining": str(remaining),
                "X-RateLimit-Reset": str(reset_after),
            },
        )

    # Content spam check
    is_spam, spam_reason = await check_content_spam(
        current_user.id, content, conversation_id, db
    )
    if is_spam:
        raise HTTPException(status_code=400, detail=f"Spam tespit edildi: {spam_reason}")

    # Send message
    try:
        message = await send_message(
            conversation_id=conversation_id,
            sender_id=current_user.id,
            content=content,
            attachment=attachment,
            db=db,
            storage=storage,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Load sender relationship
    await db.refresh(message, ["sender"])

    return _build_message_response(message)


@router.post("/conversations/{conversation_id}/read")
async def mark_as_read(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark conversation as read
    Authorization: Participant only
    """
    # Validate access
    has_access = await validate_conversation_access(
        conversation_id, current_user.id, db, current_user.role.value
    )
    if not has_access:
        raise HTTPException(status_code=403, detail="Bu conversation'a erişim yetkiniz yok")

    # Mark as read
    try:
        await mark_messages_as_read(conversation_id, current_user.id, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"success": True, "message": "Mesajlar okundu olarak işaretlendi"}


@router.post("/conversations/{conversation_id}/archive")
async def archive_conv(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Archive conversation
    Authorization: Participant only
    """
    # Validate access
    has_access = await validate_conversation_access(
        conversation_id, current_user.id, db, current_user.role.value
    )
    if not has_access:
        raise HTTPException(status_code=403, detail="Bu conversation'a erişim yetkiniz yok")

    # Archive
    try:
        await archive_conversation(conversation_id, current_user.id, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"success": True, "message": "Conversation arşivlendi"}


@router.delete("/messages/{message_id}")
async def delete_msg(
    message_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete message (soft delete)
    Authorization: Sender only
    """
    try:
        await delete_message(message_id, current_user.id, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"success": True, "message": "Mesaj silindi"}


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get total unread message count
    """
    count = await get_unread_count(current_user.id, db)
    return UnreadCountResponse(unread_count=count)


@router.get("/poll")
async def poll_new_messages(
    since: datetime = Query(..., description="Last check timestamp"),
    timeout: int = Query(30, ge=5, le=60, description="Polling timeout (seconds)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Long polling for new messages
    KVKK: Only returns conversations where user is a participant
    Rate limiting: 30 requests/minute
    """
    # Rate limiting check
    is_allowed, remaining, reset_after = await check_rate_limit(
        current_user.id, "poll", current_user.role.value, db
    )
    if not is_allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Çok fazla polling isteği. Lütfen {reset_after} saniye sonra tekrar deneyin.",
            headers={
                "X-RateLimit-Limit": "30",
                "X-RateLimit-Remaining": str(remaining),
                "X-RateLimit-Reset": str(reset_after),
            },
        )
    start_time = datetime.now(timezone.utc)

    while True:
        # Check for new messages
        from sqlalchemy import select, and_, or_

        stmt = select(Conversation).where(
            or_(
                and_(
                    Conversation.participant1_id == current_user.id,
                    Conversation.last_message_at.isnot(None),
                    Conversation.last_message_at > since,
                ),
                and_(
                    Conversation.participant2_id == current_user.id,
                    Conversation.last_message_at.isnot(None),
                    Conversation.last_message_at > since,
                ),
            )
        ).options(
            selectinload(Conversation.participant1),
            selectinload(Conversation.participant2),
            selectinload(Conversation.course),
        )

        result = await db.execute(stmt)
        conversations = list(result.scalars().unique())

        if conversations:
            # New messages found
            conversations_response = [
                _build_conversation_response(conv, current_user.id) for conv in conversations
            ]
            return {
                "conversations": conversations_response,
                "has_new_messages": True,
            }

        # Check timeout
        elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()
        if elapsed >= timeout:
            # Timeout, return empty
            return {
                "conversations": [],
                "has_new_messages": False,
            }

        # Wait 2 seconds before next check
        await asyncio.sleep(2)


@router.post("/users/{user_id}/block")
async def block_user_endpoint(
    user_id: str,
    reason: Optional[str] = Form(None, description="Block reason"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Block a user
    """
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Kendinizi engelleyemezsiniz")
    
    # Check if user is admin (admins cannot be blocked)
    from sqlalchemy import select
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    target_user = result.scalar_one_or_none()
    
    if not target_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    if target_user.role == UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin kullanıcılar engellenemez")
    
    try:
        block = await block_user(current_user.id, user_id, reason, db)
        
        # Archive existing conversations
        conversations = await get_user_conversations(current_user.id, current_user.role.value, False, db)
        for conv in conversations:
            if user_id in [conv.participant1_id, conv.participant2_id]:
                await archive_conversation(conv.id, current_user.id, db)
        
        return {"success": True, "message": "Kullanıcı engellendi"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/users/{user_id}/block")
async def unblock_user_endpoint(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Unblock a user
    """
    try:
        await unblock_user(current_user.id, user_id, db)
        return {"success": True, "message": "Kullanıcının engeli kaldırıldı"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/users/blocked")
async def get_blocked_users_endpoint(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get list of blocked users
    """
    blocks = await get_blocked_users(current_user.id, db)
    
    return {
        "blocked_users": [
            {
                "id": block.blocked_id,
                "name": block.blocked.full_name if block.blocked else "Unknown",
                "avatar": block.blocked.avatar_url if block.blocked else None,
                "reason": block.reason,
                "blocked_at": block.created_at.isoformat() if block.created_at else None,
            }
            for block in blocks
        ]
    }


@router.get("/conversations/{conversation_id}/export")
async def export_conversation(
    conversation_id: str,
    format: str = Query("json", description="Export format: json or pdf"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Export conversation (KVKK compliance)
    Only user's own conversations can be exported
    Formats: JSON or PDF
    """
    # Validate access
    has_access = await validate_conversation_access(
        conversation_id, current_user.id, db, current_user.role.value
    )
    if not has_access:
        raise HTTPException(status_code=403, detail="Bu conversation'a erişim yetkiniz yok")
    
    # Get conversation with all messages
    from sqlalchemy import select
    
    stmt = (
        select(Conversation)
        .where(Conversation.id == conversation_id)
        .options(
            selectinload(Conversation.participant1),
            selectinload(Conversation.participant2),
            selectinload(Conversation.course),
            selectinload(Conversation.messages).selectinload(Message.sender),
        )
    )
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation bulunamadı")
    
    # Get all messages (not deleted)
    messages = [
        msg for msg in conversation.messages if not msg.is_deleted
    ]
    messages.sort(key=lambda m: m.created_at)
    
    # Build export data
    export_data = {
        "conversation_id": conversation.id,
        "conversation_type": conversation.conversation_type,
        "subject": conversation.subject,
        "participant1": {
            "id": conversation.participant1_id,
            "name": conversation.participant1.full_name if conversation.participant1 else "Unknown",
            "role": conversation.participant1_role,
        },
        "participant2": {
            "id": conversation.participant2_id,
            "name": conversation.participant2.full_name if conversation.participant2 else "Unknown",
            "role": conversation.participant2_role,
        },
        "course": {
            "id": conversation.course_id,
            "title": conversation.course.title if conversation.course else None,
        } if conversation.course_id else None,
        "created_at": conversation.created_at.isoformat() if conversation.created_at else None,
        "messages": [
            {
                "id": msg.id,
                "sender_id": msg.sender_id,
                "sender_name": msg.sender.full_name if msg.sender else "Unknown",
                "sender_role": msg.sender_role,
                "content": msg.content,
                "attachment_url": msg.attachment_url,
                "attachment_filename": msg.attachment_filename,
                "attachment_size": msg.attachment_size,
                "created_at": msg.created_at.isoformat() if msg.created_at else None,
                "is_read": msg.is_read,
                "read_at": msg.read_at.isoformat() if msg.read_at else None,
            }
            for msg in messages
        ],
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "exported_by": current_user.id,
    }
    
    # Log export (audit trail)
    import logging
    logger = logging.getLogger(__name__)
    logger.info(
        f"Conversation exported: conversation_id={conversation_id}, "
        f"user_id={current_user.id}, format={format}"
    )
    
    if format == "json":
        return JSONResponse(
            content=export_data,
            headers={
                "Content-Disposition": f'attachment; filename="conversation_{conversation_id}.json"'
            },
        )
    elif format == "pdf":
        # Generate HTML for PDF (browser print-to-PDF)
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Conversation Export - {conversation_id}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .header {{ border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }}
        .message {{ margin-bottom: 15px; padding: 10px; border-left: 3px solid #007bff; }}
        .message.sent {{ background-color: #e3f2fd; }}
        .message.received {{ background-color: #f5f5f5; }}
        .message-header {{ font-weight: bold; margin-bottom: 5px; }}
        .message-time {{ color: #666; font-size: 0.9em; }}
        .attachment {{ color: #007bff; margin-top: 5px; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Conversation Export</h1>
        <p><strong>Conversation ID:</strong> {conversation.id}</p>
        <p><strong>Type:</strong> {conversation.conversation_type}</p>
        <p><strong>Participants:</strong> {conversation.participant1.full_name if conversation.participant1 else 'Unknown'} & {conversation.participant2.full_name if conversation.participant2 else 'Unknown'}</p>
        <p><strong>Created:</strong> {conversation.created_at.strftime('%Y-%m-%d %H:%M:%S') if conversation.created_at else 'N/A'}</p>
        <p><strong>Exported:</strong> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
    <div class="messages">
        {"".join([
            f'''
        <div class="message {'sent' if msg.sender_id == current_user.id else 'received'}">
            <div class="message-header">{msg.sender.full_name if msg.sender else 'Unknown'} ({msg.sender_role})</div>
            <div class="message-time">{msg.created_at.strftime('%Y-%m-%d %H:%M:%S') if msg.created_at else 'N/A'}</div>
            <div class="message-content">{msg.content}</div>
            {f'<div class="attachment">📎 Attachment: {msg.attachment_filename} ({msg.attachment_size} bytes)</div>' if msg.attachment_url else ''}
        </div>
        '''
            for msg in messages
        ])}
    </div>
</body>
</html>
        """
        return Response(
            content=html_content,
            media_type="text/html",
            headers={
                "Content-Disposition": f'attachment; filename="conversation_{conversation_id}.html"'
            },
        )
    else:
        raise HTTPException(status_code=400, detail="Geçersiz format. Sadece 'json' veya 'pdf' desteklenir")


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Soft delete conversation (KVKK Right to be Forgotten)
    Archives the conversation for the user
    """
    # Validate access
    has_access = await validate_conversation_access(
        conversation_id, current_user.id, db, current_user.role.value
    )
    if not has_access:
        raise HTTPException(status_code=403, detail="Bu conversation'a erişim yetkiniz yok")
    
    # Archive conversation (soft delete)
    try:
        await archive_conversation(conversation_id, current_user.id, db)
        
        # Log deletion (audit trail)
        import logging
        logger = logging.getLogger(__name__)
        logger.info(
            f"Conversation soft deleted: conversation_id={conversation_id}, "
            f"user_id={current_user.id}"
        )
        
        return {"success": True, "message": "Conversation silindi"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/search")
async def search_messages(
    q: str = Query(..., description="Search query", min_length=1),
    conversation_id: Optional[str] = Query(None, description="Filter by conversation ID"),
    limit: int = Query(50, ge=1, le=100, description="Limit"),
    offset: int = Query(0, ge=0, description="Offset"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search messages (privacy-aware)
    Only searches in conversations where user is a participant
    Rate limiting: 20 requests/minute
    """
    # Rate limiting check
    is_allowed, remaining, reset_after = await check_rate_limit(
        current_user.id, "search", current_user.role.value, db
    )
    if not is_allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Çok fazla arama isteği. Lütfen {reset_after} saniye sonra tekrar deneyin.",
            headers={
                "X-RateLimit-Limit": "20",
                "X-RateLimit-Remaining": str(remaining),
                "X-RateLimit-Reset": str(reset_after),
            },
        )
    
    # Build search query
    from sqlalchemy import or_
    
    search_pattern = f"%{q}%"
    
    # Base query: only messages in conversations where user is participant
    if current_user.role == UserRole.ADMIN:
        # Admin can search all conversations
        stmt = select(Message).where(Message.is_deleted.is_(False))
    else:
        # Regular users: only their conversations
        stmt = (
            select(Message)
            .join(Conversation, Message.conversation_id == Conversation.id)
            .where(
                and_(
                    Message.is_deleted.is_(False),
                    or_(
                        Conversation.participant1_id == current_user.id,
                        Conversation.participant2_id == current_user.id,
                    ),
                )
            )
        )
    
    # Filter by conversation_id if provided
    if conversation_id:
        # Validate access to conversation
        has_access = await validate_conversation_access(
            conversation_id, current_user.id, db, current_user.role.value
        )
        if not has_access:
            raise HTTPException(status_code=403, detail="Bu conversation'a erişim yetkiniz yok")
        
        stmt = stmt.where(Message.conversation_id == conversation_id)
    
    # Search in content and attachment filename
    stmt = stmt.where(
        or_(
            Message.content.ilike(search_pattern),
            Message.attachment_filename.ilike(search_pattern),
        )
    )
    
    # Get total count
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0
    
    # Order by created_at DESC (newest first)
    stmt = stmt.order_by(Message.created_at.desc())
    
    # Pagination
    stmt = stmt.offset(offset).limit(limit)
    
    # Eager load sender
    stmt = stmt.options(selectinload(Message.sender))
    
    # Execute
    result = await db.execute(stmt)
    messages = list(result.scalars().unique())
    
    # Build response
    messages_response = [_build_message_response(msg) for msg in messages]
    
    return {
        "messages": messages_response,
        "total": total,
        "limit": limit,
        "offset": offset,
        "query": q,
    }


@router.post("/messages/{message_id}/report")
async def report_message_endpoint(
    message_id: str,
    data: MessageReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Report a message
    Report reasons: spam, harassment, inappropriate, other
    """
    # Validate reason
    valid_reasons = ["spam", "harassment", "inappropriate", "other"]
    if data.reason not in valid_reasons:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz şikayet sebebi. Geçerli sebepler: {', '.join(valid_reasons)}",
        )
    
    try:
        report = await report_message(
            message_id, current_user.id, data.reason, data.description, db
        )
        
        # Log report (audit trail)
        import logging
        logger = logging.getLogger(__name__)
        logger.info(
            f"Message reported: message_id={message_id}, "
            f"reporter_id={current_user.id}, reason={data.reason}"
        )
        
        return {"success": True, "message": "Mesaj şikayet edildi"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/admin/flagged-messages")
async def get_flagged_messages_admin(
    limit: int = Query(50, ge=1, le=100, description="Limit"),
    offset: int = Query(0, ge=0, description="Offset"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Admin: Get flagged messages for moderation
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Sadece admin erişebilir")
    
    messages, total = await get_flagged_messages(limit, offset, db)
    
    messages_response = [_build_message_response(msg) for msg in messages]
    
    return {
        "messages": messages_response,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.post("/admin/messages/{message_id}/moderate")
async def moderate_message_admin(
    message_id: str,
    action: str = Form(..., description="Moderation action: delete, warn, dismiss"),
    reason: Optional[str] = Form(None, description="Moderation reason"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Admin: Moderate a flagged message
    Actions: delete (soft delete), warn (unflag + notify), dismiss (unflag)
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Sadece admin erişebilir")
    
    valid_actions = ["delete", "warn", "dismiss"]
    if action not in valid_actions:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz action. Geçerli action'lar: {', '.join(valid_actions)}",
        )
    
    try:
        await moderate_message(message_id, action, current_user.id, reason, db)
        
        # Log moderation (audit trail)
        import logging
        logger = logging.getLogger(__name__)
        logger.info(
            f"Message moderated: message_id={message_id}, "
            f"moderator_id={current_user.id}, action={action}, reason={reason}"
        )
        
        return {"success": True, "message": f"Mesaj {action} işlemi uygulandı"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
