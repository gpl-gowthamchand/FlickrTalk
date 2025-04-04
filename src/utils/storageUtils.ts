
import { ChatMessage, ChatRoom } from "@/types";
import { supabase } from "@/integrations/supabase/client-typed";
import { ChatRoomRecord, ChatMessageRecord } from "@/types/supabase";

const CHAT_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

export const generateRoomId = (): string => {
  return Math.random().toString(36).substring(2, 8);
};

export const generateSecurityCode = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

export const storeRoom = async (roomId: string, room: ChatRoom): Promise<void> => {
  try {
    // Insert or update the room in Supabase
    const { error } = await supabase
      .from('chat_rooms')
      .upsert({
        id: roomId,
        last_activity: new Date().toISOString(),
        security_code: room.securityCode
      });
    
    if (error) throw error;
    console.log(`Room stored: ${roomId}`);
  } catch (error) {
    console.error('Error storing chat room:', error);
  }
};

export const getRoom = async (roomId: string): Promise<ChatRoom | null> => {
  try {
    // Get the room from Supabase
    const { data: roomData, error: roomError } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    
    if (roomError || !roomData) {
      console.log(`Room not found: ${roomId}`);
      return null;
    }
    
    // Check if room has expired (client-side check as backup)
    const lastActivity = new Date(roomData.last_activity).getTime();
    if (Date.now() - lastActivity > CHAT_EXPIRY_TIME) {
      console.log(`Room expired: ${roomId}`);
      // We'll let the server handle deletion
      return null;
    }
    
    // Get the messages for this room
    const { data: messagesData, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('timestamp', { ascending: true });
    
    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return null;
    }
    
    // Map the database records to ChatMessage objects, ensuring display_name is properly mapped
    const messages = messagesData?.map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender,
      timestamp: msg.timestamp,
      displayName: msg.display_name || (msg.sender === 'user' ? 'You' : 'Other')
    })) || [];
    
    console.log('Retrieved messages:', messages);
    
    // Construct and return the room object
    return {
      id: roomId,
      messages: messages,
      lastActivity: lastActivity,
      securityCode: roomData.security_code
    };
  } catch (error) {
    console.error('Error retrieving chat room:', error);
    return null;
  }
};

export const addMessage = async (roomId: string, message: ChatMessage): Promise<ChatRoom | null> => {
  try {
    console.log('Adding message with display name:', message.displayName);
    
    // Insert the message with the display name
    const { error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        id: message.id,
        room_id: roomId,
        content: message.content,
        sender: message.sender,
        timestamp: message.timestamp,
        display_name: message.displayName // Ensure display name is saved
      });
    
    if (messageError) {
      console.error('Error adding message:', messageError);
      throw messageError;
    }
    
    // Update the room's last activity
    const { error: roomError } = await supabase
      .from('chat_rooms')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', roomId);
    
    if (roomError) throw roomError;
    
    // Return the updated room
    return await getRoom(roomId);
  } catch (error) {
    console.error('Error adding message:', error);
    return null;
  }
};

export const createRoom = async (securityCode?: string): Promise<ChatRoom> => {
  const roomId = generateRoomId();
  const room: ChatRoom = {
    id: roomId,
    messages: [],
    lastActivity: Date.now(),
    securityCode
  };
  
  await storeRoom(roomId, room);
  console.log(`New room created: ${roomId}`);
  return room;
};

export const getRoomSecurityCode = async (roomId: string): Promise<string | undefined> => {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select('security_code')
    .eq('id', roomId)
    .single();
  
  if (error || !data) return undefined;
  return data.security_code;
};

export const verifySecurityCode = async (roomId: string, code: string): Promise<boolean> => {
  const securityCode = await getRoomSecurityCode(roomId);
  return securityCode === code;
};

// No need for manual cleanup as we have a server-side process
export const cleanupExpiredRooms = async (): Promise<void> => {
  console.log('Cleanup handled by Supabase database function');
};
