from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
import json

class ChatInteractionBase(SQLModel):
    """Base model for chat interactions"""
    input_text: str = Field(max_length=255, description="The raw natural language input from the user")
    intent_type: str = Field(description="The classified intent from the input", default="UNKNOWN")
    entities_extracted: Optional[str] = Field(description="Parsed entities as JSON string", default=None)  # JSON stored as text
    response_text: str = Field(max_length=1000, description="The system's response to the user")
    status: str = Field(default="PENDING", description="Status of the interaction processing")


class ChatInteraction(ChatInteractionBase, table=True):
    """Chat interaction model with database table configuration"""
    __tablename__ = "chat_interactions"

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(description="Links to the user who initiated the interaction")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When the interaction occurred")
    session_id: Optional[UUID] = Field(default=None, description="Groups related interactions together")

    def set_entities(self, entities: Dict[str, Any]):
        """Helper method to set entities as JSON string"""
        self.entities_extracted = json.dumps(entities)

    def get_entities(self) -> Dict[str, Any]:
        """Helper method to get entities as dictionary"""
        if self.entities_extracted:
            return json.loads(self.entities_extracted)
        return {}

    class Config:
        arbitrary_types_allowed = True