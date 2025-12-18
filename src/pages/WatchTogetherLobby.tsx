import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Plus, ArrowRight, Loader2, Film, Copy, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/hooks/useAuthModal';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const WatchTogetherLobby = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openLogin } = useAuthModal();
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

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

  return (
    <Layout>
      <div className="container py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Xem phim cùng bạn bè
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tạo phòng xem chung để xem phim cùng lúc với bạn bè, có chat và đồng bộ video thời gian thực.
          </p>
        </motion.div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Join Room */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-primary" />
                  Tham gia phòng
                </CardTitle>
                <CardDescription>
                  Nhập mã phòng để tham gia xem cùng bạn bè
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Tạo phòng mới
                </CardTitle>
                <CardDescription>
                  Chọn một bộ phim và tạo phòng xem chung
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video rounded-lg bg-secondary/30 flex items-center justify-center border border-dashed border-border">
                  <div className="text-center text-muted-foreground">
                    <Film className="h-10 w-10 mx-auto mb-2 opacity-50" />
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

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <h2 className="font-display text-xl font-semibold text-center mb-8">
            Cách hoạt động
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
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
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default WatchTogetherLobby;