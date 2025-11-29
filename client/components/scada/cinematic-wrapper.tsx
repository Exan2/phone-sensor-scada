'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useEffect } from 'react';

interface CinematicWrapperProps {
    children: ReactNode;
    status: 'active' | 'glitching' | 'offline';
    label?: string;
}

export function CinematicWrapper({ children, status, label = 'SYSTEM' }: CinematicWrapperProps) {
    const [showOffline, setShowOffline] = useState(false);

    // Handle transition to offline to allow for exit animation
    useEffect(() => {
        if (status === 'offline') {
            const timer = setTimeout(() => setShowOffline(true), 400); // Wait for collapse animation
            return () => clearTimeout(timer);
        } else {
            setShowOffline(false);
        }
    }, [status]);

    if (showOffline) {
        return (
            <div className="w-full h-full bg-black border border-scada-text/5 relative overflow-hidden flex items-center justify-center">
                <div className="text-center z-10 opacity-30">
                    <div className="text-scada-red font-mono font-bold tracking-widest uppercase text-xs mb-1">
                        {label}
                    </div>
                    <div className="text-[10px] text-scada-red/50 font-mono">
                        SIGNAL LOST
                    </div>
                </div>
                {/* Subtle blinking cursor */}
                <div className="absolute bottom-2 right-2 w-2 h-4 bg-scada-red/20 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="w-full h-full relative overflow-hidden bg-black">
            <AnimatePresence mode="wait">
                {status !== 'offline' && (
                    <motion.div
                        key="content"
                        initial={{ opacity: 1, scaleY: 1 }}
                        exit={{
                            scaleY: [1, 0.005, 0],
                            scaleX: [1, 1, 0],
                            opacity: [1, 1, 0],
                            filter: "brightness(2)"
                        }}
                        transition={{ duration: 0.4, times: [0, 0.3, 1] }}
                        className="w-full h-full"
                    >
                        <div className={`w-full h-full transition-all duration-200 ${status === 'glitching' ? 'grayscale-[0.8] contrast-125 brightness-90' : ''
                            }`}>
                            {children}
                        </div>

                        {/* Realistic Digital Artifacts Overlay */}
                        {status === 'glitching' && (
                            <>
                                {/* Random horizontal displacement lines */}
                                <motion.div
                                    animate={{
                                        clipPath: [
                                            'inset(10% 0 80% 0)',
                                            'inset(40% 0 20% 0)',
                                            'inset(80% 0 5% 0)',
                                            'inset(10% 0 80% 0)'
                                        ],
                                        x: [-2, 2, -1, 1, 0],
                                    }}
                                    transition={{
                                        duration: 0.2,
                                        repeat: Infinity,
                                        repeatType: "mirror",
                                        ease: "linear"
                                    }}
                                    className="absolute inset-0 bg-scada-cyan/10 mix-blend-color-dodge pointer-events-none"
                                    style={{ filter: 'blur(1px)' }}
                                />

                                {/* Vertical Sync Failure Effect */}
                                <motion.div
                                    animate={{ y: [0, 2, -2, 0] }}
                                    transition={{ duration: 0.1, repeat: Infinity, repeatDelay: Math.random() * 2 }}
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                                        backgroundSize: '100% 2px, 3px 100%'
                                    }}
                                />
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
