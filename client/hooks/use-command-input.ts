'use client';

import { useState, useCallback } from 'react';
import { useEventLog } from './use-event-log';

export function useCommandInput() {
  const [command, setCommand] = useState('');
  const { addEvent } = useEventLog();

  const handleCommand = useCallback((cmd: string) => {
    if (!cmd.trim()) return;

    switch (cmd.toLowerCase()) {
      case 'scan all':
        addEvent('→ Scanning all nodes...');
        setTimeout(() => addEvent('✓ Node 1 (TEMP) — RESPONSIVE'), 200);
        setTimeout(() => addEvent('✓ Node 2 (HUM) — RESPONSIVE'), 400);
        setTimeout(() => addEvent('✓ Node 3 (PRESS) — RESPONSIVE'), 600);
        setTimeout(() => addEvent('✓ Node 4 (VIB) — RESPONSIVE'), 800);
        setTimeout(() => addEvent('✓ Scan complete — All systems nominal'), 1000);
        break;
      case 'system status':
        addEvent('→ Querying system status...');
        setTimeout(() => addEvent('CORE: OPERATIONAL | SUBSYSTEMS: 5/5 ACTIVE'), 300);
        break;
      case 'diagnostic --full':
        addEvent('→ Running full diagnostic...');
        setTimeout(() => addEvent('✓ Power systems — OK'), 200);
        setTimeout(() => addEvent('✓ Thermal systems — OK'), 400);
        setTimeout(() => addEvent('✓ Sensor grid — OK'), 600);
        setTimeout(() => addEvent('✓ Diagnostic complete'), 800);
        break;
      case 'reset node temp':
        addEvent('→ Resetting temperature node...');
        setTimeout(() => addEvent('✓ Temperature sensor reset complete'), 500);
        break;
      default:
        addEvent(`→ ${cmd}`);
        setTimeout(() => addEvent('✓ Command executed'), 300);
    }
  }, [addEvent]);

  return { command, setCommand, handleCommand };
}
