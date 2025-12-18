import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie } from '@/types/movie';
import { getImageUrl } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface HeroSliderProps {
  movies: Movie[];
  loading?: boolean;
}

export const HeroSlider = ({ movies, loading }: HeroSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const featuredMovies = movies.slice(0, 5);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  }, [featuredMovies.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  }, [featuredMovies.length]);

  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, featuredMovies.length]);

  if (loading) {
    return (
      <div className="relative h-[70vh] min-h-[500px] max-h-[800px]">
        <Skeleton className="absolute inset-0" />
      </div>
    );
  }

  if (!featuredMovies.length) return null;

  const currentMovie = featuredMovies[currentIndex];
  const backdropUrl = getImageUrl(currentMovie.thumb_url || currentMovie.poster_url);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <section className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
      {/* Background */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="container relative h-full flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl space-y-4"
          >
            {/* Badges */}
            <div className="flex items-center gap-2">
              {currentMovie.quality && (
                <Badge className="gradient-primary border-0">{currentMovie.quality}</Badge>
              )}
              {currentMovie.lang && (
                <Badge variant="secondary">{currentMovie.lang}</Badge>
              )}
              {currentMovie.year && (
                <Badge variant="outline">{currentMovie.year}</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {currentMovie.name}
            </h1>

            {/* Original Name */}
            <p className="text-lg text-muted-foreground">{currentMovie.origin_name}</p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {currentMovie.time && <span>{currentMovie.time}</span>}
              {currentMovie.episode_current && (
                <Badge variant="secondary">{currentMovie.episode_current}</Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button asChild size="lg" className="gradient-primary border-0 glow">
                <Link to={`/phim/${currentMovie.slug}`}>
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  Xem ngay
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to={`/phim/${currentMovie.slug}`}>
                  <Info className="mr-2 h-5 w-5" />
                  Chi tiết
                </Link>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {featuredMovies.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass text-foreground hover:bg-secondary transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass text-foreground hover:bg-secondary transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {featuredMovies.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/50 hover:bg-muted-foreground'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
