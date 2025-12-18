import { supabase } from "@/integrations/supabase/client";

export interface YouTubeResult {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  description?: string;
  publishedAt?: string;
}

export const searchYouTube = async (
  keyword: string,
  maxResults = 3
): Promise<YouTubeResult[]> => {
  const clean = keyword.trim();
  if (!clean) return [];

  const { data, error } = await supabase.functions.invoke<YouTubeResult[]>("youtube-search", {
    body: { keyword: clean, maxResults },
  });

  if (error) {
    console.error("YouTube search failed:", error);
    return [];
  }

  return Array.isArray(data) ? data : [];
};
