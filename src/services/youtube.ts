import { supabase } from "@/integrations/supabase/client";

export interface YouTubeResult {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  description?: string;
  publishedAt?: string;
}

export interface YouTubeSearchResponse {
  items: YouTubeResult[];
  nextPageToken: string | null;
  prevPageToken: string | null;
  totalResults: number;
  resultsPerPage: number;
}

export const searchYouTube = async (
  keyword: string,
  maxResults = 24,
  pageToken?: string
): Promise<YouTubeSearchResponse> => {
  const clean = keyword.trim();
  if (!clean) {
    return {
      items: [],
      nextPageToken: null,
      prevPageToken: null,
      totalResults: 0,
      resultsPerPage: maxResults,
    };
  }

  const { data, error } = await supabase.functions.invoke<YouTubeSearchResponse>("youtube-search", {
    body: { keyword: clean, maxResults, pageToken },
  });

  if (error) {
    console.error("YouTube search failed:", error);
    return {
      items: [],
      nextPageToken: null,
      prevPageToken: null,
      totalResults: 0,
      resultsPerPage: maxResults,
    };
  }

  // Handle both old format (array) and new format (object with items)
  if (Array.isArray(data)) {
    return {
      items: data,
      nextPageToken: null,
      prevPageToken: null,
      totalResults: data.length,
      resultsPerPage: maxResults,
    };
  }

  return data ?? {
    items: [],
    nextPageToken: null,
    prevPageToken: null,
    totalResults: 0,
    resultsPerPage: maxResults,
  };
};
