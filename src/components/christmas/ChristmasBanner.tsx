import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export const ChristmasBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Check if user already dismissed the banner
        const dismissed = localStorage.getItem('christmas-banner-dismissed');
        if (!dismissed) {
            // Show banner after 2 seconds
            setTimeout(() => setIsVisible(true), 2000);
        } else {
            setIsDismissed(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        localStorage.setItem('christmas-banner-dismissed', 'true');
    };

    if (isDismissed) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
                >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-green-600 to-red-600 p-[2px]">
                        <div className="relative bg-background rounded-2xl p-6">
                            {/* Close button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={handleDismiss}
                            >
                                <X className="h-4 w-4" />
                            </Button>

                            {/* Content */}
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    <motion.div
                                        animate={{
                                            rotate: [0, 10, -10, 10, 0],
                                            scale: [1, 1.1, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 1,
                                        }}
                                    >
                                        <Gift className="h-12 w-12 text-red-500" />
                                    </motion.div>
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-yellow-500" />
                                        Giáng Sinh Vui Vẻ! 🎄
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Chúc bạn một mùa Giáng Sinh ấm áp bên gia đình và bạn bè.
                                        Xem phim thật vui nhé! 🎅🎁
                                    </p>
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -top-1 -left-1 w-8 h-8 bg-red-500/20 rounded-full blur-xl" />
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500/20 rounded-full blur-xl" />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
