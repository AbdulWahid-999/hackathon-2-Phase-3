from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid


class UserBase(SQLModel):
    email: str = Field(unique=True, nullable=False)
    is_active: bool = Field(default=True)

    class Config:
        # Allow ORM mode to work with database objects
        from_attributes = True


class User(UserBase, table=True):
    """
    User model based on the data model specification.
    Represents an authenticated user with email, password hash, and account metadata.
    Each user has exclusive access to their own todos.
    """
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    password_hash: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        # Allow ORM mode to work with database objects
        from_attributes = True


class UserCreate(SQLModel):
    email: str = Field(unique=True, nullable=False)
    password: str = Field(min_length=1, max_length=72)

    class Config:
        # Allow ORM mode to work with database objects
        from_attributes = True


class UserRead(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        # Allow ORM mode to work with database objects
        from_attributes = True


class UserUpdate(SQLModel):
    email: Optional[str] = None
    is_active: Optional[bool] = None

    class Config:
        # Allow ORM mode to work with database objects
        from_attributes = True