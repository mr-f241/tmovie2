import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronLeft, ChevronRight, Home, List, Server, AlertCircle, 
  Loader2, Heart, Share2, Bookmark, Settings2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMovieDetail, getImageUrl } from '@/services/api';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { useFavorites } from '@/hooks/useFavorites';
import { usePlayerSettings } from '@/hooks/usePlayerSettings';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Watch = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentServer, setCurrentServer] = useState(0);
  
  const { addToHistory, updateProgress } = useWatchHistory();
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: movie, isLoading: movieLoading } = useQuery({
    queryKey: ['movie', slug],
    queryFn: () => fetchMovieDetail(slug!),
    enabled: !!slug,
  });

  const episodeSlug = searchParams.get('tap');
  
  const currentEpisodeData = movie?.episodes?.[currentServer]?.server_data;
  const currentEpisodeIndex = currentEpisodeData?.findIndex((ep) => ep.slug === episodeSlug) ?? 0;
  const currentEpisode = currentEpisodeData?.[currentEpisodeIndex >= 0 ? currentEpisodeIndex : 0];

  const prevEpisode = currentEpisodeData?.[currentEpisodeIndex - 1];
  const nextEpisode = currentEpisodeData?.[currentEpisodeIndex + 1];

  // Save to history when episode loads
  useEffect(() => {
    if (movie && currentEpisode) {
      addToHistory({
        slug: movie.slug,
        name: movie.name,
        posterUrl: getImageUrl(movie.poster_url),
        episodeSlug: currentEpisode.slug,
        episodeName: currentEpisode.name,
        progress: 0,
      });
    }
  }, [movie, currentEpisode, addToHistory]);

  const handleProgress = (progress: number, currentTime: number) => {
    if (movie && currentEpisode) {
      updateProgress(movie.slug, currentEpisode.slug, progress);
    }
  };

  const handleEnded = () => {
    if (nextEpisode) {
      toast.info('Đang chuyển tập tiếp theo...');
      setTimeout(() => {
        setSearchParams({ tap: nextEpisode.slug });
      }, 2000);
    }
  };

  const handleFavorite = () => {
    if (!movie) return;
    const added = toggleFavorite({
      slug: movie.slug,
      name: movie.name,
      posterUrl: getImageUrl(movie.poster_url),
      originName: movie.origin_name,
      year: movie.year,
    });
    toast.success(added ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích');
  };

  if (movieLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-7xl py-4">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <div className="mt-6 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie || !currentEpisode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Không tìm thấy tập phim</h1>
          <p className="text-muted-foreground mb-6">Tập phim này không tồn tại.</p>
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const isMovieFavorite = isFavorite(movie.slug);

  return (
    <div className="min-h-screen bg-background">
      {/* Video Player */}
      <div className="bg-black/50">
        <div className="container max-w-7xl py-4 lg:py-6">
          <VideoPlayer
            src={currentEpisode.link_embed}
            poster={getImageUrl(movie.thumb_url)}
            title={movie.name}
            episodeName={currentEpisode.name}
            onProgress={handleProgress}
            onEnded={handleEnded}
            onPrevEpisode={prevEpisode ? () => setSearchParams({ tap: prevEpisode.slug }) : undefined}
            onNextEpisode={nextEpisode ? () => setSearchParams({ tap: nextEpisode.slug }) : undefined}
            hasPrev={!!prevEpisode}
            hasNext={!!nextEpisode}
          />
        </div>
      </div>

      {/* Controls & Info */}
      <div className="container max-w-7xl py-6 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link to="/">
                  <Home className="h-4 w-4 mr-1.5" />
                  Trang chủ
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link to={`/phim/${movie.slug}`}>
                  <List className="h-4 w-4 mr-1.5" />
                  Chi tiết
                </Link>
              </Button>
              <Button 
                variant={isMovieFavorite ? 'default' : 'secondary'} 
                size="sm"
                onClick={handleFavorite}
                className={isMovieFavorite ? 'bg-pink-600 hover:bg-pink-700' : ''}
              >
                <Heart className={`h-4 w-4 mr-1.5 ${isMovieFavorite ? 'fill-current' : ''}`} />
                {isMovieFavorite ? 'Đã thích' : 'Thích'}
              </Button>
            </div>

            {/* Episode Navigation */}
            <div className="flex items-center gap-2">
              {prevEpisode && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSearchParams({ tap: prevEpisode.slug })}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Tập trước
                </Button>
              )}
              {nextEpisode && (
                <Button
                  size="sm"
                  className="gradient-primary border-0"
                  onClick={() => setSearchParams({ tap: nextEpisode.slug })}
                >
                  Tập tiếp
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>

          {/* Movie Info */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">{movie.name}</h1>
              <p className="text-muted-foreground mt-1">
                {movie.origin_name} • <span className="text-primary">{currentEpisode.name}</span>
              </p>
            </div>
            
            {/* Server Selection */}
            {movie.episodes && movie.episodes.length > 1 && (
              <div className="flex items-center gap-3">
                <Server className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={String(currentServer)}
                  onValueChange={(val) => setCurrentServer(Number(val))}
                >
                  <SelectTrigger className="w-[180px] bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {movie.episodes.map((ep, index) => (
                      <SelectItem key={index} value={String(index)}>
                        {ep.server_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Episode List */}
          {currentEpisodeData && currentEpisodeData.length > 1 && (
            <div>
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <List className="h-5 w-5 text-primary" />
                Danh sách tập ({currentEpisodeData.length} tập)
              </h3>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto scrollbar-hide p-1 bg-secondary/20 rounded-xl">
                {currentEpisodeData.map((ep) => {
                  const isCurrentEp = ep.slug === currentEpisode.slug;
                  return (
                    <motion.div
                      key={ep.slug}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={isCurrentEp ? 'default' : 'secondary'}
                        size="sm"
                        className={`min-w-[65px] ${isCurrentEp ? 'gradient-primary border-0 glow' : ''}`}
                        onClick={() => setSearchParams({ tap: ep.slug })}
                      >
                        {ep.name}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="flex flex-wrap gap-2 pt-2">
            {movie.category?.map((cat) => (
              <Link key={cat.slug} to={`/the-loai/${cat.slug}`}>
                <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                  {cat.name}
                </Badge>
              </Link>
            ))}
            {movie.country?.map((country) => (
              <Link key={country.slug} to={`/quoc-gia/${country.slug}`}>
                <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                  {country.name}
                </Badge>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Watch;
