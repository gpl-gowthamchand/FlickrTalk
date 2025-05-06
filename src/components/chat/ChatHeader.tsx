
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft } from "lucide-react";
import { UserMenu } from "@/components/app/UserMenu";
import { useState, useCallback, memo, useEffect } from "react";
import { useChat } from "@/contexts/ChatContext";

interface ChatHeaderProps {
  roomId?: string | null;
  onBack: () => void;
}

export const ChatHeader = memo(({ roomId, onBack }: ChatHeaderProps) => {
  // Connect to the chat context to get the current display name
  const { displayName, setDisplayName } = useChat();
  const [profileName, setProfileName] = useState(displayName || "User");
  
  // Sync profile name with chat context display name
  useEffect(() => {
    if (displayName && displayName !== profileName) {
      setProfileName(displayName);
    }
  }, [displayName]);
  
  const handleProfileNameChange = useCallback((name: string) => {
    setProfileName(name);
    setDisplayName(name);
  }, [setDisplayName]);
  
  return (
    <header className="border-b p-4 bg-background">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-medium">FlickrTalk</h1>
            {roomId && (
              <p className="text-xs text-muted-foreground">Room: {roomId}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu 
            profileName={profileName}
            onProfileNameChange={handleProfileNameChange}
          />
        </div>
      </div>
    </header>
  );
});

ChatHeader.displayName = "ChatHeader";
