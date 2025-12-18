import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipBack, SkipForward, Settings, ChevronLeft, ChevronRight,
  Loader2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerSettings, PLAYER_SHORTCUTS } from '@/hooks/usePlayerSettings';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  episodeName?: string;
  onProgress?: (progress: number, currentTime: number) => void;
  onEnded?: () => void;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  initialProgress?: number;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const VideoPlayer = ({
  src,
  poster,
  title,
  episodeName,
  onProgress,
  onEnded,
  onPrevEpisode,
  onNextEpisode,
  hasPrev,
  hasNext,
  initialProgress = 0,
}: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { settings, updateSetting } = usePlayerSettings();

  // Handle iframe load
  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Không thể tải video. Vui lòng thử server khác.');
  };

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case PLAYER_SHORTCUTS.FULLSCREEN:
          e.preventDefault();
          toggleFullscreen();
          break;
        case PLAYER_SHORTCUTS.NEXT_EPISODE:
          if (hasNext) onNextEpisode?.();
          break;
        case PLAYER_SHORTCUTS.PREV_EPISODE:
          if (hasPrev) onPrevEpisode?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen, hasNext, hasPrev, onNextEpisode, onPrevEpisode]);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimeout]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-xl overflow-hidden group"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-secondary z-20"
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
        <div className="absolute inset-0 flex items-center justify-center bg-secondary z-20">
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="secondary" onClick={() => setError(null)}>
              Thử lại
            </Button>
          </div>
        </div>
      )}

      {/* Video iframe */}
      <iframe
        ref={iframeRef}
        src={src}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Custom Controls Overlay */}
      <AnimatePresence>
        {showControls && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-10"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
              <div>
                {title && (
                  <h3 className="font-display font-semibold text-white">{title}</h3>
                )}
                {episodeName && (
                  <p className="text-sm text-white/70">{episodeName}</p>
                )}
              </div>
            </div>

            {/* Center Controls */}
            <div className="absolute inset-0 flex items-center justify-center gap-8">
              {hasPrev && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 text-white hover:bg-white/20"
                  onClick={onPrevEpisode}
                >
                  <SkipBack className="h-6 w-6" />
                </Button>
              )}

              {hasNext && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 text-white hover:bg-white/20"
                  onClick={onNextEpisode}
                >
                  <SkipForward className="h-6 w-6" />
                </Button>
              )}
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center justify-between">
                {/* Left Controls */}
                <div className="flex items-center gap-2">
                  {hasPrev && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 hidden sm:flex"
                      onClick={onPrevEpisode}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Tập trước
                    </Button>
                  )}
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  {/* Playback Speed */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        {settings.playbackSpeed}x
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {PLAYBACK_SPEEDS.map((speed) => (
                        <DropdownMenuItem
                          key={speed}
                          onClick={() => updateSetting('playbackSpeed', speed)}
                          className={speed === settings.playbackSpeed ? 'bg-primary/20' : ''}
                        >
                          {speed}x
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Fullscreen */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize className="h-5 w-5" />
                    ) : (
                      <Maximize className="h-5 w-5" />
                    )}
                  </Button>

                  {hasNext && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 hidden sm:flex"
                      onClick={onNextEpisode}
                    >
                      Tập tiếp
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/50 text-xs hidden lg:block">
              F: Toàn màn hình • N: Tập tiếp • P: Tập trước
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
