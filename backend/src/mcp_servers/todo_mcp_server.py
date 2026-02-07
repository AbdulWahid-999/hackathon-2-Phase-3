"""
MCP Server for Todo Operations

This module defines the MCP (Model-Controller-Protocol) server for todo operations
used by the AI chatbot. Each tool corresponds to a specific todo operation and
follows the deterministic, stateless principles required by the constitution.
"""

from typing import Dict, Any, List, Optional
from sqlmodel import Session, select
from uuid import UUID
from ..models.todo import Todo, TodoCreate, TodoUpdate
from ..models.user import User
from ..services.todo_service import TodoService


class TodoMCPServer:
    """
    MCP Server for handling todo operations.

    Provides stateless, single-responsibility tools for each todo operation
    as required by the constitution. Each tool persists changes to the database.
    """

    def __init__(self, session: Session):
        self.session = session
        self.todo_service = TodoService(session)

    def create_todo_tool(self, title: str, description: Optional[str] = None,
                         user_id: UUID = None, created_via_chat: bool = True) -> Dict[str, Any]:
        """
        MCP tool for creating new todos.

        Args:
            title: Title of the new todo
            description: Optional description for the new todo
            user_id: ID of the user creating the todo
            created_via_chat: Flag indicating if the todo was created via chat

        Returns:
            Dictionary with operation result
        """
        if not title or not user_id:
            return {
                "success": False,
                "message": "Title and user_id are required to create a todo",
                "todo": None
            }

        # Validate user exists
        user = self.session.get(User, user_id)
        if not user:
            return {
                "success": False,
                "message": "User not found",
                "todo": None
            }

        # Create todo data
        todo_create_data = TodoCreate(
            title=title,
            description=description,
            created_via_chat=created_via_chat
        )

        try:
            # Use the todo service to create the todo
            new_todo = self.todo_service.create_todo(todo_create_data, user_id)

            return {
                "success": True,
                "message": f"Todo '{new_todo.title}' created successfully",
                "todo": {
                    "id": str(new_todo.id),
                    "title": new_todo.title,
                    "description": new_todo.description,
                    "is_completed": new_todo.is_completed,
                    "user_id": str(new_todo.user_id),
                    "created_via_chat": new_todo.created_via_chat
                }
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to create todo: {str(e)}",
                "todo": None
            }

    def list_todos_tool(self, user_id: UUID) -> Dict[str, Any]:
        """
        MCP tool for listing todos.

        Args:
            user_id: ID of the user whose todos to list

        Returns:
            Dictionary with list of todos
        """
        try:
            # Use the todo service to get all todos for the user
            todos = self.todo_service.get_all_todos(user_id)

            todo_list = []
            for todo in todos:
                todo_list.append({
                    "id": str(todo.id),
                    "title": todo.title,
                    "description": todo.description,
                    "is_completed": todo.is_completed,
                    "user_id": str(todo.user_id),
                    "created_via_chat": todo.created_via_chat
                })

            return {
                "success": True,
                "message": f"Found {len(todo_list)} todos for user",
                "todos": todo_list
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to list todos: {str(e)}",
                "todos": []
            }

    def complete_todo_tool(self, todo_id: UUID, user_id: UUID) -> Dict[str, Any]:
        """
        MCP tool for completing todos.

        Args:
            todo_id: ID of the todo to complete
            user_id: ID of the user who owns the todo

        Returns:
            Dictionary with operation result
        """
        try:
            # First verify that the todo belongs to the user
            todo = self.session.get(Todo, todo_id)
            if not todo:
                return {
                    "success": False,
                    "message": "Todo not found",
                    "todo": None
                }

            if todo.user_id != user_id:
                return {
                    "success": False,
                    "message": "You can only modify your own todos",
                    "todo": None
                }

            # Update the todo as completed
            todo_update_data = TodoUpdate(is_completed=True)
            updated_todo = self.todo_service.update_todo(todo_id, todo_update_data, user_id)

            return {
                "success": True,
                "message": f"Todo '{updated_todo.title}' marked as completed",
                "todo": {
                    "id": str(updated_todo.id),
                    "title": updated_todo.title,
                    "description": updated_todo.description,
                    "is_completed": updated_todo.is_completed,
                    "user_id": str(updated_todo.user_id),
                    "created_via_chat": updated_todo.created_via_chat
                }
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to complete todo: {str(e)}",
                "todo": None
            }

    def delete_todo_tool(self, todo_id: UUID, user_id: UUID) -> Dict[str, Any]:
        """
        MCP tool for deleting todos.

        Args:
            todo_id: ID of the todo to delete
            user_id: ID of the user who owns the todo

        Returns:
            Dictionary with operation result
        """
        try:
            # First verify that the todo belongs to the user
            todo = self.session.get(Todo, todo_id)
            if not todo:
                return {
                    "success": False,
                    "message": "Todo not found",
                    "todo": None
                }

            if todo.user_id != user_id:
                return {
                    "success": False,
                    "message": "You can only delete your own todos",
                    "todo": None
                }

            # Delete the todo
            self.todo_service.delete_todo(todo_id, user_id)

            return {
                "success": True,
                "message": f"Todo '{todo.title}' deleted successfully",
                "todo": {
                    "id": str(todo.id),
                    "title": todo.title,
                    "description": todo.description,
                    "is_completed": todo.is_completed,
                    "user_id": str(todo.user_id),
                    "created_via_chat": todo.created_via_chat
                }
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to delete todo: {str(e)}",
                "todo": None
            }

    def delete_all_todos_tool(self, user_id: UUID) -> Dict[str, Any]:
        """
        MCP tool for deleting all todos for a user.

        Args:
            user_id: ID of the user whose todos to delete

        Returns:
            Dictionary with operation result
        """
        try:
            # First get all todos for the user to return as affected items
            todos = self.todo_service.get_all_todos(user_id)

            # Delete all todos for the user
            from sqlmodel import select
            from ..models.todo import Todo
            statement = select(Todo).where(Todo.user_id == user_id)
            result = self.session.execute(statement)
            todos_to_delete = result.scalars().all()

            # Delete each todo
            deleted_count = 0
            for todo in todos_to_delete:
                self.session.delete(todo)
                deleted_count += 1

            self.session.commit()

            # Convert todos to affected items format
            affected_items = []
            for todo in todos_to_delete:
                affected_items.append({
                    "id": str(todo.id),
                    "title": todo.title,
                    "description": todo.description,
                    "is_completed": todo.is_completed,
                    "user_id": str(todo.user_id),
                    "created_via_chat": todo.created_via_chat
                })

            return {
                "success": True,
                "message": f"All {deleted_count} todos deleted successfully",
                "deleted_count": deleted_count,
                "affected_items": affected_items
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to delete all todos: {str(e)}",
                "deleted_count": 0,
                "affected_items": []
            }

    def update_todo_tool(self, todo_id: UUID, user_id: UUID,
                         title: Optional[str] = None,
                         description: Optional[str] = None,
                         is_completed: Optional[bool] = None,
                         last_modified_by_chat: bool = True) -> Dict[str, Any]:
        """
        MCP tool for updating todos.

        Args:
            todo_id: ID of the todo to update
            user_id: ID of the user who owns the todo
            title: New title (optional)
            description: New description (optional)
            is_completed: New completion status (optional)
            last_modified_by_chat: Flag to indicate if modified via chat

        Returns:
            Dictionary with operation result
        """
        try:
            # First verify that the todo belongs to the user
            todo = self.session.get(Todo, todo_id)
            if not todo:
                return {
                    "success": False,
                    "message": "Todo not found",
                    "todo": None
                }

            if todo.user_id != user_id:
                return {
                    "success": False,
                    "message": "You can only modify your own todos",
                    "todo": None
                }

            # Prepare update data
            update_data = TodoUpdate()
            if title is not None:
                update_data.title = title
            if description is not None:
                update_data.description = description
            if is_completed is not None:
                update_data.is_completed = is_completed
            # We'll update the last_modified_by_chat field separately if needed

            # Update the todo
            updated_todo = self.todo_service.update_todo(todo_id, update_data, user_id)

            # Update the last_modified_by_chat field directly in the database
            if last_modified_by_chat:
                todo.last_modified_by_chat = True
                self.session.add(todo)
                self.session.commit()

            return {
                "success": True,
                "message": f"Todo '{updated_todo.title}' updated successfully",
                "todo": {
                    "id": str(updated_todo.id),
                    "title": updated_todo.title,
                    "description": updated_todo.description,
                    "is_completed": updated_todo.is_completed,
                    "user_id": str(updated_todo.user_id),
                    "created_via_chat": updated_todo.created_via_chat,
                    "last_modified_by_chat": last_modified_by_chat
                }
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to update todo: {str(e)}",
                "todo": None
            }

    def get_todo_by_title_tool(self, title_query: str, user_id: UUID) -> Dict[str, Any]:
        """
        MCP tool for getting a todo by partial title match.

        Args:
            title_query: Part of the title to search for
            user_id: ID of the user who owns the todos

        Returns:
            Dictionary with the matched todo or None
        """
        try:
            # Search for todos that contain the query in their title
            statement = select(Todo).where(
                Todo.user_id == user_id,
                Todo.title.ilike(f"%{title_query}%")  # Case-insensitive partial match
            )
            todos = self.session.execute(statement).scalars().all()

            # Return the first match
            if todos:
                todo = todos[0]  # Take the first match as closest
                return {
                    "success": True,
                    "message": f"Found todo matching '{title_query}'",
                    "todo": {
                        "id": str(todo.id),
                        "title": todo.title,
                        "description": todo.description,
                        "is_completed": todo.is_completed,
                        "user_id": str(todo.user_id),
                        "created_via_chat": todo.created_via_chat
                    }
                }
            else:
                return {
                    "success": False,
                    "message": f"No todo found with title containing '{title_query}'",
                    "todo": None
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to find todo by title: {str(e)}",
                "todo": None
            }