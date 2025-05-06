
import React, { createContext, useContext } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useSocketConnection } from "@/hooks/use-socket-connection";

interface SocketContextType {
  channel: RealtimeChannel | null;
  isConnected: boolean;
  connectToRoom: (roomId: string, securityCode: string, displayName: string) => Promise<void>;
  disconnectFromRoom: () => void;
}

const SocketContext = createContext<SocketContextType>({
  channel: null,
  isConnected: false,
  connectToRoom: async () => {},
  disconnectFromRoom: () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const {
    channel,
    isConnected,
    connectToRoom,
    disconnectFromRoom,
  } = useSocketConnection();

  return (
    <SocketContext.Provider
      value={{
        channel,
        isConnected,
        connectToRoom,
        disconnectFromRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
