
import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Info, Menu, User } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";

interface UserMenuProps {
  profileName: string;
  onProfileNameChange: (name: string) => void;
}

export const UserMenu = memo(({ profileName, onProfileNameChange }: UserMenuProps) => {
  // Add connection to chat context to update display name there as well
  const { setDisplayName } = useChat();
  
  const handleProfileNameChange = useCallback(() => {
    // Simple implementation that directly updates the name without opening dialog
    const newName = prompt("Enter your new profile name:", profileName);
    if (newName && newName.trim() && newName !== profileName) {
      const trimmedName = newName.trim();
      // Update local UI state
      onProfileNameChange(trimmedName);
      // Also update the chat context display name
      setDisplayName(trimmedName);
    }
  }, [profileName, onProfileNameChange, setDisplayName]);

  const handleAboutDialog = useCallback(() => {
    // Simple alert instead of dialog to show developer info
    alert(
      "Developer: G P L Gowtham chang\n" +
      "GitHub: https://github.com/gpl-gowthamchand\n" +
      "Website: https://gpl.gowthamchand@gmail.com\n" +
      "Email: https://gowthamchand.vercel.app/\n" +
      "© " + new Date().getFullYear() + " All rights reserved"
    );
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50 bg-background">
        <DropdownMenuItem onClick={handleAboutDialog}>
          <Info className="mr-2 h-4 w-4" />
          About the Developer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleProfileNameChange}>
          <User className="mr-2 h-4 w-4" />
          Change Profile Name ({profileName})
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

UserMenu.displayName = "UserMenu";
