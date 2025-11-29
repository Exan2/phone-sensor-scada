'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SystemBootOverlayProps {
    onBootComplete: () => void;
}

const BOOT_LINES = [
    "BIOS DATE 01/15/2025 14:22:55 VER 1.0.2",
    "CPU: QUANTUM CORE i9-9900K @ 5.00GHz",
    "Memory Test: 65536K OK",
    "Detecting Primary Master ... SCADA-DRIVE-01",
    "Detecting Primary Slave ... SENSOR-HUB-V2",
    "Loading Kernel ...",
    "Initializing Video Adapter ...",
    "Video Adapter Initialized.",
    "Checking File System ...",
    "Mounting Root File System ...",
    "Loading SCADA Modules ...",
    "Initializing Network Interface ...",
    "DHCP ... OK",
    "IP Address: 192.168.1.105",
    "Starting System Services ...",
    "Service: SENSOR_DAEMON ... STARTED",
    "Service: DATA_LOGGER ... STARTED",
    "Service: UI_RENDERER ... STARTED",
    "System Ready."
];

export function SystemBootOverlay({ onBootComplete }: SystemBootOverlayProps) {
    const [bootStep, setBootStep] = useState<'bios' | 'login' | 'authenticating' | 'granted' | 'denied'>('bios');
    const [lines, setLines] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);
    const [password, setPassword] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Boot Sequence Animation
    useEffect(() => {
        if (bootStep !== 'bios') return;

        let lineIndex = 0;
        const lineInterval = setInterval(() => {
            if (lineIndex >= BOOT_LINES.length) {
                clearInterval(lineInterval);
                setTimeout(() => setBootStep('login'), 1000);
                return;
            }
            setLines(prev => [...prev, BOOT_LINES[lineIndex]]);
            lineIndex++;

            // Scroll to bottom
            const terminal = document.getElementById('boot-terminal');
            if (terminal) terminal.scrollTop = terminal.scrollHeight;
        }, 100);

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 2;
            });
        }, 40);

        return () => {
            clearInterval(lineInterval);
            clearInterval(progressInterval);
        };
    }, [bootStep]);

    // Focus input on login
    useEffect(() => {
        if (bootStep === 'login' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [bootStep]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setBootStep('authenticating');

        setTimeout(() => {
            if (password === 'admin') {
                setBootStep('granted');
                setTimeout(() => {
                    onBootComplete();
                }, 2000);
            } else {
                setBootStep('denied');
                setPassword('');
                setTimeout(() => setBootStep('login'), 1500);
            }
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-scada-dark text-scada-text font-mono overflow-hidden flex flex-col items-center justify-center">

            {/* Background Grid & Scanlines (Matches Dashboard) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 136, 0.1) 25%, rgba(0, 255, 136, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 136, 0.1) 75%, rgba(0, 255, 136, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 136, 0.1) 25%, rgba(0, 255, 136, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 136, 0.1) 75%, rgba(0, 255, 136, 0.1) 76%, transparent 77%, transparent)',
                    backgroundSize: '50px 50px',
                    animation: 'scanlines 8s linear infinite'
                }}
            />

            {/* CRT Vignette */}
            <div className="absolute inset-0 pointer-events-none z-50"
                style={{
                    background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)'
                }}
            />

            <AnimatePresence mode="wait">
                {bootStep === 'bios' && (
                    <motion.div
                        key="bios"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                        className="w-full max-w-4xl p-8 h-full flex flex-col relative z-10"
                    >
                        <div className="flex justify-between mb-4 border-b border-scada-text/30 pb-2 text-scada-cyan">
                            <span>SCADA BIOS v2.4.1</span>
                            <span>SYSTEM INITIALIZATION</span>
                        </div>

                        <div id="boot-terminal" className="flex-1 overflow-y-auto font-mono text-sm space-y-1 mb-8 scrollbar-hide text-scada-text/80">
                            {lines.map((line, i) => (
                                <div key={i} className="flex">
                                    <span className="mr-2 text-scada-text/50">[{new Date().toLocaleTimeString()}]</span>
                                    <span>{line}</span>
                                </div>
                            ))}
                            <div className="animate-pulse text-scada-cyan">_</div>
                        </div>

                        <div className="w-full border border-scada-text/30 p-1 bg-black/50">
                            <div
                                className="h-4 bg-scada-cyan transition-all duration-75 ease-linear relative overflow-hidden"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite_linear]" />
                            </div>
                        </div>
                        <div className="flex justify-between text-xs mt-2 text-scada-cyan">
                            <span>LOADING KERNEL MODULES...</span>
                            <span>{progress}%</span>
                        </div>
                    </motion.div>
                )}

                {bootStep === 'login' && (
                    <motion.div
                        key="login"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="w-full max-w-md p-8 border border-scada-cyan bg-black/90 relative z-10 shadow-[0_0_30px_rgba(0,255,255,0.1)]"
                    >
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-scada-cyan" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-scada-cyan" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-scada-cyan" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-scada-cyan" />

                        <div className="text-center mb-8">
                            <div className="text-4xl mb-4 animate-pulse">🔒</div>
                            <h2 className="text-xl font-bold tracking-widest text-scada-cyan">SECURE ACCESS</h2>
                            <p className="text-xs text-scada-text/60 mt-2 uppercase">Authentication Required</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-8">
                            <div className="relative">
                                <label className="block text-[10px] uppercase tracking-widest mb-2 text-scada-text/50">Administrator Password</label>
                                <input
                                    ref={inputRef}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-scada-text/5 border-b border-scada-cyan py-3 text-center text-xl focus:outline-none focus:bg-scada-cyan/10 transition-colors font-bold tracking-[0.5em] text-scada-white placeholder-scada-text/20"
                                    placeholder="••••"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                className="group w-full py-3 border border-scada-cyan text-scada-cyan hover:bg-scada-cyan hover:text-black transition-all uppercase font-bold tracking-widest text-sm relative overflow-hidden"
                            >
                                <span className="relative z-10">Initialize Session</span>
                                <div className="absolute inset-0 bg-scada-cyan/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </button>
                        </form>
                    </motion.div>
                )}

                {bootStep === 'authenticating' && (
                    <motion.div
                        key="auth"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center z-10"
                    >
                        <div className="text-2xl animate-pulse tracking-widest text-scada-cyan">VERIFYING CREDENTIALS...</div>
                        <div className="mt-4 h-0.5 w-64 bg-scada-text/20 mx-auto overflow-hidden">
                            <div className="h-full bg-scada-cyan w-1/3 animate-[shimmer_1s_infinite_linear]" />
                        </div>
                    </motion.div>
                )}

                {bootStep === 'granted' && (
                    <motion.div
                        key="granted"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center z-10"
                    >
                        <div className="text-6xl mb-6 text-scada-green drop-shadow-[0_0_25px_rgba(0,255,136,0.6)]">ACCESS GRANTED</div>
                        <div className="text-sm tracking-[0.5em] animate-pulse text-scada-text">LOADING DASHBOARD CONFIGURATION...</div>
                    </motion.div>
                )}

                {bootStep === 'denied' && (
                    <motion.div
                        key="denied"
                        initial={{ x: -10 }}
                        animate={{ x: [0, -10, 10, -10, 10, 0] }}
                        className="text-center z-10"
                    >
                        <div className="text-6xl mb-6 text-scada-red drop-shadow-[0_0_25px_rgba(255,0,0,0.6)]">ACCESS DENIED</div>
                        <div className="text-sm tracking-[0.5em] text-scada-red uppercase">Invalid Security Token</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
