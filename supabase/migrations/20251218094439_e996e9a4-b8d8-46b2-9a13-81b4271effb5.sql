-- Security sessions table for tracking client trust
CREATE TABLE public.security_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  fingerprint_hash TEXT,
  trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  ip_hash TEXT,
  user_agent_hash TEXT,
  request_count INTEGER DEFAULT 0,
  last_request_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  is_blocked BOOLEAN DEFAULT false,
  block_reason TEXT
);

-- Rate limiting table
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- fingerprint + IP hash combo
  action_type TEXT NOT NULL, -- 'search', 'detail', 'watch', etc.
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(identifier, action_type)
);

-- Security events log (auto-purge old entries)
CREATE TABLE public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT,
  event_type TEXT NOT NULL, -- 'suspicious', 'blocked', 'rate_limited', 'bot_detected'
  event_data JSONB,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Route tokens for dynamic API endpoints
CREATE TABLE public.route_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL,
  route_token TEXT UNIQUE NOT NULL,
  route_type TEXT NOT NULL, -- 'movies', 'detail', 'search', etc.
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '5 minutes'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_security_sessions_token ON public.security_sessions(session_token);
CREATE INDEX idx_security_sessions_expires ON public.security_sessions(expires_at);
CREATE INDEX idx_rate_limits_identifier ON public.rate_limits(identifier, action_type);
CREATE INDEX idx_rate_limits_window ON public.rate_limits(window_start);
CREATE INDEX idx_security_logs_created ON public.security_logs(created_at);
CREATE INDEX idx_route_tokens_token ON public.route_tokens(route_token);
CREATE INDEX idx_route_tokens_expires ON public.route_tokens(expires_at);

-- Enable RLS
ALTER TABLE public.security_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_tokens ENABLE ROW LEVEL SECURITY;

-- Allow service role only (Edge Functions)
CREATE POLICY "Service role only" ON public.security_sessions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role only" ON public.rate_limits
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role only" ON public.security_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role only" ON public.route_tokens
  FOR ALL USING (auth.role() = 'service_role');

-- Function to clean up expired data (auto-purge)
CREATE OR REPLACE FUNCTION public.cleanup_expired_security_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete expired sessions
  DELETE FROM public.security_sessions WHERE expires_at < now();
  
  -- Delete old rate limit windows (older than 1 hour)
  DELETE FROM public.rate_limits WHERE window_start < (now() - interval '1 hour');
  
  -- Delete old security logs (older than 7 days)
  DELETE FROM public.security_logs WHERE created_at < (now() - interval '7 days');
  
  -- Delete expired route tokens
  DELETE FROM public.route_tokens WHERE expires_at < now();
END;
$$;

-- Function to check and update rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action_type TEXT,
  p_max_requests INTEGER DEFAULT 30,
  p_window_seconds INTEGER DEFAULT 60
)
RETURNS TABLE(allowed BOOLEAN, current_count INTEGER, reset_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_current_count INTEGER;
BEGIN
  v_window_start := now() - (p_window_seconds || ' seconds')::interval;
  
  -- Try to update existing record or insert new one
  INSERT INTO public.rate_limits (identifier, action_type, request_count, window_start)
  VALUES (p_identifier, p_action_type, 1, now())
  ON CONFLICT (identifier, action_type) 
  DO UPDATE SET 
    request_count = CASE 
      WHEN rate_limits.window_start < v_window_start THEN 1
      ELSE rate_limits.request_count + 1
    END,
    window_start = CASE 
      WHEN rate_limits.window_start < v_window_start THEN now()
      ELSE rate_limits.window_start
    END
  RETURNING request_count INTO v_current_count;
  
  RETURN QUERY SELECT 
    v_current_count <= p_max_requests,
    v_current_count,
    now() + (p_window_seconds || ' seconds')::interval;
END;
$$;