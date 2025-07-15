import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API client instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.detail || error.response.data?.message || 'Server error';
      throw new Error(`API Error: ${message}`);
    } else if (error.request) {
      // Request made but no response received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(`Request failed: ${error.message}`);
    }
  }
);

// Chat message interface
export interface ChatMessageRequest {
  content: string;
  session_id?: string;
  question_context?: {
    id: string;
    number: number;
    type: string;
    difficulty: string;
    title: string;
    description: string;
    // Enhanced problem context
    category?: string;
    examples?: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    constraints?: string[];
    hints?: string[];
  };
  code_context?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  audio_url?: string;
  session_id?: string;
}

export interface ChatMessageResponse {
  message: ChatMessage;
  session_id: string;
}

export interface VoiceMessageRequest {
  audio_data: string; // Base64 encoded
  session_id?: string;
  question_context?: any;
}

export interface VoiceMessageResponse {
  transcribed_text: string;
  ai_response: ChatMessage;
  session_id: string;
}

export interface ConversationHistoryResponse {
  session_id: string;
  messages: ChatMessage[];
  context: any;
  message_count: number;
}

// Chat API functions
export class ChatAPI {
  /**
   * Send a text message and get AI response
   */
  static async sendMessage(request: ChatMessageRequest): Promise<ChatMessageResponse> {
    try {
      const response = await apiClient.post<ChatMessageResponse>('/api/v1/chat/message', request);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send a voice message and get AI response
   */
  static async sendVoiceMessage(request: VoiceMessageRequest): Promise<VoiceMessageResponse> {
    try {
      const response = await apiClient.post<VoiceMessageResponse>('/api/v1/chat/voice', request);
      return response.data;
    } catch (error) {
      console.error('Error sending voice message:', error);
      throw error;
    }
  }

  /**
   * Get conversation history for a session
   */
  static async getConversationHistory(sessionId: string): Promise<ConversationHistoryResponse> {
    try {
      const response = await apiClient.get<ConversationHistoryResponse>(`/api/v1/chat/conversation/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation session
   */
  static async createSession(): Promise<{ session_id: string }> {
    try {
      const response = await apiClient.post<{ session_id: string }>('/api/v1/chat/session');
      return response.data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Update session context
   */
  static async updateSessionContext(sessionId: string, contextUpdates: any): Promise<{ message: string }> {
    try {
      const response = await apiClient.put<{ message: string }>(`/api/v1/chat/session/${sessionId}/context`, contextUpdates);
      return response.data;
    } catch (error) {
      console.error('Error updating session context:', error);
      throw error;
    }
  }
}

// Health check function
export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/api/v1/health');
    return response.status === 200;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

export default apiClient;