import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { searchMovies, getImageUrl } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { rateLimit } from '@/lib/crypto';

interface InstantSearchProps {
  onClose?: () => void;
}

export const InstantSearch = ({ onClose }: InstantSearchProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        // Client-side rate limiting
        if (rateLimit.check('search', 30, 60000)) {
          setDebouncedQuery(query);
        }
      } else {
        setDebouncedQuery('');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Search query
  const { data, isLoading } = useQuery({
    queryKey: ['instantSearch', debouncedQuery],
    queryFn: () => searchMovies(debouncedQuery, 1),
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

  const handleSelect = useCallback((slug: string) => {
    navigate(`/phim/${slug}`);
    setShowResults(false);
    setQuery('');
    onClose?.();
  }, [navigate, onClose]);

  const results = data?.items?.slice(0, 6) || [];

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Tìm kiếm phim..."
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
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((movie, index) => (
                  <motion.button
                    key={movie.slug}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
                    onClick={() => handleSelect(movie.slug)}
                  >
                    <img
                      src={getImageUrl(movie.poster_url)}
                      alt={movie.name}
                      className="w-12 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
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
                <p className="text-sm">Không tìm thấy kết quả</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
