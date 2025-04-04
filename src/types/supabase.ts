
export type ChatRoomRecord = {
  id: string;
  created_at: string;
  last_activity: string;
  security_code: string | null;
};

export type ChatMessageRecord = {
  id: string;
  room_id: string;
  content: string;
  sender: string;
  timestamp: number;
  created_at: string;
  display_name?: string;
};

export type Database = {
  public: {
    Tables: {
      chat_rooms: {
        Row: ChatRoomRecord;
        Insert: Omit<ChatRoomRecord, 'created_at'>;
        Update: Partial<Omit<ChatRoomRecord, 'created_at'>>;
      };
      chat_messages: {
        Row: ChatMessageRecord;
        Insert: Omit<ChatMessageRecord, 'created_at'>;
        Update: Partial<Omit<ChatMessageRecord, 'created_at'>>;
      };
    };
  };
};
