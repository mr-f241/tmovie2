import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Volume2, VolumeX, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
  autoplay?: boolean;
}

type PlayerMode = 'mini' | 'theater' | 'fullscreen';

export const YouTubePlayer = ({ videoId, title, onClose, autoplay = true }: YouTubePlayerProps) => {
  // Default to theater mode instead of mini
  const [mode, setMode] = useState<PlayerMode>('theater');
  const [isMuted, setIsMuted] = useState(false);

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1&playsinline=1`;

  const getModeStyles = () => {
    switch (mode) {
      case 'mini':
        return 'bottom-4 right-4 w-[360px] max-w-[calc(100vw-2rem)]';
      case 'theater':
        return 'bottom-0 left-0 right-0 sm:bottom-4 sm:left-4 sm:right-4 md:left-1/2 md:-translate-x-1/2 md:w-[800px] md:max-w-[calc(100vw-2rem)]';
      case 'fullscreen':
        return 'inset-0';
    }
  };

  const cycleMode = () => {
    if (mode === 'mini') setMode('theater');
    else if (mode === 'theater') setMode('fullscreen');
    else setMode('theater');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: mode === 'mini' ? 20 : 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: mode === 'mini' ? 20 : 0 }}
        className={`fixed z-50 ${getModeStyles()}`}
      >
        {/* Backdrop for fullscreen */}
        {mode === 'fullscreen' && (
          <div
            className="absolute inset-0 bg-black/95"
            onClick={() => setMode('theater')}
          />
        )}

        <motion.div
          layout
          className={`relative bg-background overflow-hidden shadow-2xl border border-border/50 ${
            mode === 'fullscreen' 
              ? 'w-full h-full max-w-6xl mx-auto my-4 sm:my-8 rounded-none sm:rounded-xl' 
              : mode === 'theater'
                ? 'rounded-t-xl sm:rounded-xl'
                : 'rounded-xl'
          }`}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-2 sm:p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-white text-xs sm:text-sm font-medium line-clamp-1 flex-1">
                {title}
              </h3>
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 text-white hover:bg-white/20"
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? 'Bật âm' : 'Tắt âm'}
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                </Button>
                
                {/* Mini mode button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 text-white hover:bg-white/20"
                  onClick={() => setMode(mode === 'mini' ? 'theater' : 'mini')}
                  title={mode === 'mini' ? 'Mở rộng' : 'Thu nhỏ'}
                >
                  {mode === 'mini' ? <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                </Button>
                
                {/* Fullscreen button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 text-white hover:bg-white/20"
                  onClick={() => setMode(mode === 'fullscreen' ? 'theater' : 'fullscreen')}
                  title={mode === 'fullscreen' ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                >
                  {mode === 'fullscreen' ? <Minimize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 text-white hover:bg-white/20"
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
                  title="Mở trên YouTube"
                >
                  <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 text-white hover:bg-white/20"
                  onClick={onClose}
                  title="Đóng"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Video */}
          <div className={`aspect-video ${mode === 'fullscreen' ? 'h-full' : ''}`}>
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
