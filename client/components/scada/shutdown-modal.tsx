'use client';

import { useState, useEffect } from 'react';

interface ShutdownModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ShutdownModal({ onConfirm, onCancel }: ShutdownModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (password.trim().length === 0) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 300);
      setTimeout(() => setError(false), 1500);
      return;
    }
    onConfirm();
    setPassword('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleSubmit();
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [password, onCancel]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`w-96 border-2 border-scada-cyan bg-scada-dark/95 p-6 ${
          shake ? 'animate-shake' : ''
        } ${error ? 'border-scada-red shadow-glow-red' : 'shadow-glow-green'}`}
        style={{
          boxShadow: error
            ? '0 0 30px rgba(255, 0, 0, 0.6), inset 0 0 10px rgba(255, 0, 0, 0.2)'
            : '0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 10px rgba(0, 255, 255, 0.1)',
          animation: shake ? 'shake 0.3s' : 'none',
        }}
      >
        <h2 className="text-center text-sm font-mono uppercase tracking-widest text-scada-cyan mb-6">
          Admin Authentication Required
        </h2>

        <div className="mb-6">
          <label className="block text-xs font-mono text-scada-cyan mb-2 uppercase">
            Enter Admin Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 bg-black/40 border border-scada-cyan text-scada-cyan font-mono text-xs focus:outline-none"
            style={{
              boxShadow: error
                ? '0 0 12px rgba(255, 0, 0, 0.5), inset 0 0 5px rgba(255, 0, 0, 0.2)'
                : '0 0 8px rgba(0, 255, 255, 0.3), inset 0 0 3px rgba(0, 255, 255, 0.1)',
              textShadow: '0 0 5px rgba(0, 255, 255, 0.6)',
            }}
          />
          {error && (
            <p className="text-xs text-scada-yellow mt-2 font-mono animate-pulse">
              ✕ PASSWORD REQUIRED - INPUT CANNOT BE EMPTY
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 text-xs font-mono uppercase border border-scada-cyan text-scada-cyan hover:bg-scada-cyan/10 transition-all"
            style={{
              boxShadow: '0 0 8px rgba(0, 255, 255, 0.3)',
              textShadow: '0 0 5px rgba(0, 255, 255, 0.6)',
            }}
          >
            CANCEL
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-3 py-2 text-xs font-mono uppercase border border-scada-red text-scada-red hover:bg-scada-red/10 transition-all"
            style={{
              boxShadow: '0 0 8px rgba(255, 0, 0, 0.3)',
              textShadow: '0 0 5px rgba(255, 0, 0, 0.6)',
            }}
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
}
