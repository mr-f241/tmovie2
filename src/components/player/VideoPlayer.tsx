import { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle, Play, Monitor, PictureInPicture } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  const [showResume, setShowResume] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Handle iframe load
  const handleLoad = () => {
    setIsLoading(false);
    setError(null);

    if (initialProgress > 0 && initialProgress < 95) {
      setShowResume(true);
      setTimeout(() => setShowResume(false), 10000);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Không thể tải video. Vui lòng thử server khác.');
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;

      const sendCommand = (type: string, data?: any) => {
        iframe.contentWindow?.postMessage(JSON.stringify({ type, event: type, data, ...data }), '*');
      };

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          sendCommand('toggle');
          sendCommand('playPause');
          break;
        case 'j':
          sendCommand('seek', { time: -10, relative: true });
          break;
        case 'l':
          sendCommand('seek', { time: 10, relative: true });
          break;
        case 'm':
          sendCommand('mute');
          break;
        case 'f':
          if (containerRef.current?.requestFullscreen) {
            if (!document.fullscreenElement) {
              containerRef.current.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }
          break;
        case 't':
          setIsTheaterMode(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for messages from the player inside iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (data.event === 'timeupdate' || data.type === 'timeupdate') {
          const currentTime = data.currentTime || data.data?.currentTime;
          const duration = data.duration || data.data?.duration;
          if (currentTime && duration) {
            const progress = Math.floor((currentTime / duration) * 100);
            onProgress?.(progress, currentTime);
          }
        }

        if (data.event === 'ended' || data.type === 'ended') {
          onEnded?.();
        }
      } catch (e) { }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onProgress, onEnded]);

  const handleResume = () => {
    setShowResume(false);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        type: 'seek',
        time: initialProgress
      }), '*');

      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'seek',
        data: initialProgress
      }), '*');
    }
    toast.success(`Đang quay lại đoạn ${initialProgress}%`);
  };

  const handlePiP = async () => {
    toast.info('Tính năng Picture-in-Picture đang được tối ưu cho iframe.');
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-black overflow-hidden shadow-2xl transition-all duration-500 ease-in-out group ${isTheaterMode
          ? 'fixed inset-0 z-[100] bg-black flex items-center justify-center'
          : 'aspect-video rounded-xl ring-1 ring-white/10'
        }`}
    >
      {/* Top Controls (Visible on hover) */}
      <div className="absolute top-4 left-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="bg-black/50 hover:bg-black/80 border-0 backdrop-blur-md text-white gap-2"
          onClick={() => setIsTheaterMode(!isTheaterMode)}
        >
          <Monitor className="h-4 w-4" />
          {isTheaterMode ? 'Thoát rạp phim' : 'Chế độ rạp phim'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="bg-black/50 hover:bg-black/80 border-0 backdrop-blur-md text-white gap-2"
          onClick={handlePiP}
        >
          <PictureInPicture className="h-4 w-4" />
          Mini Player
        </Button>
      </div>

      {/* Loading State */}
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

      {/* Resume Button */}
      <AnimatePresence>
        {showResume && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-4 right-4 z-20"
          >
            <Button
              onClick={handleResume}
              className="gradient-primary shadow-lg border-0 gap-2"
            >
              <Play className="h-4 w-4 fill-current" />
              Tiếp tục từ {initialProgress}%
            </Button>
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

      {/* Video iframe */}
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
