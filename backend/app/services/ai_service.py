import uuid
from datetime import datetime
from typing import List, Dict, Optional, Any
from openai import AsyncOpenAI
import logging

from app.core.config import settings
from app.schemas.chat import (
    ChatMessage, 
    MessageType, 
    ConversationContext,
    ConversationSession,
    QuestionContext
)

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OpenAI API key not configured")
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.conversations: Dict[str, ConversationSession] = {}
    
    def get_or_create_session(self, session_id: Optional[str] = None) -> str:
        """Get existing session or create new one"""
        if session_id and session_id in self.conversations:
            return session_id
        
        new_session_id = str(uuid.uuid4())
        self.conversations[new_session_id] = ConversationSession(
            session_id=new_session_id,
            messages=[],
            context=ConversationContext(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        return new_session_id
    
    def get_conversation(self, session_id: str) -> Optional[ConversationSession]:
        """Get conversation by session ID"""
        return self.conversations.get(session_id)
    
    def add_message_to_session(self, session_id: str, message: ChatMessage):
        """Add message to conversation session"""
        if session_id in self.conversations:
            self.conversations[session_id].messages.append(message)
            self.conversations[session_id].updated_at = datetime.now()
    
    def update_session_context(self, session_id: str, context_updates: Dict[str, Any]):
        """Update conversation context"""
        if session_id in self.conversations:
            session = self.conversations[session_id]
            for key, value in context_updates.items():
                if hasattr(session.context, key):
                    setattr(session.context, key, value)
            session.updated_at = datetime.now()
    
    def build_interview_system_prompt(self, context: ConversationContext, question_context=None) -> str:
        """Build system prompt for interview context with problem-specific details"""
        base_prompt = f"""You are an experienced technical interviewer conducting a mock interview. 

Current context:
- Question {context.question_number} of {context.total_questions}
- Programming language: {context.programming_language}
- Interview type: {context.interview_type}"""

        # Add problem-specific context if available
        if question_context and hasattr(question_context, 'title'):
            base_prompt += f"""

Current Problem: {question_context.title} ({question_context.difficulty})"""
            
            if hasattr(question_context, 'category') and question_context.category:
                base_prompt += f"""
- Category: {question_context.category}"""
            
            if hasattr(question_context, 'examples') and question_context.examples:
                base_prompt += f"""
- Examples available: {len(question_context.examples)} test cases"""
                # Include first example for reference
                if question_context.examples:
                    first_example = question_context.examples[0]
                    base_prompt += f"""
- Sample: Input {first_example.input} → Output {first_example.output}"""
            
            if hasattr(question_context, 'constraints') and question_context.constraints:
                base_prompt += f"""
- Key constraints: {len(question_context.constraints)} requirements to consider"""
            
            if hasattr(question_context, 'hints') and question_context.hints:
                base_prompt += f"""
- Available hints: {len(question_context.hints)} strategic hints (use sparingly when stuck)"""

        base_prompt += """

Your role:
1. Ask clarifying questions about the problem
2. Guide the candidate through their thought process
3. Reference specific examples and constraints when relevant
4. Provide hints if they're stuck (but don't give away the solution)
5. Comment on their approach and suggest improvements
6. Ask about time/space complexity
7. Be encouraging but honest about their performance

Communication style:
- Be conversational and supportive
- Ask one question at a time
- Keep responses concise (2-3 sentences typically)
- Reference specific examples when helpful ("Looking at the example where...")
- Mention constraints when relevant ("Remember the constraint that...")
- Use problem category to guide suggestions (e.g., "This is an Arrays problem - consider...")
- If they're coding, focus on their approach and logic
- If it's a behavioral question, use the STAR method for evaluation

Remember: You're helping them practice, so be constructive and educational. Use the problem's examples, constraints, and hints strategically to provide targeted guidance."""

        return base_prompt

    def prepare_conversation_history(self, session: ConversationSession, question_context=None) -> List[Dict[str, str]]:
        """Convert conversation history to OpenAI format"""
        messages = [
            {
                "role": "system",
                "content": self.build_interview_system_prompt(session.context, question_context)
            }
        ]
        
        # Add conversation history
        for msg in session.messages:
            role = "user" if msg.type == MessageType.USER else "assistant"
            messages.append({
                "role": role,
                "content": msg.content
            })
        
        return messages

    async def generate_ai_response(
        self, 
        user_message: str, 
        session_id: str,
        question_context: Optional[QuestionContext] = None,
        code_context: Optional[str] = None
    ) -> ChatMessage:
        """Generate AI response using OpenAI"""
        try:
            # Get or create session
            session_id = self.get_or_create_session(session_id)
            session = self.conversations[session_id]
            
            # Update context if provided
            if question_context:
                self.update_session_context(session_id, {
                    "current_question": question_context
                })
            
            if code_context:
                self.update_session_context(session_id, {
                    "user_code": code_context
                })
            
            # Create user message
            user_msg = ChatMessage(
                id=str(uuid.uuid4()),
                type=MessageType.USER,
                content=user_message,
                timestamp=datetime.now(),
                session_id=session_id
            )
            
            # Add to session
            self.add_message_to_session(session_id, user_msg)
            
            # Prepare messages for OpenAI with enhanced context
            messages = self.prepare_conversation_history(session, question_context)
            
            # Add current user message
            messages.append({
                "role": "user",
                "content": user_message
            })
            
            # Add enhanced problem context if available
            if question_context:
                context_details = []
                
                if question_context.examples:
                    context_details.append(f"Problem examples:")
                    for i, example in enumerate(question_context.examples[:2], 1):  # Limit to first 2 examples
                        context_details.append(f"Example {i}: Input {example.input} → Output {example.output}")
                        if example.explanation:
                            context_details.append(f"Explanation: {example.explanation}")
                
                if question_context.constraints:
                    context_details.append(f"Constraints:")
                    for constraint in question_context.constraints:
                        context_details.append(f"- {constraint}")
                
                if question_context.hints:
                    context_details.append(f"Available hints (use strategically):")
                    for i, hint in enumerate(question_context.hints, 1):
                        context_details.append(f"Hint {i}: {hint}")
                
                if context_details:
                    messages.append({
                        "role": "user",
                        "content": f"Problem context:\n" + "\n".join(context_details)
                    })
            
            # Add code context if available
            if code_context:
                messages.append({
                    "role": "user", 
                    "content": f"Current code I'm working on:\n```{session.context.programming_language}\n{code_context}\n```"
                })
            
            # Make OpenAI API call
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.7,
                max_tokens=500,
                presence_penalty=0.1,
                frequency_penalty=0.1
            )
            
            ai_content = response.choices[0].message.content
            
            # Create AI message
            ai_message = ChatMessage(
                id=str(uuid.uuid4()),
                type=MessageType.AI,
                content=ai_content,
                timestamp=datetime.now(),
                session_id=session_id
            )
            
            # Add to session
            self.add_message_to_session(session_id, ai_message)
            
            logger.info(f"Generated AI response for session {session_id}")
            return ai_message
            
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            # Return fallback response
            return ChatMessage(
                id=str(uuid.uuid4()),
                type=MessageType.AI,
                content="I apologize, but I'm having trouble processing your message right now. Could you please try again?",
                timestamp=datetime.now(),
                session_id=session_id or self.get_or_create_session()
            )

    async def process_voice_message(
        self, 
        audio_data: str, 
        session_id: Optional[str] = None
    ) -> tuple[str, ChatMessage]:
        """Process voice message - transcribe and generate response"""
        # TODO: Implement voice transcription using Azure Speech Services
        # For now, return placeholder
        transcribed_text = "[Voice message processed - transcription not yet implemented]"
        
        # Generate AI response to the transcribed text
        ai_response = await self.generate_ai_response(
            transcribed_text,
            session_id or self.get_or_create_session()
        )
        
        return transcribed_text, ai_response

# Global AI service instance
ai_service = AIService()