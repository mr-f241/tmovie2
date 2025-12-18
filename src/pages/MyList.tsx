import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Heart, Trash2, User } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Layout } from '@/components/layout/Layout';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/hooks/useAuthModal';
import { Button } from '@/components/ui/button';
import { MovieCard } from '@/components/movie/MovieCard';

const MyList: React.FC = () => {
  const { t } = useTranslation();
  const { favorites, removeFavorite, isLoaded } = useFavorites();
  const { user, isLoading } = useAuth();
  const { openLogin } = useAuthModal();

  useEffect(() => {
    if (!isLoading && !user) {
      openLogin();
    }
  }, [user, isLoading, openLogin]);

  if (!user) {
    return (
      <Layout>
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <User className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm sm:text-base text-muted-foreground">Vui lòng đăng nhập để xem danh sách yêu thích</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 sm:py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-display font-bold">{t('nav.myList')}</h1>
              <p className="text-sm text-muted-foreground">
                {favorites.length} phim yêu thích
              </p>
            </div>
          </div>

          {!isLoaded ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[2/3] skeleton-shimmer rounded-lg" />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <Heart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold mb-2">{t('empty.favorites')}</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                Thêm phim vào danh sách yêu thích để xem sau
              </p>
              <Link to="/">
                <Button>Khám phá phim</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {favorites.map((movie, index) => (
                <motion.div
                  key={movie.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative group"
                >
                  <MovieCard
                    movie={{
                      _id: movie.slug,
                      slug: movie.slug,
                      name: movie.name,
                      poster_url: movie.posterUrl,
                      origin_name: movie.originName,
                      year: movie.year,
                      type: 'single',
                      thumb_url: movie.posterUrl,
                      sub_docquyen: false,
                      chipiPhim: false,
                      time: '',
                      quality: '',
                      lang: '',
                      episode_current: '',
                      category: [],
                      country: [],
                    } as any}
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFavorite(movie.slug);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-destructive/90 flex items-center justify-center text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default MyList;
