import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Home, List, Server, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchMovieDetail, saveWatchHistory, getWatchHistory } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Watch = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentServer, setCurrentServer] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { data: movie, isLoading: movieLoading } = useQuery({
    queryKey: ['movie', slug],
    queryFn: () => fetchMovieDetail(slug!),
    enabled: !!slug,
  });

  const episodeSlug = searchParams.get('tap');
  
  // Find current episode
  const currentEpisodeData = movie?.episodes?.[currentServer]?.server_data;
  const currentEpisodeIndex = currentEpisodeData?.findIndex((ep) => ep.slug === episodeSlug) ?? 0;
  const currentEpisode = currentEpisodeData?.[currentEpisodeIndex >= 0 ? currentEpisodeIndex : 0];

  // Get previous/next episodes
  const prevEpisode = currentEpisodeData?.[currentEpisodeIndex - 1];
  const nextEpisode = currentEpisodeData?.[currentEpisodeIndex + 1];

  // Save watch history
  useEffect(() => {
    if (movie && currentEpisode) {
      saveWatchHistory(movie.slug, currentEpisode.slug, Date.now());
    }
  }, [movie, currentEpisode]);

  // Reset loading state when episode changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [currentEpisode?.link_embed]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Không thể tải video. Vui lòng thử server khác.');
  };

  if (movieLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-4">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <div className="mt-4 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie || !currentEpisode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Không tìm thấy phim</h1>
          <p className="text-muted-foreground mb-6">Tập phim này không tồn tại hoặc đã bị xóa.</p>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Video Player */}
      <div className="bg-black">
        <div className="container max-w-6xl py-4">
          <div className="relative aspect-video bg-secondary rounded-xl overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary z-10">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            )}
            
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                <Alert variant="destructive" className="max-w-md">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={currentEpisode.link_embed}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            )}
          </div>
        </div>
      </div>

      {/* Controls & Info */}
      <div className="container max-w-6xl py-6">
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
                  <Home className="h-4 w-4 mr-1" />
                  Trang chủ
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link to={`/phim/${movie.slug}`}>
                  <List className="h-4 w-4 mr-1" />
                  Chi tiết phim
                </Link>
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
                  variant="default"
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
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">{movie.name}</h1>
            <p className="text-muted-foreground mt-1">
              {movie.origin_name} - {currentEpisode.name}
            </p>
          </div>

          {/* Server Selection */}
          {movie.episodes && movie.episodes.length > 1 && (
            <div className="flex items-center gap-3">
              <Server className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Server:</span>
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

          {/* Episode List */}
          {currentEpisodeData && currentEpisodeData.length > 1 && (
            <div>
              <h3 className="font-display font-semibold mb-3">Danh sách tập</h3>
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto scrollbar-hide p-1">
                {currentEpisodeData.map((ep) => (
                  <Button
                    key={ep.slug}
                    variant={ep.slug === currentEpisode.slug ? 'default' : 'secondary'}
                    size="sm"
                    className={`min-w-[60px] ${ep.slug === currentEpisode.slug ? 'gradient-primary border-0' : ''}`}
                    onClick={() => setSearchParams({ tap: ep.slug })}
                  >
                    {ep.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {movie.category?.map((cat) => (
              <Link key={cat.slug} to={`/the-loai/${cat.slug}`}>
                <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                  {cat.name}
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
