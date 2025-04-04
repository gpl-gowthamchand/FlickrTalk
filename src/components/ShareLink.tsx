
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { getChatUrl } from '@/utils/chatUtils';
import { useToast } from '@/components/ui/use-toast';

interface ShareLinkProps {
  roomId: string;
  securityCode?: string;
  onClose: () => void;
}

const ShareLink: React.FC<ShareLinkProps> = ({ roomId, securityCode, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const chatUrl = getChatUrl(roomId, securityCode);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(chatUrl);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "The chat link has been copied to your clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-80">
      <CardContent className="pt-4">
        <h3 className="font-medium mb-2 text-sm">Share this chat link</h3>
        <div className="flex mb-2">
          <Input
            value={chatUrl}
            readOnly
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            className="ml-2"
            onClick={handleCopy}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span className="sr-only">Copy link</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Anyone with this link can join your chat. The chat will expire after 24 hours of inactivity.
        </p>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareLink;
