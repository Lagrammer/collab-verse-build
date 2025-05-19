
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Theme from "./pages/Theme";
import Chat from "./pages/Chat";
import ChatDetail from "./pages/ChatDetail";
import ReceivedContributions from "./pages/ReceivedContributions";
import SentContributions from "./pages/SentContributions";

// Auth guard
import { ProtectedRoute, PublicOnlyRoute } from "./lib/authGuard";

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes - no authentication needed */}
            <Route 
              path="/login" 
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicOnlyRoute>
                  <Signup />
                </PublicOnlyRoute>
              } 
            />
            <Route 
              path="/verify-email" 
              element={
                <PublicOnlyRoute>
                  <VerifyEmail />
                </PublicOnlyRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicOnlyRoute>
                  <ForgotPassword />
                </PublicOnlyRoute>
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                <PublicOnlyRoute>
                  <ResetPassword />
                </PublicOnlyRoute>
              } 
            />
            
            {/* Protected routes - authentication required */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/explore" 
              element={
                <ProtectedRoute>
                  <Explore />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/theme" 
              element={
                <ProtectedRoute>
                  <Theme />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat/:slug" 
              element={
                <ProtectedRoute>
                  <ChatDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/contributions/received" 
              element={
                <ProtectedRoute>
                  <ReceivedContributions />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/contributions/sent" 
              element={
                <ProtectedRoute>
                  <SentContributions />
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
