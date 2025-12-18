import { Link } from 'react-router-dom';
import { Play, Star, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Movie } from '@/types/movie';
import { getImageUrl } from '@/services/api';
import { Badge } from '@/components/ui/badge';

interface MovieCardProps {
  movie: Movie;
  index?: number;
  variant?: 'default' | 'horizontal' | 'large';
}

export const MovieCard = ({ movie, index = 0, variant = 'default' }: MovieCardProps) => {
  const posterUrl = getImageUrl(movie.poster_url);

  if (variant === 'horizontal') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
      >
        <Link
          to={`/phim/${movie.slug}`}
          className="group flex gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
        >
          <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden">
            <img
              src={posterUrl}
              alt={movie.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
          <div className="flex-1 min-w-0 py-1">
            <h3 className="font-display font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {movie.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {movie.origin_name}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {movie.quality && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {movie.quality}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{movie.year}</span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Link
        to={`/phim/${movie.slug}`}
        className="group block relative rounded-xl overflow-hidden card-shadow bg-card"
      >
        {/* Poster */}
        <div className="aspect-[2/3] relative overflow-hidden">
          <img
            src={posterUrl}
            alt={movie.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <motion.div 
              initial={{ scale: 0.5 }}
              whileHover={{ scale: 1.1 }}
              className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center glow transform group-hover:scale-100 transition-transform duration-300"
            >
              <Play className="h-6 w-6 text-primary-foreground fill-current ml-1" />
            </motion.div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {movie.quality && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0.5 gradient-primary border-0 shadow-lg">
                {movie.quality}
              </Badge>
            )}
            {movie.lang && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-secondary/90 backdrop-blur-sm">
                {movie.lang}
              </Badge>
            )}
          </div>

          {/* Episode Badge */}
          {movie.episode_current && (
            <div className="absolute bottom-2 right-2">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-background/90 backdrop-blur-sm">
                {movie.episode_current}
              </Badge>
            </div>
          )}

          {/* Hover Info Button */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
              <Info className="h-4 w-4 text-foreground" />
            </div>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-display font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {movie.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {movie.origin_name}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>{movie.year}</span>
            {movie.time && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <span>{movie.time}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
