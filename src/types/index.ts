
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'other';
  timestamp: number;
  displayName?: string;
}

export interface ChatRoom {
  id: string;
  messages: ChatMessage[];
  lastActivity: number;
  securityCode?: string;
}
