
import { useState, useEffect, useCallback } from "react";
import { Message, DbMessage } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMessages = (roomId: string | null, displayName: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  // Load previous messages
  const loadMessages = useCallback(async (roomId: string) => {
    try {
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
      
      if (data) {
        const formattedMessages: Message[] = data.map((msg: DbMessage) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          isMine: msg.sender === displayName,
          timestamp: new Date(msg.timestamp),
        }));
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Unexpected error loading messages:", error);
    }
  }, [toast, displayName]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !roomId) return;
    
    const newMessage: Message = {
      id: crypto.randomUUID(),
      content,
      sender: displayName,
      isMine: true,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    
    // Store message in the database
    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          room_id: roomId,
          content,
          sender: displayName,
        });
        
      if (error) {
        console.error("Error sending message:", error);
        toast({
          variant: "destructive",
          title: "Message not sent",
          description: "Could not send message. Please try again.",
        });
      }
    } catch (error) {
      console.error("Unexpected error sending message:", error);
    }
  }, [roomId, displayName, toast]);

  // Effect to load messages when room changes
  useEffect(() => {
    if (roomId) {
      loadMessages(roomId);
    } else {
      setMessages([]);
    }
  }, [roomId, loadMessages]);

  // Handle incoming messages and refresh if display name changes
  useEffect(() => {
    if (!roomId) return;
    
    // Refresh messages when display name changes to update "isMine" property
    loadMessages(roomId);
    
    // Subscribe to real-time updates for messages
    const subscription = supabase
      .channel(`public:messages:room_id=eq.${roomId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        // Skip messages sent by the current user (already in state)
        if (payload.new && payload.new.sender !== displayName) {
          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            sender: payload.new.sender,
            isMine: false,
            timestamp: new Date(payload.new.timestamp),
          };
          
          setMessages((prev) => [...prev, newMessage]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [roomId, displayName, loadMessages]);

  return {
    messages,
    sendMessage,
    clearMessages: useCallback(() => setMessages([]), []),
  };
};
