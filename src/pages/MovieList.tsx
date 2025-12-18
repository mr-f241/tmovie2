import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMoviesByType, fetchNewMovies, fetchCategories, fetchCountries } from '@/services/api';
import { Layout } from '@/components/layout/Layout';
import { MovieGrid } from '@/components/movie/MovieGrid';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const typeNames: Record<string, string> = {
  'phim-moi': 'Phim Mới Cập Nhật',
  'phim-bo': 'Phim Bộ',
  'phim-le': 'Phim Lẻ',
  'hoat-hinh': 'Hoạt Hình',
  'tv-shows': 'TV Shows',
};

const MovieList = () => {
  const { type = 'phim-moi' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const { data, isLoading } = useQuery({
    queryKey: ['movieList', type, page],
    queryFn: () =>
      type === 'phim-moi' ? fetchNewMovies(page) : fetchMoviesByType(type, page),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
  });

  useEffect(() => {
    setPage(1);
  }, [type]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSearchParams({ page: String(newPage) });
  };

  const totalPages = data?.pagination?.totalPages || 1;
  const currentPage = data?.pagination?.currentPage || page;

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              {typeNames[type] || 'Danh sách phim'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Tổng cộng {data?.pagination?.totalItems || 0} phim
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <Select>
              <SelectTrigger className="w-[150px] bg-secondary/50">
                <SelectValue placeholder="Thể loại" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[150px] bg-secondary/50">
                <SelectValue placeholder="Quốc gia" />
              </SelectTrigger>
              <SelectContent>
                {countries?.map((country) => (
                  <SelectItem key={country.slug} value={country.slug}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Movie Grid */}
        <MovieGrid movies={data?.items || []} loading={isLoading} skeletonCount={24} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button
              variant="secondary"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? 'default' : 'secondary'}
                    size="sm"
                    className={pageNum === currentPage ? 'gradient-primary border-0' : ''}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-2 text-muted-foreground">...</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="secondary"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MovieList;
