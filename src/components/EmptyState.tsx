
import React from 'react';
import { MessageSquare } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="bg-flickr-100 dark:bg-flickr-900/30 p-6 rounded-full mb-4">
        <MessageSquare className="w-12 h-12 text-flickr-600" />
      </div>
      <h3 className="text-2xl font-semibold mb-2">Start chatting now</h3>
      <p className="text-muted-foreground max-w-xs">
        Send a message to start your conversation. Remember, messages will disappear after 24 hours of inactivity.
      </p>
    </div>
  );
};

export default EmptyState;
