
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, UserCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSendMessage: (message: string, displayName: string) => void;
}

const DISPLAY_NAME_KEY = 'chat_display_name';

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { toast } = useToast();
  
  // Load display name from localStorage on component mount
  useEffect(() => {
    const savedName = localStorage.getItem(DISPLAY_NAME_KEY);
    if (savedName) {
      setDisplayName(savedName);
    } else {
      // If no name is set, open the popover to prompt for a name
      setPopoverOpen(true);
    }
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim()) {
      // Make sure we have at least a default display name
      const finalDisplayName = displayName.trim() || 'You';
      onSendMessage(message.trim(), finalDisplayName);
      setMessage('');
    }
  };
  
  const handleSaveName = () => {
    if (displayName.trim()) {
      localStorage.setItem(DISPLAY_NAME_KEY, displayName);
      setPopoverOpen(false);
      toast({
        title: "Name saved",
        description: `You'll appear as "${displayName}" in the chat`,
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-4 border-t flex space-x-2">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            className="flex-shrink-0"
            aria-label="Set display name"
          >
            <UserCircle size={20} className={displayName ? "text-flickr-600" : undefined} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Your Display Name</h4>
              <p className="text-sm text-muted-foreground">
                Enter the name you want to show in the chat
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveName}>Save</Button>
          </div>
        </PopoverContent>
      </Popover>
      
      <Input
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1"
        autoFocus
      />
      <Button type="submit" className="bg-flickr-600 hover:bg-flickr-700">
        <Send size={18} />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
};

export default ChatInput;
