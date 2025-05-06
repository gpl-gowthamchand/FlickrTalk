
import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [messageText, setMessageText] = useState("");

  const handleSendMessage = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim()) return;
    
    onSendMessage(messageText);
    setMessageText("");
  };

  return (
    <footer className="border-t p-4 bg-background">
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" disabled={!messageText.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </footer>
  );
};
