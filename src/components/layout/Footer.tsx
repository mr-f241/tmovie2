import { Link } from 'react-router-dom';
import { Film, Play, Facebook, Mail, Phone, Send } from 'lucide-react';

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
};

const contactInfo = [
  { 
    icon: Mail, 
    label: 'Email', 
    value: 'thanhhoccode06@gmail.com',
    href: 'mailto:thanhhoccode06@gmail.com'
  },
  { 
    icon: Phone, 
    label: 'Zalo', 
    value: '0946855980',
    href: 'https://zalo.me/0946855980'
  },
  { 
    icon: Facebook, 
    label: 'Facebook', 
    value: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=100015684885472'
  },
  { 
    icon: Send, 
    label: 'Telegram', 
    value: '@laokay06',
    href: 'https://t.me/laokay06'
  },
];

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50 mt-16">
      <div className="container py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo & Description */}
          <div className="sm:col-span-2 lg:col-span-1">
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
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold mb-3 sm:mb-4">{title}</h4>
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

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-semibold mb-3 sm:mb-4">Liên hệ</h4>
            <ul className="space-y-2 sm:space-y-3">
              {contactInfo.map((contact) => (
                <li key={contact.label}>
                  <a
                    href={contact.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <contact.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="truncate">{contact.value}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© 2024 TMovie. Tất cả nội dung được tổng hợp từ internet.</p>
        </div>
      </div>
    </footer>
  );
};