-- Fix PUBLIC_USER_DATA: Restrict profiles visibility to authenticated users or own profile
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Fix EXPOSED_SENSITIVE_DATA: Restrict ratings visibility
DROP POLICY IF EXISTS "Everyone can view ratings" ON public.ratings;

-- Users can only view their own ratings
CREATE POLICY "Users can view own ratings"
ON public.ratings
FOR SELECT
USING (auth.uid() = user_id);