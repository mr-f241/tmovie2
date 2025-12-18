import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Users, Plus, ArrowRight, Loader2, Film, Play, Clock, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/hooks/useAuthModal';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const WatchTogetherLobby = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openLogin } = useAuthModal();
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Fetch active public rooms
  const { data: activeRooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['active-watch-rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('watch_rooms')
        .select('*, watch_room_participants(count)')
        .eq('is_public', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  // Fetch all rooms for logged in users
  const { data: allRooms } = useQuery({
    queryKey: ['all-watch-rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('watch_rooms')
        .select('*, watch_room_participants(count)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const displayRooms = user ? allRooms : activeRooms;

  const handleJoinRoom = async () => {
    if (!user) {
      openLogin();
      return;
    }

    if (!joinCode.trim()) {
      toast.error('Vui lòng nhập mã phòng');
      return;
    }

    setIsJoining(true);
    try {
      const { data, error } = await supabase
        .from('watch_rooms')
        .select('*')
        .eq('room_code', joinCode.trim().toUpperCase())
        .single();

      if (error || !data) {
        toast.error('Không tìm thấy phòng');
        return;
      }

      navigate(`/xem-chung/${joinCode.trim().toUpperCase()}`);
    } catch (error) {
      toast.error('Không thể tham gia phòng');
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinDirectly = (roomCode: string) => {
    if (!user) {
      openLogin();
      return;
    }
    navigate(`/xem-chung/${roomCode}`);
  };

  return (
    <Layout>
      <div className="container py-6 sm:py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 mb-4 sm:mb-6">
            <Users className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Xem phim cùng bạn bè
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base px-4">
            Tạo phòng xem chung để xem phim cùng lúc với bạn bè, có chat và đồng bộ video thời gian thực.
          </p>
        </motion.div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto mb-8 sm:mb-12">
          {/* Join Room */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card h-full">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <ArrowRight className="h-5 w-5 text-primary" />
                  Tham gia phòng
                </CardTitle>
                <CardDescription className="text-sm">
                  Nhập mã phòng để tham gia xem cùng bạn bè
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <Input
                  placeholder="Nhập mã phòng (VD: ABC123)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono tracking-wider bg-secondary/30"
                  maxLength={6}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                />
                <Button
                  className="w-full gap-2"
                  onClick={handleJoinRoom}
                  disabled={isJoining || !joinCode.trim()}
                >
                  {isJoining ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                  Tham gia
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Create Room */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card h-full">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Plus className="h-5 w-5 text-primary" />
                  Tạo phòng mới
                </CardTitle>
                <CardDescription className="text-sm">
                  Chọn một bộ phim và tạo phòng xem chung
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="aspect-video rounded-lg bg-secondary/30 flex items-center justify-center border border-dashed border-border">
                  <div className="text-center text-muted-foreground">
                    <Film className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Chọn phim để tạo phòng</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => navigate('/')}
                >
                  <Play className="h-4 w-4" />
                  Duyệt phim
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Active Rooms List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Phòng đang hoạt động
            </h2>
            <Badge variant="secondary" className="text-xs">
              {displayRooms?.length || 0} phòng
            </Badge>
          </div>

          {roomsLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : displayRooms && displayRooms.length > 0 ? (
            <div className="grid gap-3">
              {displayRooms.map((room: any) => (
                <Card 
                  key={room.id} 
                  className="glass-card hover:border-primary/50 transition-colors cursor-pointer group"
                  onClick={() => handleJoinDirectly(room.room_code)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Poster */}
                      <div className="w-16 h-20 sm:w-20 sm:h-28 rounded-md overflow-hidden bg-secondary/50 shrink-0">
                        {room.poster_url ? (
                          <img 
                            src={room.poster_url} 
                            alt={room.movie_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-medium truncate text-sm sm:text-base">
                            {room.movie_name}
                          </h3>
                          <code className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono shrink-0">
                            {room.room_code}
                          </code>
                        </div>
                        
                        {room.episode_name && (
                          <p className="text-xs sm:text-sm text-muted-foreground truncate mb-2">
                            {room.episode_name}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {room.watch_room_participants?.[0]?.count || 1} người
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(room.created_at), { 
                              addSuffix: true, 
                              locale: vi 
                            })}
                          </span>
                          {room.is_playing && (
                            <Badge variant="default" className="bg-green-500/10 text-green-500 text-xs">
                              Đang phát
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Join Button */}
                      <Button 
                        size="sm" 
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
                      >
                        Tham gia
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Film className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Chưa có phòng nào đang hoạt động</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Hãy tạo phòng mới để bắt đầu xem cùng bạn bè!
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 sm:mt-16"
        >
          <h2 className="font-display text-lg sm:text-xl font-semibold text-center mb-6 sm:mb-8">
            Cách hoạt động
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {[
              {
                step: '1',
                title: 'Chọn phim',
                description: 'Tìm bộ phim bạn muốn xem và nhấn "Xem chung"'
              },
              {
                step: '2',
                title: 'Chia sẻ mã phòng',
                description: 'Gửi mã phòng cho bạn bè để họ tham gia'
              },
              {
                step: '3',
                title: 'Xem cùng nhau',
                description: 'Video sẽ đồng bộ và các bạn có thể chat realtime'
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-medium mb-1 text-sm sm:text-base">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default WatchTogetherLobby;
