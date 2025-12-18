import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchMovies } from '@/services/api';
import { Layout } from '@/components/layout/Layout';
import { MovieGrid } from '@/components/movie/MovieGrid';
import { InstantSearch } from '@/components/search/InstantSearch';
import { Button } from '@/components/ui/button';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const page = Number(searchParams.get('page')) || 1;

  const { data, isLoading } = useQuery({
    queryKey: ['search', keyword, page],
    queryFn: () => searchMovies(keyword, page),
    enabled: !!keyword,
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams({ keyword, page: String(newPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <Layout>
      <main className="container py-8">
        {/* Search Header */}
        <header className="max-w-2xl mx-auto mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-6">
            Tìm kiếm phim
          </h1>
          <div className="flex justify-center">
            <InstantSearch initialQuery={keyword} />
          </div>
        </header>

        {/* Results */}
        {keyword && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold">
                Kết quả cho &quot;{keyword}&quot;
              </h2>
              {data?.pagination?.totalItems && (
                <p className="text-muted-foreground">{data.pagination.totalItems} phim</p>
              )}
            </div>

            <MovieGrid movies={data?.items || []} loading={isLoading} skeletonCount={12} />

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

                <span className="px-4 text-sm text-muted-foreground">
                  Trang {page} / {totalPages}
                </span>

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
          </section>
        )}

        {/* Empty State */}
        {!keyword && (
          <section className="text-center py-12">
            <SearchIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Nhập từ khóa để tìm kiếm phim hoặc video</p>
          </section>
        )}
      </main>
    </Layout>
  );
};

export default Search;

