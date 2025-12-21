import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Copy, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/hooks/useAuthModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieSlug: string;
  movieName: string;
  posterUrl: string;
  episodeSlug?: string;
  episodeName?: string;
}

export const CreateRoomModal = ({
  isOpen,
  onClose,
  movieSlug,
  movieName,
  posterUrl,
  episodeSlug,
  episodeName,
}: CreateRoomModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openLogin } = useAuthModal();
  const [isCreating, setIsCreating] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [isPublic, setIsPublic] = useState(true);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = async () => {
    if (!user) {
      openLogin();
      return;
    }

    setIsCreating(true);
    const code = generateRoomCode();

    try {
      const { data, error } = await supabase
        .from('watch_rooms')
        .insert({
          host_id: user.id,
          room_code: code,
          movie_slug: movieSlug,
          movie_name: movieName,
          episode_slug: episodeSlug,
          episode_name: episodeName,
          poster_url: posterUrl,
          is_public: isPublic,
        })
        .select()
        .single();

      if (error) throw error;

      setRoomCode(code);
      toast.success('Đã tạo phòng thành công!');

      // Navigate to the room
      setTimeout(() => {
        navigate(`/xem-chung/${code}`);
      }, 1500);
    } catch (error: any) {
      console.error('Error creating room:', error);
      toast.error(`Không thể tạo phòng: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const joinRoom = async () => {
    if (!user) {
      openLogin();
      return;
    }

    if (!joinCode.trim()) {
      toast.error('Vui lòng nhập mã phòng');
      return;
    }

    setIsCreating(true);

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
      setIsCreating(false);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success('Đã copy mã phòng!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Xem chung
          </DialogTitle>
          <DialogDescription>
            Xem phim cùng bạn bè với chat và video đồng bộ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'create' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMode('create')}
            >
              Tạo phòng
            </Button>
            <Button
              variant={mode === 'join' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMode('join')}
            >
              Tham gia
            </Button>
          </div>

          {mode === 'create' ? (
            <>
              {roomCode ? (
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-2">Mã phòng của bạn</p>
                    <p className="text-3xl font-mono font-bold tracking-wider">{roomCode}</p>
                  </div>
                  <Button variant="outline" className="w-full gap-2" onClick={copyRoomCode}>
                    <Copy className="h-4 w-4" />
                    Copy mã phòng
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Đang chuyển đến phòng...
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="font-medium line-clamp-1">{movieName}</p>
                    {episodeName && (
                      <p className="text-sm text-muted-foreground">{episodeName}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-public"
                      checked={isPublic}
                      onCheckedChange={(checked) => setIsPublic(checked === true)}
                    />
                    <Label htmlFor="is-public" className="text-sm cursor-pointer">
                      Hiển thị công khai trong danh sách phòng
                    </Label>
                  </div>

                  <Button
                    className="w-full gap-2"
                    onClick={createRoom}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}
                    Tạo phòng xem chung
                  </Button>
                </>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nhập mã phòng</Label>
                <Input
                  placeholder="VD: ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono tracking-wider"
                  maxLength={6}
                />
              </div>
              <Button
                className="w-full gap-2"
                onClick={joinRoom}
                disabled={isCreating || !joinCode.trim()}
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                Tham gia phòng
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
