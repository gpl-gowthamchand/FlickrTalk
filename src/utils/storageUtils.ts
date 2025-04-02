import { ChatMessage, ChatRoom } from "@/types";
import { supabase } from "@/integrations/supabase/client";

const CHAT_STORAGE_PREFIX = 'flickr_talk_room_';
const CHAT_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

export const generateRoomId = (): string => {
  return Math.random().toString(36).substring(2, 8);
};

export const generateSecurityCode = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

export const storeRoom = (roomId: string, room: ChatRoom): void => {
  try {
    localStorage.setItem(`${CHAT_STORAGE_PREFIX}${roomId}`, JSON.stringify(room));
    console.log(`Room stored: ${roomId}`);
  } catch (error) {
    console.error('Error storing chat room:', error);
  }
};

export const getRoom = async (roomId: string): Promise<ChatRoom | null> => {
  try {
    const roomData = localStorage.getItem(`${CHAT_STORAGE_PREFIX}${roomId}`);
    
    if (roomData) {
      const room = JSON.parse(roomData) as ChatRoom;
      
      // Check if room has expired
      if (Date.now() - room.lastActivity > CHAT_EXPIRY_TIME) {
        console.warn(`Room expired: ${roomId}`);
        localStorage.removeItem(`${CHAT_STORAGE_PREFIX}${roomId}`);
        return null;
      }
      
      return room;
    }

    // Attempt to fetch the room from Supabase
    const { data: room, error } = await supabase
      .from('chat_rooms') // Fixed type error by defining the table in Database type
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      console.warn(`Room not found in Supabase: ${roomId}`, error.message);
      return null;
    }

    // Store the room in localStorage for fallback
    if (room) {
      localStorage.setItem(`${CHAT_STORAGE_PREFIX}${roomId}`, JSON.stringify(room));
    }

    return room as ChatRoom;
  } catch (error) {
    console.error(`Error retrieving chat room (${roomId}):`, error);
    return null;
  }
};

export const addMessage = async (roomId: string, message: ChatMessage): Promise<ChatRoom | null> => {
  let room = await getRoom(roomId); // Await the asynchronous call

  if (!room) {
    room = {
      id: roomId,
      messages: [],
      lastActivity: Date.now(),
    };
  }

  room.messages.push(message);
  room.lastActivity = Date.now();

  storeRoom(roomId, room);
  return room;
};

export const createRoom = async (securityCode?: string): Promise<ChatRoom> => {
  const roomId = generateRoomId();
  const room: ChatRoom = {
    id: roomId,
    messages: [],
    lastActivity: Date.now(),
    securityCode,
  };

  try {
    const { error } = await supabase
      .from('chat_rooms') // Fixed type error by defining the table in Database type
      .insert([room]); // Ensure ChatRoom matches Supabase Insert type
    if (error) {
      console.error('Error creating room in Supabase:', error.message);
    } else {
      console.log(`New room created in Supabase: ${roomId}`);
    }
  } catch (err) {
    console.error('Unexpected error creating room in Supabase:', err);
  }

  storeRoom(roomId, room); // Fallback to localStorage
  return room;
};

// Fix async/await issues in getRoomSecurityCode and verifySecurityCode
export const getRoomSecurityCode = async (roomId: string): Promise<string | undefined> => {
  const room = await getRoom(roomId); // Added await
  return room?.securityCode;
};

export const verifySecurityCode = async (roomId: string, code: string): Promise<boolean> => {
  const room = await getRoom(roomId); // Added await
  return room?.securityCode === code;
};

export const cleanupExpiredRooms = (): void => {
  const now = Date.now();
  let cleaned = 0;
  
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(CHAT_STORAGE_PREFIX)) {
      try {
        const roomData = localStorage.getItem(key);
        if (roomData) {
          const room = JSON.parse(roomData) as ChatRoom;
          if (now - room.lastActivity > CHAT_EXPIRY_TIME) {
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      } catch (error) {
        console.error('Error during room cleanup:', error);
      }
    }
  });
  
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} expired room(s)`);
  }
};
