import { ChatMessage, ChatRoom } from "@/types";
import { supabase } from "@/integrations/supabase/client";

const CHAT_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

export const generateRoomId = (): string => {
  return Math.random().toString(36).substring(2, 8);
};

export const generateSecurityCode = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

export const storeRoom = async (roomId: string, room: ChatRoom): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_rooms')
      .upsert(room, { onConflict: 'id' }); // Upsert ensures the room is updated if it already exists

    if (error) {
      console.error('Error storing chat room in Supabase:', error.message);
    } else {
      console.log(`Room stored in Supabase: ${roomId}`);
    }
  } catch (error) {
    console.error('Error storing chat room:', error);
  }
};

export const getRoom = async (roomId: string): Promise<ChatRoom | null> => {
  try {
    console.log(`Fetching room from Supabase: ${roomId}`);
    const { data: room, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      console.warn(`Room not found in Supabase: ${roomId}`, error.message);
      return null;
    }

    // Check if the room has expired
    if (Date.now() - room.lastActivity > CHAT_EXPIRY_TIME) {
      console.warn(`Room expired in Supabase: ${roomId}`);
      await supabase.from('chat_rooms').delete().eq('id', roomId); // Remove expired room
      return null;
    }

    console.log(`Room successfully fetched from Supabase: ${JSON.stringify(room)}`);
    return room as ChatRoom;
  } catch (error) {
    console.error(`Error retrieving chat room (${roomId}):`, error);
    return null;
  }
};

export const addMessage = async (roomId: string, message: ChatMessage): Promise<ChatRoom | null> => {
  const room = await getRoom(roomId);

  if (!room) {
    console.warn(`Room not found: ${roomId}`);
    return null;
  }

  room.messages.push(message);
  room.lastActivity = Date.now();

  await storeRoom(roomId, room); // Update the room in Supabase
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
    console.log(`Attempting to create room in Supabase: ${JSON.stringify(room)}`);

    // Add a timeout for the Supabase request
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

    const { error } = await supabase
      .from('chat_rooms')
      .insert([room]) // Removed the 'returning' option
      .abortSignal(controller.signal);

    clearTimeout(timeout);

    if (error) {
      console.error('Error creating room in Supabase:', error.message);
      throw new Error('Failed to create room in Supabase');
    }

    console.log(`Room successfully created in Supabase: ${roomId}`);
    return room;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('Supabase request timed out while creating room.');
    } else {
      console.error('Unexpected error creating room in Supabase:', err);
    }
    throw err; // Ensure the error is propagated to the caller
  }
};

export const getRoomSecurityCode = async (roomId: string): Promise<string | undefined> => {
  const room = await getRoom(roomId);
  return room?.securityCode;
};

export const verifySecurityCode = async (roomId: string, code: string): Promise<boolean> => {
  const room = await getRoom(roomId);
  return room?.securityCode === code;
};

export const cleanupExpiredRooms = async (): Promise<void> => {
  try {
    const now = Date.now();
    const { data: rooms, error } = await supabase
      .from('chat_rooms')
      .select('*');

    if (error) {
      console.error('Error fetching rooms for cleanup:', error.message);
      return;
    }

    const expiredRooms = rooms?.filter((room: ChatRoom) => now - room.lastActivity > CHAT_EXPIRY_TIME);

    if (expiredRooms?.length) {
      const expiredRoomIds = expiredRooms.map((room) => room.id);
      await supabase.from('chat_rooms').delete().in('id', expiredRoomIds);
      console.log(`Cleaned up ${expiredRoomIds.length} expired room(s)`);
    }
  } catch (error) {
    console.error('Error during room cleanup:', error);
  }
};
