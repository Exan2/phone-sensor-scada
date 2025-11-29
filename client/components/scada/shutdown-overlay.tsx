'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShutdownOverlayProps {
  onRestart?: () => void;
}

const SHUTDOWN_STEPS = [
  { id: 'kernel', label: 'STOPPING KERNEL SERVICES...' },
  { id: 'network', label: 'DISABLING NETWORK INTERFACES...' },
  { id: 'security', label: 'DEACTIVATING SECURITY PROTOCOLS...' },
  { id: 'sensors', label: 'UNLINKING SENSOR ARRAYS...' },
  { id: 'ui', label: 'TERMINATING UI SUBSYSTEM...' },
  { id: 'power', label: 'CUTTING MAIN POWER...' },
];

export function ShutdownOverlay({ onRestart }: ShutdownOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPoweredOff, setIsPoweredOff] = useState(false);
  const [rebootState, setRebootState] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle');

  useEffect(() => {
    if (currentStep < SHUTDOWN_STEPS.length) {
      const timeout = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 800); // 0.8s per step
      return () => clearTimeout(timeout);
    } else {
      // Final power off delay
      const timeout = setTimeout(() => {
        setIsPoweredOff(true);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [currentStep]);

  const handleReboot = () => {
    setRebootState('checking');

    // Simulate connection check
    setTimeout(() => {
      setRebootState('success');
      setTimeout(() => {
        if (onRestart) onRestart();
      }, 1000);
    }, 2000);
  };

  if (isPoweredOff) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden">
        {/* CRT Power Off Animation */}
        <motion.div
          initial={{ scaleY: 1, scaleX: 1, opacity: 1 }}
          animate={{
            scaleY: [1, 0.005, 0.005, 0],
            scaleX: [1, 1, 0, 0],
            opacity: [1, 1, 1, 0]
          }}
          transition={{ duration: 0.4, times: [0, 0.4, 0.8, 1] }}
          className="absolute inset-0 bg-white pointer-events-none"
        />

        <div className="text-scada-text/10 font-mono text-xs mb-8">SYSTEM HALTED</div>

        {/* Reboot Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="z-10 flex flex-col items-center gap-4"
        >
          {rebootState === 'idle' && (
            <button
              onClick={handleReboot}
              className="px-8 py-3 border border-scada-text/20 text-scada-text/40 hover:text-scada-cyan hover:border-scada-cyan hover:bg-scada-cyan/5 transition-all font-mono text-sm tracking-widest uppercase"
            >
              [ INITIALIZE SYSTEM REBOOT ]
            </button>
          )}

          {rebootState === 'checking' && (
            <div className="text-scada-cyan font-mono text-xs animate-pulse">
              &gt; CHECKING SENSOR CONNECTIVITY...
            </div>
          )}

          {rebootState === 'success' && (
            <div className="text-scada-green font-mono text-xs">
              &gt; SIGNAL DETECTED. BOOTING...
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center font-mono text-scada-red">
      <div className="w-full max-w-2xl p-8 border-y-2 border-scada-red/30 bg-scada-red/5 relative overflow-hidden">
        {/* Scanlines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 0, 0, 0.2) 25%, rgba(255, 0, 0, 0.2) 26%, transparent 27%, transparent 74%, rgba(255, 0, 0, 0.2) 75%, rgba(255, 0, 0, 0.2) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px',
            animation: 'scanlines 4s linear infinite'
          }}
        />

        <h1 className="text-4xl font-bold tracking-widest mb-8 text-center animate-pulse">
          SYSTEM SHUTDOWN SEQUENCE
        </h1>

        <div className="space-y-4">
          {SHUTDOWN_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center justify-between border-b border-scada-red/20 pb-2">
              <span className={`tracking-widest transition-opacity duration-300 ${index <= currentStep ? 'opacity-100' : 'opacity-30'}`}>
                {step.label}
              </span>
              <span className="font-bold">
                {index < currentStep ? '[OFFLINE]' : index === currentStep ? '[STOPPING]' : '[WAITING]'}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 h-1 bg-scada-red/20 w-full overflow-hidden">
          <motion.div
            className="h-full bg-scada-red"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / SHUTDOWN_STEPS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
