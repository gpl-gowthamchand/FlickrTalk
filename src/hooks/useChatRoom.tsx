
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatRoom as ChatRoomType, ChatMessage } from '@/types';
import { getRoom, addMessage, getRoomSecurityCode } from '@/utils/storageUtils';
import { generateMessage } from '@/utils/chatUtils';
import { useToast } from '@/hooks/use-toast';

interface UseChatRoomProps {
  roomId: string;
  securityCode?: string;
}

export function useChatRoom({ roomId, securityCode }: UseChatRoomProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [room, setRoom] = useState<ChatRoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresCode, setRequiresCode] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState(
    localStorage.getItem('chat_display_name') || 'You'
  );
  
  // Function to add a new message from realtime updates
  const handleNewMessage = useCallback((newMessage: ChatMessage) => {
    setRoom(prevRoom => {
      if (!prevRoom) return null;
      
      // Check if message already exists to prevent duplicates
      const messageExists = prevRoom.messages.some(msg => msg.id === newMessage.id);
      if (messageExists) {
        console.log('Message already exists in state, skipping:', newMessage.id);
        return prevRoom;
      }
      
      console.log('Adding new message to state:', newMessage);
      
      // Important: Create a new array reference to ensure React detects the change
      return {
        ...prevRoom,
        messages: [...prevRoom.messages, newMessage],
        lastActivity: Date.now()
      };
    });
  }, []);
  
  // Handle sending a new message
  const handleSendMessage = async (content: string, displayName: string) => {
    if (!roomId || !room) return;
    
    // Save the display name for this session
    if (displayName !== currentUserDisplayName) {
      setCurrentUserDisplayName(displayName);
      localStorage.setItem('chat_display_name', displayName);
    }
    
    // Generate the message with display name
    const message = generateMessage(content, 'user', displayName);
    console.log('Sending message with display name:', displayName);
    
    // Optimistically update UI first
    setRoom(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, message],
        lastActivity: Date.now()
      };
    });
    
    // Then send to database
    try {
      await addMessage(roomId, message);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Your message couldn't be sent. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load room data
  useEffect(() => {
    const loadRoom = async () => {
      if (!roomId) {
        navigate('/');
        return;
      }
      
      try {
        const roomData = await getRoom(roomId);
        const roomSecurityCode = await getRoomSecurityCode(roomId);
        
        if (!roomData) {
          console.log('Room not found:', roomId);
          toast({
            title: "Chat room not found",
            description: "This chat room doesn't exist or has expired after 24 hours of inactivity",
            variant: "destructive",
          });
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        if (roomSecurityCode && !securityCode) {
          setRequiresCode(true);
          setLoading(false);
          return;
        }
        
        console.log('Room data loaded:', roomData);
        setRoom(roomData);
      } catch (error) {
        console.error('Error loading room:', error);
        toast({
          title: "Error loading chat room",
          description: "There was a problem connecting to the chat server",
          variant: "destructive",
        });
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadRoom();
  }, [roomId, navigate, securityCode, toast]);

  return {
    room,
    loading,
    requiresCode,
    notFound,
    currentUserDisplayName,
    handleSendMessage,
    handleNewMessage
  };
}
