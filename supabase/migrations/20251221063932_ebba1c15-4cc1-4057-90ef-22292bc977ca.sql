-- 1. Xóa các chính sách cũ gây lỗi
DROP POLICY IF EXISTS "Participants can view participants" ON public.watch_room_participants;
DROP POLICY IF EXISTS "Users can view rooms by code or as participant" ON public.watch_rooms;
DROP POLICY IF EXISTS "Participants can view rooms" ON public.watch_rooms;
DROP POLICY IF EXISTS "Anyone can view rooms" ON public.watch_rooms;
DROP POLICY IF EXISTS "Anyone can view participants" ON public.watch_room_participants;

-- 2. Tạo chính sách mới cho watch_rooms (Ngắt vòng lặp)
CREATE POLICY "Allow authenticated users to view active rooms" 
ON public.watch_rooms 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    is_public = true OR 
    expires_at > CURRENT_TIMESTAMP OR
    host_id = auth.uid()
  )
);

-- 3. Tạo chính sách mới cho watch_room_participants
CREATE POLICY "Allow authenticated users to view participants" 
ON public.watch_room_participants
FOR SELECT 
USING (
  auth.uid() IS NOT NULL
);

-- 4. Đảm bảo quyền tạo phòng vẫn hoạt động
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.watch_rooms;
CREATE POLICY "Authenticated users can create rooms" ON public.watch_rooms
FOR INSERT WITH CHECK (auth.uid() = host_id);