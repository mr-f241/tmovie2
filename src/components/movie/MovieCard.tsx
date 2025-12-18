import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Movie } from '@/types/movie';
import { getImageUrl } from '@/services/api';
import { Badge } from '@/components/ui/badge';

interface MovieCardProps {
  movie: Movie;
  index?: number;
}

export const MovieCard = ({ movie, index = 0 }: MovieCardProps) => {
  const posterUrl = getImageUrl(movie.poster_url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
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
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center glow transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="h-6 w-6 text-primary-foreground fill-current ml-1" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {movie.quality && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0.5 gradient-primary border-0">
                {movie.quality}
              </Badge>
            )}
            {movie.lang && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-secondary/80 backdrop-blur-sm">
                {movie.lang}
              </Badge>
            )}
          </div>

          {/* Episode Badge */}
          {movie.episode_current && (
            <div className="absolute bottom-2 right-2">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-background/80 backdrop-blur-sm">
                {movie.episode_current}
              </Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-display font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {movie.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {movie.origin_name}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>{movie.year}</span>
            {movie.time && (
              <>
                <span>•</span>
                <span>{movie.time}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
