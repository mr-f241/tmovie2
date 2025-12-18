import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sword, Heart, Laugh, Ghost, Rocket, Drama, Wand2, Skull } from 'lucide-react';

const genres = [
  { name: 'Hành Động', slug: 'hanh-dong', icon: Sword, color: 'from-red-500 to-orange-500' },
  { name: 'Tình Cảm', slug: 'tinh-cam', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { name: 'Hài Hước', slug: 'hai-huoc', icon: Laugh, color: 'from-yellow-500 to-amber-500' },
  { name: 'Kinh Dị', slug: 'kinh-di', icon: Ghost, color: 'from-purple-500 to-violet-500' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong', icon: Rocket, color: 'from-cyan-500 to-blue-500' },
  { name: 'Chính Kịch', slug: 'chinh-kich', icon: Drama, color: 'from-emerald-500 to-teal-500' },
  { name: 'Thần Thoại', slug: 'than-thoai', icon: Wand2, color: 'from-indigo-500 to-purple-500' },
  { name: 'Võ Thuật', slug: 'vo-thuat', icon: Skull, color: 'from-slate-500 to-zinc-500' },
];

export const GenreHighlights = () => {
  return (
    <section className="py-12">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="font-display text-xl md:text-2xl font-bold flex items-center gap-3">
            <span className="w-1 h-6 rounded-full bg-primary" />
            Thể Loại Phổ Biến
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Khám phá theo sở thích của bạn
          </p>
        </motion.div>

        {/* Genre Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {genres.map((genre, index) => (
            <motion.div
              key={genre.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/the-loai/${genre.slug}`}
                className="group flex flex-col items-center justify-center p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-300 hover:scale-105"
              >
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${genre.color} mb-2 group-hover:scale-110 transition-transform duration-300`}
                >
                  <genre.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-medium text-center group-hover:text-primary transition-colors">
                  {genre.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
