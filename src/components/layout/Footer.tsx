import { Link } from "react-router-dom";
import { Facebook, Mail, Phone, Send } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const footerLinks = {
  "Thể loại": [
    { name: "Hành Động", path: "/the-loai/hanh-dong" },
    { name: "Tình Cảm", path: "/the-loai/tinh-cam" },
    { name: "Kinh Dị", path: "/the-loai/kinh-di" },
    { name: "Hài Hước", path: "/the-loai/hai-huoc" },
  ],
  "Quốc gia": [
    { name: "Việt Nam", path: "/quoc-gia/viet-nam" },
    { name: "Hàn Quốc", path: "/quoc-gia/han-quoc" },
    { name: "Trung Quốc", path: "/quoc-gia/trung-quoc" },
    { name: "Mỹ", path: "/quoc-gia/au-my" },
  ],
};

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "Email",
    href: "mailto:thanhhoccode06@gmail.com",
  },
  {
    icon: Phone,
    label: "Zalo",
    value: "Zalo",
    href: "https://zalo.me/0946855980",
  },
  {
    icon: Facebook,
    label: "Facebook",
    value: "Facebook",
    href: "https://www.facebook.com/profile.php?id=100015684885472",
  },
  {
    icon: Send,
    label: "Telegram",
    value: "Telegram",
    href: "https://t.me/laokay06",
  },
];

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50 mt-12 sm:mt-16">
      <div className="container py-8 sm:py-12 px-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo & Description */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <Logo size="sm" />
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 max-w-xs">
              Xem phim online chất lượng cao, cập nhật nhanh nhất. Phim hay, phim mới mỗi ngày.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-sm sm:text-base mb-3 sm:mb-4">{title}</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link 
                      to={link.path} 
                      className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
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
            <h4 className="font-display font-semibold text-sm sm:text-base mb-3 sm:mb-4">Liên hệ</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {contactInfo.map((contact) => (
                <li key={contact.label}>
                  <a
                    href={contact.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <contact.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform shrink-0" />
                    <span className="truncate">{contact.value}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs text-muted-foreground">
          <p>© 2024 TMovie. Tất cả nội dung được tổng hợp từ internet.</p>
        </div>
      </div>
    </footer>
  );
};
