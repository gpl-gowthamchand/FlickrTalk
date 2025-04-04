
import React from 'react';
import { Button } from "@/components/ui/button";
import { Share, X, Info } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import ShareLink from './ShareLink';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatHeaderProps {
  roomId: string;
  securityCode?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ roomId, securityCode }) => {
  const navigate = useNavigate();
  const [showShare, setShowShare] = React.useState(false);

  return (
    <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-flickr-600 to-flickr-700 text-white">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-semibold flex items-center">
          FlickrTalk
          <span className="ml-2 bg-white/20 text-xs py-1 px-2 rounded-full animate-pulse-light">
            Room: {roomId}
          </span>
        </h1>
      </div>

      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setShowShare(!showShare)}
            >
              <Share size={18} />
              <span className="sr-only">Share chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Share this chat
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Info size={18} />
              <span className="sr-only">Chat info</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Chats expire after 24 hours of inactivity
          </TooltipContent>
        </Tooltip>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => navigate('/')}
        >
          <X size={18} />
          <span className="sr-only">Close chat</span>
        </Button>
      </div>
      
      {showShare && (
        <div className="absolute top-16 right-4 z-10 animate-fade-in">
          <ShareLink roomId={roomId} securityCode={securityCode} onClose={() => setShowShare(false)} />
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
