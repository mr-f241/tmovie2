import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const ChristmasLights = () => {
    const colors = ['#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff'];
    const lights = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        color: colors[i % colors.length],
        delay: i * 0.1,
    }));

    return (
        <div className="fixed top-0 left-0 right-0 pointer-events-none z-40 h-16 overflow-hidden">
            <div className="w-full relative h-full">
                {/* Wire */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {/* Lights */}
                <div className="absolute top-0 left-0 right-0 flex justify-around">
                    {lights.map((light) => (
                        <motion.div
                            key={light.id}
                            className="relative"
                            animate={{
                                opacity: [0.3, 1, 0.3],
                                scale: [0.8, 1.2, 0.8],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: light.delay,
                            }}
                        >
                            <div
                                className="w-3 h-4 rounded-b-full"
                                style={{
                                    background: `linear-gradient(to bottom, ${light.color}dd, ${light.color}44)`,
                                    boxShadow: `0 0 10px ${light.color}, 0 0 20px ${light.color}88`,
                                }}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
