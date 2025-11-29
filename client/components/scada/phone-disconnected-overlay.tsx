'use client';

import { useEffect, useState } from 'react';

interface PhoneDisconnectedOverlayProps {
  onRetry?: () => void;
}

export function PhoneDisconnectedOverlay({ onRetry }: PhoneDisconnectedOverlayProps) {
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(scada-red 1px, transparent 1px), linear-gradient(90deg, scada-red 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 w-full max-w-3xl p-1 border-y-4 border-scada-red bg-black/80">
        <div className="absolute top-0 left-0 w-full h-1 bg-scada-red animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-scada-red animate-pulse" />

        <div className="p-12 text-center">
          <div className="text-6xl mb-4 animate-pulse">⚠️</div>

          <h2 className="text-4xl font-bold text-scada-red tracking-widest mb-2 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
            CONNECTION LOST
          </h2>

          <div className="text-xl text-scada-red/80 font-mono mb-8 tracking-[0.5em] uppercase">
            Critical Sensor Failure
          </div>

          <div className="my-8 p-6 border border-scada-red/30 bg-scada-red/5">
            <div className="text-sm text-scada-red/60 uppercase tracking-widest mb-2">
              System Auto-Shutdown In
            </div>
            <div className="text-8xl font-bold text-scada-red font-mono tabular-nums">
              00:0{countdown}
            </div>
          </div>

          <div className="space-y-2 text-left max-w-md mx-auto font-mono text-xs text-scada-red/70 mb-8">
            <div className="flex justify-between">
              <span>&gt; CHECKING SIGNAL INTEGRITY...</span>
              <span className="text-scada-red font-bold">FAILED</span>
            </div>
            <div className="flex justify-between">
              <span>&gt; PINGING DEVICE (192.168.1.105)...</span>
              <span className="text-scada-red font-bold">TIMEOUT</span>
            </div>
            <div className="flex justify-between">
              <span>&gt; ATTEMPTING RECONNECTION...</span>
              <span className="animate-pulse">RETRYING...</span>
            </div>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="group relative px-8 py-4 bg-transparent overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full border border-scada-red group-hover:bg-scada-red/10 transition-all duration-300" />
              <div className="absolute inset-0 w-0 h-full bg-scada-red/20 group-hover:w-full transition-all duration-500 ease-out" />
              <span className="relative text-scada-red font-bold tracking-widest uppercase group-hover:text-white transition-colors">
                [ FORCE RECONNECT ]
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
