
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateRandomString } from "@/utils/chatUtils";
import { useSocket } from "@/contexts/SocketContext";

export const useRoom = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [securityCode, setSecurityCode] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const { connectToRoom, disconnectFromRoom } = useSocket();
  const { toast } = useToast();

  // Create a new chat room
  const createRoom = async () => {
    const newRoomId = generateRandomString(8);
    const newSecurityCode = generateRandomString(6);
    
    try {
      // Create the room in the database
      const { error } = await supabase
        .from("chat_rooms")
        .insert({ room_id: newRoomId, security_code: newSecurityCode });
        
      if (error) {
        console.error("Error creating room:", error);
        toast({
          variant: "destructive",
          title: "Room Creation Failed",
          description: "Could not create chat room. Please try again.",
        });
        // Try again with a different ID
        return createRoom();
      }
      
      toast({
        title: "Room Created",
        description: "Your chat room has been created successfully",
      });
      
      return { roomId: newRoomId, securityCode: newSecurityCode };
    } catch (error) {
      console.error("Unexpected error creating room:", error);
      toast({
        variant: "destructive",
        title: "Room Creation Failed",
        description: "An unexpected error occurred. Please try again.",
      });
      throw error;
    }
  };

  // Join a chat room
  const joinRoom = (roomId: string, securityCode: string, name: string) => {
    setDisplayName(name);
    setRoomId(roomId);
    setSecurityCode(securityCode);
    connectToRoom(roomId, securityCode, name);
  };
  
  // Leave the current room
  const leaveRoom = () => {
    disconnectFromRoom();
    setRoomId(null);
    setSecurityCode(null);
  };

  return {
    roomId,
    securityCode,
    displayName,
    setDisplayName,
    createRoom,
    joinRoom,
    leaveRoom,
  };
};
