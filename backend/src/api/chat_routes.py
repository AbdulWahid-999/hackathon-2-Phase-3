import logging
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlmodel import Session
from typing import Dict, Any, Optional
from uuid import UUID
from ..database.connection import get_session
from ..middleware.auth import require_auth
from ..models.user import User
from ..services.chat_service import ChatService
from pydantic import BaseModel
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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


class ChatHistoryResponse(BaseModel):
    """Response model for chat history."""
    history: list


router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/send", response_model=ChatMessageResponse)
def send_chat_message(
    request: ChatMessageRequest,
    current_user: User = Depends(require_auth),
    session: Session = Depends(get_session)
) -> ChatMessageResponse:
    """
    Send a chat message to the AI chatbot.
    Processes natural language input and performs todo operations.
    """
    try:
        # Log incoming message
        logger.info(f"Received chat message from user {current_user.id}: {request.message}")

        # Convert session_id string to UUID if provided
        session_id_uuid = None
        if request.session_id:
            try:
                session_id_uuid = UUID(request.session_id)
            except ValueError:
                logger.warning(f"Invalid session ID format: {request.session_id}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid session ID format"
                )

        # Verify user exists and is active
        user = session.get(User, current_user.id)
        if not user or not user.is_active:
            logger.warning(f"Unauthorized access attempt by user ID: {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )

        # Create chat service instance
        chat_service = ChatService(session)

        # Process the user message
        result = chat_service.process_user_message(
            user_input=request.message,
            user_id=current_user.id,
            session_id=session_id_uuid
        )

        # Log the result
        logger.info(f"Processed chat message for user {current_user.id}, success: {result.get('success', False)}")

        return ChatMessageResponse(
            message=result.get("message", ""),
            intent=result.get("intent", "UNKNOWN"),
            success=result.get("success", False),
            operation_result=result.get("operation_result", {})
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the error for debugging
        print(f"Chat processing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your message"
        )


@router.get("/history", response_model=ChatHistoryResponse)
def get_chat_history(
    current_user: User = Depends(require_auth),
    session: Session = Depends(get_session),
    limit: int = 20
) -> ChatHistoryResponse:
    """
    Get chat history for the current user.
    Retrieves conversation history for the authenticated user.
    """
    try:
        # Create chat service instance
        chat_service = ChatService(session)

        # Get chat history
        history_records = chat_service.get_chat_history(current_user.id, limit)

        # Convert to simple history format
        history = []
        for record in history_records:
            history.append({
                "id": str(record.id),
                "user_input": record.input_text,
                "bot_response": record.response_text,
                "intent": record.intent_type,
                "timestamp": record.timestamp.isoformat(),
                "session_id": str(record.session_id) if record.session_id else None
            })

        return ChatHistoryResponse(history=history)

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the error for debugging
        print(f"Chat history retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving chat history"
        )


@router.post("/intent-resolution")
def resolve_intent(
    request: ChatMessageRequest,
    current_user: User = Depends(require_auth),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Resolve intent from natural language.
    Parses natural language and returns the intended operation without executing it.
    """
    try:
        from ..services.intent_resolution_service import IntentResolutionService

        # Create intent resolver instance
        intent_resolver = IntentResolutionService()

        # Resolve the intent
        intent_type, parameters, confidence = intent_resolver.resolve_intent(request.message)

        return {
            "intent": intent_type.value,
            "confidence": confidence,
            "parameters": parameters,
            "message": f"Intent resolved: {intent_type.value} with {confidence:.2f} confidence"
        }

    except Exception as e:
        # Log the error for debugging
        print(f"Intent resolution error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to identify intent from input: {str(e)}"
        )


# WebSocket connection manager for handling multiple connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: str):
        websocket = self.active_connections.get(user_id)
        if websocket:
            await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

manager = ConnectionManager()


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time updates.
    Handles real-time communication between client and server.
    """
    logger.info(f"WebSocket connection attempt for user {user_id}")
    await manager.connect(websocket, user_id)
    logger.info(f"WebSocket connected for user {user_id}")

    try:
        # Listen for messages from the client
        while True:
            data = await websocket.receive_text()
            logger.debug(f"WebSocket received data from user {user_id}: {data}")

            # Process received data (if needed)
            # For now, just acknowledge receipt
            await manager.send_personal_message(json.dumps({"type": "ack", "message": "received"}), user_id)
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        logger.info(f"WebSocket disconnected for user {user_id}")
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {str(e)}")
        manager.disconnect(user_id)