import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-token, x-route-token, x-request-timestamp, x-request-nonce',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

const EXTERNAL_API_BASE = 'https://phimapi.com';

// Rate limits per action (requests per minute)
const RATE_LIMITS: Record<string, { max: number; window: number }> = {
  movies: { max: 60, window: 60 },
  detail: { max: 30, window: 60 },
  search: { max: 20, window: 60 },
  watch: { max: 15, window: 60 },
  categories: { max: 30, window: 60 },
};

// Hash function
async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Normalize and clean response data (remove sensitive patterns)
function normalizeResponse(data: any, routeType: string): any {
  if (!data) return null;
  
  // Deep clone to avoid mutation
  const normalized = JSON.parse(JSON.stringify(data));
  
  // Shuffle array items slightly to break predictable patterns
  if (Array.isArray(normalized.items)) {
    // Don't actually shuffle - just ensure consistent structure
    normalized.items = normalized.items.map((item: any) => ({
      ...item,
      // Remove internal IDs that could be used for tracking
      _internal: undefined,
    }));
  }
  
  return normalized;
}

// Generate poisoned response for suspicious clients
function generatePoisonedResponse(routeType: string): any {
  // Return partial/empty data that looks valid but isn't useful
  return {
    status: true,
    items: [],
    pagination: {
      totalItems: 0,
      currentPage: 1,
      totalPages: 0,
    }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Extract security headers
    const sessionToken = req.headers.get('x-session-token');
    const routeToken = req.headers.get('x-route-token');
    const requestTimestamp = req.headers.get('x-request-timestamp');
    const requestNonce = req.headers.get('x-request-nonce');

    // Validate session token
    if (!sessionToken) {
      console.log('Missing session token');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate timestamp (reject stale requests > 5 minutes to allow for clock drift)
    if (requestTimestamp) {
      const timestamp = parseInt(requestTimestamp);
      const now = Date.now();
      // Allow 5 minute window for clock drift between client and server
      if (Math.abs(now - timestamp) > 300000) {
        console.log('Stale request rejected');
        return new Response(JSON.stringify({ error: 'Request expired' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Verify session
    const { data: session, error: sessionError } = await supabase
      .from('security_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      console.log('Invalid or expired session');
      return new Response(JSON.stringify({ error: 'Session expired' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if blocked
    if (session.is_blocked) {
      console.log('Blocked session attempted access');
      // Silent fail - return empty data
      return new Response(JSON.stringify(generatePoisonedResponse('blocked')), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body = await req.json();
    const { action, params } = body;

    if (!action) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify route token
    if (routeToken) {
      const { data: validToken } = await supabase
        .from('route_tokens')
        .select('*')
        .eq('route_token', routeToken)
        .eq('session_token', sessionToken)
        .eq('route_type', action)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (!validToken) {
        console.log('Invalid route token');
        // Decrease trust score
        await supabase
          .from('security_sessions')
          .update({ trust_score: Math.max(0, session.trust_score - 10) })
          .eq('session_token', sessionToken);
      }
    }

    // Get client IP hash for rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const ipHash = await hashData(clientIp);
    const identifier = `${session.fingerprint_hash}_${ipHash}`;

    // Check rate limit
    const rateLimit = RATE_LIMITS[action] || { max: 30, window: 60 };
    const { data: rateLimitResult } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_action_type: action,
      p_max_requests: rateLimit.max,
      p_window_seconds: rateLimit.window,
    });

    if (rateLimitResult && !rateLimitResult[0]?.allowed) {
      console.log(`Rate limit exceeded for ${action}`);
      
      // Log the event
      await supabase.from('security_logs').insert({
        session_token: sessionToken,
        event_type: 'rate_limited',
        event_data: { action, count: rateLimitResult[0]?.current_count },
        ip_hash: ipHash,
      });

      // Decrease trust score
      await supabase
        .from('security_sessions')
        .update({ trust_score: Math.max(0, session.trust_score - 5) })
        .eq('session_token', sessionToken);

      // For low trust, return poisoned data instead of error
      if (session.trust_score < 30) {
        return new Response(JSON.stringify(generatePoisonedResponse(action)), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        error: 'Too many requests',
        retryAfter: rateLimit.window,
      }), {
        status: 429,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimit.window),
        },
      });
    }

    // Update session stats
    await supabase
      .from('security_sessions')
      .update({ 
        request_count: session.request_count + 1,
        last_request_at: new Date().toISOString(),
      })
      .eq('session_token', sessionToken);

    // Build external API URL based on action
    let apiUrl: string;
    let apiPath: string;

    switch (action) {
      case 'movies':
        apiPath = `/danh-sach/phim-moi-cap-nhat?page=${params?.page || 1}`;
        break;
      case 'moviesByType':
        apiPath = `/v1/api/danh-sach/${params?.type}?page=${params?.page || 1}`;
        break;
      case 'detail':
        apiPath = `/phim/${params?.slug}`;
        break;
      case 'search':
        apiPath = `/v1/api/tim-kiem?keyword=${encodeURIComponent(params?.keyword || '')}&page=${params?.page || 1}`;
        break;
      case 'categories':
        apiPath = '/the-loai';
        break;
      case 'countries':
        apiPath = '/quoc-gia';
        break;
      case 'moviesByCategory':
        apiPath = `/v1/api/the-loai/${params?.slug}?page=${params?.page || 1}`;
        break;
      case 'moviesByCountry':
        apiPath = `/v1/api/quoc-gia/${params?.slug}?page=${params?.page || 1}`;
        break;
      case 'moviesByYear':
        apiPath = `/v1/api/nam/${params?.year}?page=${params?.page || 1}`;
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    apiUrl = `${EXTERNAL_API_BASE}${apiPath}`;

    console.log(`Proxying: ${action} | Trust: ${session.trust_score}`);

    // Fetch from external API
    const externalResponse = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TMovie/1.0',
      },
    });

    if (!externalResponse.ok) {
      console.error(`External API error: ${externalResponse.status}`);
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const externalData = await externalResponse.json();

    // Normalize response for security
    const normalizedData = normalizeResponse(externalData, action);

    // If trust score is very low, poison the response
    if (session.trust_score < 20) {
      console.log('Low trust - returning poisoned data');
      await supabase.from('security_logs').insert({
        session_token: sessionToken,
        event_type: 'poisoned_response',
        event_data: { action, trust_score: session.trust_score },
        ip_hash: ipHash,
      });
      return new Response(JSON.stringify(generatePoisonedResponse(action)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(normalizedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('API proxy error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
