import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Palette, 
  Play, 
  Shield,
  Moon,
  Sun,
  Monitor,
  Globe,
  LogOut
} from 'lucide-react';

import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { languages, changeLanguage } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '@/hooks/useAuthModal';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const themeOptions = [
    { value: 'dark', label: t('settings.dark'), icon: Moon },
    { value: 'light', label: t('settings.light'), icon: Sun },
    { value: 'system', label: t('settings.system'), icon: Monitor },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-6 sm:py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-6 sm:mb-8">{t('settings.title')}</h1>

          <div className="space-y-6 sm:space-y-8">
            {/* Appearance Section */}
            <section className="glass-card rounded-xl p-4 sm:p-6">
              <div className="flex items-start sm:items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold">{t('settings.appearance')}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Tùy chỉnh giao diện ứng dụng</p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Theme */}
                <div className="space-y-3">
                  <Label className="text-sm sm:text-base">{t('settings.theme')}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {themeOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={theme === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme(option.value as 'dark' | 'light' | 'system')}
                        className="gap-1.5 sm:gap-2 px-2 sm:px-3 h-9 sm:h-10"
                      >
                        <option.icon className="w-4 h-4 shrink-0" />
                        <span className="text-xs sm:text-sm truncate">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Language */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Label className="text-sm sm:text-base">{t('settings.language')}</Label>
                  </div>
                  <Select
                    value={i18n.language}
                    onValueChange={(value) => changeLanguage(value)}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Playback Section */}
            <section className="glass-card rounded-xl p-4 sm:p-6">
              <div className="flex items-start sm:items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold">{t('settings.playback')}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Cài đặt phát video</p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm sm:text-base flex-1">{t('settings.autoplay')}</Label>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm sm:text-base flex-1">{t('settings.autoNextEpisode')}</Label>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <Label className="text-sm sm:text-base">{t('settings.defaultQuality')}</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Tự động</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="480p">480p</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <Label className="text-sm sm:text-base">{t('settings.defaultSpeed')}</Label>
                  <Select defaultValue="1">
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Notifications Section */}
            <section className="glass-card rounded-xl p-4 sm:p-6">
              <div className="flex items-start sm:items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold">{t('settings.notifications')}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Quản lý thông báo</p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm sm:text-base flex-1">{t('settings.enableNotifications')}</Label>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm sm:text-base flex-1">{t('settings.newEpisodes')}</Label>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm sm:text-base flex-1">{t('settings.recommendations')}</Label>
                  <Switch />
                </div>
              </div>
            </section>

            {/* Account Section */}
            {user && (
              <section className="glass-card rounded-xl p-4 sm:p-6">
                <div className="flex items-start sm:items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold">{t('settings.account')}</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Quản lý tài khoản</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* User Info Card */}
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarImage src={profile?.avatar_url || ''} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {profile?.display_name?.[0] || user.email?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {profile?.display_name || profile?.username || 'User'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/profile')} 
                        className="w-full sm:w-auto shrink-0"
                      >
                        {t('profile.editProfile')}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <Button 
                    variant="destructive" 
                    className="w-full gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    {t('nav.logout')}
                  </Button>
                </div>
              </section>
            )}

            {/* Login Prompt */}
            {!user && (
              <section className="glass-card rounded-xl p-6 text-center">
                <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-lg sm:text-xl font-semibold mb-2">Đăng nhập để đồng bộ cài đặt</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Đăng nhập để lưu cài đặt và đồng bộ trên mọi thiết bị
                </p>
                <Button onClick={() => {
                  const { openLogin } = useAuthModal.getState();
                  openLogin();
                }}>
                  {t('nav.login')}
                </Button>
              </section>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Settings;
