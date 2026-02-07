from sqlmodel import SQLModel, Field
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum


class OperationType(str, Enum):
    CREATE = "CREATE"
    READ = "READ"
    UPDATE = "UPDATE"
    DELETE = "DELETE"


class TodoOperationBase(SQLModel):
    """Base model for todo operations"""
    operation_type: OperationType = Field(description="The type of database operation")
    intent_id: UUID = Field(description="Reference to the Intent that triggered this operation")
    status: str = Field(default="PENDING", description="Status of the operation")
    result_message: Optional[str] = Field(default=None, max_length=500, description="Description of the result")


class TodoOperation(TodoOperationBase, table=True):
    """Todo operation model with database table configuration"""
    __tablename__ = "todo_operations"

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    todo_ids_affected: Optional[str] = Field(description="IDs of affected todo items as JSON string", default=None)  # JSON stored as text
    execution_time: Optional[datetime] = Field(default_factory=datetime.utcnow, description="When the operation was executed")

    class Config:
        arbitrary_types_allowed = True

    def set_todo_ids_affected(self, todo_ids: List[UUID]):
        """Helper method to set todo IDs as JSON string"""
        import json
        self.todo_ids_affected = json.dumps([str(todo_id) for todo_id in todo_ids])

    def get_todo_ids_affected(self) -> List[UUID]:
        """Helper method to get todo IDs as list"""
        import json
        if self.todo_ids_affected:
            return [UUID(id_str) for id_str in json.loads(self.todo_ids_affected)]
        return []