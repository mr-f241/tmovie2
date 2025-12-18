import { useQuery } from '@tanstack/react-query';
import { fetchNewMovies, fetchMoviesByType } from '@/services/api';
import { Layout } from '@/components/layout/Layout';
import { HeroSlider } from '@/components/movie/HeroSlider';
import { DiscoverySection } from '@/components/movie/DiscoverySection';
import { MovieCarousel } from '@/components/movie/MovieCarousel';
import { GenreHighlights } from '@/components/movie/GenreHighlights';
import { FeaturedBanner } from '@/components/movie/FeaturedBanner';
import { PersonalizedSections } from '@/components/movie/PersonalizedSections';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  const { data: newMovies, isLoading: loadingNew } = useQuery({
    queryKey: ['newMovies'],
    queryFn: () => fetchNewMovies(1),
    staleTime: 5 * 60 * 1000,
  });

  const { data: phimBo, isLoading: loadingPhimBo } = useQuery({
    queryKey: ['phimBo'],
    queryFn: () => fetchMoviesByType('phim-bo', 1),
    staleTime: 5 * 60 * 1000,
  });

  const { data: phimLe, isLoading: loadingPhimLe } = useQuery({
    queryKey: ['phimLe'],
    queryFn: () => fetchMoviesByType('phim-le', 1),
    staleTime: 5 * 60 * 1000,
  });

  const { data: hoatHinh, isLoading: loadingHoatHinh } = useQuery({
    queryKey: ['hoatHinh'],
    queryFn: () => fetchMoviesByType('hoat-hinh', 1),
    staleTime: 5 * 60 * 1000,
  });

  const { data: tvShows, isLoading: loadingTvShows } = useQuery({
    queryKey: ['tvShows'],
    queryFn: () => fetchMoviesByType('tv-shows', 1),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Layout>
      {/* Hero Slider */}
      <HeroSlider movies={newMovies?.items || []} loading={loadingNew} />

      {/* Discovery Section - "What do you want to watch?" */}
      <DiscoverySection />

      {/* Personalized Sections for logged-in users */}
      {user && <PersonalizedSections />}

      {/* Featured Carousels */}
      <MovieCarousel
        title="Phim Mới Cập Nhật"
        subtitle="Cập nhật mới nhất hàng ngày"
        movies={newMovies?.items || []}
        loading={loadingNew}
        viewAllLink="/danh-sach/phim-moi"
      />

      {/* Genre Highlights */}
      <GenreHighlights />

      <MovieCarousel
        title="Phim Bộ Hot"
        subtitle="Series phim được yêu thích nhất"
        movies={phimBo?.items || []}
        loading={loadingPhimBo}
        viewAllLink="/danh-sach/phim-bo"
      />

      {/* Featured Banners */}
      <FeaturedBanner />

      <MovieCarousel
        title="Phim Lẻ Hay"
        subtitle="Bộ sưu tập phim điện ảnh chất lượng"
        movies={phimLe?.items || []}
        loading={loadingPhimLe}
        viewAllLink="/danh-sach/phim-le"
      />

      <MovieCarousel
        title="Hoạt Hình"
        subtitle="Animation & Anime cho mọi lứa tuổi"
        movies={hoatHinh?.items || []}
        loading={loadingHoatHinh}
        viewAllLink="/danh-sach/hoat-hinh"
      />

      <MovieCarousel
        title="TV Shows"
        subtitle="Chương trình giải trí đa dạng"
        movies={tvShows?.items || []}
        loading={loadingTvShows}
        viewAllLink="/danh-sach/tv-shows"
      />
    </Layout>
  );
};

export default Index;
