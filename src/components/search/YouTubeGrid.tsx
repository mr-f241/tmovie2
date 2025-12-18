import { motion } from 'framer-motion';
import { Youtube, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { YouTubeResult } from '@/services/youtube';

interface YouTubeGridProps {
  videos: YouTubeResult[];
  loading?: boolean;
  skeletonCount?: number;
}

const YouTubeCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-video bg-secondary rounded-xl mb-3" />
    <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
    <div className="h-3 bg-secondary rounded w-1/2" />
  </div>
);

export const YouTubeGrid = ({ videos, loading, skeletonCount = 12 }: YouTubeGridProps) => {
  const navigate = useNavigate();

  const handlePlayVideo = (videoId: string, title: string) => {
    navigate(`/youtube/watch?v=${videoId}&title=${encodeURIComponent(title)}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <YouTubeCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Youtube className="h-16 w-16 mb-4 opacity-50 text-red-500" />
        <p className="text-lg">Không tìm thấy video nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {videos.map((video, index) => (
        <motion.button
          key={video.videoId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="group text-left"
          onClick={() => handlePlayVideo(video.videoId, video.title)}
        >
          <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                <Play className="h-7 w-7 text-white fill-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
              <Youtube className="h-3 w-3 text-red-500" />
            </div>
          </div>
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {video.channelTitle}
          </p>
        </motion.button>
      ))}
    </div>
  );
};
