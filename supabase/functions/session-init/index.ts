import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-token, x-request-signature, x-request-timestamp, x-request-nonce',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Generate cryptographic hash
async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate session token
function generateToken(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Calculate trust score from fingerprint data
function calculateTrustScore(fingerprint: any): number {
  let score = 50;
  
  // Check for headless browser indicators
  if (fingerprint.webdriver === true) score -= 30;
  if (fingerprint.languages?.length === 0) score -= 10;
  if (fingerprint.plugins === 0) score -= 10;
  if (!fingerprint.canvas) score -= 5;
  if (!fingerprint.webgl) score -= 5;
  
  // Positive indicators
  if (fingerprint.screen?.width > 0) score += 5;
  if (fingerprint.timezone) score += 5;
  if (fingerprint.touchSupport !== undefined) score += 5;
  if (fingerprint.audio) score += 5;
  
  // Behavioral signals
  if (fingerprint.mouseMovements > 0) score += 10;
  if (fingerprint.scrollEvents > 0) score += 5;
  if (fingerprint.keyEvents > 0) score += 5;
  
  return Math.max(0, Math.min(100, score));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { fingerprint, userAgent } = body;

    // Get client IP (hashed for privacy)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';
    const ipHash = await hashData(clientIp);
    const uaHash = await hashData(userAgent || 'unknown');
    const fingerprintHash = await hashData(JSON.stringify(fingerprint || {}));

    // Calculate trust score
    const trustScore = calculateTrustScore(fingerprint || {});

    // Generate session token
    const sessionToken = generateToken();

    // Create session in database
    const { data: session, error: sessionError } = await supabase
      .from('security_sessions')
      .insert({
        session_token: sessionToken,
        fingerprint_hash: fingerprintHash,
        trust_score: trustScore,
        ip_hash: ipHash,
        user_agent_hash: uaHash,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      throw new Error('Failed to create session');
    }

    // Generate route tokens for this session
    const routeTypes = ['movies', 'detail', 'search', 'watch', 'categories'];
    const routeTokens: Record<string, string> = {};

    for (const routeType of routeTypes) {
      const routeToken = generateToken(16);
      routeTokens[routeType] = routeToken;

      await supabase.from('route_tokens').insert({
        session_token: sessionToken,
        route_token: routeToken,
        route_type: routeType,
      });
    }

    // Log session creation
    await supabase.from('security_logs').insert({
      session_token: sessionToken,
      event_type: 'session_created',
      event_data: { trust_score: trustScore },
      ip_hash: ipHash,
    });

    // Clean up expired data periodically
    await supabase.rpc('cleanup_expired_security_data');

    console.log(`Session created: ${sessionToken.substring(0, 8)}... | Trust: ${trustScore}`);

    return new Response(JSON.stringify({
      sessionToken,
      routeTokens,
      expiresIn: 86400, // 24 hours
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Session init error:', error);
    return new Response(JSON.stringify({ 
      error: 'Service temporarily unavailable' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
