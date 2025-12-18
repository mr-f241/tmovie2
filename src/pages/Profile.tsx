import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User, Camera, Save, Loader2 } from 'lucide-react';

import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/hooks/useAuthModal';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, updateProfile, isLoading } = useAuth();
  const { openLogin } = useAuthModal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Open auth modal if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      openLogin();
    }
  }, [user, isLoading, openLogin]);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 2MB');
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Delete old avatar if exists
      if (formData.avatar_url) {
        const oldPath = formData.avatar_url.split('/avatars/')[1];
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update form data and save to profile
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      await updateProfile({ avatar_url: publicUrl });
      
      toast.success('Đã cập nhật ảnh đại diện');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Lỗi khi tải ảnh lên: ' + (error.message || 'Không xác định'));
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile(formData);
    setIsSaving(false);
    toast.success('Đã lưu thông tin');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Vui lòng đăng nhập để xem hồ sơ</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-display font-bold mb-8">{t('profile.title')}</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={formData.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl bg-primary/10">
                      {formData.display_name?.[0]?.toUpperCase() || 
                       formData.username?.[0]?.toUpperCase() || 
                       <User className="w-10 h-10" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  
                  {/* Upload button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {profile?.display_name || profile?.username || 'User'}
                  </h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('profile.memberSince')}: {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Nhấn vào biểu tượng camera để tải ảnh lên (tối đa 2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="glass-card rounded-xl p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="display_name">{t('profile.displayName')}</Label>
                <Input
                  id="display_name"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  placeholder="Tên hiển thị"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">{t('auth.username')}</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t('profile.bio')}</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Giới thiệu về bạn..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url">{t('profile.avatar')} URL (hoặc tải ảnh lên)</Label>
                <Input
                  id="avatar_url"
                  name="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t('common.save')}
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;
