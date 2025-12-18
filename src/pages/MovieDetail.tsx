import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Calendar, Clock, Globe, Film, Users, Heart, Share2, Star, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchMovieDetail, getImageUrl, fetchMoviesByType } from '@/services/api';
import { useFavorites } from '@/hooks/useFavorites';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MovieSection } from '@/components/movie/MovieSection';
import { toast } from 'sonner';

const MovieDetail = () => {
  const { slug } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getResumeInfo } = useWatchHistory();

  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', slug],
    queryFn: () => fetchMovieDetail(slug!),
    enabled: !!slug,
  });

  const { data: relatedMovies } = useQuery({
    queryKey: ['relatedMovies', movie?.type],
    queryFn: () => fetchMoviesByType(movie?.type === 'series' ? 'phim-bo' : 'phim-le', 1),
    enabled: !!movie?.type,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const resumeInfo = movie ? getResumeInfo(movie.slug) : null;
  const isMovieFavorite = movie ? isFavorite(movie.slug) : false;

  const handleFavoriteToggle = () => {
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

  const handleShare = async () => {
    if (navigator.share && movie) {
      await navigator.share({
        title: movie.name,
        text: `Xem ${movie.name} tại TMovie`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép link');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="relative min-h-[60vh]">
          <Skeleton className="absolute inset-0" />
        </div>
        <div className="container py-8">
          <div className="grid md:grid-cols-[300px_1fr] gap-8">
            <Skeleton className="aspect-[2/3] rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!movie) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Không tìm thấy phim</h1>
          <p className="text-muted-foreground mb-8">Phim bạn tìm kiếm không tồn tại.</p>
          <Button asChild>
            <Link to="/">Về trang chủ</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const backdropUrl = getImageUrl(movie.thumb_url || movie.poster_url);
  const posterUrl = getImageUrl(movie.poster_url);
  const firstEpisode = movie.episodes?.[0]?.server_data?.[0];
  const watchUrl = resumeInfo 
    ? `/xem-phim/${movie.slug}?tap=${resumeInfo.episodeSlug}`
    : `/xem-phim/${movie.slug}`;

  return (
    <Layout>
      {/* Hero Backdrop */}
      <div className="relative min-h-[55vh] md:min-h-[65vh]">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </div>

      {/* Content */}
      <div className="container relative -mt-52 md:-mt-72 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-6 md:gap-10"
        >
          {/* Poster */}
          <div className="flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="aspect-[2/3] rounded-2xl overflow-hidden card-shadow ring-1 ring-border/20"
            >
              <img
                src={posterUrl}
                alt={movie.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </motion.div>

            {/* Mobile Actions */}
            <div className="md:hidden flex gap-2">
              {firstEpisode && (
                <Button asChild size="lg" className="flex-1 gradient-primary border-0 glow">
                  <Link to={watchUrl}>
                    <Play className="mr-2 h-5 w-5 fill-current" />
                    {resumeInfo ? 'Tiếp tục xem' : 'Xem phim'}
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Badges */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-2"
            >
              {movie.quality && (
                <Badge className="gradient-primary border-0">{movie.quality}</Badge>
              )}
              {movie.lang && <Badge variant="secondary">{movie.lang}</Badge>}
              {movie.status && <Badge variant="outline">{movie.status}</Badge>}
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                {movie.name}
              </h1>
              <p className="text-lg text-muted-foreground mt-2">{movie.origin_name}</p>
            </motion.div>

            {/* Meta Info */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-5 text-sm"
            >
              {movie.year && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{movie.year}</span>
                </div>
              )}
              {movie.time && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{movie.time}</span>
                </div>
              )}
              {movie.episode_total && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Film className="h-4 w-4 text-primary" />
                  <span>{movie.episode_current} / {movie.episode_total}</span>
                </div>
              )}
              {movie.view && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{movie.view.toLocaleString()} lượt xem</span>
                </div>
              )}
            </motion.div>

            {/* Categories & Countries */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-2"
            >
              {movie.category?.map((cat) => (
                <Link key={cat.slug} to={`/the-loai/${cat.slug}`}>
                  <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                    {cat.name}
                  </Badge>
                </Link>
              ))}
              {movie.country?.map((country) => (
                <Link key={country.slug} to={`/quoc-gia/${country.slug}`}>
                  <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                    <Globe className="h-3 w-3 mr-1" />
                    {country.name}
                  </Badge>
                </Link>
              ))}
            </motion.div>

            {/* Desktop Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="hidden md:flex items-center gap-3"
            >
              {firstEpisode && (
                <Button asChild size="lg" className="gradient-primary border-0 glow group">
                  <Link to={watchUrl}>
                    <Play className="mr-2 h-5 w-5 fill-current group-hover:scale-110 transition-transform" />
                    {resumeInfo ? `Tiếp tục xem (${resumeInfo.progress}%)` : 'Xem phim'}
                  </Link>
                </Button>
              )}
              <Button 
                variant={isMovieFavorite ? 'default' : 'secondary'} 
                size="lg"
                onClick={handleFavoriteToggle}
                className={isMovieFavorite ? 'bg-pink-600 hover:bg-pink-700' : ''}
              >
                <Heart className={`mr-2 h-5 w-5 ${isMovieFavorite ? 'fill-current' : ''}`} />
                {isMovieFavorite ? 'Đã thích' : 'Yêu thích'}
              </Button>
              <Button variant="secondary" size="icon" className="h-11 w-11" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Description */}
            {movie.content && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <h3 className="font-display font-semibold text-lg mb-3">Nội dung phim</h3>
                <div
                  className="text-muted-foreground leading-relaxed prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: movie.content }}
                />
              </motion.div>
            )}

            {/* Cast & Director */}
            {(movie.actor?.length > 0 || movie.director?.length > 0) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                {movie.director?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Đạo diễn</h4>
                    <p className="text-sm">{movie.director.join(', ')}</p>
                  </div>
                )}
                {movie.actor?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Diễn viên</h4>
                    <p className="text-sm line-clamp-3">{movie.actor.join(', ')}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Episodes */}
            {movie.episodes?.length > 0 && movie.episodes[0].server_data?.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <h3 className="font-display font-semibold text-lg mb-4">Danh sách tập</h3>
                <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto scrollbar-hide p-1">
                  {movie.episodes[0].server_data.map((ep) => {
                    const isResume = resumeInfo?.episodeSlug === ep.slug;
                    return (
                      <Link
                        key={ep.slug}
                        to={`/xem-phim/${movie.slug}?tap=${ep.slug}`}
                      >
                        <Button 
                          variant={isResume ? 'default' : 'secondary'} 
                          size="sm" 
                          className={`min-w-[65px] ${isResume ? 'gradient-primary border-0' : ''}`}
                        >
                          {ep.name}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Related Movies */}
        {relatedMovies?.items && relatedMovies.items.length > 0 && (
          <MovieSection
            title="Phim liên quan"
            movies={relatedMovies.items.filter((m) => m.slug !== movie.slug)}
          />
        )}
      </div>
    </Layout>
  );
};

export default MovieDetail;
