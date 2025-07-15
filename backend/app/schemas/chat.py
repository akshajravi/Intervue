from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum

class MessageType(str, Enum):
    USER = "user"
    AI = "ai"

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class ChatMessage(BaseModel):
    id: str
    type: MessageType
    content: str
    timestamp: datetime
    audio_url: Optional[str] = None
    session_id: Optional[str] = None

class ProblemExample(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = None

class QuestionContext(BaseModel):
    id: str
    number: int
    type: str
    difficulty: str
    title: str
    description: str
    # Enhanced problem context
    category: Optional[str] = None
    examples: Optional[List[ProblemExample]] = None
    constraints: Optional[List[str]] = None
    hints: Optional[List[str]] = None

class ChatMessageRequest(BaseModel):
    content: str
    session_id: Optional[str] = None
    question_context: Optional[QuestionContext] = None
    code_context: Optional[str] = None

class ChatMessageResponse(BaseModel):
    message: ChatMessage
    session_id: str

class VoiceMessageRequest(BaseModel):
    audio_data: str  # Base64 encoded audio data
    session_id: Optional[str] = None
    question_context: Optional[dict] = None

class VoiceMessageResponse(BaseModel):
    transcribed_text: str
    ai_response: ChatMessage
    session_id: str

class ConversationContext(BaseModel):
    current_question: Optional[dict] = None
    question_number: int = 1
    total_questions: int = 5
    interview_type: str = "mock_interview"
    user_code: Optional[str] = None
    programming_language: str = "python"

class ConversationSession(BaseModel):
    session_id: str
    messages: List[ChatMessage] = []
    context: ConversationContext
    created_at: datetime
    updated_at: datetime

class ConversationHistoryResponse(BaseModel):
    session_id: str
    messages: List[ChatMessage]
    context: ConversationContext
    message_count: int