import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, ChevronRight } from 'lucide-react';
import type { ChatMessage as ChatMessageType, Question, VoiceRecording } from '../types/interview';
import ChatMessage from './ChatMessage';
import MockInterviewVoiceRecorder from './MockInterviewVoiceRecorder';

interface ChatInterfaceProps {
  question: Question;
  messages: ChatMessageType[];
  onSendMessage: (message: string) => void;
  onVoiceMessage: (recording: VoiceRecording) => void;
  onNextQuestion: () => void;
  canProceed: boolean;
  currentQuestion: number;
  totalQuestions: number;
  isLoadingResponse?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  question,
  messages,
  onSendMessage,
  onVoiceMessage,
  onNextQuestion,
  canProceed,
  currentQuestion,
  totalQuestions,
  isLoadingResponse = false,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending text message
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle voice recording completion
  const handleVoiceRecordingComplete = (recording: VoiceRecording) => {
    onVoiceMessage(recording);
    setShowVoiceRecorder(false);
  };

  // Handle audio playback
  const handlePlayAudio = (audioUrl: string) => {
    if (currentlyPlayingAudio === audioUrl) {
      // Pause current audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setCurrentlyPlayingAudio(null);
    } else {
      // Play new audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setCurrentlyPlayingAudio(audioUrl);
      }
    }
  };

  // Handle audio end
  useEffect(() => {
    if (audioRef.current) {
      const handleEnded = () => {
        setCurrentlyPlayingAudio(null);
      };
      const handlePause = () => {
        setCurrentlyPlayingAudio(null);
      };
      
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('pause', handlePause);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleEnded);
          audioRef.current.removeEventListener('pause', handlePause);
        }
      };
    }
  }, []);

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Easy': return 'text-success bg-success-50';
      case 'Medium': return 'text-orange-600 bg-orange-50';
      case 'Hard': return 'text-danger bg-danger-50';
      default: return 'text-secondary bg-secondary-50';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-inter shadow-sm">
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      {/* Question Header */}
      <div className="p-4 border-b border-secondary-200" style={{ backgroundColor: '#fff7f1' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-secondary-600">
              Question {currentQuestion} of {totalQuestions}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
          </div>
          <span className="text-xs text-secondary-500 font-medium">
            {question.type}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
          {question.title}
        </h3>
        
        <p className="text-sm text-secondary-700 leading-relaxed">
          {question.description}
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onPlayAudio={handlePlayAudio}
            isAudioPlaying={currentlyPlayingAudio === message.audioUrl}
          />
        ))}
        
        {/* Loading indicator */}
        {isLoadingResponse && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recorder */}
      {showVoiceRecorder && (
        <div className="p-4 border-t border-secondary-200 bg-secondary-50">
          <MockInterviewVoiceRecorder
            onRecordingComplete={handleVoiceRecordingComplete}
            onRecordingStart={() => console.log('Recording started')}
            onRecordingStop={() => console.log('Recording stopped')}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-secondary-200 bg-white">
        <div className="space-y-3">
          {/* Text Input */}
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response..."
                className="w-full p-3 border border-secondary-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={2}
                maxLength={1000}
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoadingResponse}
              className="btn btn-primary"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                className={`btn ${showVoiceRecorder ? 'btn-danger' : 'btn-secondary'}`}
                aria-label={showVoiceRecorder ? 'Hide voice recorder' : 'Show voice recorder'}
              >
                <Mic className="w-4 h-4" />
                {showVoiceRecorder ? 'Hide Voice' : 'Voice Response'}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-xs text-secondary-500">
                {inputMessage.length}/1000
              </div>
              
              {currentQuestion < totalQuestions && (
                <button
                  onClick={onNextQuestion}
                  disabled={!canProceed}
                  className="btn btn-primary"
                  aria-label="Next question"
                >
                  Next Question
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
              
              {currentQuestion === totalQuestions && canProceed && (
                <button
                  onClick={onNextQuestion}
                  className="btn btn-success"
                  aria-label="Complete interview"
                >
                  Complete Interview
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;