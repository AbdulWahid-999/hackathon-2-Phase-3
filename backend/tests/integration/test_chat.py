import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from backend.src.main import app
from backend.src.models.user import User
from backend.src.services.chat_service import ChatService
from backend.src.services.intent_resolution_service import IntentResolutionService
from uuid import uuid4


@pytest.fixture(name="client")
def client_fixture():
    # Create in-memory SQLite database for testing
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    with TestClient(app) as client:
        with Session(engine) as session:
            # Mock the database session for the test
            client.session = session
            yield client


def test_send_chat_message_success(client):
    """Test sending a successful chat message."""
    # Create a mock user
    user_id = uuid4()
    user = User(
        id=user_id,
        email="test@example.com",
        password_hash="hashed_password",
        is_active=True
    )

    # Add user to session
    client.session.add(user)
    client.session.commit()

    # Mock the authentication dependency
    with patch("backend.src.middleware.auth.require_auth") as mock_auth:
        mock_auth.return_value = user

        # Mock the chat service
        with patch.object(ChatService, 'process_user_message') as mock_process:
            mock_process.return_value = {
                "message": "Todo added successfully",
                "intent": "ADD_TODO",
                "success": True,
                "operation_result": {"test": "result"}
            }

            response = client.post(
                "/chat/send",
                json={"message": "Add buy groceries"},
                headers={"Authorization": "Bearer fake_token"}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Todo added successfully"
            assert data["intent"] == "ADD_TODO"
            assert data["success"] is True


def test_send_chat_message_unauthorized(client):
    """Test sending a chat message without authentication."""
    response = client.post(
        "/chat/send",
        json={"message": "Add buy groceries"}
    )

    # Should return 401 for unauthorized access
    assert response.status_code == 401


def test_resolve_intent_endpoint(client):
    """Test the intent resolution endpoint."""
    # Create a mock user
    user_id = uuid4()
    user = User(
        id=user_id,
        email="test@example.com",
        password_hash="hashed_password",
        is_active=True
    )

    # Add user to session
    client.session.add(user)
    client.session.commit()

    # Mock the authentication dependency
    with patch("backend.src.middleware.auth.require_auth") as mock_auth:
        mock_auth.return_value = user

        response = client.post(
            "/chat/intent-resolution",
            json={"message": "Add buy groceries"},
            headers={"Authorization": "Bearer fake_token"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "intent" in data
        assert "confidence" in data
        assert "parameters" in data


def test_intent_resolution_service():
    """Test the intent resolution service directly."""
    service = IntentResolutionService()

    # Test ADD intent
    intent_type, params, confidence = service.resolve_intent("Add buy groceries")
    assert intent_type.name == "ADD" or intent_type.value == "ADD_TODO"
    assert confidence > 0.0

    # Test LIST intent
    intent_type, params, confidence = service.resolve_intent("Show my todos")
    assert intent_type.name == "LIST" or intent_type.value == "LIST_TODOS"
    assert confidence > 0.0

    # Test COMPLETE intent
    intent_type, params, confidence = service.resolve_intent("Complete the meeting todo")
    assert intent_type.name == "COMPLETE" or intent_type.value == "COMPLETE_TODO"
    assert confidence > 0.0

    # Test UNKNOWN intent
    intent_type, params, confidence = service.resolve_intent("Random unknown command")
    assert intent_type.name == "UNKNOWN" or intent_type.value == "UNKNOWN"
    assert confidence == 0.0


def test_get_chat_history(client):
    """Test getting chat history."""
    # Create a mock user
    user_id = uuid4()
    user = User(
        id=user_id,
        email="test@example.com",
        password_hash="hashed_password",
        is_active=True
    )

    # Add user to session
    client.session.add(user)
    client.session.commit()

    # Mock the authentication dependency
    with patch("backend.src.middleware.auth.require_auth") as mock_auth:
        mock_auth.return_value = user

        # Mock the chat service
        with patch.object(ChatService, 'get_chat_history') as mock_history:
            mock_history.return_value = []

            response = client.get(
                "/chat/history",
                headers={"Authorization": "Bearer fake_token"}
            )

            assert response.status_code == 200
            data = response.json()
            assert "history" in data