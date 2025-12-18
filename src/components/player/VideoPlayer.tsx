import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  episodeName?: string;
  onProgress?: (progress: number, currentTime: number) => void;
  onEnded?: () => void;
  initialProgress?: number;
}

export const VideoPlayer = ({
  src,
  poster,
  title,
  episodeName,
  onProgress,
  onEnded,
  initialProgress = 0,
}: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle iframe load
  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Không thể tải video. Vui lòng thử server khác.');
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
    >
      {/* Loading State - Only shown before video loads */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-secondary z-10 pointer-events-none"
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Đang tải video...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary z-10">
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="secondary" onClick={() => { setError(null); setIsLoading(true); }}>
              Thử lại
            </Button>
          </div>
        </div>
      )}

      {/* Video iframe - NO OVERLAYS - Native controls fully accessible */}
      <iframe
        ref={iframeRef}
        src={src}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        onLoad={handleLoad}
        onError={handleError}
        style={{ border: 'none' }}
      />
    </div>
  );
};
