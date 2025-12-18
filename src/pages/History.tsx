import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Trash2, Play, User } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Layout } from '@/components/layout/Layout';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/hooks/useAuthModal';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const History: React.FC = () => {
  const { t } = useTranslation();
  const { history, removeFromHistory, clearHistory, isLoaded } = useWatchHistory();
  const { user, isLoading } = useAuth();
  const { openLogin } = useAuthModal();

  useEffect(() => {
    if (!isLoading && !user) {
      openLogin();
    }
  }, [user, isLoading, openLogin]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Vui lòng đăng nhập để xem lịch sử</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <HistoryIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold">{t('nav.history')}</h1>
                <p className="text-muted-foreground">
                  {history.length} phim đã xem
                </p>
              </div>
            </div>
            {history.length > 0 && (
              <Button variant="outline" onClick={clearHistory} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Xóa tất cả
              </Button>
            )}
          </div>

          {!isLoaded ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 skeleton-shimmer rounded-lg" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-20">
              <HistoryIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">{t('empty.history')}</h2>
              <p className="text-muted-foreground mb-6">
                Bắt đầu xem phim để lưu lịch sử
              </p>
              <Link to="/">
                <Button>Khám phá phim</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <motion.div
                  key={item.slug}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="glass-card rounded-xl overflow-hidden group"
                >
                  <div className="flex gap-4 p-4">
                    {/* Poster */}
                    <Link 
                      to={`/xem-phim/${item.slug}?tap=${item.episodeSlug}`}
                      className="relative w-24 sm:w-32 aspect-video rounded-lg overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={item.posterUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-foreground" />
                      </div>
                      {/* Progress overlay */}
                      <div className="absolute bottom-0 left-0 right-0">
                        <Progress value={item.progress} className="h-1 rounded-none" />
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/phim/${item.slug}`}>
                        <h3 className="font-semibold line-clamp-1 hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.episodeName}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <span>{item.progress}% đã xem</span>
                        <span>•</span>
                        <span>{formatDate(item.timestamp)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link to={`/xem-phim/${item.slug}?tap=${item.episodeSlug}`}>
                        <Button size="sm" className="gap-2">
                          <Play className="w-4 h-4" />
                          <span className="hidden sm:inline">Tiếp tục</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromHistory(item.slug)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default History;
