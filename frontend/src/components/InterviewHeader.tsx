import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Settings } from 'lucide-react';
import type { Question } from '../types/interview';

interface InterviewHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  question: Question;
  startTime: Date;
  isActive: boolean;
  onToggleInterview: () => void;
  onEndInterview: () => void;
}

const InterviewHeader: React.FC<InterviewHeaderProps> = ({
  currentQuestion,
  totalQuestions,
  question,
  startTime,
  isActive,
  onToggleInterview,
  onEndInterview,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Easy': return 'text-success bg-success-50';
      case 'Medium': return 'text-orange-600 bg-orange-50';
      case 'Hard': return 'text-danger bg-danger-50';
      default: return 'text-secondary bg-secondary-50';
    }
  };

  const getProgressWidth = (): string => {
    return `${(currentQuestion / totalQuestions) * 100}%`;
  };

  return (
    <header className="bg-white border-b border-secondary-200 shadow-sm font-inter">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section - Question Info */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold text-black">
              Question {currentQuestion} of {totalQuestions}
            </div>
            <div className={`px-3 py-1 rounded-md text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </div>
            <div className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-md text-sm font-medium">
              {question.type}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-32 bg-secondary-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: getProgressWidth() }}
            />
          </div>
        </div>

        {/* Right Section - Timer and Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="text-xl font-mono font-bold text-secondary-700">
              {formatTime(elapsedTime)}
            </div>
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-success animate-pulse' : 'bg-secondary-300'}`} />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleInterview}
              className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'}`}
              aria-label={isActive ? 'Pause Interview' : 'Start Interview'}
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            
            <button
              onClick={onEndInterview}
              className="btn btn-danger"
              aria-label="End Interview"
            >
              <Square className="w-4 h-4" />
            </button>
            
            <button
              className="btn btn-secondary"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default InterviewHeader;