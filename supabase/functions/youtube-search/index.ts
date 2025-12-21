import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory cache for YouTube results
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    // Support both GET (query params) and POST (JSON body)
    let keyword: string | null = null;
    let maxResultsInput: string | null = null;
    let pageToken: string | null = null;

    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const body = await req.json().catch(() => ({}));
        keyword = typeof body?.keyword === 'string' ? body.keyword : null;
        if (body?.maxResults !== undefined && body?.maxResults !== null) {
          maxResultsInput = String(body.maxResults);
        }
        if (typeof body?.pageToken === 'string') {
          pageToken = body.pageToken;
        }
      }
    }

    keyword = (keyword ?? url.searchParams.get('keyword'))?.trim() ?? null;
    maxResultsInput = maxResultsInput ?? url.searchParams.get('maxResults');
    pageToken = pageToken ?? url.searchParams.get('pageToken');

    const parsedMax = Number.parseInt((maxResultsInput ?? '5').trim(), 10);
    const maxResults = Number.isFinite(parsedMax) ? Math.min(50, Math.max(1, parsedMax)) : 5;

    if (!keyword) {
      return new Response(
        JSON.stringify({ error: 'Missing keyword parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cacheKey = `${keyword}_${maxResults}_${pageToken || 'first'}`;
    const cached = cache.get(cacheKey);

    // Return cached result if valid
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`Cache hit for: ${keyword} (page: ${pageToken || 'first'})`);
      return new Response(
        JSON.stringify(cached.data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      console.error('YouTube API key not configured');
      return new Response(
        JSON.stringify({ error: 'YouTube API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search for movie trailers/full movies
    const searchQuery = keyword;
    let youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=${maxResults}&key=${apiKey}&relevanceLanguage=vi`;

    // Add pageToken if provided
    if (pageToken) {
      youtubeUrl += `&pageToken=${encodeURIComponent(pageToken)}`;
    }

    console.log(`Searching YouTube for: ${searchQuery} (page: ${pageToken || 'first'})`);

    const response = await fetch(youtubeUrl, {
      headers: {
        'Referer': 'https://lovable.dev',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`YouTube API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: 'YouTube API error', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    const items = data.items?.map((item: any) => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title,
      thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
      description: item.snippet?.description?.substring(0, 150),
    })) || [];

    const result = {
      items,
      nextPageToken: data.nextPageToken || null,
      prevPageToken: data.prevPageToken || null,
      totalResults: data.pageInfo?.totalResults || items.length,
      resultsPerPage: data.pageInfo?.resultsPerPage || maxResults,
    };

    // Cache the results
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    // Clean old cache entries
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        cache.delete(key);
      }
    }

    console.log(`Found ${items.length} YouTube results for: ${keyword} (total: ${result.totalResults})`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in youtube-search:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
