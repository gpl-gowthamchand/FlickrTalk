
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { cleanupExpiredRooms } from "./utils/storageUtils";
import Home from "./pages/Home";
import ChatRoom from "./pages/ChatRoom";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Clean up expired rooms on startup
    cleanupExpiredRooms();
    
    // Set up periodic cleanup
    const cleanupInterval = setInterval(() => {
      cleanupExpiredRooms();
    }, 60 * 60 * 1000); // Every hour
    
    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat/:roomId" element={<ChatRoom />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
