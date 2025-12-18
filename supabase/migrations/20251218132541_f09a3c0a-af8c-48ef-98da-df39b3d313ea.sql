-- Drop and recreate the SELECT policy for watch_rooms to allow finding by room_code
DROP POLICY IF EXISTS "Participants can view rooms" ON public.watch_rooms;

-- Allow authenticated users to view rooms by room_code (for joining) or if they're host/participant
CREATE POLICY "Users can view rooms by code or as participant" 
ON public.watch_rooms 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = host_id 
    OR EXISTS (
      SELECT 1 FROM watch_room_participants 
      WHERE watch_room_participants.room_id = watch_rooms.id 
      AND watch_room_participants.user_id = auth.uid()
    )
    OR expires_at > now() -- Allow viewing active rooms for joining
  )
);

-- Add is_public column for rooms that want to be listed
ALTER TABLE public.watch_rooms ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Assign admin role to specific user (will be done after they sign up)
-- First create a function to assign admin role by email
CREATE OR REPLACE FUNCTION public.assign_admin_by_email(target_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- Try to assign admin role (if user exists)
SELECT public.assign_admin_by_email('laokay037@gmail.com');