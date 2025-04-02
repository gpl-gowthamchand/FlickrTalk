import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ChatHeader from '@/components/ChatHeader';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';
import RoomCodeForm from '@/components/RoomCodeForm';
import { getRoom, addMessage, getRoomSecurityCode } from '@/utils/storageUtils';
import { generateMessage } from '@/utils/chatUtils';
import { ChatMessage, ChatRoom as ChatRoomType } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const ChatRoom: React.FC = () => {
  const { roomId = '' } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [room, setRoom] = useState<ChatRoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresCode, setRequiresCode] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  // Get security code from location state (if provided) 
  const securityCode = location.state?.securityCode;
  
  // Handle messages
  const handleSendMessage = (content: string) => {
    if (!roomId || !room) return;
    
    const message = generateMessage(content, 'user');
    const updatedRoom = addMessage(roomId, message);
    setRoom(updatedRoom);
  };

  // Effect to check for room existence and security code
  useEffect(() => {
    if (!roomId) {
      console.error('No room ID provided. Redirecting to home.');
      navigate('/');
      return;
    }
    
    const roomData = getRoom(roomId);
    const roomSecurityCode = getRoomSecurityCode(roomId);
    
    if (!roomData) {
      console.warn(`Room not found or expired: ${roomId}`);
      toast({
        title: "Chat room not found",
        description: "This chat room doesn't exist or has expired after 24 hours of inactivity.",
        variant: "destructive",
      });
      setNotFound(true);
      setLoading(false);
      return;
    }
    
    // Check if room requires security code
    if (roomSecurityCode && !securityCode) {
      console.info(`Room requires security code: ${roomId}`);
      setRequiresCode(true);
      setLoading(false);
      return;
    }
    
    console.log(`Room loaded successfully: ${roomId}`);
    setRoom(roomData);
    setLoading(false);
    
    // Set up polling to check for new messages
    const interval = setInterval(() => {
      const updatedRoom = getRoom(roomId);
      if (updatedRoom) {
        setRoom(updatedRoom);
      } else {
        console.warn(`Room expired during session: ${roomId}`);
        toast({
          title: "Chat room expired",
          description: "This chat room has expired due to inactivity.",
        });
        clearInterval(interval);
        navigate('/');
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [roomId, navigate, securityCode, toast]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex space-x-2 mb-4">
            <div className="w-3 h-3 bg-flickr-600 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-flickr-600 rounded-full animate-pulse delay-100"></div>
            <div className="w-3 h-3 bg-flickr-600 rounded-full animate-pulse delay-200"></div>
          </div>
          <p className="text-muted-foreground">Loading chat room...</p>
        </div>
      </div>
    );
  }

  // Show not found state
  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 flex items-center justify-center rounded-full mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Chat room not found</h2>
          <p className="text-muted-foreground mb-6">
            This chat room doesn't exist or has expired. Chat rooms automatically expire after 24 hours of inactivity.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-flickr-600 text-white px-4 py-2 rounded-md hover:bg-flickr-700 transition-colors"
          >
            Create a new chat
          </button>
        </div>
      </div>
    );
  }

  // Show security code form if required
  if (requiresCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <RoomCodeForm roomId={roomId} />
      </div>
    );
  }

  // Show chat interface
  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader roomId={roomId} securityCode={securityCode} />
      <MessageList messages={room?.messages || []} />
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatRoom;
