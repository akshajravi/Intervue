import React from 'react';
import { Bot, User, Play, Pause } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../types/interview';

interface ChatMessageProps {
  message: ChatMessageType;
  onPlayAudio?: (audioUrl: string) => void;
  isAudioPlaying?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onPlayAudio,
  isAudioPlaying = false,
}) => {
  const isAI = message.type === 'ai';
  
  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4 font-inter`}>
      <div className={`flex max-w-[80%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isAI ? 'mr-3' : 'ml-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isAI 
              ? 'bg-primary text-white' 
              : 'bg-secondary-100 text-secondary-700'
          }`}>
            {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
          {/* Message Bubble */}
          <div className={`relative px-4 py-2 rounded-lg max-w-full break-words ${
            isAI 
              ? 'bg-white border border-secondary-200 text-secondary-900' 
              : 'bg-primary text-white'
          }`}>
            {/* Message Text */}
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>

            {/* Audio Controls */}
            {message.audioUrl && (
              <div className="flex items-center mt-2 pt-2 border-t border-secondary-200">
                <button
                  onClick={() => onPlayAudio?.(message.audioUrl!)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    isAI
                      ? 'bg-secondary-50 text-secondary-700 hover:bg-secondary-100'
                      : 'bg-primary-700 text-white hover:bg-primary-600'
                  }`}
                  aria-label={isAudioPlaying ? 'Pause audio' : 'Play audio'}
                >
                  {isAudioPlaying ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                  <span>{isAudioPlaying ? 'Pause' : 'Play'}</span>
                </button>
              </div>
            )}

            {/* Speech Bubble Tail */}
            <div className={`absolute top-3 ${
              isAI 
                ? 'left-0 transform -translate-x-2' 
                : 'right-0 transform translate-x-2'
            }`}>
              <div className={`w-0 h-0 ${
                isAI
                  ? 'border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-white'
                  : 'border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-primary'
              }`} />
            </div>
          </div>

          {/* Timestamp */}
          <div className={`text-xs text-secondary-500 mt-1 ${
            isAI ? 'text-left' : 'text-right'
          }`}>
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;