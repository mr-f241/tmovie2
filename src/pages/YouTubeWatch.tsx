import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Youtube, ExternalLink, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { toast } from 'sonner';

const YouTubeWatch = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToHistory } = useWatchHistory();
  const lastAddedRef = useRef<string | null>(null);

  const videoId = searchParams.get('v');
  const title = searchParams.get('title') || 'Video YouTube';

  useEffect(() => {
    if (videoId && title) {
      if (lastAddedRef.current === videoId) return;

      addToHistory({
        slug: `yt-${videoId}`,
        name: title,
        posterUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        episodeSlug: videoId,
        episodeName: 'YouTube Video',
        progress: 0,
      });

      lastAddedRef.current = videoId;
    }
  }, [videoId, title, addToHistory]);

  if (!videoId) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
          <Youtube className="h-16 w-16 mb-4 opacity-50 text-red-500" />
          <p className="text-lg mb-4">Không tìm thấy video</p>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </Layout>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép link!');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Video Player - Full width */}
        <div className="w-full bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="relative w-full aspect-video">
              <iframe
                src={embedUrl}
                title={title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Navigation */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Mở trên YouTube</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </Button>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 line-clamp-2">
            {title}
          </h1>

          {/* YouTube Badge */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Youtube className="h-5 w-5 text-red-500" />
            <span>Video từ YouTube</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default YouTubeWatch;
