
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ChatHeader from '@/components/ChatHeader';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';
import RoomCodeForm from '@/components/RoomCodeForm';
import ChatLoader from '@/components/ChatLoader';
import ChatNotFound from '@/components/ChatNotFound';
import { useChatRoom } from '@/hooks/useChatRoom';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';

const ChatRoom: React.FC = () => {
  const { roomId = '' } = useParams<{ roomId: string }>();
  const location = useLocation();
  const securityCode = location.state?.securityCode;
  
  // Use our custom hooks for chat room data and real-time messaging
  const {
    room,
    loading,
    requiresCode,
    notFound,
    currentUserDisplayName,
    handleSendMessage,
    handleNewMessage
  } = useChatRoom({ roomId, securityCode });
  
  // Set up real-time subscription - only when we have a valid room
  useRealtimeMessages({ 
    roomId, 
    onNewMessage: handleNewMessage 
  });

  // Show appropriate UI based on state
  if (loading) {
    return <ChatLoader />;
  }

  if (notFound) {
    return <ChatNotFound />;
  }

  if (requiresCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <RoomCodeForm roomId={roomId} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader roomId={roomId} securityCode={securityCode} />
      <MessageList 
        messages={room?.messages || []} 
        currentUserDisplayName={currentUserDisplayName}
      />
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatRoom;
