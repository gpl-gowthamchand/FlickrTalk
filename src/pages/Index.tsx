import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChat } from "@/contexts/ChatContext";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/app/UserMenu";

const Index = () => {
  const navigate = useNavigate();
  const { createRoom, joinRoom, displayName, setDisplayName } = useChat();
  
  // Use the display name from chat context as the source of truth
  const [profileName, setProfileName] = useState(displayName || "");
  const [createName, setCreateName] = useState(displayName || "");
  const [joinName, setJoinName] = useState(displayName || "");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinSecurityCode, setJoinSecurityCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const [createdRoomData, setCreatedRoomData] = useState<{roomId: string, securityCode: string} | null>(null);

  // Sync with chat context display name
  useEffect(() => {
    if (displayName) {
      setProfileName(displayName);
      if (!createName) setCreateName(displayName);
      if (!joinName) setJoinName(displayName);
    }
  }, [displayName]);

  const handleCreateRoom = async () => {
    if (!createName.trim()) return;
    
    setIsCreating(true);
    try {
      const result = await createRoom();
      setCreatedRoomData(result);
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleContinueToCreatedRoom = async () => {
    if (!createdRoomData || !createName.trim()) return;
    
    try {
      // Join the room first
      await joinRoom(createdRoomData.roomId, createdRoomData.securityCode, createName);
      // Then navigate after the room is joined
      navigate(`/chat/${createdRoomData.roomId}`);
    } catch (error) {
      console.error("Error joining created room:", error);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinName.trim() || !joinRoomId.trim() || !joinSecurityCode.trim()) return;
    
    try {
      // Join the room first
      await joinRoom(joinRoomId, joinSecurityCode, joinName);
      // Then navigate after the room is joined
      navigate(`/chat/${joinRoomId}`);
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  const handleCopyLink = () => {
    if (!createdRoomData) return;
    
    const url = new URL(window.location.href);
    url.pathname = `/chat/${createdRoomData.roomId}`;
    url.searchParams.set("code", createdRoomData.securityCode);
    
    navigator.clipboard.writeText(url.toString());
  };

  const handleProfileNameChange = (name: string) => {
    setProfileName(name);
    // Update chat context display name
    setDisplayName(name);
    // Update form fields if they're empty or match the previous name
    if (!createName || createName === profileName) setCreateName(name);
    if (!joinName || joinName === profileName) setJoinName(name);
  };

  const developerName = "John Doe";
  const githubUrl = "https://github.com/johndoe";
  const websiteUrl = "https://johndoe.com";
  const developerEmail = "john.doe@example.com";
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b p-4">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            FlickrTalk
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu
              profileName={profileName}
              onProfileNameChange={handleProfileNameChange}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-md py-8 px-4 md:py-12">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center">Welcome to FlickrTalk</CardTitle>
            <CardDescription className="text-center">
              Start a private, temporary conversation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create Room</TabsTrigger>
                <TabsTrigger value="join">Join Room</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4 mt-4">
                {!createdRoomData ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="create-name">Display Name</Label>
                      <Input
                        id="create-name"
                        placeholder="Enter your display name"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleCreateRoom} 
                      className="w-full"
                      disabled={!createName.trim() || isCreating}
                    >
                      {isCreating ? "Creating..." : "Create Room"}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-accent rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium">Room ID:</p>
                        <p className="font-mono">{createdRoomData.roomId}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="font-medium">Security Code:</p>
                        <p className="font-mono">{createdRoomData.securityCode}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={handleCopyLink}
                      >
                        Copy Link
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={handleContinueToCreatedRoom}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="join" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="join-name">Display Name</Label>
                  <Input
                    id="join-name"
                    placeholder="Enter your display name"
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="room-id">Room ID</Label>
                  <Input
                    id="room-id"
                    placeholder="Enter room ID"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="security-code">Security Code</Label>
                  <Input
                    id="security-code"
                    placeholder="Enter security code"
                    value={joinSecurityCode}
                    onChange={(e) => setJoinSecurityCode(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleJoinRoom} 
                  className="w-full"
                  disabled={!joinName.trim() || !joinRoomId.trim() || !joinSecurityCode.trim()}
                >
                  Join Room
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
          <Separator />
          <CardFooter className="flex justify-center pt-4 text-sm text-muted-foreground">
            <p>Messages are not stored permanently</p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Index;
