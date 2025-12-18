import { Link } from 'react-router-dom';
import { Film, Play, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const footerLinks = {
  'Thể loại': [
    { name: 'Hành Động', path: '/the-loai/hanh-dong' },
    { name: 'Tình Cảm', path: '/the-loai/tinh-cam' },
    { name: 'Kinh Dị', path: '/the-loai/kinh-di' },
    { name: 'Hài Hước', path: '/the-loai/hai-huoc' },
  ],
  'Quốc gia': [
    { name: 'Việt Nam', path: '/quoc-gia/viet-nam' },
    { name: 'Hàn Quốc', path: '/quoc-gia/han-quoc' },
    { name: 'Trung Quốc', path: '/quoc-gia/trung-quoc' },
    { name: 'Mỹ', path: '/quoc-gia/au-my' },
  ],
  'Hỗ trợ': [
    { name: 'Liên hệ', path: '/lien-he' },
    { name: 'Điều khoản', path: '/dieu-khoan' },
    { name: 'Chính sách', path: '/chinh-sach' },
  ],
};

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50 mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="relative">
                <Film className="h-7 w-7 text-primary" />
                <Play className="absolute h-2.5 w-2.5 text-primary-foreground top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <span className="font-display text-xl font-bold">
                T<span className="text-primary">Movie</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Xem phim online chất lượng cao, cập nhật nhanh nhất. Phim hay, phim mới mỗi ngày.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 TMovie. Tất cả nội dung được tổng hợp từ internet.</p>
        </div>
      </div>
    </footer>
  );
};
