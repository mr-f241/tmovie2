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
      <div className="container max-w-4xl py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-display font-bold mb-8">{t('settings.title')}</h1>

          <div className="space-y-8">
            {/* Appearance Section */}
            <section className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{t('settings.appearance')}</h2>
                  <p className="text-sm text-muted-foreground">Tùy chỉnh giao diện ứng dụng</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Theme */}
                <div className="flex items-center justify-between">
                  <Label className="text-base">{t('settings.theme')}</Label>
                  <div className="flex gap-2">
                    {themeOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={theme === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme(option.value as 'dark' | 'light' | 'system')}
                        className="gap-2"
                      >
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Language */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-base">{t('settings.language')}</Label>
                  </div>
                  <Select
                    value={i18n.language}
                    onValueChange={(value) => changeLanguage(value)}
                  >
                    <SelectTrigger className="w-40">
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
            <section className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{t('settings.playback')}</h2>
                  <p className="text-sm text-muted-foreground">Cài đặt phát video</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-base">{t('settings.autoplay')}</Label>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label className="text-base">{t('settings.autoNextEpisode')}</Label>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label className="text-base">{t('settings.defaultQuality')}</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger className="w-32">
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

                <div className="flex items-center justify-between">
                  <Label className="text-base">{t('settings.defaultSpeed')}</Label>
                  <Select defaultValue="1">
                    <SelectTrigger className="w-32">
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
            <section className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{t('settings.notifications')}</h2>
                  <p className="text-sm text-muted-foreground">Quản lý thông báo</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-base">{t('settings.enableNotifications')}</Label>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label className="text-base">{t('settings.newEpisodes')}</Label>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label className="text-base">{t('settings.recommendations')}</Label>
                  <Switch />
                </div>
              </div>
            </section>

            {/* Account Section */}
            {user && (
              <section className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{t('settings.account')}</h2>
                    <p className="text-sm text-muted-foreground">Quản lý tài khoản</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="font-medium">{profile?.display_name || profile?.username}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/profile')}>
                      {t('profile.editProfile')}
                    </Button>
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
                <h2 className="text-xl font-semibold mb-2">Đăng nhập để đồng bộ cài đặt</h2>
                <p className="text-muted-foreground mb-4">
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
