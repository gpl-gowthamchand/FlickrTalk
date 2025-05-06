
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface JoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin: (name: string, code: string) => void;
  initialCode?: string | null;
}

export const JoinDialog = ({ open, onOpenChange, onJoin, initialCode = "" }: JoinDialogProps) => {
  const [nameInput, setNameInput] = useState("");
  const [codeInput, setCodeInput] = useState(initialCode || "");

  useEffect(() => {
    if (initialCode) {
      setCodeInput(initialCode);
    }
  }, [initialCode]);

  const handleJoin = () => {
    if (!nameInput.trim() || !codeInput.trim()) return;
    onJoin(nameInput, codeInput);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Chat Room</DialogTitle>
          <DialogDescription>
            Enter your display name and security code to join this chat room.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Display Name
            </label>
            <Input
              id="name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your display name"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium">
              Security Code
            </label>
            <Input
              id="code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Enter security code"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleJoin} disabled={!nameInput.trim() || !codeInput.trim()}>
            Join Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
