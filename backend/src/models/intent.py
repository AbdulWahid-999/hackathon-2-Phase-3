from sqlmodel import SQLModel, Field
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
import json
from enum import Enum

class IntentType(str, Enum):
    ADD = "ADD_TODO"
    LIST = "LIST_TODOS"
    UPDATE = "UPDATE_TODO"
    DELETE = "DELETE_TODO"
    COMPLETE = "COMPLETE_TODO"
    GREETING = "GREETING"
    UNKNOWN_QUESTION = "UNKNOWN_QUESTION"
    UNKNOWN = "UNKNOWN"


class IntentBase(SQLModel):
    """Base model for intents"""
    type: IntentType = Field(description="The type of action")
    parameters: Optional[str] = Field(description="Parameters as JSON string", default=None)  # JSON stored as text
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Confidence in the intent classification")


class Intent(IntentBase, table=True):
    """Intent model with database table configuration"""
    __tablename__ = "intents"

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    associated_chat_id: UUID = Field(description="Reference to the ChatInteraction that triggered this intent")

    class Config:
        arbitrary_types_allowed = True

    def set_parameters(self, parameters: Dict[str, Any]):
        """Helper method to set parameters as JSON string"""
        self.parameters = json.dumps(parameters)

    def get_parameters(self) -> Dict[str, Any]:
        """Helper method to get parameters as dictionary"""
        if self.parameters:
            return json.loads(self.parameters)
        return {}