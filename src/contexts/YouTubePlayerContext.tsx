import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { YouTubePlayer } from '@/components/player/YouTubePlayer';

interface YouTubePlayerContextType {
  playYouTube: (videoId: string, title: string) => void;
  closeYouTube: () => void;
  isPlaying: boolean;
}

const YouTubePlayerContext = createContext<YouTubePlayerContextType | undefined>(undefined);

export const YouTubePlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentVideo, setCurrentVideo] = useState<{ videoId: string; title: string } | null>(null);

  const playYouTube = useCallback((videoId: string, title: string) => {
    setCurrentVideo({ videoId, title });
  }, []);

  const closeYouTube = useCallback(() => {
    setCurrentVideo(null);
  }, []);

  return (
    <YouTubePlayerContext.Provider
      value={{
        playYouTube,
        closeYouTube,
        isPlaying: !!currentVideo,
      }}
    >
      {children}
      {currentVideo && (
        <YouTubePlayer
          videoId={currentVideo.videoId}
          title={currentVideo.title}
          onClose={closeYouTube}
        />
      )}
    </YouTubePlayerContext.Provider>
  );
};

export const useYouTubePlayer = () => {
  const context = useContext(YouTubePlayerContext);
  if (!context) {
    throw new Error('useYouTubePlayer must be used within YouTubePlayerProvider');
  }
  return context;
};
