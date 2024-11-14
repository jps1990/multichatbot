export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'image' | 'error';
  timestamp: number;
}

export interface Conversation {
  id: number;
  title: string;
  messages: Message[];
}

export interface ApiKeys {
  openai: string;
  anthropic: string;
  cohere: string;
}

export interface ApiResponse {
  content: string;
  type: 'text' | 'image' | 'error';
}