"""
Messaging Service (EPIC-12)

Conversation ve message yönetim servisi.
KVKK compliant recipient filtering, message sending, conversation management.
"""

from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from fastapi import UploadFile, HTTPException
from sqlalchemy import and_, or_, select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.course import Course
from app.models.messaging import Conversation, Message, UserBlock, MessageReport
from app.models.order import Enrollment
from app.models.notification import NotificationType
from app.models.user import User, UserRole
from app.services.notification_service import NotificationService
from app.services.storage_service import StorageBackend
from app.services.security_service import sanitize_html_content


async def get_or_create_conversation(
    participant1_id: str,
    participant2_id: str,
    course_id: Optional[str],
    db: AsyncSession,
) -> Conversation:
    """
    Mevcut conversation kontrolü (her iki yönde de - participant order önemli değil)
    Yoksa yeni conversation oluştur
    conversation_type otomatik belirleme (participant role'lerine göre)
    """
    # Participant order normalization (participant1_id < participant2_id her zaman)
    if participant1_id > participant2_id:
        participant1_id, participant2_id = participant2_id, participant1_id

    # Mevcut conversation kontrolü
    stmt = select(Conversation).where(
        and_(
            Conversation.participant1_id == participant1_id,
            Conversation.participant2_id == participant2_id,
            Conversation.course_id == (course_id if course_id else None),
        )
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()

    if existing:
        return existing

    # Participant role'lerini al
    user1_result = await db.execute(select(User).where(User.id == participant1_id))
    user1 = user1_result.scalar_one_or_none()
    user2_result = await db.execute(select(User).where(User.id == participant2_id))
    user2 = user2_result.scalar_one_or_none()

    if not user1 or not user2:
        raise ValueError("Participant bulunamadı")

    participant1_role = user1.role.value
    participant2_role = user2.role.value

    # Conversation type belirleme
    if participant1_role == "student" and participant2_role == "teacher":
        conversation_type = "student_teacher"
    elif participant1_role == "admin" and participant2_role == "teacher":
        conversation_type = "admin_teacher"
    elif participant1_role == "admin" and participant2_role == "student":
        conversation_type = "admin_student"
    else:
        # Fallback: generic type
        conversation_type = f"{participant1_role}_{participant2_role}"

    # Yeni conversation oluştur
    conversation = Conversation(
        id=str(uuid4()),
        participant1_id=participant1_id,
        participant2_id=participant2_id,
        participant1_role=participant1_role,
        participant2_role=participant2_role,
        course_id=course_id,
        conversation_type=conversation_type,
    )
    db.add(conversation)
    await db.flush()
    return conversation


async def get_available_message_recipients(
    user_id: str, user_role: str, db: AsyncSession
) -> list[User]:
    """
    KVKK Compliance - KRİTİK FONKSIYON
    Kullanıcının mesajlaşabileceği kişileri getir
    Student: Sadece kayıtlı oldukları kursların öğretmenleri + Admin (Support)
    Teacher: Kendi kurslarına kayıtlı öğrenciler + Admin
    Admin: Tüm öğretmenler + tüm öğrenciler
    """
    if user_role == "student":
        # Get enrolled course teachers
        stmt = (
            select(User)
            .distinct(User.id)
            .join(Course, Course.teacher_id == User.id)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .where(Enrollment.user_id == user_id)
            .where(User.role == UserRole.TEACHER)
            .where(User.is_active.is_(True))
        )
        result = await db.execute(stmt)
        teachers = list(result.scalars().unique())

        # Get admins (as "Support")
        admin_stmt = select(User).where(User.role == UserRole.ADMIN).where(User.is_active.is_(True))
        admin_result = await db.execute(admin_stmt)
        admins = list(admin_result.scalars().unique())

        return teachers + admins

    elif user_role == "teacher":
        # Get own course students
        stmt = (
            select(User)
            .distinct(User.id)
            .join(Enrollment, Enrollment.user_id == User.id)
            .join(Course, Course.id == Enrollment.course_id)
            .where(Course.teacher_id == user_id)
            .where(User.role == UserRole.STUDENT)
            .where(User.is_active.is_(True))
        )
        result = await db.execute(stmt)
        students = list(result.scalars().unique())

        # Get admins
        admin_stmt = select(User).where(User.role == UserRole.ADMIN).where(User.is_active.is_(True))
        admin_result = await db.execute(admin_stmt)
        admins = list(admin_result.scalars().unique())

        return students + admins

    elif user_role == "admin":
        # Get all teachers + all students
        stmt = select(User).where(
            User.role.in_([UserRole.TEACHER, UserRole.STUDENT]),
            User.is_active.is_(True),
        )
        result = await db.execute(stmt)
        return list(result.scalars().unique())

    return []


async def send_message(
    conversation_id: str,
    sender_id: str,
    content: str,
    attachment: Optional[UploadFile],
    db: AsyncSession,
    storage: StorageBackend,
) -> Message:
    """
    Mesaj oluştur
    Attachment upload (if any)
    Conversation metadata güncelle (last_message_at, last_message_preview)
    Unread count güncelle (recipient için)
    """
    # Conversation kontrolü
    stmt = (
        select(Conversation)
        .where(Conversation.id == conversation_id)
        .options(selectinload(Conversation.participant1), selectinload(Conversation.participant2))
    )
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise ValueError("Conversation bulunamadı")

    # Conversation kapalı mı kontrol et
    if conversation.is_closed:
        raise ValueError("Bu konuşma kapatılmış, yeni mesaj gönderilemez")

    # Sender participant mı kontrol et
    if sender_id not in [conversation.participant1_id, conversation.participant2_id]:
        raise ValueError("Bu conversation'a mesaj gönderme yetkiniz yok")

    # Blocking check
    recipient_id = (
        conversation.participant2_id
        if sender_id == conversation.participant1_id
        else conversation.participant1_id
    )
    await check_blocked_before_send(sender_id, recipient_id, db)

    # Content sanitization (XSS protection)
    # Mesajlar için sadece basit HTML tag'leri izin ver (b, i, u, br, p)
    sanitized_content = sanitize_html_content(content, allowed_tags=["b", "i", "u", "br", "p", "a"])

    # Attachment upload (if any)
    attachment_url = None
    attachment_filename = None
    attachment_size = None

    if attachment:
        # Validate and upload attachment using attachment service
        from app.services.messaging_attachment_service import (
            validate_attachment,
            upload_attachment,
        )

        try:
            file_content, sanitized_filename, file_size = await validate_attachment(
                attachment, sender_id, db
            )
            attachment_url = await upload_attachment(
                file_content, sanitized_filename, sender_id, conversation_id, storage
            )
            attachment_filename = sanitized_filename
            attachment_size = file_size
        except HTTPException:
            raise
        except Exception as e:
            raise ValueError(f"Dosya yükleme hatası: {str(e)}")

    # Sender role'ünü al
    sender_result = await db.execute(select(User).where(User.id == sender_id))
    sender = sender_result.scalar_one_or_none()
    sender_role = sender.role.value if sender else "student"

    # Message oluştur
    message = Message(
        id=str(uuid4()),
        conversation_id=conversation_id,
        sender_id=sender_id,
        sender_role=sender_role,
        content=sanitized_content,
        attachment_url=attachment_url,
        attachment_filename=attachment_filename,
        attachment_size=attachment_size,
    )
    db.add(message)
    await db.flush()

    # Conversation metadata güncelle
    now = datetime.now(timezone.utc)
    conversation.last_message_at = now
    conversation.last_message_preview = sanitized_content[:100] if sanitized_content else None

    # Unread count güncelle (recipient için)
    recipient_id = (
        conversation.participant2_id
        if sender_id == conversation.participant1_id
        else conversation.participant1_id
    )

    if sender_id == conversation.participant1_id:
        conversation.unread_count_participant2 += 1
    else:
        conversation.unread_count_participant1 += 1

    await db.commit()

    # Notification gönder
    notification_service = NotificationService(db)
    await notification_service.send_notification(
        user_ids=[recipient_id],
        notification_type=NotificationType.NEW_MESSAGE,
        title="Yeni Mesaj",
        message=f"{sender.full_name if sender else 'Birisi'} size mesaj gönderdi",
        data={
            "conversation_id": conversation_id,
            "sender_id": sender_id,
            "message_preview": sanitized_content[:100] if sanitized_content else "",
        },
        action_url=f"/dashboard/messages?conversation={conversation_id}",
        action_label="Mesajı Görüntüle",
    )

    return message


async def get_conversation_messages(
    conversation_id: str, limit: int, offset: int, db: AsyncSession
) -> list[Message]:
    """
    Pagination ile mesajları getir
    Newest first (created_at DESC)
    """
    stmt = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .where(Message.is_deleted.is_(False))
        .order_by(Message.created_at.desc())
        .limit(limit)
        .offset(offset)
        .options(selectinload(Message.sender))
    )
    result = await db.execute(stmt)
    return list(result.scalars().unique())


