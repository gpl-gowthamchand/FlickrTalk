
import { ChatMessage, ChatRoom } from "@/types";

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

export const getRoom = (roomId: string): ChatRoom | null => {
  try {
    const roomData = localStorage.getItem(`${CHAT_STORAGE_PREFIX}${roomId}`);
    
    if (!roomData) {
      console.log(`Room not found: ${roomId}`);
      return null;
    }
    
    const room = JSON.parse(roomData) as ChatRoom;
    
    // Check if room has expired
    if (Date.now() - room.lastActivity > CHAT_EXPIRY_TIME) {
      console.log(`Room expired: ${roomId}`);
      localStorage.removeItem(`${CHAT_STORAGE_PREFIX}${roomId}`);
      return null;
    }
    
    return room;
  } catch (error) {
    console.error('Error retrieving chat room:', error);
    return null;
  }
};

export const addMessage = (roomId: string, message: ChatMessage): ChatRoom => {
  let room = getRoom(roomId);
  
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

export const createRoom = (securityCode?: string): ChatRoom => {
  const roomId = generateRoomId();
  const room: ChatRoom = {
    id: roomId,
    messages: [],
    lastActivity: Date.now(),
    securityCode
  };
  
  storeRoom(roomId, room);
  console.log(`New room created: ${roomId}`);
  return room;
};

export const getRoomSecurityCode = (roomId: string): string | undefined => {
  const room = getRoom(roomId);
  return room?.securityCode;
};

export const verifySecurityCode = (roomId: string, code: string): boolean => {
  const room = getRoom(roomId);
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
