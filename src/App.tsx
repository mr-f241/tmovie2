import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { securityClient } from '@/lib/security';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuthModal } from '@/hooks/useAuthModal';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { MovieChatbot } from '@/components/ai/MovieChatbot';

import Index from "./pages/Index";
import MovieList from "./pages/MovieList";
import MovieDetail from "./pages/MovieDetail";
import Watch from "./pages/Watch";
import WatchTogether from "./pages/WatchTogether";
import WatchTogetherLobby from "./pages/WatchTogetherLobby";
import Search from "./pages/Search";
import CategoryPage from "./pages/CategoryPage";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import MyList from "./pages/MyList";
import History from "./pages/History";
import Admin from "./pages/Admin";
import YouTubeWatch from "./pages/YouTubeWatch";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Auth Modal wrapper component
const AuthModalWrapper = () => {
  const { isOpen, mode, close } = useAuthModal();
  return <AuthModal isOpen={isOpen} onClose={close} defaultMode={mode} />;
};

const App = () => {
  useEffect(() => {
    securityClient.init().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthModalWrapper />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/danh-sach/:type" element={<MovieList />} />
                <Route path="/phim/:slug" element={<MovieDetail />} />
                <Route path="/xem-phim/:slug" element={<Watch />} />
                <Route path="/xem-chung" element={<WatchTogetherLobby />} />
                <Route path="/xem-chung/:roomCode" element={<WatchTogether />} />
                <Route path="/tim-kiem" element={<Search />} />
                <Route path="/the-loai/:slug" element={<CategoryPage type="category" />} />
                <Route path="/quoc-gia/:slug" element={<CategoryPage type="country" />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-list" element={<MyList />} />
                <Route path="/history" element={<History />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/youtube/watch" element={<YouTubeWatch />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <InstallPrompt />
              <MovieChatbot />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
