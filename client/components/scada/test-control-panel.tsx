'use client';

interface TestControlPanelProps {
  onSimulateTemperatureSpike: () => void;
  onSimulatePressureSurge: () => void;
  onSimulatePowerDrop: () => void;
  onResetSystems: () => void;
}

export function TestControlPanel({
  onSimulateTemperatureSpike,
  onSimulatePressureSurge,
  onSimulatePowerDrop,
  onResetSystems,
}: TestControlPanelProps) {
  return (
    <div className="border border-scada-purple/50 bg-black/40 backdrop-blur-sm p-3 shadow-glow-green">
      <h3 className="text-xs font-mono uppercase tracking-widest text-scada-purple mb-3 border-b border-scada-purple/30 pb-2">
        ▸ Test Control Panel
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onSimulateTemperatureSpike}
          className="px-2 py-1.5 text-xs font-mono uppercase border border-scada-yellow text-scada-yellow hover:bg-scada-yellow/10 transition-all"
          style={{
            boxShadow: '0 0 6px rgba(255, 204, 0, 0.3)',
            textShadow: '0 0 3px rgba(255, 204, 0, 0.6)',
          }}
        >
          TEMP SPIKE
        </button>
        <button
          onClick={onSimulatePressureSurge}
          className="px-2 py-1.5 text-xs font-mono uppercase border border-scada-yellow text-scada-yellow hover:bg-scada-yellow/10 transition-all"
          style={{
            boxShadow: '0 0 6px rgba(255, 204, 0, 0.3)',
            textShadow: '0 0 3px rgba(255, 204, 0, 0.6)',
          }}
        >
          PRESS SURGE
        </button>
        <button
          onClick={onSimulatePowerDrop}
          className="px-2 py-1.5 text-xs font-mono uppercase border border-scada-red text-scada-red hover:bg-scada-red/10 transition-all"
          style={{
            boxShadow: '0 0 6px rgba(255, 0, 0, 0.3)',
            textShadow: '0 0 3px rgba(255, 0, 0, 0.6)',
          }}
        >
          PWR DROP
        </button>
        <button
          onClick={onResetSystems}
          className="px-2 py-1.5 text-xs font-mono uppercase border border-scada-green text-scada-green hover:bg-scada-green/10 transition-all"
          style={{
            boxShadow: '0 0 6px rgba(0, 255, 136, 0.3)',
            textShadow: '0 0 3px rgba(0, 255, 136, 0.6)',
          }}
        >
          RESET ALL
        </button>
      </div>
    </div>
  );
}
