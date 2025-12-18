-- Fix watch_rooms: Only allow participants to view room details
DROP POLICY IF EXISTS "Anyone can view rooms" ON public.watch_rooms;
CREATE POLICY "Participants can view rooms" ON public.watch_rooms
FOR SELECT USING (
  auth.uid() = host_id OR
  EXISTS (
    SELECT 1 FROM public.watch_room_participants
    WHERE room_id = watch_rooms.id AND user_id = auth.uid()
  )
);

-- Fix watch_room_participants: Only allow participants to view other participants
DROP POLICY IF EXISTS "Anyone can view participants" ON public.watch_room_participants;
CREATE POLICY "Participants can view participants" ON public.watch_room_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.watch_room_participants p
    WHERE p.room_id = watch_room_participants.room_id AND p.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.watch_rooms r
    WHERE r.id = watch_room_participants.room_id AND r.host_id = auth.uid()
  )
);

-- Fix watch_room_messages: Only allow participants to view messages
DROP POLICY IF EXISTS "Anyone can view messages" ON public.watch_room_messages;
CREATE POLICY "Participants can view messages" ON public.watch_room_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.watch_room_participants p
    WHERE p.room_id = watch_room_messages.room_id AND p.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.watch_rooms r
    WHERE r.id = watch_room_messages.room_id AND r.host_id = auth.uid()
  )
);

-- Add DELETE policy for profiles
CREATE POLICY "Users can delete own profile" ON public.profiles
FOR DELETE USING (auth.uid() = user_id);

-- Add DELETE policy for user_settings
CREATE POLICY "Users can delete own settings" ON public.user_settings
FOR DELETE USING (auth.uid() = user_id);

-- Add DELETE policy for notifications
CREATE POLICY "Users can delete own notifications" ON public.notifications
FOR DELETE USING (auth.uid() = user_id);

-- Add DELETE policy for watch_room_messages
CREATE POLICY "Users can delete own messages" ON public.watch_room_messages
FOR DELETE USING (auth.uid() = user_id);