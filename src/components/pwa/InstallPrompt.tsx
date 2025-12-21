import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { useState } from 'react';

export const InstallPrompt = () => {
    const { isInstallable, isInstalled, promptInstall } = usePWA();
    const [isDismissed, setIsDismissed] = useState(false);

    if (isInstalled || isDismissed || !isInstallable) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
            >
                <div className="glass-card rounded-xl p-4 shadow-2xl border border-primary/20">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shrink-0">
                            <Download className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold mb-1">Cài đặt TMovie</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                Cài đặt ứng dụng để trải nghiệm tốt hơn, xem offline và nhận thông báo phim mới!
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={promptInstall}
                                >
                                    <Download className="h-4 w-4 mr-1.5" />
                                    Cài đặt ngay
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setIsDismissed(true)}
                                >
                                    Để sau
                                </Button>
                            </div>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="shrink-0"
                            onClick={() => setIsDismissed(true)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
