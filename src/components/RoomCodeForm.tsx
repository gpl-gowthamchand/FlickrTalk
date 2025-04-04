
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { verifySecurityCode } from '@/utils/storageUtils';
import { useToast } from '@/components/ui/use-toast';

interface RoomCodeFormProps {
  roomId: string;
}

const RoomCodeForm: React.FC<RoomCodeFormProps> = ({ roomId }) => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const isValid = await verifySecurityCode(roomId, code.trim());
    if (isValid) {
      navigate(`/chat/${roomId}`, { 
        state: { securityCode: code.trim() } 
      });
    } else {
      toast({
        title: "Invalid security code",
        description: "Please check the code and try again",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Enter Security Code</CardTitle>
        <CardDescription>
          This chat room is protected. Please enter the security code to join.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Input
            placeholder="Enter security code..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mb-2"
            required
            autoFocus
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            type="button"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!code.trim() || isSubmitting}
            className="bg-flickr-600 hover:bg-flickr-700"
          >
            {isSubmitting ? "Checking..." : "Join Chat"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RoomCodeForm;
