import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Menu,
  X,
  Tv,
  Clapperboard,
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
  Users,
  Grid3X3,
  MapPin,
  Swords,
  Heart as HeartIcon,
  Ghost,
  Laugh,
  Wand2,
  Plane,
  Bomb,
  Drama,
  Baby,
  GraduationCap,
  Music,
  Shirt,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { InstantSearch } from '@/components/search/InstantSearch';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useAdmin } from '@/hooks/useAdmin';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import { toast } from 'sonner';

const navLinks = [
  { name: 'nav.series', path: '/danh-sach/phim-bo', icon: Tv },
  { name: 'nav.movies', path: '/danh-sach/phim-le', icon: Clapperboard },
];

const genres = [
  { name: 'Hành Động', slug: 'hanh-dong', icon: Swords },
  { name: 'Tình Cảm', slug: 'tinh-cam', icon: HeartIcon },
  { name: 'Kinh Dị', slug: 'kinh-di', icon: Ghost },
  { name: 'Hài Hước', slug: 'hai-huoc', icon: Laugh },
  { name: 'Viễn Tưởng', slug: 'vien-tuong', icon: Wand2 },
  { name: 'Phiêu Lưu', slug: 'phieu-luu', icon: Plane },
  { name: 'Chiến Tranh', slug: 'chien-tranh', icon: Bomb },
  { name: 'Tâm Lý', slug: 'tam-ly', icon: Drama },
  { name: 'Gia Đình', slug: 'gia-dinh', icon: Baby },
  { name: 'Học Đường', slug: 'hoc-duong', icon: GraduationCap },
  { name: 'Âm Nhạc', slug: 'am-nhac', icon: Music },
  { name: 'Thời Trang', slug: 'thoi-trang', icon: Shirt },
];

