import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Heart, History, ChevronRight, Play, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const PersonalizedSections = () => {
  const { user } = useAuth();

  // Fetch watch history
  const { data: watchHistory } = useQuery({
    queryKey: ['watchHistory', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('watched_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch favorites
  const { data: favorites } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!user,
  });

  if (!user) return null;

  const continueWatching = watchHistory?.filter((item) => {
    const progress = item.progress || 0;
    const duration = item.duration || 1;
    return progress > 0 && progress < duration * 0.9;
  });

  return (
    <div className="space-y-8">
      {/* Continue Watching */}
      {continueWatching && continueWatching.length > 0 && (
        <section className="py-8">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl md:text-2xl font-bold flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                Tiếp Tục Xem
              </h2>
              <Link
                to="/lich-su"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                Xem tất cả
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {continueWatching.slice(0, 4).map((item, index) => {
                const progress = ((item.progress || 0) / (item.duration || 1)) * 100;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={`/xem-phim/${item.movie_slug}${item.episode_slug ? `/${item.episode_slug}` : ''}`}
                      className="group block relative rounded-xl overflow-hidden bg-secondary/50"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video">
                        <img
                          src={getImageUrl(item.poster_url || '')}
                          alt={item.movie_name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                        {/* Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center glow">
                            <Play className="h-6 w-6 text-primary-foreground fill-current ml-1" />
                          </div>
                        </div>

                        {/* Episode Badge */}
                        {item.episode_name && (
                          <Badge
                            variant="secondary"
                            className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm text-xs"
                          >
                            {item.episode_name}
                          </Badge>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0">
                        <Progress value={progress} className="h-1 rounded-none" />
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {item.movie_name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round(progress)}% đã xem
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* My List */}
      {favorites && favorites.length > 0 && (
        <section className="py-8">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl md:text-2xl font-bold flex items-center gap-3">
                <Heart className="h-5 w-5 text-rose-500" />
                Danh Sách Của Tôi
              </h2>
              <Link
                to="/danh-sach-cua-toi"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                Xem tất cả
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {favorites.slice(0, 10).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0 w-[140px]"
                >
                  <Link to={`/phim/${item.movie_slug}`} className="group block">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-secondary">
                      <img
                        src={getImageUrl(item.poster_url || '')}
                        alt={item.movie_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                          <Play className="h-4 w-4 text-primary-foreground fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="font-medium text-xs line-clamp-2 group-hover:text-primary transition-colors">
                        {item.movie_name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.year}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommended Section Placeholder */}
      {watchHistory && watchHistory.length > 0 && (
        <section className="py-8">
          <div className="container">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl md:text-2xl font-bold">
                Đề Xuất Cho Bạn
              </h2>
            </div>
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Xem thêm phim để nhận được gợi ý phù hợp với sở thích của bạn
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
