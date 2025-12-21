import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const usePWA = () => {
    const [isInstallable, setIsInstallable] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        // Listen for app installed
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            toast.success('Đã cài đặt TMovie thành công! 🎉');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('[PWA] Service Worker registered:', registration);

                    // Check for updates every hour
                    setInterval(() => {
                        registration.update();
                    }, 60 * 60 * 1000);
                })
                .catch((error) => {
                    console.error('[PWA] Service Worker registration failed:', error);
                });
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const promptInstall = async () => {
        if (!deferredPrompt) {
            toast.error('Trình duyệt không hỗ trợ cài đặt');
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            toast.success('Đang cài đặt TMovie...');
        }

        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    return {
        isInstallable,
        isInstalled,
        promptInstall,
    };
};
