
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'other';
  timestamp: number;
}

export interface ChatRoom {
  id: string;
  messages: ChatMessage[];
  lastActivity: number;
  securityCode?: string;
}
