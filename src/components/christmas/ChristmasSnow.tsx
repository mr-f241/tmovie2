import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface Snowflake {
    id: number;
    left: number;
    animationDuration: number;
    opacity: number;
    size: number;
}

export const ChristmasSnow = () => {
    const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
    const location = useLocation();

    // Disable snow on watch pages
    const isWatchPage = location.pathname.includes('/xem-phim') ||
        location.pathname.includes('/xem-chung') ||
        location.pathname.includes('/youtube/watch');

    useEffect(() => {
        // Create 75 snowflakes
        const flakes: Snowflake[] = Array.from({ length: 75 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            animationDuration: 5 + Math.random() * 10,
            opacity: 0.4 + Math.random() * 0.6,
            size: 10 + Math.random() * 15, // Size from 10px to 25px
        }));
        setSnowflakes(flakes);
    }, []);

    if (isWatchPage) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="absolute animate-snow-fall text-white select-none"
                    style={{
                        left: `${flake.left}%`,
                        opacity: flake.opacity,
                        fontSize: `${flake.size}px`,
                        animationDuration: `${flake.animationDuration}s`,
                        animationDelay: `${Math.random() * 5}s`,
                        textShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
                    }}
                >
                    ❄
                </div>
            ))}
        </div>
    );
};
