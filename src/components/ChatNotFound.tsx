
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChatNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 flex items-center justify-center rounded-full mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Chat room not found</h2>
        <p className="text-muted-foreground mb-6">
          This chat room doesn't exist or has expired. Chat rooms automatically expire after 24 hours of inactivity.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-flickr-600 text-white px-4 py-2 rounded-md hover:bg-flickr-700 transition-colors"
        >
          Create a new chat
        </button>
      </div>
    </div>
  );
};

export default ChatNotFound;
