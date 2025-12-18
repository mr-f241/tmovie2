import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Send, Copy, LogOut, Play, Pause, Home,
  MessageCircle, Crown, User, Share2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/hooks/useAuthModal';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { fetchMovieDetail, getImageUrl } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface WatchRoom {
  id: string;
  host_id: string;
  room_code: string;
  movie_slug: string;
  movie_name: string;
  episode_slug: string | null;
  episode_name: string | null;
  poster_url: string | null;
  is_playing: boolean;
  playback_time: number;
  created_at: string;
}

interface Participant {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  is_host: boolean;
}

interface ChatMessage {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  content: string;
  created_at: string;
}

const WatchTogether = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { openLogin } = useAuthModal();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Fetch room data
  const { data: room, isLoading: roomLoading } = useQuery({
    queryKey: ['watch-room', roomCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('watch_rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single();
      if (error) throw error;
      return data as WatchRoom;
    },
    enabled: !!roomCode,
  });

  // Fetch movie details
  const { data: movie } = useQuery({
    queryKey: ['movie', room?.movie_slug],
    queryFn: () => fetchMovieDetail(room!.movie_slug),
    enabled: !!room?.movie_slug,
  });

  const currentEpisode = movie?.episodes?.[0]?.server_data?.find(
    (ep) => ep.slug === room?.episode_slug
  ) || movie?.episodes?.[0]?.server_data?.[0];

  const isHost = user?.id === room?.host_id;

  // Join room on mount
  useEffect(() => {
    if (!room || !user || !profile) return;

    const joinRoom = async () => {
      const { error } = await supabase.from('watch_room_participants').upsert({
        room_id: room.id,
        user_id: user.id,
        display_name: profile.display_name || profile.username || 'Guest',
        avatar_url: profile.avatar_url,
        is_host: user.id === room.host_id,
      }, { onConflict: 'room_id,user_id' });
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Error joining room:', error);
      }
    };

    joinRoom();

    // Leave on unmount
    return () => {
      supabase
        .from('watch_room_participants')
        .delete()
        .eq('room_id', room.id)
        .eq('user_id', user.id);
    };
  }, [room, user, profile]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!room) return;

    // Room updates (video sync)
    const roomChannel = supabase
      .channel(`room-${room.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'watch_rooms',
        filter: `id=eq.${room.id}`,
      }, (payload) => {
        queryClient.setQueryData(['watch-room', roomCode], payload.new);
      })
      .subscribe();

    // Participants updates
    const participantsChannel = supabase
      .channel(`participants-${room.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'watch_room_participants',
        filter: `room_id=eq.${room.id}`,
      }, async () => {
        const { data } = await supabase
          .from('watch_room_participants')
          .select('*')
          .eq('room_id', room.id);
        setParticipants(data || []);
      })
      .subscribe();

    // Chat messages
    const messagesChannel = supabase
      .channel(`messages-${room.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'watch_room_messages',
        filter: `room_id=eq.${room.id}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    // Initial load
    Promise.all([
      supabase.from('watch_room_participants').select('*').eq('room_id', room.id),
      supabase.from('watch_room_messages').select('*').eq('room_id', room.id).order('created_at'),
    ]).then(([participantsRes, messagesRes]) => {
      setParticipants(participantsRes.data || []);
      setMessages(messagesRes.data || []);
    });

    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [room, roomCode, queryClient]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sync video state (host only)
  const updateRoomState = async (isPlaying: boolean, time?: number) => {
    if (!isHost || !room) return;
    
    await supabase
      .from('watch_rooms')
      .update({
        is_playing: isPlaying,
        ...(time !== undefined && { playback_time: time }),
      })
      .eq('id', room.id);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || !room) return;

    await supabase.from('watch_room_messages').insert({
      room_id: room.id,
      user_id: user.id,
      display_name: profile?.display_name || profile?.username || 'Guest',
      avatar_url: profile?.avatar_url,
      content: message.trim(),
    });

    setMessage('');
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã copy link phòng!');
  };

  const leaveRoom = async () => {
    if (room && user) {
      await supabase
        .from('watch_room_participants')
        .delete()
        .eq('room_id', room.id)
        .eq('user_id', user.id);
    }
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Đăng nhập để tham gia</h1>
          <p className="text-muted-foreground mb-6">Bạn cần đăng nhập để xem chung với bạn bè</p>
          <Button onClick={openLogin}>Đăng nhập</Button>
        </div>
      </div>
    );
  }

  if (roomLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Phòng không tồn tại</h1>
          <p className="text-muted-foreground mb-6">Phòng này đã hết hạn hoặc không tồn tại</p>
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Về trang chủ
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Video Section */}
      <div className="flex-1">
        <div className="container max-w-6xl py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <Home className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="font-display text-lg font-bold line-clamp-1">{room.movie_name}</h1>
                {room.episode_name && (
                  <p className="text-sm text-muted-foreground">{room.episode_name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyRoomLink}>
                <Copy className="h-4 w-4 mr-1.5" />
                Copy link
              </Button>
              <Button variant="destructive" size="sm" onClick={leaveRoom}>
                <LogOut className="h-4 w-4 mr-1.5" />
                Rời
              </Button>
            </div>
          </div>

          {/* Video Player */}
          {currentEpisode && (
            <VideoPlayer
              src={currentEpisode.link_embed}
              poster={getImageUrl(movie?.thumb_url || '')}
              title={room.movie_name}
              episodeName={room.episode_name || undefined}
            />
          )}

          {/* Room Info */}
          <div className="mt-4 glass-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">{participants.length} người đang xem</span>
              </div>
              <div className="flex items-center gap-1">
                {participants.slice(0, 5).map((p) => (
                  <Avatar key={p.id} className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={p.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-primary/10">
                      {p.display_name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {participants.length > 5 && (
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs">
                    +{participants.length - 5}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <motion.div
        initial={{ width: isChatOpen ? 380 : 0 }}
        animate={{ width: isChatOpen ? 380 : 0 }}
        className="border-l border-border bg-secondary/20 flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="font-semibold">Chat</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>

        {/* Participants */}
        <div className="p-3 border-b border-border">
          <p className="text-xs text-muted-foreground mb-2">Người tham gia</p>
          <div className="flex flex-wrap gap-2">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1.5 px-2 py-1 bg-secondary/50 rounded-full text-xs"
              >
                {p.is_host && <Crown className="h-3 w-3 text-yellow-500" />}
                <span>{p.display_name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={msg.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {msg.display_name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs">
                    <span className="font-medium">{msg.display_name}</span>
                    <span className="text-muted-foreground ml-2">
                      {new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground break-words">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="p-3 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-secondary/30"
            />
            <Button type="submit" size="icon" disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default WatchTogether;