async def mark_messages_as_read(conversation_id: str, user_id: str, db: AsyncSession) -> None:
    """
    Kullanıcı için okunmamış mesajları "read" yap
    Unread count sıfırla (participant1 veya participant2 için)
    last_read_at güncelle
    """
    # Conversation kontrolü
    stmt = select(Conversation).where(Conversation.id == conversation_id)
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise ValueError("Conversation bulunamadı")

    # Participant kontrolü
    if user_id not in [conversation.participant1_id, conversation.participant2_id]:
        raise ValueError("Bu conversation'a erişim yetkiniz yok")

    # Okunmamış mesajları "read" yap
    now = datetime.now(timezone.utc)
    stmt = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .where(Message.sender_id != user_id)
        .where(Message.is_read.is_(False))
        .where(Message.is_deleted.is_(False))
    )
    result = await db.execute(stmt)
    unread_messages = result.scalars().all()

    for msg in unread_messages:
        msg.is_read = True
        msg.read_at = now

    # Unread count sıfırla
    if user_id == conversation.participant1_id:
        conversation.unread_count_participant1 = 0
        conversation.last_read_at_participant1 = now
    else:
        conversation.unread_count_participant2 = 0
        conversation.last_read_at_participant2 = now

    await db.commit()


async def get_user_conversations(
    user_id: str, user_role: str, include_archived: bool, db: AsyncSession
) -> list[Conversation]:
    """
    Kullanıcının tüm conversation'larını getir
    participant1_id veya participant2_id ile match
    Archived filter (role-based)
    Sort by last_message_at DESC
    """
    stmt = select(Conversation).where(
        or_(
            Conversation.participant1_id == user_id,
            Conversation.participant2_id == user_id,
        )
    )

    # Archived filter
    if not include_archived:
        stmt = stmt.where(
            or_(
                and_(
                    Conversation.participant1_id == user_id,
                    Conversation.is_archived_participant1.is_(False),
                ),
                and_(
                    Conversation.participant2_id == user_id,
                    Conversation.is_archived_participant2.is_(False),
                ),
            )
        )

    stmt = (
        stmt.order_by(Conversation.last_message_at.desc().nulls_last())
        .options(
            selectinload(Conversation.participant1),
            selectinload(Conversation.participant2),
            selectinload(Conversation.course),
        )
    )

    result = await db.execute(stmt)
    return list(result.scalars().unique())