const countries = [
  { name: 'Việt Nam', slug: 'viet-nam', flag: '🇻🇳' },
  { name: 'Hàn Quốc', slug: 'han-quoc', flag: '🇰🇷' },
  { name: 'Trung Quốc', slug: 'trung-quoc', flag: '🇨🇳' },
  { name: 'Nhật Bản', slug: 'nhat-ban', flag: '🇯🇵' },
  { name: 'Thái Lan', slug: 'thai-lan', flag: '🇹🇭' },
  { name: 'Âu Mỹ', slug: 'au-my', flag: '🇺🇸' },
  { name: 'Ấn Độ', slug: 'an-do', flag: '🇮🇳' },
  { name: 'Đài Loan', slug: 'dai-loan', flag: '🇹🇼' },
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
  const { isAdmin } = useAdmin();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [mobileGenresOpen, setMobileGenresOpen] = useState(false);
  const [mobileCountriesOpen, setMobileCountriesOpen] = useState(false);
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
    setMobileGenresOpen(false);
    setMobileCountriesOpen(false);
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

  const handleSurpriseMe = async () => {
    try {
      // Fetch latest movies to get some slugs
      const response = await fetch('https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=1').then(res => res.json());
      if (response.items && response.items.length > 0) {
        const randomIndex = Math.floor(Math.random() * response.items.length);
        const randomMovie = response.items[randomIndex];
        toast.success('Đang chọn phim ngẫu nhiên cho bạn...');
        navigate(`/phim/${randomMovie.slug}`);
      }
    } catch (error) {
      toast.error('Không thể chọn phim ngẫu nhiên lúc này.');
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? 'glass py-3 shadow-lg'
          : 'bg-gradient-to-b from-background/90 via-background/50 to-transparent py-4'
          }`}
      >
        <div className="container flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Genres Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <Grid3X3 className="h-4 w-4" />
                  Thể loại
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 bg-popover p-2">
                <div className="grid grid-cols-2 gap-1">
                  {genres.map((genre) => (
                    <DropdownMenuItem key={genre.slug} asChild>
                      <Link
                        to={`/the-loai/${genre.slug}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-md"
                      >
                        <genre.icon className="h-4 w-4 text-primary" />
                        {genre.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Countries Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <MapPin className="h-4 w-4" />
                  Quốc gia
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-popover">
                {countries.map((country) => (
                  <DropdownMenuItem key={country.slug} asChild>
                    <Link
                      to={`/quoc-gia/${country.slug}`}
                      className="flex items-center gap-2"
                    >
                      <span>{country.flag}</span>
                      {country.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Nav links */}
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${isActive
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

            {/* Watch Together */}
            <Link
              to="/xem-chung"
              className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${location.pathname === '/xem-chung'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Xem chung
              </span>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Surprise Me */}
            <motion.div whileTap={{ scale: 0.95 }} className="hidden sm:block">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSurpriseMe}
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Phim ngẫu nhiên"
              >
                <Sparkles className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Search Toggle */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
                className={`text-muted-foreground hover:text-foreground transition-colors ${showSearch ? 'text-primary' : ''
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
              <DropdownMenuContent align="end" className="w-40 bg-popover">
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
                <DropdownMenuContent align="end" className="w-80 bg-popover">
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
                <DropdownMenuContent align="end" className="w-56 bg-popover">
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
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-list" className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Danh sách yêu thích
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/history" className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Lịch sử xem
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Cài đặt
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2 text-primary">
                        <Shield className="h-4 w-4" />
                        Quản trị
                      </Link>
                    </DropdownMenuItem>
                  )}
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
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="container mt-4"
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
              className="lg:hidden glass mt-3 mx-4 rounded-xl p-4 shadow-xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex flex-col gap-1">
                {/* Surprise Me Mobile */}
                <button
                  onClick={handleSurpriseMe}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-all mb-2"
                >
                  <Sparkles className="h-5 w-5" />
                  Phim ngẫu nhiên (Surprise Me)
                </button>

                {/* Genres Accordion */}
                <div>
                  <button
                    onClick={() => setMobileGenresOpen(!mobileGenresOpen)}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                  >
                    <span className="flex items-center gap-3">
                      <Grid3X3 className="h-5 w-5" />
                      Thể loại
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${mobileGenresOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {mobileGenresOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-1 pl-4 py-2">
                          {genres.map((genre) => (
                            <Link
                              key={genre.slug}
                              to={`/the-loai/${genre.slug}`}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary"
                            >
                              <genre.icon className="h-4 w-4 text-primary" />
                              {genre.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Countries Accordion */}
                <div>
                  <button
                    onClick={() => setMobileCountriesOpen(!mobileCountriesOpen)}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                  >
                    <span className="flex items-center gap-3">
                      <MapPin className="h-5 w-5" />
                      Quốc gia
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${mobileCountriesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {mobileCountriesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-1 pl-4 py-2">
                          {countries.map((country) => (
                            <Link
                              key={country.slug}
                              to={`/quoc-gia/${country.slug}`}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary"
                            >
                              <span>{country.flag}</span>
                              {country.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Other Nav Links */}
                {navLinks.slice(1).map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                    >
                      <link.icon className="h-5 w-5" />
                      {t(link.name)}
                    </Link>
                  );
                })}

                {/* Watch Together */}
                <Link
                  to="/xem-chung"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${location.pathname === '/xem-chung'
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                >
                  <Users className="h-5 w-5" />
                  Xem chung
                </Link>

                {/* Mobile User Actions */}
                <div className="border-t border-border mt-2 pt-2">
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                      >
                        <User className="h-5 w-5" />
                        Hồ sơ
                      </Link>
                      <Link
                        to="/my-list"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                      >
                        <Heart className="h-5 w-5" />
                        Danh sách yêu thích
                      </Link>
                      <Link
                        to="/history"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                      >
                        <History className="h-5 w-5" />
                        Lịch sử xem
                      </Link>
                      <Link
                        to="/settings"
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
                      onClick={() => changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')}
                      className="flex-1"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      {i18n.language === 'vi' ? 'EN' : 'VI'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      <div className="h-20" /> {/* Spacer for fixed header */}
    </>
  );
};
