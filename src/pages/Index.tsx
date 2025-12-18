import { useQuery } from '@tanstack/react-query';
import { fetchNewMovies, fetchMoviesByType } from '@/services/api';
import { Layout } from '@/components/layout/Layout';
import { HeroSlider } from '@/components/movie/HeroSlider';
import { MovieSection } from '@/components/movie/MovieSection';
import { ContinueWatching } from '@/components/movie/ContinueWatching';

const Index = () => {
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

      {/* Continue Watching */}
      <ContinueWatching />

      {/* Movie Sections */}
      <div className="space-y-2">
        <MovieSection
          title="Phim Mới Cập Nhật"
          movies={newMovies?.items || []}
          loading={loadingNew}
          viewAllLink="/danh-sach/phim-moi"
        />

        <MovieSection
          title="Phim Bộ Mới"
          movies={phimBo?.items || []}
          loading={loadingPhimBo}
          viewAllLink="/danh-sach/phim-bo"
        />

        <MovieSection
          title="Phim Lẻ Hot"
          movies={phimLe?.items || []}
          loading={loadingPhimLe}
          viewAllLink="/danh-sach/phim-le"
        />

        <MovieSection
          title="Hoạt Hình"
          movies={hoatHinh?.items || []}
          loading={loadingHoatHinh}
          viewAllLink="/danh-sach/hoat-hinh"
        />

        <MovieSection
          title="TV Shows"
          movies={tvShows?.items || []}
          loading={loadingTvShows}
          viewAllLink="/danh-sach/tv-shows"
        />
      </div>
    </Layout>
  );
};

export default Index;
