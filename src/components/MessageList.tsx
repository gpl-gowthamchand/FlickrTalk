
import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import ChatMessage from './ChatMessage';
import EmptyState from './EmptyState';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageListProps {
  messages: ChatMessageType[];
  currentUserDisplayName: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserDisplayName }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);
  
  // Improved scroll behavior for new messages with a more robust approach
  useEffect(() => {
    if (messages.length > prevMessagesLength) {
      // Use setTimeout to ensure DOM is fully updated before scrolling
      const scrollTimeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        console.log('Scrolled to bottom after new message');
        setPrevMessagesLength(messages.length);
      }, 100); // Small delay to ensure render is complete
      
      return () => clearTimeout(scrollTimeout);
    }
  }, [messages, prevMessagesLength]);
  
  if (messages.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <ScrollArea className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef}>
      <div className="space-y-4 pb-4">
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            currentUserDisplayName={currentUserDisplayName} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default MessageList;
