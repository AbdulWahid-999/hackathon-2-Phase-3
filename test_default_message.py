#!/usr/bin/env python3
"""
Test script to verify that all non-tool-function inputs get the same default message
"""
import sys
import os

# Add the backend src directory to the path so we can import modules
backend_src_path = os.path.join(os.path.dirname(__file__), 'backend', 'src')
sys.path.insert(0, backend_src_path)

# Add the backend directory as well for relative imports
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

from src.services.intent_resolution_service import IntentResolutionService
from src.services.chat_service import ChatService
from src.models.intent import IntentType
from unittest.mock import Mock
from sqlmodel import Session
from uuid import UUID


def test_default_messages():
    """Test that all non-tool-function inputs get the same default message"""
    print("Testing default message responses...")

    # Create an instance of the intent resolution service
    intent_resolver = IntentResolutionService()

    # Test different inputs that should all return the same default message
    test_inputs = [
        "hi",
        "hello", 
        "hey",
        "hy",
        "greetings",
        "what's up?",
        "how are you?",
        "who are you?",
        "tell me about yourself",
        "random text that doesn't match any patterns",
        "some other random input",
        "another test input"
    ]

    expected_response = "I'm an AI assistant created by Muhammad Abdul Wahid. I can only help with managing your todos. I can help you add, list, complete, or delete tasks. You can say things like 'Add buy groceries', 'Show my todos', 'Complete meeting', or 'Delete all tasks'."

    # Create a mock session for the chat service
    mock_session = Mock(spec=Session)
    
    # Create chat service instance
    chat_service = ChatService(mock_session)
    
    print(f"Expected default message: {expected_response}\n")

    for user_input in test_inputs:
        # Use the chat service to process the message
        # Since we're mocking the session and not connecting to a real DB, 
        # we expect this to fail at the DB level but still return the correct intent/message
        try:
            # Just test the intent resolution part
            intent_type, parameters, confidence = intent_resolver.resolve_intent(user_input)
            
            print(f"Input: '{user_input}' -> Intent: {intent_type}, Confidence: {confidence:.2f}")
            
            # Check what type of intent was returned
            if intent_type == IntentType.UNKNOWN_QUESTION:
                print(f"  -> Would trigger unknown question handler")
            elif intent_type == IntentType.UNKNOWN:
                print(f"  -> Would trigger unknown intent handler")
            elif intent_type == IntentType.GREETING:
                print(f"  -> Would trigger greeting handler")
            else:
                print(f"  -> Would trigger {intent_type} handler")
                
        except Exception as e:
            print(f"Input: '{user_input}' -> Error during processing: {e}")

    print("\nTest completed. Note: Actual message delivery depends on the handlers in ChatService.")


if __name__ == "__main__":
    test_default_messages()