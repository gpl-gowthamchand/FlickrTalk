
import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { formatTimestamp } from '@/utils/chatUtils';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={cn(
      "flex mb-4 animate-slide-in",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] px-4 py-2 rounded-lg",
        isUser 
          ? "bg-flickr-600 text-white rounded-tr-none" 
          : "bg-gray-200 dark:bg-gray-700 rounded-tl-none"
      )}>
        <div className="text-sm break-words">{message.content}</div>
        <div className={cn(
          "text-xs mt-1",
          isUser ? "text-flickr-200" : "text-gray-500 dark:text-gray-400"
        )}>
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
