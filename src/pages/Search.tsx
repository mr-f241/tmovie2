import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon } from 'lucide-react';
import { searchMovies } from '@/services/api';
import { Layout } from '@/components/layout/Layout';
import { MovieGrid } from '@/components/movie/MovieGrid';
import { SearchSuggestions } from '@/components/search/SearchSuggestions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const page = Number(searchParams.get('page')) || 1;
  const [inputValue, setInputValue] = useState(keyword);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['search', keyword, page],
    queryFn: () => searchMovies(keyword, page),
    enabled: !!keyword,
  });

  useEffect(() => {
    setInputValue(keyword);
  }, [keyword]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ keyword: inputValue.trim(), page: '1' });
      setShowSuggestions(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ keyword, page: String(newPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <Layout>
      <div className="container py-8">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-6">
            Tìm kiếm phim
          </h1>
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Nhập tên phim cần tìm..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full h-14 text-lg bg-secondary/50 border-border/50 pr-14 rounded-xl"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 gradient-primary border-0"
            >
              <SearchIcon className="h-5 w-5" />
            </Button>
          </form>

          {/* Suggestions dropdown */}
          {showSuggestions && !keyword && (
            <div className="mt-4 glass-card rounded-xl p-4">
              <SearchSuggestions onSelect={() => setShowSuggestions(false)} />
            </div>
          )}
        </div>

        {/* Results */}
        {keyword && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold">
                Kết quả cho "{keyword}"
              </h2>
              {data?.pagination?.totalItems && (
                <p className="text-muted-foreground">
                  {data.pagination.totalItems} phim
                </p>
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
          </div>
        )}

        {/* Empty State */}
        {!keyword && !showSuggestions && (
          <div className="text-center py-12">
            <SearchIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nhập từ khóa để tìm kiếm phim yêu thích
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
