-- Watch Together rooms
CREATE TABLE public.watch_rooms (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    host_id UUID NOT NULL,
    room_code TEXT NOT NULL UNIQUE,
    movie_slug TEXT NOT NULL,
    movie_name TEXT NOT NULL,
    episode_slug TEXT,
    episode_name TEXT,
    poster_url TEXT,
    is_playing BOOLEAN DEFAULT false,
    playback_time NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '6 hours')
);

-- Room participants
CREATE TABLE public.watch_room_participants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.watch_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    is_host BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Room chat messages
CREATE TABLE public.watch_room_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.watch_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.watch_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_room_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for watch_rooms
CREATE POLICY "Anyone can view rooms" ON public.watch_rooms
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create rooms" ON public.watch_rooms
FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update room" ON public.watch_rooms
FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Host can delete room" ON public.watch_rooms
FOR DELETE USING (auth.uid() = host_id);

-- RLS Policies for watch_room_participants
CREATE POLICY "Anyone can view participants" ON public.watch_room_participants
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join" ON public.watch_room_participants
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave" ON public.watch_room_participants
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for watch_room_messages
CREATE POLICY "Anyone can view messages" ON public.watch_room_messages
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can send messages" ON public.watch_room_messages
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_room_messages;

-- Trigger for updated_at
CREATE TRIGGER update_watch_rooms_updated_at
BEFORE UPDATE ON public.watch_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();