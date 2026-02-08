from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime


class ChatMessageRequest(BaseModel):
    """Request model for chat messages."""
    message: str
    session_id: Optional[str] = None  # Using string for UUID, will be converted to UUID in handler


class ChatMessageResponse(BaseModel):
    """Response model for chat messages."""
    message: str
    intent: str
    success: bool
    operation_result: Dict[str, Any]


class ChatHistoryItem(BaseModel):
    """Model for individual chat history item."""
    id: str
    user_input: str
    bot_response: str
    intent: str
    timestamp: str
    session_id: Optional[str] = None


class ChatHistoryResponse(BaseModel):
    """Response model for chat history."""
    history: List[ChatHistoryItem]