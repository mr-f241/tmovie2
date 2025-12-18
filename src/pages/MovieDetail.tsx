import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Calendar, Clock, Globe, Film, Users, Star, Share2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchMovieDetail, getImageUrl, fetchMoviesByType } from '@/services/api';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MovieSection } from '@/components/movie/MovieSection';

const MovieDetail = () => {
  const { slug } = useParams();

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
          <p className="text-muted-foreground mb-8">Phim bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
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

  return (
    <Layout>
      {/* Hero Backdrop */}
      <div className="relative min-h-[50vh] md:min-h-[60vh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      </div>

      {/* Content */}
      <div className="container relative -mt-48 md:-mt-64 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr] gap-6 md:gap-8"
        >
          {/* Poster */}
          <div className="flex flex-col gap-4">
            <div className="aspect-[2/3] rounded-xl overflow-hidden card-shadow">
              <img
                src={posterUrl}
                alt={movie.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>

            {/* Watch Button - Mobile */}
            <div className="md:hidden">
              {firstEpisode && (
                <Button asChild size="lg" className="w-full gradient-primary border-0 glow">
                  <Link to={`/xem-phim/${movie.slug}`}>
                    <Play className="mr-2 h-5 w-5 fill-current" />
                    Xem phim
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {movie.quality && (
                <Badge className="gradient-primary border-0">{movie.quality}</Badge>
              )}
              {movie.lang && <Badge variant="secondary">{movie.lang}</Badge>}
              {movie.status && <Badge variant="outline">{movie.status}</Badge>}
            </div>

            {/* Title */}
            <div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {movie.name}
              </h1>
              <p className="text-lg text-muted-foreground mt-2">{movie.origin_name}</p>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              {movie.year && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{movie.year}</span>
                </div>
              )}
              {movie.time && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{movie.time}</span>
                </div>
              )}
              {movie.episode_total && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Film className="h-4 w-4" />
                  <span>{movie.episode_current} / {movie.episode_total}</span>
                </div>
              )}
              {movie.view && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{movie.view.toLocaleString()} lượt xem</span>
                </div>
              )}
            </div>

            {/* Categories & Countries */}
            <div className="flex flex-wrap gap-2">
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
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              {firstEpisode && (
                <Button asChild size="lg" className="gradient-primary border-0 glow">
                  <Link to={`/xem-phim/${movie.slug}`}>
                    <Play className="mr-2 h-5 w-5 fill-current" />
                    Xem phim
                  </Link>
                </Button>
              )}
              <Button variant="secondary" size="lg">
                <Heart className="mr-2 h-5 w-5" />
                Yêu thích
              </Button>
              <Button variant="secondary" size="icon" className="h-11 w-11">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Description */}
            {movie.content && (
              <div>
                <h3 className="font-display font-semibold text-lg mb-2">Nội dung phim</h3>
                <p
                  className="text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: movie.content }}
                />
              </div>
            )}

            {/* Cast & Director */}
            {(movie.actor?.length > 0 || movie.director?.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-4">
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
              </div>
            )}

            {/* Episodes */}
            {movie.episodes?.length > 0 && movie.episodes[0].server_data?.length > 1 && (
              <div>
                <h3 className="font-display font-semibold text-lg mb-3">Danh sách tập</h3>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto scrollbar-hide">
                  {movie.episodes[0].server_data.map((ep, index) => (
                    <Link
                      key={ep.slug}
                      to={`/xem-phim/${movie.slug}?tap=${ep.slug}`}
                    >
                      <Button variant="secondary" size="sm" className="min-w-[60px]">
                        {ep.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
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
