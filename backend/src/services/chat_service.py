from sqlmodel import Session, select
from typing import Dict, Any, Optional, List
from datetime import datetime
from uuid import UUID
from ..models.chat_interaction import ChatInteraction
from ..models.intent import Intent
from ..models.todo_operation import TodoOperation, OperationType
from ..models.todo import Todo
from .intent_resolution_service import IntentResolutionService
from .todo_service import TodoService
from ..mcp_servers.todo_mcp_server import TodoMCPServer


class ChatService:
    """
    Service for handling chat interactions and orchestrating todo operations
    through natural language commands.
    """

    def __init__(self, session: Session):
        self.session = session
        self.intent_resolver = IntentResolutionService()
        self.todo_service = TodoService(session)
        self.mcp_server = TodoMCPServer(session)

    def process_user_message(self, user_input: str, user_id: UUID, session_id: Optional[UUID] = None) -> Dict[str, Any]:
        """
        Process a user's natural language message and perform appropriate todo operations.

        Args:
            user_input: The raw natural language input from the user
            user_id: The ID of the user making the request
            session_id: Optional session identifier to group related interactions

        Returns:
            Dictionary with response message and operation results
        """
        try:
            # Resolve intent from user input
            intent_type, parameters, confidence = self.intent_resolver.resolve_intent(user_input)

            # Create chat interaction record
            chat_interaction = ChatInteraction(
                input_text=user_input,
                intent_type=str(intent_type.value) if hasattr(intent_type, 'value') else str(intent_type),
                response_text="",
                status="PENDING",
                user_id=user_id,
                session_id=session_id
            )

            # Set entities as JSON string
            chat_interaction.set_entities(parameters)

            # Add to session
            self.session.add(chat_interaction)
            self.session.flush()  # Get the ID without committing

            # Create intent record
            intent_record = Intent(
                type=intent_type,
                associated_chat_id=chat_interaction.id,
                confidence_score=confidence
            )
            intent_record.set_parameters(parameters)

            self.session.add(intent_record)
            self.session.flush()

            # Perform the appropriate operation based on intent
            result = self._execute_intent_based_on_type(intent_type, parameters, user_id)

            # Update chat interaction with result
            chat_interaction.response_text = result.get("message", "Operation completed.")
            chat_interaction.status = "PROCESSED"

            # Create todo operation record
            todo_operation = TodoOperation(
                operation_type=self._map_intent_to_operation(intent_type),
                intent_id=intent_record.id,
                status="SUCCESS" if result.get("success", False) else "FAILED",
                result_message=result.get("message", "")
            )

            if result.get("affected_items"):
                affected_ids = [item.get("id") for item in result.get("affected_items", []) if item.get("id")]
                todo_operation.set_todo_ids_affected(affected_ids)

            self.session.add(todo_operation)
            self.session.commit()

            return {
                "success": True,
                "message": result.get("message", "Operation completed."),
                "intent": intent_type.value,
                "operation_result": result
            }

        except Exception as e:
            # Handle errors and update chat interaction status
            chat_interaction.status = "FAILED"
            chat_interaction.response_text = f"An error occurred: {str(e)}"
            self.session.add(chat_interaction)
            self.session.commit()

            return {
                "success": False,
                "message": f"An error occurred: {str(e)}",
                "intent": "ERROR",
                "operation_result": {"error": str(e)}
            }

    def _execute_intent_based_on_type(self, intent_type: 'IntentType', parameters: Dict[str, Any], user_id: UUID) -> Dict[str, Any]:
        """Execute the appropriate operation based on the resolved intent type."""
        try:
            # Convert intent_type to string for comparison
            intent_str = str(intent_type).split('.')[-1]  # Get the enum value name

            if intent_str == 'ADD' or intent_str == 'ADD_TODO':
                return self._handle_add_todo(parameters, user_id)
            elif intent_str == 'LIST' or intent_str == 'LIST_TODOS':
                return self._handle_list_todos(user_id)
            elif intent_str == 'COMPLETE' or intent_str == 'COMPLETE_TODO':
                return self._handle_complete_todo(parameters, user_id)
            elif intent_str == 'DELETE' or intent_str == 'DELETE_TODO':
                return self._handle_delete_todo(parameters, user_id)
            elif intent_str == 'UPDATE' or intent_str == 'UPDATE_TODO':
                return self._handle_update_todo(parameters, user_id)
            elif intent_str == 'GREETING':
                return self._handle_greeting(parameters)
            elif intent_str == 'UNKNOWN_QUESTION':
                return self._handle_unknown_question(parameters)
            else:
                # Use original input if available for better fallback response
                original_input = parameters.get("original_input", "")
                return self._handle_unknown_intent(original_input)
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to execute operation: {str(e)}",
                "affected_items": []
            }

    def _handle_add_todo(self, parameters: Dict[str, Any], user_id: UUID) -> Dict[str, Any]:
        """Handle adding a new todo based on parameters."""
        # Extract title from parameters
        title = parameters.get("todo_title") or parameters.get("potential_title")

        if not title:
            # Try to get title from the raw input as a fallback
            title = parameters.get("raw_input", "").strip()

        if not title:
            return {
                "success": False,
                "message": "Could not determine the todo title. Please specify what you'd like to add.",
                "affected_items": []
            }

        try:
            # Use MCP server to create the todo
            result = self.mcp_server.create_todo_tool(
                title=title,
                user_id=user_id,
                created_via_chat=True
            )

            if result["success"]:
                return {
                    "success": True,
                    "message": result["message"],
                    "affected_items": [result["todo"]]
                }
            else:
                return {
                    "success": False,
                    "message": result["message"],
                    "affected_items": []
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to add todo: {str(e)}",
                "affected_items": []
            }

    def _handle_list_todos(self, user_id: UUID) -> Dict[str, Any]:
        """Handle listing todos for a user."""
        try:
            # Use MCP server to list todos
            result = self.mcp_server.list_todos_tool(user_id=user_id)

            if result["success"]:
                todos = result.get("todos", [])

                if not todos:
                    message = "You have no todos yet. Add one by saying something like 'Add buy groceries'."
                else:
                    todo_titles = [todo["title"] for todo in todos]
                    message = f"You have {len(todos)} todo(s): {', '.join(todo_titles[:5])}"  # Show first 5
                    if len(todos) > 5:
                        message += f" and {len(todos) - 5} more."

                return {
                    "success": True,
                    "message": message,
                    "affected_items": todos
                }
            else:
                return {
                    "success": False,
                    "message": result["message"],
                    "affected_items": []
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to list todos: {str(e)}",
                "affected_items": []
            }

    def _handle_complete_todo(self, parameters: Dict[str, Any], user_id: UUID) -> Dict[str, Any]:
        """Handle completing a todo based on parameters."""
        title = parameters.get("todo_title") or parameters.get("potential_title")

        if not title:
            return {
                "success": False,
                "message": "Could not determine which todo to complete. Please specify the todo title.",
                "affected_items": []
            }

        try:
            # Find the todo by title and user
            result = self.mcp_server.get_todo_by_title_tool(title_query=title, user_id=user_id)

            if not result["success"]:
                return {
                    "success": False,
                    "message": result["message"],
                    "affected_items": []
                }

            # Get the todo ID
            todo_id = result["todo"]["id"]

            # Use MCP server to complete the todo
            complete_result = self.mcp_server.complete_todo_tool(todo_id, user_id)

            if complete_result["success"]:
                return {
                    "success": True,
                    "message": complete_result["message"],
                    "affected_items": [complete_result["todo"]]
                }
            else:
                return {
                    "success": False,
                    "message": complete_result["message"],
                    "affected_items": []
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to complete todo: {str(e)}",
                "affected_items": []
            }

    def _handle_delete_todo(self, parameters: Dict[str, Any], user_id: UUID) -> Dict[str, Any]:
        """Handle deleting a todo based on parameters."""
        title = parameters.get("todo_title") or parameters.get("potential_title")
        # Check if the command is for deleting all todos
        is_delete_all = parameters.get("is_delete_all", False)

        # Check if the title contains "all" to indicate bulk deletion
        if title and ("all" in title.lower() and any(word in title.lower() for word in ["todo", "task", "item", "everything"])):
            is_delete_all = True

        if is_delete_all:
            # Delete all todos for the user
            try:
                delete_result = self.mcp_server.delete_all_todos_tool(user_id=user_id)

                if delete_result["success"]:
                    return {
                        "success": True,
                        "message": delete_result["message"],
                        "affected_items": delete_result.get("affected_items", [])
                    }
                else:
                    return {
                        "success": False,
                        "message": delete_result["message"],
                        "affected_items": []
                    }
            except Exception as e:
                return {
                    "success": False,
                    "message": f"Failed to delete all todos: {str(e)}",
                    "affected_items": []
                }

        if not title:
            return {
                "success": False,
                "message": "Could not determine which todo to delete. Please specify the todo title.",
                "affected_items": []
            }

        try:
            # Find the todo by title and user
            result = self.mcp_server.get_todo_by_title_tool(title_query=title, user_id=user_id)

            if not result["success"]:
                return {
                    "success": False,
                    "message": result["message"],
                    "affected_items": []
                }

            # Get the todo ID
            todo_id = result["todo"]["id"]

            # Use MCP server to delete the todo
            delete_result = self.mcp_server.delete_todo_tool(todo_id, user_id)

            if delete_result["success"]:
                return {
                    "success": True,
                    "message": delete_result["message"],
                    "affected_items": [delete_result["todo"]]
                }
            else:
                return {
                    "success": False,
                    "message": delete_result["message"],
                    "affected_items": []
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to delete todo: {str(e)}",
                "affected_items": []
            }

    def _handle_update_todo(self, parameters: Dict[str, Any], user_id: UUID) -> Dict[str, Any]:
        """Handle updating a todo based on parameters."""
        old_title = parameters.get("old_todo_title") or parameters.get("todo_title") or parameters.get("potential_title")
        new_title = parameters.get("new_todo_title")

        if not old_title or not new_title:
            return {
                "success": False,
                "message": "Could not determine what to update. Please specify both the current and new todo titles.",
                "affected_items": []
            }

        try:
            # Find the todo by old title and user
            result = self.mcp_server.get_todo_by_title_tool(title_query=old_title, user_id=user_id)

            if not result["success"]:
                return {
                    "success": False,
                    "message": result["message"],
                    "affected_items": []
                }

            # Get the todo ID
            todo_id = result["todo"]["id"]

            # Use MCP server to update the todo
            update_result = self.mcp_server.update_todo_tool(
                todo_id=todo_id,
                user_id=user_id,
                title=new_title,
                last_modified_by_chat=True
            )

            if update_result["success"]:
                return {
                    "success": True,
                    "message": update_result["message"],
                    "affected_items": [update_result["todo"]]
                }
            else:
                return {
                    "success": False,
                    "message": update_result["message"],
                    "affected_items": []
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to update todo: {str(e)}",
                "affected_items": []
            }

    def _handle_greeting(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle greeting messages."""
        # For all greeting messages, provide the same standard response
        response = "Hello! I'm an AI assistant created by Muhammad Abdul Wahid. I will assist you with your todos."

        return {
            "success": True,
            "message": response,
            "affected_items": []
        }

    def _handle_unknown_question(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle questions that are not related to todo management."""
        question = parameters.get("question", "")

        # Handle common questions
        if any(word in question for word in ["how are you", "how is life", "how is everything", "how is going"]):
            response = "I'm an AI assistant created by Muhammad Abdul Wahid. I can only help with managing your todos. I can help you add, list, complete, or delete tasks. You can say things like 'Add buy groceries', 'Show my todos', 'Complete meeting', or 'Delete all tasks'."
        elif any(word in question for word in ["what is your name", "who created you", "who made you", "tell me about yourself"]):
            response = "I'm an AI assistant created by Muhammad Abdul Wahid. I can only help with managing your todos. I can help you add, list, complete, or delete tasks. You can say things like 'Add buy groceries', 'Show my todos', 'Complete meeting', or 'Delete all tasks'."
        elif any(word in question for word in ["what can you do", "what are your abilities", "what are your functions"]):
            response = "I'm an AI assistant created by Muhammad Abdul Wahid. I can only help with managing your todos. I can help you add, list, complete, or delete tasks. You can say things like 'Add buy groceries', 'Show my todos', 'Complete meeting', or 'Delete all tasks'."
        elif any(word in question for word in ["thank you", "thanks", "appreciate", "grateful"]):
            response = "You're welcome! I'm glad I could help. Is there anything else I can do with your todos?"
        elif any(word in question for word in ["bye", "goodbye", "see you", "farewell", "take care"]):
            response = "Goodbye! Feel free to come back anytime you need help with your todos."
        elif any(word in question for word in ["weather", "temperature", "news", "sports", "politics", "joke", "funny"]):
            response = "I'm an AI assistant created by Muhammad Abdul Wahid. I can only help with managing your todos. I can help you add, list, complete, or delete tasks. You can say things like 'Add buy groceries', 'Show my todos', 'Complete meeting', or 'Delete all tasks'."
        else:
            response = "I'm an AI assistant created by Muhammad Abdul Wahid. I can only help with managing your todos. I can help you add, list, complete, or delete tasks. You can say things like 'Add buy groceries', 'Show my todos', 'Complete meeting', or 'Delete all tasks'."

        return {
            "success": True,
            "message": response,
            "affected_items": []
        }

    def _handle_unknown_intent(self, original_input: str = "") -> Dict[str, Any]:
        """Handle cases where the intent is unknown."""
        # Get fallback response from intent resolver
        fallback_msg = "I'm an AI assistant created by Muhammad Abdul Wahid. I can only help with managing your todos. I can help you add, list, complete, or delete tasks. You can say things like 'Add buy groceries', 'Show my todos', 'Complete meeting', or 'Delete all tasks'."

        return {
            "success": False,
            "message": fallback_msg,
            "affected_items": []
        }

    # The _find_todo_by_title_and_user method is no longer needed since MCP server handles this
    # The MCP server has the get_todo_by_title_tool method that performs the same function

    def _map_intent_to_operation(self, intent_type: 'IntentType') -> OperationType:
        """Map intent type to operation type."""
        intent_str = str(intent_type)
        if 'ADD' in intent_str or 'ADD_TODO' in intent_str:
            return OperationType.CREATE
        elif 'LIST' in intent_str or 'LIST_TODOS' in intent_str:
            return OperationType.READ
        elif 'UPDATE' in intent_str or 'UPDATE_TODO' in intent_str:
            return OperationType.UPDATE
        elif 'DELETE' in intent_str or 'DELETE_TODO' in intent_str:
            return OperationType.DELETE
        elif 'COMPLETE' in intent_str or 'COMPLETE_TODO' in intent_str:
            return OperationType.UPDATE  # Completing is a type of update
        else:
            return OperationType.READ  # Default to read for unknown intents

    def get_chat_history(self, user_id: UUID, limit: int = 20) -> List[ChatInteraction]:
        """Get chat history for a user."""
        statement = select(ChatInteraction).where(
            ChatInteraction.user_id == user_id
        ).order_by(ChatInteraction.timestamp.desc()).limit(limit)

        result = self.session.exec(statement)
        return result.all()