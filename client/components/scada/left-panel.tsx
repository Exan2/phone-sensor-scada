'use client';

import { MetricCard } from './metric-card';
import type { SensorDataAdvanced } from '@/types/sensor';

interface LeftPanelProps {
  sensorData: SensorDataAdvanced;
  isAlarming?: boolean;
}

export function LeftPanel({ sensorData, isAlarming = false }: LeftPanelProps) {
  const getStatus = (value: number, min: number, max: number) => {
    if (value < min || value > max) return 'critical';
    if (value < min + (max - min) * 0.2) return 'warning';
    return 'normal';
  };

  const getTrend = (readings: number[]): 'up' | 'down' | 'stable' => {
    if (readings.length < 2) return 'stable';
    const recent = readings.slice(-5);
    const sum = recent.reduce((a, b) => a + b, 0) / recent.length;
    const older = readings.slice(-10, -5);
    const oldSum = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : sum;
    if (sum > oldSum + 0.5) return 'up';
    if (sum < oldSum - 0.5) return 'down';
    return 'stable';
  };

  const getHealth = (status: string): number => {
    return status === 'normal' ? 100 : status === 'warning' ? 60 : 20;
  };

  return (
    <div 
      className={`h-full flex flex-col gap-2 pb-20 transition-all duration-300 ${
        isAlarming 
          ? 'border-l-2 border-scada-red shadow-glow-red' 
          : 'border-l-2 border-scada-cyan shadow-glow-green'
      }`}
      style={isAlarming ? { animation: 'pulse 1s infinite' } : {}}
    >
      <div className="px-3 py-2 border-l-4 border-scada-cyan">
        <h2 className="text-xs font-mono uppercase tracking-widest text-scada-cyan">
          ▸ System Metrics
        </h2>
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        <MetricCard
          label="Temperature"
          value={sensorData.temperature}
          unit="°C"
          status={getStatus(sensorData.temperature, 20, 55)}
          min={20}
          max={55}
          current={sensorData.temperature}
          isAlarming={isAlarming && sensorData.temperature > 55}
          min_value={sensorData.history.temperature.min}
          max_value={sensorData.history.temperature.max}
          avg_value={sensorData.history.temperature.avg}
          trend={getTrend(sensorData.history.temperature.readings)}
          health={getHealth(getStatus(sensorData.temperature, 20, 55))}
        />
        <MetricCard
          label="Humidity"
          value={sensorData.humidity}
          unit="%"
          status={getStatus(sensorData.humidity, 30, 70)}
          min={0}
          max={100}
          current={sensorData.humidity}
          min_value={sensorData.history.humidity.min}
          max_value={sensorData.history.humidity.max}
          avg_value={sensorData.history.humidity.avg}
          trend={getTrend(sensorData.history.humidity.readings)}
          health={getHealth(getStatus(sensorData.humidity, 30, 70))}
        />
        <MetricCard
          label="Light"
          value={sensorData.light}
          unit="lux"
          status={getStatus(sensorData.light, 0, 50000)}
          min={0}
          max={100000}
          current={sensorData.light}
          min_value={sensorData.history.light.min}
          max_value={sensorData.history.light.max}
          avg_value={sensorData.history.light.avg}
          trend={getTrend(sensorData.history.light.readings)}
          health={getHealth(getStatus(sensorData.light, 0, 50000))}
        />
        <MetricCard
          label="Vibration"
          value={sensorData.vibration}
          unit="Hz"
          status={getStatus(sensorData.vibration, 0, 5)}
          min={0}
          max={10}
          current={sensorData.vibration}
          isAlarming={isAlarming && sensorData.vibration > 5}
          min_value={sensorData.history.vibration.min}
          max_value={sensorData.history.vibration.max}
          avg_value={sensorData.history.vibration.avg}
          trend={getTrend(sensorData.history.vibration.readings)}
          health={getHealth(getStatus(sensorData.vibration, 0, 5))}
        />
      </div>
    </div>
  );
}
