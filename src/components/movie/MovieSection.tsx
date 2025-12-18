import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Movie } from '@/types/movie';
import { MovieCard } from './MovieCard';
import { MovieCardSkeleton } from './MovieCardSkeleton';

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  loading?: boolean;
  viewAllLink?: string;
}

export const MovieSection = ({ title, movies, loading, viewAllLink }: MovieSectionProps) => {
  return (
    <section className="py-8">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl md:text-2xl font-bold">{title}</h2>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Xem tất cả
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.slice(0, 12).map((movie, index) => (
              <MovieCard key={movie._id || movie.slug} movie={movie} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
