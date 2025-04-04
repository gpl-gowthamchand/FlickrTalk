
import { ChatMessage } from "@/types";
import { generateRoomId, generateSecurityCode } from "./storageUtils";

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const generateMessage = (
  content: string, 
  sender: 'user' | 'other' = 'user',
  displayName?: string
): ChatMessage => {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    content,
    sender,
    timestamp: Date.now(),
    displayName: displayName || (sender === 'user' ? 'You' : 'Other')
  };
};

export const getChatUrl = (roomId: string, securityCode?: string): string => {
  const baseUrl = window.location.origin;
  const url = `${baseUrl}/chat/${roomId}`;
  
  if (securityCode) {
    return `${url}?code=${securityCode}`;
  }
  
  return url;
};

export const createSecureRoom = (): { roomId: string; securityCode: string } => {
  const roomId = generateRoomId();
  const securityCode = generateSecurityCode();
  
  return { roomId, securityCode };
};
