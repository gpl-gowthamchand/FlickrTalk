
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateRandomString } from "@/utils/chatUtils";
import { useSocket } from "@/contexts/SocketContext";

export const useRoom = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [securityCode, setSecurityCode] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [previousDisplayName, setPreviousDisplayName] = useState(""); // Track previous name for notifications
  const { connectToRoom, disconnectFromRoom } = useSocket();
  const { toast } = useToast();

  // Update display name with notification to other users
  const updateDisplayName = (newName: string) => {
    console.log("🔄 updateDisplayName called:", { newName, currentName: displayName, roomId });
    
    if (newName.trim() && newName !== displayName) {
      const oldName = displayName;
      console.log("📝 Name change detected:", { oldName, newName });
      
      setPreviousDisplayName(oldName);
      setDisplayName(newName);
      
      // If we're in a room, notify other users about the name change
      if (roomId && oldName) {
        console.log("📢 Sending name change notification for room:", roomId);
        notifyNameChange(oldName, newName);
      } else {
        console.log("⚠️ Not sending notification - no room or old name:", { roomId, oldName });
      }
    } else {
      console.log("⏭️ Skipping name update - no change or empty name");
    }
  };

  // Notify other users about name change
  const notifyNameChange = async (oldName: string, newName: string) => {
    if (!roomId) {
      console.log("❌ No room ID for name change notification");
      return;
    }
    
    console.log("📤 Sending name change notification:", { oldName, newName, roomId });
    
    try {
      // Send a system message about the name change
      const { data, error } = await supabase
        .from("messages")
        .insert({
          room_id: roomId,
          content: `**${oldName}** changed their name to **${newName}**`,
          sender: "System"
          // Temporarily removed is_system_message to test basic functionality
        })
        .select();
        
      if (error) {
        console.error("❌ Error sending name change notification:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
      } else {
        console.log("✅ Name change notification sent successfully:", data);
      }
    } catch (error) {
      console.error("💥 Failed to send name change notification:", error);
    }
  };

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
  const joinRoom = async (roomId: string, securityCode: string, name: string) => {
    console.log("Joining room:", { roomId, securityCode, name });
    
    // Verify the room exists and security code is correct
    try {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("id", roomId)
        .eq("security_code", securityCode)
        .single();
        
      if (error || !data) {
        console.error("Room verification failed:", error);
        toast({
          variant: "destructive",
          title: "Invalid Room",
          description: "Room ID or security code is incorrect.",
        });
        throw new Error("Invalid room or security code");
      }
      
      console.log("Room verified successfully:", data);
      
      // Set the room context
      setDisplayName(name);
      setRoomId(roomId);
      setSecurityCode(securityCode);
      connectToRoom(roomId, securityCode, name);
      
      toast({
        title: "Room Joined",
        description: `Welcome to the chat room!`,
      });
      
      return true;
    } catch (error) {
      console.error("Error joining room:", error);
      throw error;
    }
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
    setDisplayName: updateDisplayName, // Use the new function instead of setState directly
    previousDisplayName,
    createRoom,
    joinRoom,
    leaveRoom,
  };
};
