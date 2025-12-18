import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Tv, Sparkles, Flame, Globe, Clapperboard } from 'lucide-react';

const categories = [
  {
    title: 'Phim Lẻ',
    subtitle: 'Movies',
    icon: Film,
    href: '/danh-sach/phim-le',
    gradient: 'from-rose-500/20 to-orange-500/20',
    iconColor: 'text-rose-500',
    borderColor: 'border-rose-500/30',
  },
  {
    title: 'Phim Bộ',
    subtitle: 'TV Series',
    icon: Tv,
    href: '/danh-sach/phim-bo',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-500',
    borderColor: 'border-blue-500/30',
  },
  {
    title: 'Hoạt Hình',
    subtitle: 'Animation',
    icon: Sparkles,
    href: '/danh-sach/hoat-hinh',
    gradient: 'from-violet-500/20 to-purple-500/20',
    iconColor: 'text-violet-500',
    borderColor: 'border-violet-500/30',
  },
  {
    title: 'TV Shows',
    subtitle: 'Variety',
    icon: Clapperboard,
    href: '/danh-sach/tv-shows',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-500',
    borderColor: 'border-emerald-500/30',
  },
  {
    title: 'Thịnh Hành',
    subtitle: 'Trending',
    icon: Flame,
    href: '/danh-sach/phim-moi',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    iconColor: 'text-amber-500',
    borderColor: 'border-amber-500/30',
  },
  {
    title: 'Quốc Gia',
    subtitle: 'Countries',
    icon: Globe,
    href: '/quoc-gia',
    gradient: 'from-pink-500/20 to-rose-500/20',
    iconColor: 'text-pink-500',
    borderColor: 'border-pink-500/30',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const DiscoverySection = () => {
  return (
    <section className="py-12">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
            Bạn muốn xem gì?
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Khám phá hàng nghìn bộ phim và chương trình giải trí chất lượng cao
          </p>
        </motion.div>

        {/* Category Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {categories.map((category) => (
            <motion.div key={category.href} variants={itemVariants}>
              <Link
                to={category.href}
                className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border ${category.borderColor} bg-gradient-to-br ${category.gradient} backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/10`}
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  className={`mb-3 p-3 rounded-xl bg-background/50 ${category.iconColor}`}
                >
                  <category.icon className="h-8 w-8" />
                </motion.div>

                {/* Text */}
                <h3 className="font-display font-semibold text-sm md:text-base text-foreground group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {category.subtitle}
                </span>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-300" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
