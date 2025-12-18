import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MovieList from "./pages/MovieList";
import MovieDetail from "./pages/MovieDetail";
import Watch from "./pages/Watch";
import Search from "./pages/Search";
import CategoryPage from "./pages/CategoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/danh-sach/:type" element={<MovieList />} />
          <Route path="/phim/:slug" element={<MovieDetail />} />
          <Route path="/xem-phim/:slug" element={<Watch />} />
          <Route path="/tim-kiem" element={<Search />} />
          <Route path="/the-loai/:slug" element={<CategoryPage type="category" />} />
          <Route path="/quoc-gia/:slug" element={<CategoryPage type="country" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
