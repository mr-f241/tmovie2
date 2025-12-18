import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Menu,
  X,
  Play,
  Film,
  Home,
  Tv,
  Clapperboard,
  Sparkles,
  Gamepad2,
  User,
  Settings,
  LogOut,
  Heart,
  History,
  Bell,
  Sun,
  Moon,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { InstantSearch } from '@/components/search/InstantSearch';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthModal } from '@/hooks/useAuthModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const navLinks = [
  { name: 'nav.home', path: '/', icon: Home },
  { name: 'nav.series', path: '/danh-sach/phim-bo', icon: Tv },
  { name: 'nav.movies', path: '/danh-sach/phim-le', icon: Clapperboard },
  { name: 'nav.animation', path: '/danh-sach/hoat-hinh', icon: Sparkles },
  { name: 'nav.tvShows', path: '/danh-sach/tv-shows', icon: Gamepad2 },
];

const languages = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { openLogin } = useAuthModal();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setShowSearch(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
  };

  const currentLanguage = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'glass py-3 shadow-lg'
            : 'bg-gradient-to-b from-background/90 via-background/50 to-transparent py-4'
        }`}
      >
        <div className="container flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Film className="h-8 w-8 text-primary transition-all duration-300 group-hover:drop-shadow-[0_0_8px_hsl(var(--primary))]" />
              <Play className="absolute h-3 w-3 text-primary-foreground top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
            <span className="font-display text-2xl font-bold tracking-tight">
              T<span className="text-primary">Movie</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <link.icon className="h-4 w-4" />
                    {t(link.name)}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Toggle */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
                className={`text-muted-foreground hover:text-foreground transition-colors ${
                  showSearch ? 'text-primary' : ''
                }`}
              >
                <Search className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={i18n.language === lang.code ? 'bg-secondary' : ''}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="hidden sm:flex text-muted-foreground hover:text-foreground"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Notifications */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hidden sm:flex text-muted-foreground hover:text-foreground"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Không có thông báo mới
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* User Menu / Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden sm:flex items-center gap-2 px-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/20 text-primary text-sm">
                        {profile?.display_name?.[0] || user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {profile?.display_name || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/ho-so" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/danh-sach-cua-toi" className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Danh sách yêu thích
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/lich-su" className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Lịch sử xem
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/cai-dat" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Cài đặt
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="hidden sm:flex"
                onClick={openLogin}
              >
                Đăng nhập
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <motion.div whileTap={{ scale: 0.95 }} className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="container mt-4 overflow-hidden"
            >
              <InstantSearch onClose={() => setShowSearch(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', bounce: 0.2 }}
              className="lg:hidden glass mt-3 mx-4 rounded-xl p-4 shadow-xl"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link, index) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                          isActive
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                      >
                        <link.icon className="h-5 w-5" />
                        {t(link.name)}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Mobile User Actions */}
                <div className="border-t border-border mt-2 pt-2">
                  {user ? (
                    <>
                      <Link
                        to="/ho-so"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                      >
                        <User className="h-5 w-5" />
                        Hồ sơ
                      </Link>
                      <Link
                        to="/danh-sach-cua-toi"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                      >
                        <Heart className="h-5 w-5" />
                        Danh sách yêu thích
                      </Link>
                      <Link
                        to="/lich-su"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                      >
                        <History className="h-5 w-5" />
                        Lịch sử xem
                      </Link>
                      <Link
                        to="/cai-dat"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                      >
                        <Settings className="h-5 w-5" />
                        Cài đặt
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 w-full"
                      >
                        <LogOut className="h-5 w-5" />
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={openLogin}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary bg-primary/10 w-full"
                    >
                      <User className="h-5 w-5" />
                      Đăng nhập
                    </button>
                  )}

                  {/* Theme & Language in Mobile */}
                  <div className="flex items-center gap-2 px-4 py-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                      className="flex-1"
                    >
                      {resolvedTheme === 'dark' ? (
                        <>
                          <Sun className="h-4 w-4 mr-2" />
                          Sáng
                        </>
                      ) : (
                        <>
                          <Moon className="h-4 w-4 mr-2" />
                          Tối
                        </>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')
                      }
                      className="flex-1"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      {currentLanguage.flag} {currentLanguage.name}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Backdrop for mobile menu */}
      <AnimatePresence>
        {(isMenuOpen || showSearch) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => {
              setIsMenuOpen(false);
              setShowSearch(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};
