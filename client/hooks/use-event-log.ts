'use client';

import { useState, useCallback } from 'react';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'CRITICAL' | 'SYSTEM' | 'USER';
  message: string;
}

export function useEventLog() {
  const [events, setEvents] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date(),
      level: 'SYSTEM',
      message: 'System initialized - All nodes responsive',
    },
    {
      id: '2',
      timestamp: new Date(),
      level: 'SYSTEM',
      message: 'Monitoring active - Ready for commands',
    },
  ]);

  const addEvent = useCallback((message: string, level: LogEntry['level'] = 'INFO') => {
    setEvents((prev) => {
      const newEntry: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        level,
        message,
      };
      return [...prev.slice(-199), newEntry]; // Keep last 200 entries
    });
  }, []);

  const clearLog = useCallback(() => {
    setEvents([]);
  }, []);

  return { events, addEvent, clearLog };
}
