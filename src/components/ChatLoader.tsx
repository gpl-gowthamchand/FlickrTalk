
import React from 'react';

const ChatLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="flex space-x-2 mb-4">
          <div className="w-3 h-3 bg-flickr-600 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-flickr-600 rounded-full animate-pulse delay-100"></div>
          <div className="w-3 h-3 bg-flickr-600 rounded-full animate-pulse delay-200"></div>
        </div>
        <p className="text-muted-foreground">Loading chat room...</p>
      </div>
    </div>
  );
};

export default ChatLoader;
