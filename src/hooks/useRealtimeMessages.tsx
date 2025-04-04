
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client-typed';
import { ChatMessage } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface UseRealtimeMessagesProps {
  roomId: string;
  onNewMessage: (message: ChatMessage) => void;
}

export function useRealtimeMessages({ roomId, onNewMessage }: UseRealtimeMessagesProps) {
  const { toast } = useToast();
  const supabaseChannelRef = useRef<any>(null);
  
  // Function to handle incoming messages from Supabase real-time
  const handleRealtimeMessage = (payload: any) => {
    console.log('Real-time message received:', payload);
    
    if (!payload.new) {
      console.log('No new message data in payload:', payload);
      return;
    }
    
    const newMessage: ChatMessage = {
      id: payload.new.id,
      content: payload.new.content,
      sender: payload.new.sender,
      timestamp: payload.new.timestamp,
      displayName: payload.new.display_name || (payload.new.sender === 'user' ? 'Unknown' : 'Other')
    };
    
    console.log('Processing new message:', newMessage);
    // Ensure we call the callback with the new message
    onNewMessage(newMessage);
  };

  // Set up Supabase real-time subscription
  useEffect(() => {
    if (!roomId) return;
    
    console.log(`Setting up real-time subscription for room: ${roomId}`);
    
    // Unsubscribe from any previous channel
    if (supabaseChannelRef.current) {
      console.log('Unsubscribing from previous channel');
      supabase.removeChannel(supabaseChannelRef.current);
      supabaseChannelRef.current = null;
    }
    
    try {
      // Create a specific channel name for better real-time performance
      const channelName = `room-messages:${roomId}`;
      console.log(`Creating new channel: ${channelName}`);
      
      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}` 
        }, handleRealtimeMessage)
        .subscribe((status) => {
          console.log('Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to real-time updates for room: ${roomId}`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Error subscribing to real-time updates');
            toast({
              title: "Connection issue",
              description: "We're having trouble connecting to the chat server",
              variant: "destructive",
            });
          }
        });
      
      supabaseChannelRef.current = channel;
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the chat server",
        variant: "destructive",
      });
    }
    
    // Clean up subscription on unmount
    return () => {
      if (supabaseChannelRef.current) {
        console.log(`Unsubscribing from channel for room: ${roomId}`);
        try {
          supabase.removeChannel(supabaseChannelRef.current);
        } catch (error) {
          console.error('Error removing channel:', error);
        }
        supabaseChannelRef.current = null;
      }
    };
  }, [roomId, toast, onNewMessage]);

  return { supabaseChannelRef };
}
