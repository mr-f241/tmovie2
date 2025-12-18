import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Play,
  Calendar,
  Clock,
  Globe,
  Film,
  Users,
  Heart,
  Share2,
  Star,
  Bookmark,
  MessageSquare,
  Info,
  List,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMovieDetail, getImageUrl, fetchMoviesByType } from '@/services/api';
import { useFavorites } from '@/hooks/useFavorites';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MovieCarousel } from '@/components/movie/MovieCarousel';
import { toast } from 'sonner';

const MovieDetail = () => {
  const { slug } = useParams();
  const { user, profile } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getResumeInfo } = useWatchHistory();
  const queryClient = useQueryClient();
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');

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

  // Fetch user's rating
  const { data: existingRating } = useQuery({
    queryKey: ['rating', slug, user?.id],
    queryFn: async () => {
      if (!user || !slug) return null;
      const { data } = await supabase
        .from('ratings')
        .select('rating')
        .eq('user_id', user.id)
        .eq('movie_slug', slug)
        .single();
      return data?.rating || 0;
    },
    enabled: !!user && !!slug,
  });

  // Fetch average rating
  const { data: avgRating } = useQuery({
    queryKey: ['avgRating', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data } = await supabase
        .from('ratings')
        .select('rating')
        .eq('movie_slug', slug);
      if (!data || data.length === 0) return { avg: 0, count: 0 };
      const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
      return { avg: Math.round(avg * 10) / 10, count: data.length };
    },
    enabled: !!slug,
  });

  // Fetch comments
  const { data: comments } = useQuery({
    queryKey: ['comments', slug],
    queryFn: async () => {
      if (!slug) return [];
      const { data } = await supabase
        .from('comments')
        .select('*, profiles:user_id(display_name, avatar_url)')
        .eq('movie_slug', slug)
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!slug,
  });

  // Rating mutation
  const rateMutation = useMutation({
    mutationFn: async (rating: number) => {
      if (!user || !slug) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('ratings')
        .upsert({
          user_id: user.id,
          movie_slug: slug,
          rating,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,movie_slug' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rating', slug] });
      queryClient.invalidateQueries({ queryKey: ['avgRating', slug] });
      toast.success('Đã đánh giá phim');
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !slug) throw new Error('Not authenticated');
      const { error } = await supabase.from('comments').insert({
        user_id: user.id,
        movie_slug: slug,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', slug] });
      setComment('');
      toast.success('Đã thêm bình luận');
    },
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  useEffect(() => {
    if (existingRating) setUserRating(existingRating);
  }, [existingRating]);

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

  const handleRate = (rating: number) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }
    setUserRating(rating);
    rateMutation.mutate(rating);
  };

  const handleComment = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để bình luận');
      return;
    }
    if (!comment.trim()) return;
    commentMutation.mutate(comment);
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
      <div className="relative min-h-[60vh] md:min-h-[70vh]">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 0%, hsl(var(--background) / 0.5) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="container relative -mt-56 md:-mt-80 pb-12">
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

            {/* Rating Display */}
            <div className="glass rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Đánh giá</span>
                {avgRating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{avgRating.avg}</span>
                    <span className="text-xs text-muted-foreground">
                      ({avgRating.count})
                    </span>
                  </div>
                )}
              </div>

              {/* Star Rating */}
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRate(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        star <= (hoverRating || userRating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                {userRating ? `Bạn đã đánh giá ${userRating} sao` : 'Nhấn để đánh giá'}
              </p>
            </div>

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
                  <span>
                    {movie.episode_current} / {movie.episode_total}
                  </span>
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
                  <Badge
                    variant="secondary"
                    className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    {cat.name}
                  </Badge>
                </Link>
              ))}
              {movie.country?.map((country) => (
                <Link key={country.slug} to={`/quoc-gia/${country.slug}`}>
                  <Badge
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
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

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Tabs defaultValue="episodes" className="w-full">
                <TabsList className="w-full justify-start bg-secondary/50 p-1 rounded-xl">
                  <TabsTrigger value="episodes" className="rounded-lg">
                    <List className="h-4 w-4 mr-2" />
                    Tập phim
                  </TabsTrigger>
                  <TabsTrigger value="info" className="rounded-lg">
                    <Info className="h-4 w-4 mr-2" />
                    Thông tin
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="rounded-lg">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Bình luận
                    {comments && comments.length > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {comments.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Episodes Tab */}
                <TabsContent value="episodes" className="mt-6">
                  {movie.episodes?.length > 0 && movie.episodes[0].server_data?.length > 0 ? (
                    <div className="space-y-4">
                      {movie.episodes.map((server, idx) => (
                        <div key={idx}>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3">
                            {server.server_name}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {server.server_data.map((ep) => {
                              const isResume = resumeInfo?.episodeSlug === ep.slug;
                              return (
                                <Link key={ep.slug} to={`/xem-phim/${movie.slug}?tap=${ep.slug}`}>
                                  <Button
                                    variant={isResume ? 'default' : 'secondary'}
                                    size="sm"
                                    className={`min-w-[70px] ${
                                      isResume ? 'gradient-primary border-0' : ''
                                    }`}
                                  >
                                    {ep.name}
                                  </Button>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Film className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Chưa có tập phim</p>
                    </div>
                  )}
                </TabsContent>

                {/* Info Tab */}
                <TabsContent value="info" className="mt-6 space-y-6">
                  {/* Description */}
                  {movie.content && (
                    <div>
                      <h3 className="font-semibold mb-3">Nội dung phim</h3>
                      <div
                        className="text-muted-foreground leading-relaxed prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: movie.content }}
                      />
                    </div>
                  )}

                  {/* Cast & Director */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    {movie.director?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Đạo diễn</h4>
                        <p className="text-sm text-muted-foreground">{movie.director.join(', ')}</p>
                      </div>
                    )}
                    {movie.actor?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Diễn viên</h4>
                        <p className="text-sm text-muted-foreground">{movie.actor.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Comments Tab */}
                <TabsContent value="comments" className="mt-6 space-y-6">
                  {/* Comment Form */}
                  <div className="space-y-3">
                    <Textarea
                      placeholder={user ? 'Viết bình luận...' : 'Đăng nhập để bình luận'}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      disabled={!user}
                      className="min-h-[100px] bg-secondary/50"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleComment}
                        disabled={!user || !comment.trim() || commentMutation.isPending}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Gửi bình luận
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments && comments.length > 0 ? (
                      comments.map((c: any) => (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3 p-4 rounded-xl bg-secondary/30"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={c.profiles?.avatar_url || ''} />
                            <AvatarFallback>
                              {c.profiles?.display_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {c.profiles?.display_name || 'Ẩn danh'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(c.created_at).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{c.content}</p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Chưa có bình luận nào</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </motion.div>

        {/* Related Movies */}
        {relatedMovies?.items && relatedMovies.items.length > 0 && (
          <div className="mt-12">
            <MovieCarousel
              title="Phim liên quan"
              movies={relatedMovies.items.filter((m) => m.slug !== movie.slug)}
              viewAllLink={movie.type === 'series' ? '/danh-sach/phim-bo' : '/danh-sach/phim-le'}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MovieDetail;
