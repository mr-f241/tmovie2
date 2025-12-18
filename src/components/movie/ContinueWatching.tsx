import { Link } from 'react-router-dom';
import { Play, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWatchHistory, WatchHistoryItem } from '@/hooks/useWatchHistory';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const ContinueWatching = () => {
  const { getContinueWatching, removeFromHistory } = useWatchHistory();
  const continueWatching = getContinueWatching();

  if (continueWatching.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl md:text-2xl font-bold">Tiếp tục xem</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence>
            {continueWatching.map((item, index) => (
              <ContinueWatchingCard
                key={item.slug}
                item={item}
                index={index}
                onRemove={() => removeFromHistory(item.slug)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

interface CardProps {
  item: WatchHistoryItem;
  index: number;
  onRemove: () => void;
}

const ContinueWatchingCard = ({ item, index, onRemove }: CardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      <Link
        to={`/xem-phim/${item.slug}?tap=${item.episodeSlug}`}
        className="block relative rounded-xl overflow-hidden card-shadow bg-card"
      >
        {/* Poster */}
        <div className="aspect-video relative overflow-hidden">
          <img
            src={item.posterUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center glow">
              <Play className="h-5 w-5 text-primary-foreground fill-current ml-0.5" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0">
            <Progress value={item.progress} className="h-1 rounded-none bg-secondary/50" />
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-display font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {item.episodeName} • {item.progress}%
          </p>
        </div>
      </Link>

      {/* Remove Button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};
