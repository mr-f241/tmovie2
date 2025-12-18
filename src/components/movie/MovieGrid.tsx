import { Movie } from '@/types/movie';
import { MovieCard } from './MovieCard';
import { MovieCardSkeleton } from './MovieCardSkeleton';

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  skeletonCount?: number;
}

export const MovieGrid = ({ movies, loading, skeletonCount = 12 }: MovieGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không tìm thấy phim nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {movies.map((movie, index) => (
        <MovieCard key={movie._id || movie.slug} movie={movie} index={index} />
      ))}
    </div>
  );
};
