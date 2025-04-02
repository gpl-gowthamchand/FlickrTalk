
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { createRoom, generateSecurityCode } from '@/utils/storageUtils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageCircle, Lock } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [useSecurityCode, setUseSecurityCode] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleCreateChat = () => {
    setLoading(true);
    const securityCode = useSecurityCode ? generateSecurityCode() : undefined;
    const room = createRoom(securityCode);
    
    setTimeout(() => {
      navigate(`/chat/${room.id}`, { 
        state: { securityCode: room.securityCode }
      });
    }, 500);
  };
  
  const handleJoinChat = () => {
    if (roomId.trim()) {
      navigate(`/chat/${roomId.trim()}`);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-flickr-100/30 dark:from-background dark:to-flickr-900/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-flickr-600 to-accent bg-clip-text text-transparent">
            FlickrTalk
          </h1>
          <p className="text-lg text-muted-foreground">
            Private, ephemeral chats that disappear after 24 hours
          </p>
        </div>
        
        <Card className="border-flickr-200 dark:border-flickr-800">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Chat</TabsTrigger>
              <TabsTrigger value="join">Join Chat</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <CardHeader>
                <CardTitle>Create a New Chat</CardTitle>
                <CardDescription>
                  Start a new chat room and share the link with others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Switch 
                    id="security-code" 
                    checked={useSecurityCode}
                    onCheckedChange={setUseSecurityCode}
                  />
                  <Label htmlFor="security-code" className="flex items-center">
                    <Lock size={14} className="mr-1" />
                    Add security code
                  </Label>
                </div>
                
                {useSecurityCode && (
                  <p className="text-sm text-muted-foreground mb-4">
                    A unique security code will be generated. Only people with the code can join.
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-flickr-600 hover:bg-flickr-700"
                  onClick={handleCreateChat}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      Creating
                      <span className="ml-2 flex space-x-1">
                        <span className="animate-pulse">.</span>
                        <span className="animate-pulse delay-100">.</span>
                        <span className="animate-pulse delay-200">.</span>
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <MessageCircle className="mr-2" size={18} />
                      Create Chat Room
                    </span>
                  )}
                </Button>
              </CardFooter>
            </TabsContent>
            
            <TabsContent value="join">
              <CardHeader>
                <CardTitle>Join Existing Chat</CardTitle>
                <CardDescription>
                  Enter a chat room ID to join an existing conversation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="room-id">Room ID</Label>
                  <Input
                    id="room-id"
                    placeholder="Enter room ID..."
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-flickr-600 hover:bg-flickr-700"
                  onClick={handleJoinChat}
                  disabled={!roomId.trim()}
                >
                  <span className="flex items-center">
                    <MessageCircle className="mr-2" size={18} />
                    Join Chat Room
                  </span>
                </Button>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            FlickrTalk chats expire automatically after 24 hours of inactivity
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
