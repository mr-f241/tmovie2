import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-token',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
};

// Generate new route tokens
function generateToken(length = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const sessionToken = req.headers.get('x-session-token');

    if (!sessionToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify session
    const { data: session } = await supabase
      .from('security_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!session) {
      return new Response(JSON.stringify({ error: 'Session expired' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete old route tokens for this session
    await supabase
      .from('route_tokens')
      .delete()
      .eq('session_token', sessionToken);

    // Generate new route tokens
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

    console.log(`Route tokens refreshed for session: ${sessionToken.substring(0, 8)}...`);

    return new Response(JSON.stringify({
      routeTokens,
      expiresIn: 300, // 5 minutes
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return new Response(JSON.stringify({ error: 'Service error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
