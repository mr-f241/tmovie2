import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMoviesByCategory, fetchMoviesByCountry, fetchCategories, fetchCountries } from '@/services/api';
import { Layout } from '@/components/layout/Layout';
import { MovieGrid } from '@/components/movie/MovieGrid';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryPageProps {
  type: 'category' | 'country';
}

const CategoryPage = ({ type }: CategoryPageProps) => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const fetchFn = type === 'category' ? fetchMoviesByCategory : fetchMoviesByCountry;
  const listFn = type === 'category' ? fetchCategories : fetchCountries;

  const { data, isLoading } = useQuery({
    queryKey: [type, slug, page],
    queryFn: () => fetchFn(slug!, page),
    enabled: !!slug,
  });

  const { data: items } = useQuery({
    queryKey: [type === 'category' ? 'categories' : 'countries'],
    queryFn: listFn,
  });

  const currentItem = items?.find((item) => item.slug === slug);

  useEffect(() => {
    setPage(1);
  }, [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSearchParams({ page: String(newPage) });
  };

  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            {type === 'category' ? 'Thể loại' : 'Quốc gia'}: {currentItem?.name || slug}
          </h1>
          <p className="text-muted-foreground mt-1">
            Tổng cộng {data?.pagination?.totalItems || 0} phim
          </p>
        </div>

        <MovieGrid movies={data?.items || []} loading={isLoading} skeletonCount={24} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button
              variant="secondary"
              size="icon"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? 'default' : 'secondary'}
                    size="sm"
                    className={pageNum === page ? 'gradient-primary border-0' : ''}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="secondary"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;
