
import React, { createContext, useContext } from "react";
import { useRoom } from "@/hooks/use-room";
import { useMessages } from "@/hooks/use-messages";
import { Message } from "@/types/chat";

interface ChatContextType {
  messages: Message[];
  sendMessage: (content: string) => void;
  displayName: string;
  setDisplayName: (name: string) => void;
  roomId: string | null;
  securityCode: string | null;
  createRoom: () => Promise<{ roomId: string; securityCode: string }>;
  joinRoom: (roomId: string, securityCode: string, displayName: string) => void;
  leaveRoom: () => void;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  sendMessage: () => {},
  displayName: "",
  setDisplayName: () => {},
  roomId: null,
  securityCode: null,
  createRoom: async () => ({ roomId: "", securityCode: "" }),
  joinRoom: () => {},
  leaveRoom: () => {},
});

export const useChat = () => useContext(ChatContext);

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const {
    roomId,
    securityCode,
    displayName,
    setDisplayName,
    createRoom,
    joinRoom,
    leaveRoom,
  } = useRoom();

  const { messages, sendMessage } = useMessages(roomId, displayName);

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        displayName,
        setDisplayName,
        roomId,
        securityCode,
        createRoom,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
