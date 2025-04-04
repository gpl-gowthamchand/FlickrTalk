
import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { formatTimestamp } from '@/utils/chatUtils';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatMessageProps {
  message: ChatMessageType;
  currentUserDisplayName: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, currentUserDisplayName }) => {
  // Determine if the message is from the current user by comparing display names
  // This ensures proper display regardless of which client views the chat
  const isCurrentUserByName = message.displayName === currentUserDisplayName;
  const isCurrentUserBySender = message.sender === 'user';
  
  // For backward compatibility with messages that might not have display name set
  const isUser = isCurrentUserByName || (isCurrentUserBySender && !message.displayName);
  
  // Display name fallback logic
  const displayName = message.displayName || (isUser ? currentUserDisplayName : 'Other');
  const avatarFallback = displayName.charAt(0).toUpperCase();
  
  return (
    <div className={cn(
      "flex items-start mb-4 animate-slide-in",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarFallback className="bg-gray-300 text-gray-700">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "max-w-[75%] px-4 py-2 rounded-lg",
        isUser 
          ? "bg-flickr-600 text-white rounded-tr-none" 
          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none"
      )}>
        <div className="text-[11px] opacity-80 font-medium mb-1">
          {displayName}
        </div>
        <div className="text-sm break-words">{message.content}</div>
        <div className={cn(
          "text-[9px] mt-1",
          isUser ? "text-flickr-200" : "text-gray-500 dark:text-gray-400"
        )}>
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 ml-2">
          <AvatarFallback className="bg-flickr-200 text-flickr-700">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
