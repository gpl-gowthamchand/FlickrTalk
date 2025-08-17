
import { useState, useEffect } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SocketConnectionState {
  channel: RealtimeChannel | null;
  isConnected: boolean;
  error: Error | null;
}

export const useSocketConnection = () => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Create a new channel connection
  const connectToRoom = async (
    roomId: string, 
    securityCode: string, 
    displayName: string
  ): Promise<void> => {
    try {
      console.log("Connecting to room:", { roomId, securityCode, displayName });
      
      // Verify room exists and security code matches
      const { data, error } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("id", roomId)
        .eq("security_code", securityCode)
        .single();
        
      if (error) {
        console.error("Room verification error:", error);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Invalid room ID or security code.",
        });
        throw error;
      }

      console.log("Room verified successfully:", data);

      // Room verified, now create a simple channel for presence
      const roomChannel = supabase
        .channel(`room:${roomId}`)
        .on("presence", { event: "sync" }, () => {
          console.log("Presence synced");
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          console.log("User joined:", newPresences);
          if (newPresences && newPresences.length > 0) {
            toast({
              title: "User joined",
              description: `${newPresences[0]?.user} has joined the chat`,
            });
          }
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          console.log("User left:", leftPresences);
          if (leftPresences && leftPresences.length > 0) {
            toast({
              title: "User left",
              description: `${leftPresences[0]?.user} has left the chat`,
            });
          }
        })
        .subscribe(async (status) => {
          console.log("Socket connection status:", status);
          
          if (status === "SUBSCRIBED") {
            setIsConnected(true);
            console.log("Successfully connected to room:", roomId);
            
            // Send user presence information
            await roomChannel.track({
              user: displayName,
              online_at: new Date().toISOString(),
            });

            // Don't show connection success toast to avoid spam
            console.log("Connected to chat room as:", displayName);
          } else if (status === "CLOSED") {
            console.log("Socket connection closed");
            setIsConnected(false);
          } else if (status === "CHANNEL_ERROR") {
            console.log("Socket channel error (non-critical)");
            // Don't show error toast for channel errors
            // Real-time messaging will still work through messages subscription
          }
        });

      setChannel(roomChannel);
      
      // Show success toast after setting up the channel
      toast({
        title: "Connected to chat room",
        description: `Joined room as ${displayName}`,
      });
      
    } catch (error) {
      console.error("Room connection error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to chat room. Please try again.",
      });
      throw error;
    }
  };

  // Disconnect and cleanup
  const disconnectFromRoom = () => {
    if (channel) {
      console.log("Disconnecting from room");
      supabase.removeChannel(channel);
      setChannel(null);
      setIsConnected(false);
      toast({
        title: "Disconnected",
        description: "You've left the chat room",
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channel) {
        console.log("Cleaning up socket connection on unmount");
        supabase.removeChannel(channel);
      }
    };
  }, [channel]);

  return {
    channel,
    isConnected,
    connectToRoom,
    disconnectFromRoom,
  };
};
