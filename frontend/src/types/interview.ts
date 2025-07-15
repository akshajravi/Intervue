export interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface StarterCode {
  python: string;
  javascript: string;
  java: string;
  cpp: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  examples: Example[];
  constraints: string[];
  hints: string[];
  starter_code: StarterCode;
}

export interface Question {
  id: string;
  number: number;
  type: 'Coding Challenge' | 'System Design' | 'Behavioral';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  title: string;
  description: string;
  template?: string;
  problem?: Problem; // Reference to the full problem data
}

export interface InterviewState {
  currentQuestion: number;
  totalQuestions: number;
  startTime: Date;
  isActive: boolean;
  isRecording: boolean;
  currentCode: string;
  language: 'python' | 'javascript' | 'java' | 'cpp';
  theme: 'light' | 'dark';
  fontSize: number;
  messages: ChatMessage[];
}

export interface VoiceRecording {
  blob: Blob;
  url: string;
  duration: number;
}