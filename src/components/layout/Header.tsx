import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Play, Film, Home, Tv, Clapperboard, Sparkles, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { InstantSearch } from '@/components/search/InstantSearch';

const navLinks = [
  { name: 'Trang chủ', path: '/', icon: Home },
  { name: 'Phim Bộ', path: '/danh-sach/phim-bo', icon: Tv },
  { name: 'Phim Lẻ', path: '/danh-sach/phim-le', icon: Clapperboard },
  { name: 'Hoạt Hình', path: '/danh-sach/hoat-hinh', icon: Sparkles },
  { name: 'TV Shows', path: '/danh-sach/tv-shows', icon: Gamepad2 },
];

export const Header = () => {
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

  // Close search on escape
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
                    {link.name}
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

          {/* Search & Mobile Menu */}
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
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}
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
