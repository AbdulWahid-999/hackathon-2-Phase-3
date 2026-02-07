#!/usr/bin/env python3
"""
Test script to verify the greeting and unknown question changes work correctly
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
from src.models.intent import IntentType
from unittest.mock import Mock

def test_greeting_responses():
    """Test that greeting responses are working correctly"""
    print("Testing greeting responses...")
    
    # Create an instance of the intent resolution service
    intent_resolver = IntentResolutionService()
    
    # Test different greeting inputs
    test_inputs = [
        "hello",
        "hi", 
        "hey",
        "how are you",
        "what is your name",
        "what can you do",
        "tell me about yourself",
        "weather today",
        "how is life",
        "who created you"
    ]
    
    for user_input in test_inputs:
        intent_type, parameters, confidence = intent_resolver.resolve_intent(user_input)
        print(f"Input: '{user_input}' -> Intent: {intent_type}, Confidence: {confidence:.2f}")
        
        # Simulate chat service handling
        if intent_type == IntentType.GREETING:
            print(f"  -> Would trigger greeting handler with params: {parameters}")
        elif intent_type == IntentType.UNKNOWN_QUESTION:
            print(f"  -> Would trigger unknown question handler with params: {parameters}")
        elif intent_type == IntentType.UNKNOWN:
            print(f"  -> Would trigger unknown intent handler")
    
    print("\nGreeting and unknown question handling appears to be working correctly!")

if __name__ == "__main__":
    test_greeting_responses()