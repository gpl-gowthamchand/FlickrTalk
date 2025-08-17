
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useChat } from "@/contexts/ChatContext";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { JoinDialog } from "@/components/chat/JoinDialog";

const ChatPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const securityCode = searchParams.get("code");
  const navigate = useNavigate();
  
  const { 
    messages, 
    sendMessage, 
    displayName, 
    joinRoom, 
    leaveRoom, 
    roomId: contextRoomId
  } = useChat();
  
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  useEffect(() => {
    console.log("ChatPage useEffect - roomId:", roomId, "securityCode:", securityCode, "contextRoomId:", contextRoomId);
    
    // If we already have a room context and it matches the URL, we're good
    if (contextRoomId && contextRoomId === roomId) {
      console.log("Already in the correct room:", contextRoomId);
      setShowJoinDialog(false);
      return;
    }
    
    // If we have a room ID in URL but no room context, we need to join
    if (roomId && !contextRoomId) {
      console.log("Room ID in URL but no room context, showing join dialog");
      setShowJoinDialog(true);
      return;
    }
    
    // If we have a room context but it doesn't match the URL, we need to rejoin
    if (contextRoomId && contextRoomId !== roomId) {
      console.log("Room context mismatch, need to rejoin");
      setShowJoinDialog(true);
      return;
    }
    
    // If no room context and no room ID, show join dialog
    if (!contextRoomId && !roomId) {
      console.log("No room context or room ID, showing join dialog");
      setShowJoinDialog(true);
      return;
    }
    
    return () => {
      console.log("Cleaning up ChatPage, leaving room");
      leaveRoom();
    };
  }, [roomId, securityCode, contextRoomId, leaveRoom]);

  const handleJoin = (name: string, code: string) => {
    if (!roomId || !name.trim() || !code.trim()) return;
    
    console.log("Handling join request:", { roomId, name, code });
    
    joinRoom(roomId, code, name);
    setShowJoinDialog(false);
    
    // Update URL without the security code for better security
    navigate(`/chat/${roomId}`, { replace: true });
  };

  const handleBack = () => {
    leaveRoom();
    navigate("/");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader roomId={contextRoomId} onBack={handleBack} />
      <MessageList messages={messages} />
      <MessageInput onSendMessage={sendMessage} />
      <JoinDialog 
        open={showJoinDialog} 
        onOpenChange={setShowJoinDialog}
        onJoin={handleJoin}
        initialCode={securityCode}
        roomId={roomId}
      />
    </div>
  );
};

export default ChatPage;
