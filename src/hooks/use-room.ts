
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
      console.log("Attempting to create room:", { roomId: newRoomId, securityCode: newSecurityCode });
      
      // Create the room in the database - using current schema
      const { data, error } = await supabase
        .from("chat_rooms")
        .insert({ 
          id: newRoomId, 
          security_code: newSecurityCode,
          last_activity: new Date().toISOString()
        })
        .select();
        
      if (error) {
        console.error("Supabase error creating room:", error);
        toast({
          variant: "destructive",
          title: "Room Creation Failed",
          description: `Database error: ${error.message}`,
        });
        
        // If it's a duplicate key error, try again
        if (error.code === '23505') {
          console.log("Duplicate room ID, trying again...");
          return createRoom();
        }
        
        throw error;
      }
      
      console.log("Room created successfully:", data);
      
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
