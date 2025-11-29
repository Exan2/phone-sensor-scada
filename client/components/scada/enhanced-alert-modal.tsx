'use client';

import { useState, useEffect } from 'react';

interface AlertModalProps {
  sensor: string;
  currentValue: number;
  limit: number;
  message: string;
  severity: 'warning' | 'critical';
  onAcknowledge: () => void;
}

export function EnhancedAlertModal({
  sensor,
  currentValue,
  limit,
  message,
  severity,
  onAcknowledge,
}: AlertModalProps) {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    if (severity === 'critical') {
      const interval = setInterval(() => setPulse(p => !p), 500);
      return () => clearInterval(interval);
    }
  }, [severity]);

  const borderColor = severity === 'critical' ? 'border-scada-red' : 'border-scada-yellow';
  const bgColor = severity === 'critical' ? 'shadow-glow-red' : 'shadow-glow-yellow';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        className={`w-96 border-2 ${borderColor} bg-scada-dark/95 p-8 ${bgColor} ${pulse ? 'opacity-100' : 'opacity-90'} transition-opacity duration-200`}
        style={{
          boxShadow: severity === 'critical' 
            ? '0 0 40px rgba(255, 0, 0, 0.8), inset 0 0 20px rgba(255, 0, 0, 0.2)'
            : '0 0 30px rgba(255, 204, 0, 0.6), inset 0 0 15px rgba(255, 204, 0, 0.15)',
        }}
      >
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className={`text-lg font-mono font-bold uppercase tracking-wider mb-1 ${
            severity === 'critical' ? 'text-scada-red' : 'text-scada-yellow'
          }`}>
            {severity === 'critical' ? '⚠ CRITICAL ALERT' : '⚡ WARNING ALERT'}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-scada-cyan to-transparent mx-auto" />
        </div>

        {/* Alert details */}
        <div className="space-y-3 mb-6 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/50 p-2 border border-scada-cyan/30">
              <span className="text-scada-cyan/60">SENSOR:</span>
              <div className="text-scada-green font-bold">{sensor}</div>
            </div>
            <div className="bg-black/50 p-2 border border-scada-cyan/30">
              <span className="text-scada-cyan/60">CURRENT:</span>
              <div className="text-scada-red font-bold">{currentValue.toFixed(2)}</div>
            </div>
            <div className="bg-black/50 p-2 border border-scada-cyan/30">
              <span className="text-scada-cyan/60">LIMIT:</span>
              <div className="text-scada-yellow font-bold">{limit.toFixed(2)}</div>
            </div>
            <div className="bg-black/50 p-2 border border-scada-cyan/30">
              <span className="text-scada-cyan/60">EXCESS:</span>
              <div className="text-scada-red font-bold">{(currentValue - limit).toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-black/50 p-3 border border-scada-cyan/30">
            <span className="text-scada-cyan/60 block mb-1">MESSAGE:</span>
            <p className="text-scada-green">{message}</p>
          </div>

          <div className="bg-black/50 p-3 border border-scada-cyan/30">
            <span className="text-scada-cyan/60 block mb-1">RECOMMENDED ACTIONS:</span>
            <ul className="text-scada-cyan space-y-1">
              <li>• Check sensor calibration</li>
              <li>• Investigate root cause</li>
              <li>• Monitor for escalation</li>
              <li>• Escalate if condition persists</li>
            </ul>
          </div>
        </div>

        {/* Acknowledge button */}
        <button
          onClick={onAcknowledge}
          className={`w-full px-4 py-2 text-xs font-mono uppercase border-2 font-bold transition-all ${
            severity === 'critical'
              ? 'border-scada-red text-scada-red hover:bg-scada-red/20'
              : 'border-scada-yellow text-scada-yellow hover:bg-scada-yellow/20'
          }`}
          style={{
            boxShadow: severity === 'critical'
              ? '0 0 15px rgba(255, 0, 0, 0.5)'
              : '0 0 15px rgba(255, 204, 0, 0.4)',
            textShadow: '0 0 8px currentColor',
          }}
        >
          [ACKNOWLEDGE ALERT]
        </button>
      </div>
    </div>
  );
}
