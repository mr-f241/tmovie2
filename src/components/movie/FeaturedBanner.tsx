import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star, Trophy, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const FeaturedBanner = () => {
  return (
    <section className="py-8">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Oscar Picks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/30 p-6 md:p-8 group hover:border-amber-500/50 transition-colors"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-amber-500" />
                <Badge
                  variant="secondary"
                  className="bg-amber-500/20 text-amber-500 border-amber-500/30"
                >
                  Oscar Picks
                </Badge>
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold mb-2">
                Phim Đề Cử Oscar
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Những tác phẩm điện ảnh xuất sắc được đề cử và vinh danh tại Oscar
              </p>
              <Button
                asChild
                variant="secondary"
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-500"
              >
                <Link to="/bo-suu-tap/oscar">
                  <Star className="mr-2 h-4 w-4" />
                  Khám phá ngay
                </Link>
              </Button>
            </div>
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/30 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
          </motion.div>

          {/* Summer Blockbusters */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500/20 via-red-500/10 to-transparent border border-orange-500/30 p-6 md:p-8 group hover:border-orange-500/50 transition-colors"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-5 w-5 text-orange-500" />
                <Badge
                  variant="secondary"
                  className="bg-orange-500/20 text-orange-500 border-orange-500/30"
                >
                  Hot 2024
                </Badge>
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold mb-2">
                Bom Tấn Mùa Hè
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Những siêu phẩm hành động, giải trí đình đám nhất mùa hè năm nay
              </p>
              <Button
                asChild
                variant="secondary"
                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-500"
              >
                <Link to="/bo-suu-tap/bom-tan">
                  <Play className="mr-2 h-4 w-4" />
                  Xem ngay
                </Link>
              </Button>
            </div>
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/30 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
