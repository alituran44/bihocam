"""
Messaging Schemas (EPIC-12)

Pydantic schemas for messaging API.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class ConversationCreate(BaseModel):
    recipient_id: str = Field(..., description="Recipient user ID")
    course_id: Optional[str] = Field(None, description="Related course ID (optional)")
    subject: Optional[str] = Field(None, max_length=255, description="Conversation subject")


class MessageRecipient(BaseModel):
    """Available message recipient (KVKK Compliant)"""
    id: str
    full_name: str
    avatar: Optional[str] = None
    role: str  # student, teacher, admin
    label: str  # Display label (e.g., "Support" for admin in student view)


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=10000, description="Message content")
    
    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Mesaj içeriği boş olamaz")
        return v.strip()


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    sender_role: str
    content: str
    attachment_url: Optional[str] = None
    attachment_filename: Optional[str] = None
    attachment_size: Optional[int] = None
    is_read: bool
    read_at: Optional[datetime] = None
    is_deleted: bool
    deleted_at: Optional[datetime] = None
    is_flagged: bool
    flag_reason: Optional[str] = None
    created_at: datetime
    # Nested sender info
    sender_name: str
    sender_avatar: Optional[str] = None


class ConversationResponse(BaseModel):
    id: str
    participant1_id: str
    participant2_id: str
    participant1_role: str
    participant2_role: str
    course_id: Optional[str]
    subject: Optional[str]
    conversation_type: str
    last_message_at: Optional[datetime]
    last_message_preview: Optional[str]
    unread_count: int  # Calculated based on current user
    is_archived: bool  # Calculated based on current user
    is_closed: bool
    created_at: datetime
    # Nested participant info
    participant1_name: str
    participant1_avatar: Optional[str] = None
    participant2_name: str
    participant2_avatar: Optional[str] = None
    # Other participant info (kimin ile konuşuyoruz - current user'a göre)
    other_participant_id: str
    other_participant_name: str
    other_participant_avatar: Optional[str] = None
    other_participant_role: str
    other_participant_label: str  # "Support" if admin, else full_name
    # Course info
    course_title: Optional[str] = None
    # Latest messages (optional)
    latest_messages: Optional[list[MessageResponse]] = None


class UnreadCountResponse(BaseModel):
    unread_count: int


class ConversationListResponse(BaseModel):
    conversations: list[ConversationResponse]
    total: int


class MessageListResponse(BaseModel):
    messages: list[MessageResponse]
    total: int
    limit: int
    offset: int


class UserBlockCreate(BaseModel):
    blocked_id: str = Field(..., description="User ID to block")
    reason: Optional[str] = Field(None, max_length=255, description="Block reason")


class MessageReportCreate(BaseModel):
    reason: str = Field(..., description="Report reason: spam, harassment, inappropriate, other")
    description: Optional[str] = Field(None, description="Additional details")
