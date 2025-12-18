import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const featuredMovies = movies.slice(0, 6);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  }, [featuredMovies.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  }, [featuredMovies.length]);

  useEffect(() => {
    if (!isAutoPlaying || featuredMovies.length <= 1) return;
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [nextSlide, featuredMovies.length, isAutoPlaying]);

  if (loading) {
    return (
      <div className="relative h-[75vh] min-h-[550px] max-h-[850px]">
        <Skeleton className="absolute inset-0" />
        <div className="container relative h-full flex items-end pb-32">
          <div className="space-y-4 max-w-2xl">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-14 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-12 w-64" />
          </div>
        </div>
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
      scale: 1.1,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <section 
      className="relative h-[75vh] min-h-[550px] max-h-[850px] overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
          {/* Cinematic gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
          {/* Vignette effect */}
          <div className="absolute inset-0" style={{ 
            background: 'radial-gradient(ellipse at center, transparent 0%, hsl(var(--background) / 0.4) 100%)' 
          }} />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="container relative h-full flex items-end pb-24 lg:pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl space-y-5"
          >
            {/* Badges */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2"
            >
              {currentMovie.quality && (
                <Badge className="gradient-primary border-0 shadow-lg">{currentMovie.quality}</Badge>
              )}
              {currentMovie.lang && (
                <Badge variant="secondary" className="bg-secondary/80 backdrop-blur-sm">{currentMovie.lang}</Badge>
              )}
              {currentMovie.year && (
                <Badge variant="outline" className="border-border/50 backdrop-blur-sm">{currentMovie.year}</Badge>
              )}
              {currentMovie.episode_current && (
                <Badge variant="secondary" className="bg-secondary/80 backdrop-blur-sm">
                  {currentMovie.episode_current}
                </Badge>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
            >
              {currentMovie.name}
            </motion.h1>

            {/* Original Name */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-muted-foreground"
            >
              {currentMovie.origin_name}
            </motion.p>

            {/* Meta */}
            {currentMovie.time && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"
              >
                <span>{currentMovie.time}</span>
                {currentMovie.category?.slice(0, 3).map((cat) => (
                  <span key={cat.slug} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    {cat.name}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-3 pt-2"
            >
              <Button asChild size="lg" className="gradient-primary border-0 glow group">
                <Link to={`/xem-phim/${currentMovie.slug}`}>
                  <Play className="mr-2 h-5 w-5 fill-current group-hover:scale-110 transition-transform" />
                  Xem ngay
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="bg-secondary/80 backdrop-blur-sm hover:bg-secondary">
                <Link to={`/phim/${currentMovie.slug}`}>
                  <Info className="mr-2 h-5 w-5" />
                  Chi tiết
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {featuredMovies.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass text-foreground hover:bg-secondary/80 transition-all opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-70"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass text-foreground hover:bg-secondary/80 transition-all opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-70"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {featuredMovies.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`relative h-1.5 rounded-full transition-all duration-500 overflow-hidden ${
                index === currentIndex
                  ? 'w-12 bg-primary'
                  : 'w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === currentIndex && isAutoPlaying && (
                <motion.div
                  className="absolute inset-0 bg-primary-foreground/30"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 7, ease: 'linear' }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Thumbnail Preview */}
      <div className="absolute bottom-20 right-8 hidden xl:flex gap-2">
        {featuredMovies.map((movie, index) => (
          <motion.button
            key={movie.slug}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`relative w-20 aspect-video rounded-lg overflow-hidden transition-all ${
              index === currentIndex 
                ? 'ring-2 ring-primary scale-110 z-10' 
                : 'opacity-50 hover:opacity-80'
            }`}
            whileHover={{ scale: index === currentIndex ? 1.1 : 1.05 }}
          >
            <img
              src={getImageUrl(movie.thumb_url || movie.poster_url)}
              alt={movie.name}
              className="w-full h-full object-cover"
            />
          </motion.button>
        ))}
      </div>
    </section>
  );
};
