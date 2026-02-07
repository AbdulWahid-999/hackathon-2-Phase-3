from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class TodoBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    is_completed: bool = Field(default=False)

    class Config:
        # Allow ORM mode to work with database objects
        from_attributes = True

class Todo(TodoBase, table=True):
    """
    Todo model based on the data model specification.
    Represents a task with title, description, and completion status.
    Each todo is associated with a single user.
    Extended to support chatbot integration.
    """
    __tablename__ = "todo"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: uuid.UUID = Field(foreign_key="users.id")
    # Fields for chatbot integration
    created_via_chat: bool = Field(default=False, description="Whether the todo was created through chat")
    last_modified_by_chat: bool = Field(default=False, description="Whether the last modification was via chat")

    class Config:
        # Allow ORM mode to work with database objects
        from_attributes = True

class TodoCreate(TodoBase):
    class Config:
        # Allow extra fields and arbitrary types for flexibility
        extra = "allow"
        # Allow ORM mode to work with database objects
        from_attributes = True

class TodoRead(TodoBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    user_id: uuid.UUID

    class Config:
        # Allow ORM mode to work with database objects
        from_attributes = True

class TodoUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None

    class Config:
        # Allow extra fields and arbitrary types for flexibility
        extra = "allow"
        # Allow ORM mode to work with database objects
        from_attributes = True