import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Clock, Film } from 'lucide-react';
import { fetchNewMovies } from '@/services/api';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { getImageUrl } from '@/services/api';

interface SearchSuggestionsProps {
  onSelect?: () => void;
}

export const SearchSuggestions = ({ onSelect }: SearchSuggestionsProps) => {
  const { getContinueWatching } = useWatchHistory();
  const continueWatching = getContinueWatching().slice(0, 5);

  const { data: trending } = useQuery({
    queryKey: ['trending-suggestions'],
    queryFn: () => fetchNewMovies(1),
    staleTime: 10 * 60 * 1000,
  });

  const trendingMovies = trending?.items?.slice(0, 6) || [];

  return (
    <div className="space-y-6">
      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Tiếp tục xem</h4>
          </div>
          <div className="space-y-2">
            {continueWatching.map((item) => (
              <Link
                key={item.slug}
                to={`/xem-phim/${item.slug}?tap=${item.episodeSlug}`}
                onClick={onSelect}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <img
                  src={item.posterUrl}
                  alt={item.name}
                  className="w-12 h-8 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.episodeName} • {item.progress}%</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trending */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Đang thịnh hành</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {trendingMovies.map((movie) => (
            <Link
              key={movie.slug}
              to={`/phim/${movie.slug}`}
              onClick={onSelect}
              className="group relative aspect-video rounded-lg overflow-hidden"
            >
              <img
                src={getImageUrl(movie.thumb_url || movie.poster_url)}
                alt={movie.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-1.5 left-1.5 right-1.5">
                <p className="text-xs font-medium line-clamp-1 text-white">{movie.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