async def archive_conversation(conversation_id: str, user_id: str, db: AsyncSession) -> None:
    """
    Conversation'ı kullanıcı için arşivle
    is_archived_participant1 veya is_archived_participant2 güncelle (user_id'ye göre)
    """
    stmt = select(Conversation).where(Conversation.id == conversation_id)
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise ValueError("Conversation bulunamadı")

    if user_id == conversation.participant1_id:
        conversation.is_archived_participant1 = True
    elif user_id == conversation.participant2_id:
        conversation.is_archived_participant2 = True
    else:
        raise ValueError("Bu conversation'a erişim yetkiniz yok")

    await db.commit()


async def delete_message(message_id: str, user_id: str, db: AsyncSession) -> None:
    """
    Soft delete message (is_deleted = True)
    Sadece sender silebilir
    """
    stmt = select(Message).where(Message.id == message_id)
    result = await db.execute(stmt)
    message = result.scalar_one_or_none()

    if not message:
        raise ValueError("Message bulunamadı")

    if message.sender_id != user_id:
        raise ValueError("Sadece mesaj gönderen kişi silebilir")

    message.is_deleted = True
    message.deleted_at = datetime.now(timezone.utc)

    await db.commit()


async def validate_conversation_access(
    conversation_id: str, user_id: str, db: AsyncSession, user_role: Optional[str] = None
) -> bool:
    """
    Kullanıcının conversation'a erişim yetkisi var mı kontrol et
    participant1 veya participant2 olmalı
    Admin'ler tüm conversation'lara erişebilir
    """
    stmt = select(Conversation).where(Conversation.id == conversation_id)
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()

    if not conversation:
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Conversation not found: conversation_id={conversation_id}")
        return False

    # Admin'ler tüm conversation'lara erişebilir
    if user_role == "admin":
        return True

    # Participant kontrolü
    is_participant = user_id in [conversation.participant1_id, conversation.participant2_id]
    
    # Debug logging (can be removed later)
    import logging
    logger = logging.getLogger(__name__)
    if not is_participant:
        logger.warning(
            f"Access denied: user_id={user_id}, "
            f"participant1_id={conversation.participant1_id}, "
            f"participant2_id={conversation.participant2_id}, "
            f"conversation_id={conversation_id}, "
            f"user_role={user_role}"
        )
    else:
        logger.info(
            f"Access granted: user_id={user_id}, "
            f"participant1_id={conversation.participant1_id}, "
            f"participant2_id={conversation.participant2_id}, "
            f"conversation_id={conversation_id}"
        )
    
    return is_participant


