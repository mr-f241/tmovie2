import { Movie } from '@/types/movie';
import { MovieCard } from './MovieCard';
import { MovieCardSkeleton } from './MovieCardSkeleton';

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  skeletonCount?: number;
  columns?: 2 | 3 | 4 | 5 | 6;
}

export const MovieGrid = ({ 
  movies, 
  loading, 
  skeletonCount = 12,
  columns = 6 
}: MovieGridProps) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  };

  if (loading) {
    return (
      <div className={`grid ${gridCols[columns]} gap-4`}>
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
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {movies.map((movie, index) => (
        <MovieCard key={movie._id || movie.slug} movie={movie} index={index} />
      ))}
    </div>
  );
};
