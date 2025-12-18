import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Play, Star } from 'lucide-react';
import { Movie } from '@/types/movie';
import { Skeleton } from '@/components/ui/skeleton';

interface ThemedCollectionProps {
  title: string;
  movies: Movie[];
  loading?: boolean;
  viewAllLink?: string;
  featured?: boolean;
}

export const ThemedCollection = ({ 
  title, 
  movies, 
  loading, 
  viewAllLink,
  featured = false 
}: ThemedCollectionProps) => {
  if (loading) {
    return (
      <section className="py-6">
        <div className="container">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayMovies = movies.slice(0, featured ? 8 : 12);
  const featuredMovie = featured && displayMovies[0];
  const otherMovies = featured ? displayMovies.slice(1) : displayMovies;

  return (
    <section className="py-6">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg md:text-xl font-bold flex items-center gap-2">
            {title}
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </h2>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-sm text-primary hover:underline"
            >
              Xem tất cả
            </Link>
          )}
        </div>

        {featured && featuredMovie ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Featured Large Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <Link
                to={`/phim/${featuredMovie.slug}`}
                className="group relative block aspect-[3/4] rounded-xl overflow-hidden"
              >
                <img
                  src={featuredMovie.poster_url?.startsWith('http')
                    ? featuredMovie.poster_url
                    : `https://phimimg.com/${featuredMovie.poster_url}`}
                  alt={featuredMovie.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex gap-2 mb-2">
                    {featuredMovie.quality && (
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded">
                        {featuredMovie.quality}
                      </span>
                    )}
                    {featuredMovie.lang && (
                      <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded">
                        {featuredMovie.lang}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                    {featuredMovie.name}
                  </h3>
                  <p className="text-sm text-white/70 mb-3">
                    {featuredMovie.origin_name}
                  </p>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                      <Play className="h-4 w-4 fill-current" />
                      Xem ngay
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Other movies grid */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {otherMovies.slice(0, 8).map((movie, index) => (
                <MovieCard key={movie._id || movie.slug} movie={movie} index={index} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {otherMovies.map((movie, index) => (
              <MovieCard key={movie._id || movie.slug} movie={movie} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Small movie card component
const MovieCard = ({ movie, index }: { movie: Movie; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03 }}
    >
      <Link
        to={`/phim/${movie.slug}`}
        className="group block"
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
          <img
            src={movie.poster_url?.startsWith('http')
              ? movie.poster_url
              : `https://phimimg.com/${movie.poster_url}`}
            alt={movie.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="h-5 w-5 text-primary-foreground fill-current" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-1.5 left-1.5 flex gap-1">
            {movie.quality && (
              <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded">
                {movie.quality}
              </span>
            )}
          </div>

          {/* Episode info */}
          {movie.episode_current && (
            <div className="absolute bottom-1.5 left-1.5 right-1.5">
              <span className="px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded block text-center truncate">
                {movie.episode_current}
              </span>
            </div>
          )}
        </div>

        <h3 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
          {movie.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {movie.origin_name || movie.year}
        </p>
      </Link>
    </motion.div>
  );
};