async def get_unread_count(user_id: str, db: AsyncSession) -> int:
    """
    Kullanıcının toplam okunmamış mesaj sayısını getir
    """
    stmt = select(func.sum(Conversation.unread_count_participant1)).where(
        Conversation.participant1_id == user_id
    )
    result1 = await db.execute(stmt)
    count1 = result1.scalar() or 0

    stmt = select(func.sum(Conversation.unread_count_participant2)).where(
        Conversation.participant2_id == user_id
    )
    result2 = await db.execute(stmt)
    count2 = result2.scalar() or 0

    return int(count1 + count2)


async def block_user(blocker_id: str, blocked_id: str, reason: Optional[str], db: AsyncSession) -> UserBlock:
    """
    Kullanıcıyı engelle
    """
    if blocker_id == blocked_id:
        raise ValueError("Kendinizi engelleyemezsiniz")
    
    # Check if already blocked
    stmt = select(UserBlock).where(
        and_(
            UserBlock.blocker_id == blocker_id,
            UserBlock.blocked_id == blocked_id,
        )
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    
    if existing:
        raise ValueError("Bu kullanıcı zaten engellenmiş")
    
    # Create block
    block = UserBlock(
        id=str(uuid4()),
        blocker_id=blocker_id,
        blocked_id=blocked_id,
        reason=reason,
    )
    db.add(block)
    await db.commit()
    
    return block


async def unblock_user(blocker_id: str, blocked_id: str, db: AsyncSession) -> None:
    """
    Kullanıcının engelini kaldır
    """
    stmt = select(UserBlock).where(
        and_(
            UserBlock.blocker_id == blocker_id,
            UserBlock.blocked_id == blocked_id,
        )
    )
    result = await db.execute(stmt)
    block = result.scalar_one_or_none()
    
    if not block:
        raise ValueError("Bu kullanıcı engellenmemiş")
    
    await db.delete(block)
    await db.commit()


async def is_user_blocked(blocker_id: str, blocked_id: str, db: AsyncSession) -> bool:
    """
    Kullanıcı engellenmiş mi kontrol et
    """
    stmt = select(UserBlock).where(
        and_(
            UserBlock.blocker_id == blocker_id,
            UserBlock.blocked_id == blocked_id,
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none() is not None


async def get_blocked_users(user_id: str, db: AsyncSession) -> list[UserBlock]:
    """
    Kullanıcının engellediği kişileri getir
    """
    stmt = (
        select(UserBlock)
        .where(UserBlock.blocker_id == user_id)
        .options(selectinload(UserBlock.blocked))
        .order_by(UserBlock.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().unique())


async def check_blocked_before_send(
    sender_id: str, recipient_id: str, db: AsyncSession
) -> None:
    """
    Mesaj göndermeden önce engelleme kontrolü
    """
    # Check if sender blocked recipient
    if await is_user_blocked(sender_id, recipient_id, db):
        raise ValueError("Bu kullanıcıyı engellediniz, mesaj gönderemezsiniz")
    
    # Check if recipient blocked sender
    if await is_user_blocked(recipient_id, sender_id, db):
        raise ValueError("Bu kullanıcı sizi engellemiş, mesaj gönderemezsiniz")


async def report_message(
    message_id: str, reporter_id: str, reason: str, description: Optional[str], db: AsyncSession
) -> MessageReport:
    """
    Mesajı şikayet et
    """
    # Check if message exists
    stmt = select(Message).where(Message.id == message_id)
    result = await db.execute(stmt)
    message = result.scalar_one_or_none()
    
    if not message:
        raise ValueError("Mesaj bulunamadı")
    
    # Check if already reported by this user
    stmt = select(MessageReport).where(
        and_(
            MessageReport.message_id == message_id,
            MessageReport.reporter_id == reporter_id,
        )
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    
    if existing:
        raise ValueError("Bu mesajı zaten şikayet ettiniz")
    
    # Create report
    report = MessageReport(
        id=str(uuid4()),
        message_id=message_id,
        reporter_id=reporter_id,
        reason=reason,
        description=description,
    )
    db.add(report)
    await db.flush()
    
    # Check report count threshold (5+ reports → auto-flag)
    count_stmt = select(func.count(MessageReport.id)).where(
        MessageReport.message_id == message_id
    )
    count_result = await db.execute(count_stmt)
    report_count = count_result.scalar() or 0
    
    if report_count >= 5:
        # Auto-flag message
        message.is_flagged = True
        message.flag_reason = f"Otomatik işaretlendi: {report_count} şikayet"
        await db.flush()
    
    await db.commit()
    return report


async def get_flagged_messages(
    limit: int, offset: int, db: AsyncSession
) -> tuple[list[Message], int]:
    """
    Admin için işaretli mesajları getir
    """
    # Get flagged messages
    stmt = (
        select(Message)
        .where(Message.is_flagged.is_(True))
        .where(Message.is_deleted.is_(False))
        .order_by(Message.created_at.desc())
        .options(selectinload(Message.sender), selectinload(Message.conversation))
    )
    
    # Count total
    count_stmt = select(func.count(Message.id)).where(
        and_(
            Message.is_flagged.is_(True),
            Message.is_deleted.is_(False),
        )
    )
    count_result = await db.execute(count_stmt)
    total = count_result.scalar() or 0
    
    # Pagination
    stmt = stmt.offset(offset).limit(limit)
    
    result = await db.execute(stmt)
    messages = list(result.scalars().unique())
    
    return messages, total


async def moderate_message(
    message_id: str,
    action: str,
    moderator_id: str,
    reason: Optional[str],
    db: AsyncSession,
) -> None:
    """
    Admin mesaj moderasyonu
    Actions: delete, warn, dismiss
    """
    stmt = select(Message).where(Message.id == message_id)
    result = await db.execute(stmt)
    message = result.scalar_one_or_none()
    
    if not message:
        raise ValueError("Mesaj bulunamadı")
    
    now = datetime.now(timezone.utc)
    
    if action == "delete":
        # Soft delete message
        message.is_deleted = True
        message.deleted_at = now
        message.is_flagged = False
        message.moderated_at = now
        message.moderated_by_id = moderator_id
    elif action == "warn":
        # Keep message but unflag (warning sent to user)
        message.is_flagged = False
        message.moderated_at = now
        message.moderated_by_id = moderator_id
        # TODO: Send warning notification to sender
    elif action == "dismiss":
        # Dismiss report (unflag)
        message.is_flagged = False
        message.moderated_at = now
        message.moderated_by_id = moderator_id
    else:
        raise ValueError(f"Geçersiz action: {action}")
    
    await db.commit()
