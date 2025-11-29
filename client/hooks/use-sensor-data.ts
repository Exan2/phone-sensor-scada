'use client';

import { useState, useEffect } from 'react';
import type { SensorDataAdvanced, SensorHistory, SystemState } from '@/types/sensor';

const generateMockData = (): any => {
  const baseTemp = 35 + Math.sin(Date.now() / 5000) * 15;
  const tempVariation = Math.random() * 8 - 4;
  
  return {
    temperature: Math.max(20, Math.min(65, baseTemp + tempVariation)),
    humidity: Math.max(30, Math.min(90, 40 + Math.sin(Date.now() / 4000) * 25 + (Math.random() * 10 - 5))),
    light: Math.max(0, Math.min(100000, 500 + Math.sin(Date.now() / 8000) * 200 + (Math.random() * 100 - 50))),
    vibration: Math.max(0, Math.min(10, Math.abs(Math.sin(Date.now() / 3000) * 4) + Math.random() * 2)),
    status: Math.random() > 0.8 ? 'warning' : 'normal',
  };
};

const initializeHistory = (): SensorHistory => ({
  min: Infinity,
  max: -Infinity,
  avg: 0,
  readings: [],
  lastUpdate: new Date(),
});

export function useSensorData() {
  const [sensorData, setSensorData] = useState<SensorDataAdvanced>({
    temperature: 35,
    humidity: 50,
    light: 100,
    vibration: 0,
    status: 'normal',
    history: {
      temperature: initializeHistory(),
      humidity: initializeHistory(),
      light: initializeHistory(),
      vibration: initializeHistory(),
    },
  });

  const [systemState, setSystemState] = useState<SystemState>('operational');
  const [usingRealData, setUsingRealData] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Fetch real sensor data from API
  const fetchRealSensorData = async () => {
    try {
      const response = await fetch('/api/sensors', { cache: 'no-store' });
      const data = await response.json();
      
      if (response.ok && !data.error && !data.mock) {
        // Real data received
        setUsingRealData(true);
        setConnectionStatus('connected');
        return {
          temperature: data.temperature || 35,
          humidity: data.humidity || 50,
          light: data.light || 100,
          vibration: data.vibration || 0,
          status: data.status || 'normal',
        };
      } else {
        // Service unavailable
        setUsingRealData(false);
        setConnectionStatus('disconnected');
        return null;
      }
    } catch (error) {
      // Network error
      setUsingRealData(false);
      setConnectionStatus('disconnected');
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Check connection status on mount
    const initialCheck = async () => {
      const data = await fetchRealSensorData();
      if (mounted && data) {
        setSensorData((prev) => {
          const updateHistory = (key: keyof typeof prev.history, value: number) => {
            const history = { ...prev.history[key] };
            history.readings = [...history.readings.slice(-49), value];
            history.min = Math.min(...history.readings);
            history.max = Math.max(...history.readings);
            history.avg = history.readings.reduce((a, b) => a + b, 0) / history.readings.length;
            history.lastUpdate = new Date();
            return history;
          };

          return {
            ...data,
            history: {
              temperature: updateHistory('temperature', data.temperature),
              humidity: updateHistory('humidity', data.humidity),
              light: updateHistory('light', data.light),
              vibration: updateHistory('vibration', data.vibration),
            },
          };
        });
      }
    };
    
    initialCheck();

    const interval = setInterval(async () => {
      if (!mounted) return;
      
      const realData = await fetchRealSensorData();
      
      // Always update if we have real data, or use mock if disconnected and still checking
      if (realData !== null) {
        // Real data received - update immediately
        setSensorData((prev) => {
          const updateHistory = (key: keyof typeof prev.history, value: number) => {
            const history = { ...prev.history[key] };
            history.readings = [...history.readings.slice(-49), value];
            history.min = Math.min(...history.readings);
            history.max = Math.max(...history.readings);
            history.avg = history.readings.reduce((a, b) => a + b, 0) / history.readings.length;
            history.lastUpdate = new Date();
            return history;
          };

          return {
            ...realData,
            history: {
              temperature: updateHistory('temperature', realData.temperature),
              humidity: updateHistory('humidity', realData.humidity),
              light: updateHistory('light', realData.light),
              vibration: updateHistory('vibration', realData.vibration),
            },
          };
        });
      } else if (connectionStatus === 'checking' && !usingRealData) {
        // Still checking and no real data yet - use mock
      setSensorData((prev) => {
        const newData = generateMockData();
        const updateHistory = (key: keyof typeof prev.history, value: number) => {
          const history = { ...prev.history[key] };
          history.readings = [...history.readings.slice(-49), value];
          history.min = Math.min(...history.readings);
          history.max = Math.max(...history.readings);
          history.avg = history.readings.reduce((a, b) => a + b, 0) / history.readings.length;
          history.lastUpdate = new Date();
          return history;
        };

        return {
          ...newData,
          history: {
            temperature: updateHistory('temperature', newData.temperature),
            humidity: updateHistory('humidity', newData.humidity),
              light: updateHistory('light', newData.light),
            vibration: updateHistory('vibration', newData.vibration),
          },
        };
      });
      }
      // When disconnected, don't update - freeze the last known values
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []); // Remove connectionStatus from dependencies to avoid stale closures

  return { 
    sensorData, 
    systemState, 
    setSystemState,
    usingRealData,
    connectionStatus
  };
}
