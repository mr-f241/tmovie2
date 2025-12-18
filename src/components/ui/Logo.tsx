import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = 'md', showText = true, className }: LogoProps) => {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-lg' },
    md: { icon: 'w-9 h-9', text: 'text-2xl' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl' },
  };

  return (
    <div className={cn('flex items-center gap-2 group', className)}>
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Logo Icon */}
        <div className={cn(
          sizes[size].icon,
          'relative rounded-lg bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow duration-300'
        )}>
          {/* Play triangle */}
          <svg 
            viewBox="0 0 24 24" 
            className="w-[55%] h-[55%] text-primary-foreground ml-0.5"
            fill="currentColor"
          >
            <path d="M8 5.14v14l11-7-11-7z" />
          </svg>
          
          {/* Decorative film strip effect */}
          <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-[60%] flex flex-col justify-between">
            <div className="w-full h-1 bg-primary-foreground/40 rounded-full" />
            <div className="w-full h-1 bg-primary-foreground/40 rounded-full" />
            <div className="w-full h-1 bg-primary-foreground/40 rounded-full" />
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/20 to-transparent" />
        </div>
      </motion.div>

      {showText && (
        <span className={cn(
          sizes[size].text,
          'font-display font-bold tracking-tight'
        )}>
          <span className="text-foreground">T</span>
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Movie</span>
        </span>
      )}
    </div>
  );
};
