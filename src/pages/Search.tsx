import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, ChevronLeft, ChevronRight, Film, Youtube } from 'lucide-react';
import { searchMovies } from '@/services/api';
import { searchYouTube } from '@/services/youtube';
import { Layout } from '@/components/layout/Layout';
import { MovieGrid } from '@/components/movie/MovieGrid';
import { YouTubeGrid } from '@/components/search/YouTubeGrid';
import { InstantSearch } from '@/components/search/InstantSearch';
import { Button } from '@/components/ui/button';

const YOUTUBE_PAGE_SIZE = 24;

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const page = Number(searchParams.get('page')) || 1;
  const tab = (searchParams.get('tab') as 'movies' | 'youtube') || 'movies';

  // YouTube pagination state (pageToken based)
  const [youtubePageToken, setYoutubePageToken] = useState<string | undefined>(undefined);
  const [youtubePageHistory, setYoutubePageHistory] = useState<string[]>([]);

  // Movie search
  const { data: movieData, isLoading: isLoadingMovies } = useQuery({
    queryKey: ['search', keyword, page],
    queryFn: () => searchMovies(keyword, page),
    enabled: !!keyword && tab === 'movies',
  });

  // YouTube search with pagination
  const { data: youtubeData, isLoading: isLoadingYouTube } = useQuery({
    queryKey: ['youtubeSearchPage', keyword, YOUTUBE_PAGE_SIZE, youtubePageToken],
    queryFn: () => searchYouTube(keyword, YOUTUBE_PAGE_SIZE, youtubePageToken),
    enabled: !!keyword && tab === 'youtube',
  });

  const handleTabChange = (newTab: 'movies' | 'youtube') => {
    setSearchParams({ keyword, tab: newTab, page: '1' });
    // Reset YouTube pagination when changing tabs
    setYoutubePageToken(undefined);
    setYoutubePageHistory([]);
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ keyword, tab, page: String(newPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleYouTubeNextPage = () => {
    if (youtubeData?.nextPageToken) {
      // Save current token to history for going back
      setYoutubePageHistory((prev) => [...prev, youtubePageToken || '']);
      setYoutubePageToken(youtubeData.nextPageToken);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleYouTubePrevPage = () => {
    if (youtubePageHistory.length > 0) {
      const newHistory = [...youtubePageHistory];
      const prevToken = newHistory.pop();
      setYoutubePageHistory(newHistory);
      setYoutubePageToken(prevToken || undefined);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalPages = movieData?.pagination?.totalPages || 1;
  const movieCount = movieData?.pagination?.totalItems || 0;
  const youtubeCount = youtubeData?.totalResults || 0;
  const currentYouTubePage = youtubePageHistory.length + 1;
  // YouTube API limits to ~500 results max, so cap total pages
  const estimatedYouTubeTotalPages = Math.min(
    Math.ceil(youtubeCount / YOUTUBE_PAGE_SIZE),
    Math.ceil(500 / YOUTUBE_PAGE_SIZE)
  );

  return (
    <Layout>
      <main className="container py-8">
        {/* Search Header */}
        <header className="max-w-2xl mx-auto mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-6">
            Tìm kiếm
          </h1>
          <div className="flex justify-center">
            <InstantSearch initialQuery={keyword} />
          </div>
        </header>

        {/* Results */}
        {keyword && (
          <section>
            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6 border-b border-border">
              <button
                onClick={() => handleTabChange('movies')}
                className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  tab === 'movies'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Film className="h-4 w-4" />
                Phim
                {tab === 'movies' && movieCount > 0 && (
                  <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                    {movieCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleTabChange('youtube')}
                className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  tab === 'youtube'
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Youtube className="h-4 w-4" />
                YouTube
                {tab === 'youtube' && youtubeCount > 0 && (
                  <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
                    {youtubeCount > 1000 ? '1000+' : youtubeCount}
                  </span>
                )}
              </button>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold">
                Kết quả cho &quot;{keyword}&quot;
              </h2>
              {tab === 'movies' && movieCount > 0 && (
                <p className="text-muted-foreground">{movieCount} phim</p>
              )}
              {tab === 'youtube' && youtubeCount > 0 && (
                <p className="text-muted-foreground">
                  {youtubeCount > 1000 ? '1000+' : youtubeCount} video
                </p>
              )}
            </div>

            {/* Content */}
            {tab === 'movies' ? (
              <>
                <MovieGrid movies={movieData?.items || []} loading={isLoadingMovies} skeletonCount={12} />

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
              </>
            ) : (
              <>
                <YouTubeGrid
                  videos={youtubeData?.items || []}
                  loading={isLoadingYouTube}
                  skeletonCount={12}
                />

                {/* YouTube Pagination */}
                {(youtubeData?.nextPageToken || youtubePageHistory.length > 0) && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      variant="secondary"
                      size="icon"
                      disabled={youtubePageHistory.length === 0}
                      onClick={handleYouTubePrevPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="px-4 text-sm text-muted-foreground">
                      Trang {currentYouTubePage} / {estimatedYouTubeTotalPages || '?'}
                    </span>

                    <Button
                      variant="secondary"
                      size="icon"
                      disabled={!youtubeData?.nextPageToken}
                      onClick={handleYouTubeNextPage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
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
