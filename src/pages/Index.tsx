import { useQuery } from '@tanstack/react-query';
import { fetchNewMovies, fetchMoviesByType } from '@/services/api';
import { Layout } from '@/components/layout/Layout';
import { HeroSlider } from '@/components/movie/HeroSlider';
import { MovieCarousel } from '@/components/movie/MovieCarousel';
import { GenreHighlights } from '@/components/movie/GenreHighlights';
import { PersonalizedSections } from '@/components/movie/PersonalizedSections';
import { QuickFilters } from '@/components/movie/QuickFilters';
import { Top10Section } from '@/components/movie/Top10Section';
import { ActivityStats } from '@/components/movie/ActivityStats';
import { ThemedCollection } from '@/components/movie/ThemedCollection';
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

      {/* Quick Filters */}
      <QuickFilters />

      {/* Activity Stats - Sôi nổi, yêu thích, thể loại hot, bình luận mới */}
      <ActivityStats />

      {/* Personalized Sections for logged-in users */}
      {user && <PersonalizedSections />}

      {/* Top 10 Phim Bộ */}
      <Top10Section
        title="Top 10 Phim Bộ Hôm Nay"
        movies={phimBo?.items || []}
        loading={loadingPhimBo}
        viewAllLink="/danh-sach/phim-bo"
      />

      {/* Phim Mới Cập Nhật */}
      <MovieCarousel
        title="Phim Mới Cập Nhật"
        subtitle="Cập nhật mới nhất hàng ngày"
        movies={newMovies?.items || []}
        loading={loadingNew}
        viewAllLink="/danh-sach/phim-moi"
      />

      {/* Genre Highlights */}
      <GenreHighlights />

      {/* Top 10 Phim Lẻ */}
      <Top10Section
        title="Top 10 Phim Lẻ Hôm Nay"
        movies={phimLe?.items || []}
        loading={loadingPhimLe}
        viewAllLink="/danh-sach/phim-le"
      />

      {/* Themed Collections */}
      <ThemedCollection
        title="Kho Tàng Anime Mới Nhất"
        movies={hoatHinh?.items || []}
        loading={loadingHoatHinh}
        viewAllLink="/danh-sach/hoat-hinh"
        featured
      />

      <MovieCarousel
        title="Phim Bộ Hot"
        subtitle="Series phim được yêu thích nhất"
        movies={phimBo?.items || []}
        loading={loadingPhimBo}
        viewAllLink="/danh-sach/phim-bo"
      />

      <ThemedCollection
        title="Phim Điện Ảnh Mới Công Chiếu"
        movies={phimLe?.items || []}
        loading={loadingPhimLe}
        viewAllLink="/danh-sach/phim-le"
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
