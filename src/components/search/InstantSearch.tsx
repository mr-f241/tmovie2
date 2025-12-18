import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, Film, Youtube, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { searchMovies, getImageUrl } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { rateLimit } from '@/lib/crypto';
import { useYouTubePlayer } from '@/contexts/YouTubePlayerContext';

interface YouTubeResult {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  description?: string;
}

interface InstantSearchProps {
  onClose?: () => void;
}

// Fetch YouTube results
const searchYouTube = async (keyword: string): Promise<YouTubeResult[]> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-search?keyword=${encodeURIComponent(keyword)}&maxResults=3`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      console.error('YouTube search failed:', response.status);
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
};

export const InstantSearch = ({ onClose }: InstantSearchProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'movies' | 'youtube'>('movies');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { playYouTube } = useYouTubePlayer();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        if (rateLimit.check('search', 30, 60000)) {
          setDebouncedQuery(query);
        }
      } else {
        setDebouncedQuery('');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Movie search query
  const { data: movieData, isLoading: isLoadingMovies } = useQuery({
    queryKey: ['instantSearch', debouncedQuery],
    queryFn: () => searchMovies(debouncedQuery, 1),
    enabled: debouncedQuery.length >= 2,
  });

  // YouTube search query
  const { data: youtubeData, isLoading: isLoadingYouTube } = useQuery({
    queryKey: ['youtubeSearch', debouncedQuery],
    queryFn: () => searchYouTube(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      onClose?.();
    } else if (e.key === 'Enter' && query.trim()) {
      navigate(`/tim-kiem?keyword=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
      onClose?.();
    }
  };

  const handleSelectMovie = useCallback((slug: string) => {
    navigate(`/phim/${slug}`);
    setShowResults(false);
    setQuery('');
    onClose?.();
  }, [navigate, onClose]);

  const handleSelectYouTube = useCallback((videoId: string, title: string) => {
    playYouTube(videoId, title);
    setShowResults(false);
    setQuery('');
    onClose?.();
  }, [playYouTube, onClose]);

  const movieResults = movieData?.items?.slice(0, 5) || [];
  const youtubeResults = youtubeData?.slice(0, 3) || [];
  const isLoading = activeTab === 'movies' ? isLoadingMovies : isLoadingYouTube;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Tìm kiếm phim, video..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 h-12 bg-secondary/50 border-border/50 text-base rounded-xl"
          autoFocus
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {showResults && debouncedQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-50"
          >
            {/* Tabs */}
            <div className="flex border-b border-border/50">
              <button
                onClick={() => setActiveTab('movies')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'movies'
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Film className="h-4 w-4" />
                Phim ({movieResults.length})
              </button>
              <button
                onClick={() => setActiveTab('youtube')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'youtube'
                    ? 'text-red-500 border-b-2 border-red-500 bg-red-500/5'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Youtube className="h-4 w-4" />
                YouTube ({youtubeResults.length})
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : activeTab === 'movies' ? (
              // Movie Results
              movieResults.length > 0 ? (
                <div className="py-2 max-h-80 overflow-y-auto">
                  {movieResults.map((movie, index) => (
                    <motion.button
                      key={movie.slug}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left group"
                      onClick={() => handleSelectMovie(movie.slug)}
                    >
                      <div className="relative">
                        <img
                          src={getImageUrl(movie.poster_url)}
                          alt={movie.name}
                          className="w-12 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <Play className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1">{movie.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {movie.origin_name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {movie.year} • {movie.quality}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                  <div className="border-t border-border/50 p-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-center text-sm text-primary"
                      onClick={() => {
                        navigate(`/tim-kiem?keyword=${encodeURIComponent(query)}`);
                        setShowResults(false);
                        onClose?.();
                      }}
                    >
                      Xem tất cả kết quả
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-muted-foreground">
                  <Film className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Không tìm thấy phim</p>
                </div>
              )
            ) : (
              // YouTube Results
              youtubeResults.length > 0 ? (
                <div className="py-2 max-h-80 overflow-y-auto">
                  {youtubeResults.map((video, index) => (
                    <motion.button
                      key={video.videoId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 transition-colors text-left group"
                      onClick={() => handleSelectYouTube(video.videoId, video.title)}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-24 h-14 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <Play className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
                          <Youtube className="h-3 w-3 inline text-red-500" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {video.channelTitle}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-muted-foreground">
                  <Youtube className="h-8 w-8 mb-2 opacity-50 text-red-500" />
                  <p className="text-sm">Không tìm thấy video</p>
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
