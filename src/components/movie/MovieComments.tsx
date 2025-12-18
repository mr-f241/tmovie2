import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Trash2, MoreVertical, Edit2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/hooks/useAuthModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface MovieCommentsProps {
  movieSlug: string;
  episodeSlug?: string;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  movie_slug: string;
  parent_id: string | null;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  profile?: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export const MovieComments = ({ movieSlug, episodeSlug }: MovieCommentsProps) => {
  const { user, profile } = useAuth();
  const { openLogin } = useAuthModal();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const commentKey = episodeSlug ? `${movieSlug}-${episodeSlug}` : movieSlug;

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', commentKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('movie_slug', commentKey)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Comment[];
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (newContent: string) => {
      const { error } = await supabase.from('comments').insert({
        movie_slug: commentKey,
        content: newContent,
        user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', commentKey] });
      setContent('');
      toast.success('Đã gửi bình luận');
    },
    onError: () => toast.error('Lỗi khi gửi bình luận'),
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase
        .from('comments')
        .update({ content, is_edited: true })
        .eq('id', id)
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', commentKey] });
      setEditingId(null);
      toast.success('Đã cập nhật bình luận');
    },
    onError: () => toast.error('Lỗi khi cập nhật'),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', commentKey] });
      toast.success('Đã xóa bình luận');
    },
    onError: () => toast.error('Lỗi khi xóa'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openLogin();
      return;
    }
    if (content.trim()) {
      addCommentMutation.mutate(content.trim());
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">
          Bình luận ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder={user ? "Viết bình luận của bạn..." : "Đăng nhập để bình luận"}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[80px] bg-secondary/30"
          disabled={!user}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!content.trim() || addCommentMutation.isPending}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Gửi
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 rounded-full skeleton-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 skeleton-shimmer rounded" />
                  <div className="h-12 skeleton-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card rounded-xl p-4"
              >
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10">
                      {(comment.profile?.display_name || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {comment.profile?.display_name || comment.profile?.username || 'Người dùng'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(comment.created_at)}
                        </span>
                        {comment.is_edited && (
                          <span className="text-xs text-muted-foreground">(đã sửa)</span>
                        )}
                      </div>
                      {user?.id === comment.user_id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingId(comment.id);
                                setEditContent(comment.content);
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteCommentMutation.mutate(comment.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    {editingId === comment.id ? (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[60px] bg-secondary/30"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingId(null)}
                          >
                            Hủy
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateCommentMutation.mutate({ id: comment.id, content: editContent })}
                            disabled={updateCommentMutation.isPending}
                          >
                            Lưu
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-muted-foreground whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
