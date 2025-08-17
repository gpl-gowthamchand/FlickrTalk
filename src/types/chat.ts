
export interface Message {
  id: string;
  content: string;
  sender: string;
  isMine: boolean;
  timestamp: Date;
  room_id?: string;
}

export interface ChatRoom {
  id: string;
  security_code: string | null;
  created_at: string;
  last_activity: string;
}

// Database types for Supabase
export interface DbMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  room_id: string;
}

export interface DbChatRoom {
  id: string;
  security_code: string | null;
  created_at: string;
  last_activity: string;
}
