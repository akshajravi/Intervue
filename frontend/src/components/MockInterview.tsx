import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { 
  InterviewState, 
  Question, 
  ChatMessage, 
  VoiceRecording 
} from '../types/interview';
import InterviewHeader from './InterviewHeader';
import CodeEditor from './CodeEditor';
import ChatInterface from './ChatInterface';
import { ChatAPI, type ChatMessageRequest } from '../api/backend';
import { ProblemService } from '../services/problemService';

const MockInterview: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<Question[]>([]);
  const [interviewState, setInterviewState] = useState<InterviewState>({
    currentQuestion: 1,
    totalQuestions: 5,
    startTime: new Date(),
    isActive: true,
    isRecording: false,
    currentCode: '',
    language: 'python',
    theme: 'dark',
    fontSize: 14,
    messages: [],
  });

  // Initialize session and load problems on component mount
  useEffect(() => {
    const initializeInterview = async () => {
      try {
        // Create backend session
        const response = await ChatAPI.createSession();
        setSessionId(response.session_id);
        console.log('Session created:', response.session_id);

        // Generate random interview questions
        const questions = ProblemService.generateInterviewSet(5);
        setInterviewQuestions(questions);

        // Set up first question
        if (questions.length > 0) {
          const firstQuestion = questions[0];
          const starterCode = ProblemService.getStarterCode(firstQuestion.id, 'python');
          
          setInterviewState(prev => ({
            ...prev,
            currentCode: starterCode,
            totalQuestions: questions.length,
            messages: [
              {
                id: '1',
                type: 'ai',
                content: `Welcome to your mock interview! I'm here to help you practice coding challenges.

For this first question, you'll be working on "${firstQuestion.title}" - ${firstQuestion.difficulty} level ${firstQuestion.problem?.category || 'problem'}.

Please take your time to read through the problem description, understand the requirements, and feel free to ask questions or discuss your approach. You can type your thoughts or use the voice recorder to explain your reasoning.

When you're ready, start implementing the solution in the code editor on the left. Good luck!`,
                timestamp: new Date(Date.now() - 30000),
              }
            ]
          }));
        }
      } catch (error) {
        console.error('Failed to initialize interview:', error);
      }
    };

    initializeInterview();
  }, []);

  // Get current question from the loaded questions
  const currentQuestion = interviewQuestions[interviewState.currentQuestion - 1] || {
    id: 'loading',
    number: 1,
    type: 'Coding Challenge' as const,
    difficulty: 'Easy' as const,
    title: 'Loading...',
    description: 'Loading problem...',
    template: '// Loading...'
  };


  // Handle interview controls
  const handleToggleInterview = () => {
    setInterviewState(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  };

  const handleEndInterview = () => {
    setInterviewState(prev => ({
      ...prev,
      isActive: false
    }));
    // Here you would typically navigate to results or summary page
    console.log('Interview ended');
  };

  // Handle code editor changes
  const handleCodeChange = (code: string) => {
    setInterviewState(prev => ({
      ...prev,
      currentCode: code
    }));
  };

  const handleLanguageChange = (language: 'python' | 'javascript' | 'java' | 'cpp') => {
    // Update language and load appropriate starter code for current question
    const newStarterCode = ProblemService.getStarterCode(currentQuestion.id, language);
    
    setInterviewState(prev => ({
      ...prev,
      language,
      currentCode: newStarterCode
    }));
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setInterviewState(prev => ({
      ...prev,
      theme
    }));
  };

  const handleFontSizeChange = (fontSize: number) => {
    setInterviewState(prev => ({
      ...prev,
      fontSize
    }));
  };

  // Handle chat messages
  const handleSendMessage = async (content: string) => {
    if (!sessionId) {
      console.error('No session ID available');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setInterviewState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));

    setIsLoadingResponse(true);

    try {
      // Prepare request with question and code context
      const request: ChatMessageRequest = {
        content,
        session_id: sessionId,
        question_context: {
          id: currentQuestion.id,
          number: currentQuestion.number,
          type: currentQuestion.type,
          difficulty: currentQuestion.difficulty,
          title: currentQuestion.title,
          description: currentQuestion.description,
          // Enhanced problem context from the JSON database
          category: currentQuestion.problem?.category,
          examples: currentQuestion.problem?.examples,
          constraints: currentQuestion.problem?.constraints,
          hints: currentQuestion.problem?.hints
        },
        code_context: interviewState.currentCode
      };

      // Send message to backend and get AI response
      const response = await ChatAPI.sendMessage(request);
      
      // Convert backend response to frontend ChatMessage format
      const aiMessage: ChatMessage = {
        id: response.message.id,
        type: response.message.type,
        content: response.message.content,
        timestamp: new Date(response.message.timestamp)
      };

      setInterviewState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage]
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error message to user
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.',
        timestamp: new Date()
      };

      setInterviewState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }));
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const handleVoiceMessage = async (recording: VoiceRecording) => {
    if (!sessionId) {
      console.error('No session ID available');
      return;
    }

    const voiceMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `[Voice message - ${recording.duration}s]`,
      timestamp: new Date(),
      audioUrl: recording.url
    };

    setInterviewState(prev => ({
      ...prev,
      messages: [...prev.messages, voiceMessage]
    }));

    setIsLoadingResponse(true);

    try {
      // TODO: Convert recording.url to base64 audio data
      // For now, use placeholder approach
      const placeholder_response = await ChatAPI.sendMessage({
        content: "[User sent a voice message - voice transcription not yet implemented]",
        session_id: sessionId,
        question_context: {
          id: currentQuestion.id,
          number: currentQuestion.number,
          type: currentQuestion.type,
          difficulty: currentQuestion.difficulty,
          title: currentQuestion.title,
          description: currentQuestion.description,
          // Enhanced problem context from the JSON database
          category: currentQuestion.problem?.category,
          examples: currentQuestion.problem?.examples,
          constraints: currentQuestion.problem?.constraints,
          hints: currentQuestion.problem?.hints
        },
        code_context: interviewState.currentCode
      });

      const aiMessage: ChatMessage = {
        id: placeholder_response.message.id,
        type: placeholder_response.message.type,
        content: placeholder_response.message.content,
        timestamp: new Date(placeholder_response.message.timestamp)
      };

      setInterviewState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage]
      }));

    } catch (error) {
      console.error('Error processing voice message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I had trouble processing your voice message. Please try typing your response instead.',
        timestamp: new Date()
      };

      setInterviewState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }));
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const handleNextQuestion = () => {
    if (interviewState.currentQuestion < interviewState.totalQuestions) {
      const nextQuestionNumber = interviewState.currentQuestion + 1;
      const nextQuestion = interviewQuestions[nextQuestionNumber - 1];
      
      if (nextQuestion) {
        // Get the starter code for the current language
        const starterCode = ProblemService.getStarterCode(nextQuestion.id, interviewState.language);
        
        setInterviewState(prev => ({
          ...prev,
          currentQuestion: nextQuestionNumber,
          currentCode: starterCode,
          messages: [
            ...prev.messages,
            {
              id: Date.now().toString(),
              type: 'ai',
              content: `Great work on the previous question! Let's move on to question ${nextQuestionNumber}.

**Problem: ${nextQuestion.title}** (${nextQuestion.difficulty} - ${nextQuestion.problem?.category || 'Coding Challenge'})

${nextQuestion.description}

I've updated the code editor with a fresh template to get you started. Take your time to understand the problem and feel free to ask any questions!`,
              timestamp: new Date()
            }
          ]
        }));
      }
    } else {
      // Complete interview
      handleEndInterview();
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen flex flex-col font-inter"
      style={{ backgroundColor: '#fff7f1' }}
    >
      {/* Header */}
      <InterviewHeader
        currentQuestion={interviewState.currentQuestion}
        totalQuestions={interviewState.totalQuestions}
        question={currentQuestion}
        startTime={interviewState.startTime}
        isActive={interviewState.isActive}
        onToggleInterview={handleToggleInterview}
        onEndInterview={handleEndInterview}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Side - Code Editor */}
        <div className="w-3/5 rounded-lg overflow-hidden">
          <CodeEditor
            code={interviewState.currentCode}
            language={interviewState.language}
            theme={interviewState.theme}
            fontSize={interviewState.fontSize}
            onCodeChange={handleCodeChange}
            onLanguageChange={handleLanguageChange}
            onThemeChange={handleThemeChange}
            onFontSizeChange={handleFontSizeChange}
          />
        </div>

        {/* Right Side - Chat Interface */}
        <div className="w-2/5 rounded-lg overflow-hidden">
          <ChatInterface
            question={currentQuestion}
            messages={interviewState.messages}
            onSendMessage={handleSendMessage}
            onVoiceMessage={handleVoiceMessage}
            onNextQuestion={handleNextQuestion}
            canProceed={interviewState.messages.length > 1} // Allow proceeding after some interaction
            currentQuestion={interviewState.currentQuestion}
            totalQuestions={interviewState.totalQuestions}
            isLoadingResponse={isLoadingResponse}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default MockInterview;