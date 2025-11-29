export interface SensorData {
  temperature: number;
  humidity: number;
  light: number;
  vibration: number;
  status: 'normal' | 'warning' | 'critical';
  // Hardware Metrics
  cpuTemp?: number;
  cpuUsage?: number;
  ramUsage?: number;
  batteryTemp?: number;
  batteryLevel?: number;
}

export interface SensorHistory {
  min: number;
  max: number;
  avg: number;
  readings: number[];
  lastUpdate: Date;
}

export interface SensorDataAdvanced extends SensorData {
  history: {
    temperature: SensorHistory;
    humidity: SensorHistory;
    light: SensorHistory;
    vibration: SensorHistory;
  };
}

export type SystemState = 'operational' | 'warning' | 'critical' | 'diagnostics' | 'shutdown' | 'offline';

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  sensor: string;
  message: string;
  value: number;
  limit: number;
  timestamp: Date;
  acknowledged: boolean;
}
