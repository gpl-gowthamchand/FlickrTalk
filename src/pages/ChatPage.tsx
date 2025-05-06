
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
    // Auto-join if we have URL parameters
    if (roomId && securityCode && !contextRoomId) {
      setShowJoinDialog(true);
    } else if (!contextRoomId) {
      setShowJoinDialog(true);
    }
    
    return () => {
      leaveRoom();
    };
  }, []);

  const handleJoin = (name: string, code: string) => {
    if (!roomId || !name.trim() || !code.trim()) return;
    
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
      />
    </div>
  );
};

export default ChatPage;
