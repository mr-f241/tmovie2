import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Flame,
  ChevronRight,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const hotGenres = [
  { name: 'Hành Động', slug: 'hanh-dong', color: 'from-red-500 to-orange-500' },
  { name: 'Tình Cảm', slug: 'tinh-cam', color: 'from-pink-500 to-rose-500' },
  { name: 'Kinh Dị', slug: 'kinh-di', color: 'from-purple-500 to-violet-500' },
  { name: 'Hài Hước', slug: 'hai-huoc', color: 'from-yellow-500 to-amber-500' },
];

const trendingMovies = [
  { name: 'Song Quỷ', slug: 'song-quy', views: '125K' },
  { name: 'Nụ Hôn Bùng Nổ', slug: 'nu-hon-bung-no', views: '98K' },
  { name: 'Trường An 24H', slug: 'truong-an-24h', views: '87K' },
  { name: 'Thần Điêu Đại Hiệp', slug: 'than-dieu-dai-hiep', views: '76K' },
];

const mostLiked = [
  { name: 'Song Quỷ', slug: 'song-quy', likes: '15.2K' },
  { name: 'Ẩn Danh', slug: 'an-danh', likes: '12.8K' },
  { name: 'Nụ Hôn Bùng Nổ', slug: 'nu-hon-bung-no', likes: '11.5K' },
  { name: 'Ngân Hà Hải Kiếp', slug: 'ngan-ha-hai-kiep', likes: '9.8K' },
];

export const ActivityStats = () => {
  // Fetch recent comments
  const { data: recentComments, isLoading } = useQuery({
    queryKey: ['recentComments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          movie_slug,
          user_id,
          profiles!inner(display_name, avatar_url)
        `)
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });

  return (
    <section className="py-10">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sôi Nổi Nhất */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-secondary/30 rounded-xl p-4 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-sm">Sôi Nổi Nhất</h3>
            </div>
            <div className="space-y-3">
              {trendingMovies.map((movie, index) => (
                <Link
                  key={movie.slug}
                  to={`/phim/${movie.slug}`}
                  className="flex items-center gap-3 group"
                >
                  <span className={`text-sm font-bold w-5 ${index < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {index + 1}
                  </span>
                  <span className="text-sm flex-1 truncate group-hover:text-primary transition-colors">
                    {movie.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{movie.views}</span>
                </Link>
              ))}
            </div>
            <Link
              to="/danh-sach/phim-moi"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-4 transition-colors"
            >
              Xem thêm <ChevronRight className="h-3 w-3" />
            </Link>
          </motion.div>

          {/* Yêu Thích Nhất */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-secondary/30 rounded-xl p-4 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-sm">Yêu Thích Nhất</h3>
            </div>
            <div className="space-y-3">
              {mostLiked.map((movie, index) => (
                <Link
                  key={movie.slug}
                  to={`/phim/${movie.slug}`}
                  className="flex items-center gap-3 group"
                >
                  <span className={`text-sm font-bold w-5 ${index < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {index + 1}
                  </span>
                  <span className="text-sm flex-1 truncate group-hover:text-primary transition-colors">
                    {movie.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{movie.likes}</span>
                </Link>
              ))}
            </div>
            <Link
              to="/danh-sach/phim-moi"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-4 transition-colors"
            >
              Xem thêm <ChevronRight className="h-3 w-3" />
            </Link>
          </motion.div>

          {/* Thể Loại Hot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-secondary/30 rounded-xl p-4 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-sm">Thể Loại Hot</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {hotGenres.map((genre) => (
                <Link
                  key={genre.slug}
                  to={`/the-loai/${genre.slug}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r ${genre.color} text-white hover:opacity-90 transition-opacity`}
                >
                  {genre.name}
                </Link>
              ))}
            </div>
            <Link
              to="/the-loai"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-4 transition-colors"
            >
              Xem tất cả <ChevronRight className="h-3 w-3" />
            </Link>
          </motion.div>

          {/* Bình Luận Mới */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-secondary/30 rounded-xl p-4 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-sm">Bình Luận Mới</h3>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentComments?.slice(0, 4).map((comment: any) => (
                  <Link
                    key={comment.id}
                    to={`/phim/${comment.movie_slug}`}
                    className="flex gap-2 group"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.profiles?.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {comment.profiles?.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium truncate">
                          {comment.profiles?.display_name || 'Ẩn danh'}
                        </span>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { 
                            addSuffix: true, 
                            locale: vi 
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 group-hover:text-foreground transition-colors">
                        {comment.content}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
