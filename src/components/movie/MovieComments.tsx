import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Trash2, MoreVertical, Edit2, Smile, ImagePlus, X, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/hooks/useAuthModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

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
  replies?: Comment[];
}

export const MovieComments = ({ movieSlug, episodeSlug }: MovieCommentsProps) => {
  const { user } = useAuth();
  const { openLogin } = useAuthModal();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  const commentKey = episodeSlug ? `${movieSlug}-${episodeSlug}` : movieSlug;

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', commentKey],
    queryFn: async () => {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('movie_slug', commentKey)
        .order('created_at', { ascending: false });
      
      if (commentsError) throw commentsError;
      if (!commentsData || commentsData.length === 0) return [];

      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url')
        .in('user_id', userIds);

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.user_id, p])
      );

      const commentsWithProfiles = commentsData.map(comment => ({
        ...comment,
        profile: profilesMap.get(comment.user_id) || null
      })) as Comment[];

      // Organize into threads
      const parentComments: Comment[] = [];
      const repliesMap = new Map<string, Comment[]>();

      commentsWithProfiles.forEach(comment => {
        if (comment.parent_id) {
          const replies = repliesMap.get(comment.parent_id) || [];
          replies.push(comment);
          repliesMap.set(comment.parent_id, replies);
        } else {
          parentComments.push(comment);
        }
      });

      // Sort replies by created_at ascending
      repliesMap.forEach(replies => {
        replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      });

      // Attach replies to parent comments
      return parentComments.map(parent => ({
        ...parent,
        replies: repliesMap.get(parent.id) || []
      }));
    },
  });

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];
    
    const uploadedUrls: string[] = [];
    
    for (const file of selectedImages) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('comment-images')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('comment-images')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(urlData.publicUrl);
    }
    
    return uploadedUrls;
  };

  const addCommentMutation = useMutation({
    mutationFn: async ({ content: newContent, parentId }: { content: string; parentId?: string }) => {
      setIsUploading(true);
      try {
        const imageUrls = parentId ? [] : await uploadImages();
        let finalContent = newContent;
        
        if (imageUrls.length > 0) {
          finalContent += '\n' + imageUrls.map(url => `[img]${url}[/img]`).join('\n');
        }
        
        const { error } = await supabase.from('comments').insert({
          movie_slug: commentKey,
          content: finalContent,
          user_id: user!.id,
          parent_id: parentId || null,
        });
        if (error) throw error;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', commentKey] });
      if (variables.parentId) {
        setReplyContent('');
        setReplyingTo(null);
        setExpandedReplies(prev => new Set(prev).add(variables.parentId!));
        toast.success('Đã gửi trả lời');
      } else {
        setContent('');
        setSelectedImages([]);
        setImagePreviews([]);
        toast.success('Đã gửi bình luận');
      }
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
    if (content.trim() || selectedImages.length > 0) {
      addCommentMutation.mutate({ content: content.trim() });
    }
  };

  const handleReplySubmit = (parentId: string) => {
    if (!user) {
      openLogin();
      return;
    }
    if (replyContent.trim()) {
      addCommentMutation.mutate({ content: replyContent.trim(), parentId });
    }
  };

  const handleEmojiSelect = (emoji: { native: string }, isReply: boolean = false) => {
    if (isReply) {
      setReplyContent(prev => prev + emoji.native);
      replyInputRef.current?.focus();
    } else {
      setContent(prev => prev + emoji.native);
      textareaRef.current?.focus();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 4) {
      toast.error('Tối đa 4 ảnh');
      return;
    }
    
    const validFiles = files.filter(f => {
      if (!f.type.startsWith('image/')) {
        toast.error('Chỉ chấp nhận file ảnh');
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error('Ảnh tối đa 5MB');
        return false;
      }
      return true;
    });
    
    setSelectedImages(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
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

  const renderContent = (text: string) => {
    const imgRegex = /\[img\](.*?)\[\/img\]/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;
    let imgIndex = 0;

    while ((match = imgRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <img
          key={`img-${imgIndex++}`}
          src={match[1]}
          alt="Comment image"
          className="max-w-full sm:max-w-[200px] rounded-lg mt-2 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(match![1], '_blank')}
        />
      );
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts;
  };

  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${isReply ? 'ml-8 sm:ml-12 mt-3' : 'glass-card rounded-xl p-3 sm:p-4'}`}
    >
      <div className={`flex gap-2 sm:gap-3 ${isReply ? 'bg-secondary/20 rounded-lg p-2 sm:p-3' : ''}`}>
        <Avatar className={`${isReply ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-8 w-8 sm:h-10 sm:w-10'} flex-shrink-0`}>
          <AvatarImage src={comment.profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-xs sm:text-sm">
            {(comment.profile?.display_name || 'U')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
              <span className={`font-medium ${isReply ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} truncate max-w-[120px] sm:max-w-none`}>
                {comment.profile?.display_name || comment.profile?.username || 'Người dùng'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTime(comment.created_at)}
                {comment.is_edited && ' (đã sửa)'}
              </span>
            </div>
            {user?.id === comment.user_id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0">
                    <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
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
                className="min-h-[60px] bg-secondary/30 text-sm"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
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
            <>
              <div className={`mt-1 ${isReply ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} text-muted-foreground whitespace-pre-wrap break-words`}>
                {renderContent(comment.content)}
              </div>
              {!isReply && user && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setReplyingTo(comment);
                    setReplyContent('');
                    setTimeout(() => replyInputRef.current?.focus(), 100);
                  }}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Trả lời
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reply Form */}
      {replyingTo?.id === comment.id && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 ml-8 sm:ml-12"
        >
          <div className="flex gap-2">
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-xs">
                {user?.email?.[0].toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                ref={replyInputRef}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Trả lời ${comment.profile?.display_name || 'người dùng'}...`}
                className="min-h-[60px] bg-secondary/30 text-sm"
              />
              <div className="flex items-center justify-between">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-0" align="start">
                    <Picker
                      data={data}
                      onEmojiSelect={(emoji: { native: string }) => handleEmojiSelect(emoji, true)}
                      theme="dark"
                      locale="vi"
                      previewPosition="none"
                      skinTonePosition="none"
                      perLine={8}
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleReplySubmit(comment.id)}
                    disabled={!replyContent.trim() || addCommentMutation.isPending}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Gửi
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Replies */}
      {!isReply && comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-primary hover:text-primary/80"
            onClick={() => toggleReplies(comment.id)}
          >
            {expandedReplies.has(comment.id) ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Ẩn {comment.replies.length} trả lời
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Xem {comment.replies.length} trả lời
              </>
            )}
          </Button>
          <AnimatePresence>
            {expandedReplies.has(comment.id) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {comment.replies.map(reply => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="font-display text-base sm:text-lg font-semibold">
          Bình luận ({totalComments})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder={user ? "Viết bình luận của bạn..." : "Đăng nhập để bình luận"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] sm:min-h-[100px] bg-secondary/30 pr-12 text-sm sm:text-base resize-none"
            disabled={!user}
          />
        </div>
        
        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 p-0.5 bg-destructive text-destructive-foreground rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {user && (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground"
                    >
                      <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-0" align="start">
                    <Picker
                      data={data}
                      onEmojiSelect={(emoji: { native: string }) => handleEmojiSelect(emoji)}
                      theme="dark"
                      locale="vi"
                      previewPosition="none"
                      skinTonePosition="none"
                      perLine={8}
                    />
                  </PopoverContent>
                </Popover>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={(!content.trim() && selectedImages.length === 0) || addCommentMutation.isPending || isUploading}
            className="gap-2 text-sm sm:text-base"
            size="sm"
          >
            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Gửi</span>
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 sm:space-y-4">
        {isLoading ? (
          <div className="space-y-3 sm:space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full skeleton-shimmer flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 sm:w-32 skeleton-shimmer rounded" />
                  <div className="h-12 skeleton-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm sm:text-base">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};