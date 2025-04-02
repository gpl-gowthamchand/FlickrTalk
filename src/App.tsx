import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { cleanupExpiredRooms } from "./utils/storageUtils";
import { testSupabaseConnection } from "@/integrations/supabase/client";
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
    
    testSupabaseConnection().then((success) => {
      if (!success) {
        console.error('Failed to connect to Supabase. Check your environment variables.');
        alert('Unable to connect to the chat server. Please check your internet connection or contact support.');
      } else {
        console.log('Connected to Supabase successfully.');
      }
    });

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
