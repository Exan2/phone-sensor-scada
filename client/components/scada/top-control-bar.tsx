'use client';

import { useState } from 'react';
import { ShutdownModal } from './shutdown-modal';

interface TopControlBarProps {
  onShutdown: () => void;
  onDiagnostics: () => void;
  onRestart: () => void;
  onShowTestPanel: () => void;
  phoneConnected?: boolean;
  connectionStatus?: 'checking' | 'connected' | 'disconnected';
}

export function TopControlBar({ onShutdown, onDiagnostics, onRestart, onShowTestPanel, phoneConnected = false, connectionStatus = 'disconnected' }: TopControlBarProps) {
  const [showShutdownModal, setShowShutdownModal] = useState(false);

  const handleShutdownClick = () => {
    setShowShutdownModal(true);
  };

  const handleConfirmShutdown = () => {
    setShowShutdownModal(false);
    onShutdown();
  };

  return (
    <>
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-scada-cyan/20 to-transparent border-b border-scada-cyan/50 flex items-center justify-between px-4 z-40">
        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-scada-green rounded-full animate-pulse" />
            <span className="text-xs font-mono text-scada-cyan uppercase tracking-wide">SYSTEM STATUS:</span>
            <span className="text-xs font-mono text-scada-green font-bold">ONLINE</span>
          </div>
          <div className="flex items-center gap-2 border-l border-scada-cyan/30 pl-3">
            <div className={`w-2 h-2 rounded-full ${
              phoneConnected 
                ? 'bg-scada-green animate-pulse' 
                : connectionStatus === 'checking'
                ? 'bg-scada-yellow animate-pulse'
                : 'bg-scada-red'
            }`} />
            <span className="text-xs font-mono text-scada-cyan uppercase tracking-wide">PHONE:</span>
            <span className={`text-xs font-mono font-bold ${
              phoneConnected 
                ? 'text-scada-green' 
                : connectionStatus === 'checking'
                ? 'text-scada-yellow'
                : 'text-scada-red'
            }`}>
              {phoneConnected ? 'CONNECTED' : connectionStatus === 'checking' ? 'CHECKING...' : 'DISCONNECTED'}
            </span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onShowTestPanel}
            className="px-3 py-1.5 text-xs font-mono uppercase border border-scada-yellow text-scada-yellow hover:bg-scada-yellow/20 transition-all duration-200"
            style={{
              boxShadow: '0 0 8px rgba(255, 204, 0, 0.4)',
              textShadow: '0 0 5px rgba(255, 204, 0, 0.6)',
            }}
          >
            [TEST PANEL]
          </button>
          <button
            onClick={onDiagnostics}
            className="px-3 py-1.5 text-xs font-mono uppercase border border-scada-cyan text-scada-cyan hover:bg-scada-cyan/20 transition-all duration-200"
            style={{
              boxShadow: '0 0 8px rgba(0, 255, 255, 0.4)',
              textShadow: '0 0 5px rgba(0, 255, 255, 0.6)',
            }}
          >
            [RUN DIAGNOSTICS]
          </button>
          <button
            onClick={handleShutdownClick}
            className="px-3 py-1.5 text-xs font-mono uppercase border border-scada-red text-scada-red hover:bg-scada-red/20 transition-all duration-200"
            style={{
              boxShadow: '0 0 8px rgba(255, 0, 0, 0.4)',
              textShadow: '0 0 5px rgba(255, 0, 0, 0.6)',
            }}
          >
            [SHUTDOWN SYSTEM]
          </button>
          <button
            onClick={onRestart}
            className="px-3 py-1.5 text-xs font-mono uppercase border border-scada-yellow text-scada-yellow hover:bg-scada-yellow/20 transition-all duration-200"
            style={{
              boxShadow: '0 0 8px rgba(255, 204, 0, 0.4)',
              textShadow: '0 0 5px rgba(255, 204, 0, 0.6)',
            }}
          >
            [RESTART]
          </button>
        </div>

        {/* User badge */}
        <div className="flex items-center gap-2 border-l border-scada-cyan/30 pl-4">
          <div className="w-2 h-2 bg-scada-green rounded-full" />
          <span className="text-xs font-mono uppercase tracking-wider text-scada-cyan">ADMINISTRATOR</span>
        </div>
      </div>

      {/* Shutdown Modal */}
      {showShutdownModal && (
        <ShutdownModal
          onConfirm={handleConfirmShutdown}
          onCancel={() => setShowShutdownModal(false)}
        />
      )}
    </>
  );
}
