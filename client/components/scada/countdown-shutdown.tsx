'use client';

import { useEffect, useState } from 'react';

interface CountdownShutdownProps {
  onAbort: () => void;
  onComplete: () => void;
}

export function CountdownShutdown({ onAbort, onComplete }: CountdownShutdownProps) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setCountdown(c => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, onComplete]);

  const percentage = (countdown / 10) * 100;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-96 border-2 border-scada-red bg-black p-8 text-center shadow-glow-red">
        <h2 className="text-2xl font-mono font-bold text-scada-red mb-4 animate-pulse">
          SHUTDOWN SEQUENCE
        </h2>

        <p className="text-xs font-mono text-scada-cyan mb-6">
          SYSTEM WILL POWER DOWN IN
        </p>

        <div className="mb-8">
          <div className="text-6xl font-mono font-bold text-scada-red mb-4">
            {countdown}
          </div>

          {/* Countdown bar */}
          <div className="h-3 border border-scada-red bg-black/50 overflow-hidden mb-4">
            <div 
              className="h-full bg-scada-red transition-all duration-1000"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-xs font-mono text-scada-yellow">
            PRESS ABORT TO CANCEL
          </p>
        </div>

        <button
          onClick={onAbort}
          className="w-full px-4 py-3 text-xs font-mono uppercase border-2 border-scada-yellow text-scada-yellow hover:bg-scada-yellow/20 transition-all font-bold"
          style={{
            boxShadow: '0 0 15px rgba(255, 204, 0, 0.5)',
            textShadow: '0 0 8px rgba(255, 204, 0, 0.8)',
          }}
        >
          [ABORT SHUTDOWN]
        </button>
      </div>
    </div>
  );
}
