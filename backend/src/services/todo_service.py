from sqlmodel import Session, select
from typing import List
from datetime import datetime
from uuid import UUID
from ..models.todo import Todo, TodoCreate, TodoUpdate
from ..exceptions import TodoNotFoundException

class TodoService:
    def __init__(self, session: Session):
        self.session = session

    def get_all_todos(self, user_id: UUID) -> List[Todo]:
        """
        Retrieve all todos for a specific user from the database.
        """
        result = self.session.execute(select(Todo).where(Todo.user_id == user_id))
        todos = result.scalars().all()
        return todos

    def create_todo(self, todo_data: TodoCreate, user_id: UUID) -> Todo:
        """
        Create a new todo in the database associated with a specific user.
        """
        try:
            # Create new todo instance with user association
            db_todo = Todo(
                title=getattr(todo_data, 'title', ''),
                description=getattr(todo_data, 'description', None),
                is_completed=getattr(todo_data, 'is_completed', False),
                user_id=user_id
            )

            # Add to database
            self.session.add(db_todo)
            self.session.commit()
            self.session.refresh(db_todo)

            return db_todo
        except Exception as e:
            print(f"Todo creation error: {e}")
            self.session.rollback()
            raise e

    def get_todo_by_id(self, todo_id: UUID, user_id: UUID) -> Todo:
        """
        Retrieve a specific todo by ID for the authenticated user.
        """
        try:
            # First get the todo
            todo = self.session.get(Todo, todo_id)
            if not todo:
                raise TodoNotFoundException()

            # Check if the todo belongs to the user
            if todo.user_id != user_id:
                raise TodoNotFoundException()

            return todo
        except Exception as e:
            print(f"Todo retrieval error: {e}")
            raise e

    def update_todo(self, todo_id: UUID, todo_update: TodoUpdate, user_id: UUID) -> Todo:
        """
        Update an existing todo in the database for the authenticated user.
        """
        # Get the existing todo
        db_todo = self.session.get(Todo, todo_id)
        if not db_todo:
            raise TodoNotFoundException()

        # Check if the todo belongs to the user
        if db_todo.user_id != user_id:
            raise TodoNotFoundException()

        # Update the todo with provided data
        try:
            # Get the data to update, excluding unset values
            update_data = {}
            if hasattr(todo_update, 'title') and todo_update.title is not None:
                update_data['title'] = todo_update.title
            if hasattr(todo_update, 'description') and todo_update.description is not None:
                update_data['description'] = todo_update.description
            if hasattr(todo_update, 'is_completed') and todo_update.is_completed is not None:
                update_data['is_completed'] = todo_update.is_completed

            for key, value in update_data.items():
                setattr(db_todo, key, value)

            # Update timestamp
            db_todo.updated_at = datetime.utcnow()

            # Commit changes
            self.session.add(db_todo)
            self.session.commit()
            self.session.refresh(db_todo)

            return db_todo
        except Exception as e:
            print(f"Todo update error: {e}")
            self.session.rollback()
            raise e

    def delete_todo(self, todo_id: UUID, user_id: UUID) -> bool:
        """
        Delete a specific todo from the database for the authenticated user.
        """
        try:
            # Get the existing todo
            db_todo = self.session.get(Todo, todo_id)
            if not db_todo:
                raise TodoNotFoundException()

            # Check if the todo belongs to the user
            if db_todo.user_id != user_id:
                raise TodoNotFoundException()

            # Delete the todo
            self.session.delete(db_todo)
            self.session.commit()

            return True
        except Exception as e:
            print(f"Todo deletion error: {e}")
            self.session.rollback()
            raise e