import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchNewMovies, fetchMoviesByType } from '@/services/api';
import { Layout } from '@/components/layout/Layout';
import { HeroSlider } from '@/components/movie/HeroSlider';
import { MovieSection } from '@/components/movie/MovieSection';

const Index = () => {
  const { data: newMovies, isLoading: loadingNew } = useQuery({
    queryKey: ['newMovies'],
    queryFn: () => fetchNewMovies(1),
  });

  const { data: phimBo, isLoading: loadingPhimBo } = useQuery({
    queryKey: ['phimBo'],
    queryFn: () => fetchMoviesByType('phim-bo', 1),
  });

  const { data: phimLe, isLoading: loadingPhimLe } = useQuery({
    queryKey: ['phimLe'],
    queryFn: () => fetchMoviesByType('phim-le', 1),
  });

  const { data: hoatHinh, isLoading: loadingHoatHinh } = useQuery({
    queryKey: ['hoatHinh'],
    queryFn: () => fetchMoviesByType('hoat-hinh', 1),
  });

  const { data: tvShows, isLoading: loadingTvShows } = useQuery({
    queryKey: ['tvShows'],
    queryFn: () => fetchMoviesByType('tv-shows', 1),
  });

  return (
    <Layout>
      {/* Hero Slider */}
      <HeroSlider movies={newMovies?.items || []} loading={loadingNew} />

      {/* Movie Sections */}
      <div className="space-y-4">
        <MovieSection
          title="Phim Mới Cập Nhật"
          movies={newMovies?.items || []}
          loading={loadingNew}
          viewAllLink="/danh-sach/phim-moi"
        />

        <MovieSection
          title="Phim Bộ"
          movies={phimBo?.items || []}
          loading={loadingPhimBo}
          viewAllLink="/danh-sach/phim-bo"
        />

        <MovieSection
          title="Phim Lẻ"
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
