
import { useRef, useEffect } from "react";
import { format } from "date-fns";
import { Message } from "@/types/chat";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <p>No messages yet</p>
          <p className="text-sm">Start a conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.isMine ? "items-end" : "items-start"
            } fade-in`}
          >
            {!message.isMine && (
              <span className="text-xs font-medium text-muted-foreground ml-2 mb-1">
                {message.sender}
              </span>
            )}
            <div
              className={message.isMine ? "sent-message" : "received-message"}
            >
              <div>{message.content}</div>
              <div className="message-time">
                {format(message.timestamp, "h:mm a")}
              </div>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
