
import { useState, useEffect, useCallback } from "react";
import { Message, DbMessage } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMessages = (roomId: string | null, displayName: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  // Debug logging
  useEffect(() => {
    console.log("useMessages hook - roomId:", roomId, "displayName:", displayName);
  }, [roomId, displayName]);

  // Load previous messages
  const loadMessages = useCallback(async (roomId: string) => {
    try {
      console.log("Loading messages for room:", roomId);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", roomId)
        .order("timestamp", { ascending: true });
        
      if (error) {
        console.error("Error loading messages:", error);
        toast({
          variant: "destructive",
          title: "Could not load messages",
          description: "There was a problem loading previous messages.",
        });
        return;
      }
      
      console.log("Loaded messages from database:", data);
      if (data && data.length > 0) {
        const formattedMessages: Message[] = data.map((msg: DbMessage) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          isMine: msg.sender === displayName,
          timestamp: new Date(msg.timestamp),
        }));
        
        console.log("Formatted messages for display:", formattedMessages);
        setMessages(formattedMessages);
      } else {
        console.log("No previous messages found for room:", roomId);
        setMessages([]);
      }
    } catch (error) {
      console.error("Unexpected error loading messages:", error);
    }
  }, [toast, displayName]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !roomId) {
      console.log("sendMessage validation failed:", { content: content.trim(), roomId });
      toast({
        variant: "destructive",
        title: "Cannot send message",
        description: "You are not in a chat room. Please join a room first.",
      });
      return;
    }
    
    console.log("Attempting to send message:", { content, roomId, displayName });
    
    // Verify we're still in the room
    try {
      const { data: roomData, error: roomError } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("id", roomId)
        .single();
        
      if (roomError || !roomData) {
        console.error("Room verification failed for message sending:", roomError);
        toast({
          variant: "destructive",
          title: "Room not found",
          description: "The chat room no longer exists. Please return to the home page.",
        });
        return;
      }
    } catch (error) {
      console.error("Error verifying room for message sending:", error);
      return;
    }
    
    const newMessage: Message = {
      id: crypto.randomUUID(),
      content,
      sender: displayName,
      isMine: true,
      timestamp: new Date(),
    };
    
    // Optimistically add message to UI
    setMessages((prev) => [...prev, newMessage]);
    
    // Store message in the database
    try {
      console.log("Inserting message into database:", {
        room_id: roomId,
        content,
        sender: displayName,
      });
      
      const { data, error } = await supabase
        .from("messages")
        .insert({
          room_id: roomId,
          content,
          sender: displayName,
        })
        .select();
        
      if (error) {
        console.error("Supabase error sending message:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        toast({
          variant: "destructive",
          title: "Message not sent",
          description: `Database error: ${error.message}`,
        });
        // Remove the optimistic message if it failed
        setMessages((prev) => prev.filter(msg => msg.id !== newMessage.id));
      } else {
        console.log("Message sent successfully to database:", data);
      }
    } catch (error) {
      console.error("Unexpected error sending message:", error);
      // Remove the optimistic message if it failed
      setMessages((prev) => prev.filter(msg => msg.id !== newMessage.id));
    }
  }, [roomId, displayName, toast]);

  // Effect to load messages when room changes
  useEffect(() => {
    if (roomId) {
      console.log("Room changed, loading messages for:", roomId);
      loadMessages(roomId);
    } else {
      setMessages([]);
    }
  }, [roomId, loadMessages]);

  // Handle incoming messages and refresh if display name changes
  useEffect(() => {
    if (!roomId) return;
    
    console.log("Setting up real-time subscription for room:", roomId);
    
    // Subscribe to real-time updates for messages
    const subscription = supabase
      .channel(`messages-${roomId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages'
      }, (payload) => {
        console.log("Received real-time message:", payload);
        
        // Only process messages for the current room
        if (payload.new && payload.new.room_id === roomId) {
          // Skip messages sent by the current user (already in state)
          if (payload.new.sender !== displayName) {
            const newMessage: Message = {
              id: payload.new.id,
              content: payload.new.content,
              sender: payload.new.sender,
              isMine: false,
              timestamp: new Date(payload.new.timestamp),
            };
            
            console.log("Adding new message from other user:", newMessage);
            setMessages((prev) => [...prev, newMessage]);
          } else {
            console.log("Skipping own message in real-time update");
          }
        }
      })
      .subscribe();

    return () => {
      console.log("Cleaning up subscription for room:", roomId);
      supabase.removeChannel(subscription);
    };
  }, [roomId, displayName]);

  return {
    messages,
    sendMessage,
    clearMessages: useCallback(() => setMessages([]), []),
  };
};
