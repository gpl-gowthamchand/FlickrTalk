
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
      // Verify room exists and security code matches
      const { data, error } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("room_id", roomId)
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

      // Room verified, now subscribe to real-time updates
      const roomChannel = supabase
        .channel(`room:${roomId}`)
        .on("presence", { event: "sync" }, () => {
          console.log("Presence synced");
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          console.log("User joined:", newPresences);
          toast({
            title: "User joined",
            description: `${newPresences[0]?.user} has joined the chat`,
          });
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          console.log("User left:", leftPresences);
          toast({
            title: "User left",
            description: `${leftPresences[0]?.user} has left the chat`,
          });
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            setIsConnected(true);
            
            // Send user presence information
            await roomChannel.track({
              user: displayName,
              online_at: new Date().toISOString(),
            });

            toast({
              title: "Connected to chat room",
              description: `Joined room as ${displayName}`,
            });
          } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
            toast({
              variant: "destructive",
              title: "Connection Error",
              description: "Failed to connect to the chat room. Please try again.",
            });
          }
        });

      setChannel(roomChannel);
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
