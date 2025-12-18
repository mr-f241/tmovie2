import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Play } from 'lucide-react';
import { Movie } from '@/types/movie';
import { Skeleton } from '@/components/ui/skeleton';

interface Top10SectionProps {
  title: string;
  movies: Movie[];
  loading?: boolean;
  viewAllLink?: string;
}

export const Top10Section = ({ title, movies, loading, viewAllLink }: Top10SectionProps) => {
  const top10Movies = movies.slice(0, 10);

  if (loading) {
    return (
      <section className="py-8">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[180px]">
                <Skeleton className="aspect-[2/3] rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl md:text-2xl font-bold flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-primary/50" />
            {title}
          </h2>
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

        {/* Scrollable container */}
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {top10Movies.map((movie, index) => (
              <motion.div
                key={movie._id || movie.slug}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 snap-start"
              >
                <Link
                  to={`/phim/${movie.slug}`}
                  className="group relative flex items-end"
                >
                  {/* Large Number */}
                  <div className="relative z-10 -mr-4 mb-2">
                    <span 
                      className="font-display text-[80px] md:text-[100px] font-black leading-none"
                      style={{
                        WebkitTextStroke: '2px hsl(var(--primary))',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '4px 4px 8px rgba(0,0,0,0.5)'
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>

                  {/* Poster */}
                  <div className="relative w-[120px] md:w-[140px] aspect-[2/3] rounded-xl overflow-hidden shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                    <img
                      src={movie.poster_url?.startsWith('http') 
                        ? movie.poster_url 
                        : `https://phimimg.com/${movie.poster_url}`}
                      alt={movie.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <Play className="h-5 w-5 text-primary-foreground fill-current" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quality Badge */}
                    {movie.quality && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded">
                        {movie.quality}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Movie Info */}
                <div className="mt-2 pl-12 w-[160px] md:w-[180px]">
                  <h3 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                    {movie.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {movie.origin_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {movie.year && <span>{movie.year}</span>}
                    {movie.episode_current && (
                      <>
                        <span>•</span>
                        <span>{movie.episode_current}</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
