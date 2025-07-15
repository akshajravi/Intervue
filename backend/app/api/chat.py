from fastapi import APIRouter, HTTPException, status
from typing import Optional
import logging

from app.schemas.chat import (
    ChatMessageRequest,
    ChatMessageResponse,
    VoiceMessageRequest,
    VoiceMessageResponse,
    ConversationHistoryResponse,
    ChatMessage,
    MessageType
)
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/message", response_model=ChatMessageResponse)
async def send_message(request: ChatMessageRequest):
    """Send a message and get AI response"""
    try:
        # Generate AI response with enhanced context
        ai_message = await ai_service.generate_ai_response(
            user_message=request.content,
            session_id=request.session_id,
            question_context=request.question_context,  # Already a QuestionContext object from Pydantic
            code_context=request.code_context
        )
        
        return ChatMessageResponse(
            message=ai_message,
            session_id=ai_message.session_id
        )
        
    except Exception as e:
        logger.error(f"Error in send_message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process message: {str(e)}"
        )

@router.post("/voice", response_model=VoiceMessageResponse)
async def send_voice_message(request: VoiceMessageRequest):
    """Process voice message and get AI response"""
    try:
        # Process voice message
        transcribed_text, ai_response = await ai_service.process_voice_message(
            audio_data=request.audio_data,
            session_id=request.session_id
        )
        
        return VoiceMessageResponse(
            transcribed_text=transcribed_text,
            ai_response=ai_response,
            session_id=ai_response.session_id
        )
        
    except Exception as e:
        logger.error(f"Error in send_voice_message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process voice message: {str(e)}"
        )

@router.get("/conversation/{session_id}", response_model=ConversationHistoryResponse)
async def get_conversation_history(session_id: str):
    """Get conversation history for a session"""
    try:
        conversation = ai_service.get_conversation(session_id)
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        return ConversationHistoryResponse(
            session_id=session_id,
            messages=conversation.messages,
            context=conversation.context,
            message_count=len(conversation.messages)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_conversation_history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve conversation history: {str(e)}"
        )

@router.post("/session", response_model=dict)
async def create_session():
    """Create a new conversation session"""
    try:
        session_id = ai_service.get_or_create_session()
        return {"session_id": session_id}
        
    except Exception as e:
        logger.error(f"Error in create_session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create session: {str(e)}"
        )

@router.put("/session/{session_id}/context")
async def update_session_context(session_id: str, context_updates: dict):
    """Update conversation context for a session"""
    try:
        conversation = ai_service.get_conversation(session_id)
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        ai_service.update_session_context(session_id, context_updates)
        
        return {"message": "Context updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_session_context: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update context: {str(e)}"
        )