'use client';

import { useState, useEffect } from 'react';
import { LeftPanel } from '@/components/scada/left-panel';
import { CenterMap } from '@/components/scada/center-map';
import { RightTerminal } from '@/components/scada/right-terminal';
import { BottomCommandBar } from '@/components/scada/bottom-command-bar';
import { TopControlBar } from '@/components/scada/top-control-bar';
import { TestControlPanel } from '@/components/scada/test-control-panel';
import { AlarmSystem } from '@/components/scada/alarm-system';
import { ShutdownOverlay } from '@/components/scada/shutdown-overlay';
import { CountdownShutdown } from '@/components/scada/countdown-shutdown';
import { PhoneDisconnectedOverlay } from '@/components/scada/phone-disconnected-overlay';
import { SystemBootOverlay } from '@/components/scada/system-boot-overlay';
import { RestartingOverlay } from '@/components/scada/restarting-overlay';
import { PasswordModal } from '@/components/scada/password-modal';
import { CinematicWrapper } from '@/components/scada/cinematic-wrapper';
import { useSensorData } from '@/hooks/use-sensor-data';
import { useEventLog } from '@/hooks/use-event-log';
import { useCommandInput } from '@/hooks/use-command-input';

export default function Page() {
  const { sensorData, systemState, setSystemState, usingRealData, connectionStatus } = useSensorData();
  const { events, addEvent } = useEventLog();
  const { command, setCommand, handleCommand } = useCommandInput();

  // Phases
  const [shutdownPhase, setShutdownPhase] = useState<'idle' | 'countdown' | 'offline'>('idle');
  const [restartPhase, setRestartPhase] = useState<'idle' | 'restarting'>('idle');
  const [disconnectPhase, setDisconnectPhase] = useState<'idle' | 'warning' | 'failing' | 'shutdown'>('idle');

  // UI States
  const [alarmActive, setAlarmActive] = useState(false);
  const [testData, setTestData] = useState({ tempSpike: false, pressureSurge: false, powerDrop: false });
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [isSystemBooted, setIsSystemBooted] = useState(false);
  const [showShutdownAuth, setShowShutdownAuth] = useState(false);

  // Panel States for Cinematic Failure
  const [panelStatus, setPanelStatus] = useState<{
    left: 'active' | 'glitching' | 'offline';
    center: 'active' | 'glitching' | 'offline';
    right: 'active' | 'glitching' | 'offline';
  }>({ left: 'active', center: 'active', right: 'active' });

  // Failing sensors state for cinematic disconnect
  const [failedSensors, setFailedSensors] = useState<string[]>([]);

  // ---------------------------------------------------------------------------
  // ALARM LOGIC
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (connectionStatus === 'disconnected' && !usingRealData) return;

    const hasAlarm = sensorData.temperature > 50 || sensorData.vibration > 5;

    if (hasAlarm && !alarmActive) {
      setAlarmActive(true);
      addEvent(`⚠ ALERT: SYSTEM THRESHOLD BREACHED - ${hasAlarm ? 'IMMEDIATE ACTION REQUIRED' : ''}`);
    } else if (!hasAlarm && alarmActive) {
      setAlarmActive(false);
      addEvent('✓ Alert condition cleared - System nominal');
    }
  }, [sensorData, alarmActive, addEvent, connectionStatus, usingRealData]);

  // ---------------------------------------------------------------------------
  // DISCONNECTION LOGIC (Cinematic)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // If phone disconnects and we are not already handling it
    if (connectionStatus === 'disconnected' && !usingRealData && disconnectPhase === 'idle' && isSystemBooted) {
      setDisconnectPhase('warning');
      addEvent('🔴 CRITICAL: SENSOR UPLINK LOST - INITIATING FAILSAFE PROTOCOLS');

      // 8 Seconds Warning -> Cascading Failure
      setTimeout(() => {
        setDisconnectPhase('failing');
        addEvent('⚠ WARNING: SENSOR DATA INTEGRITY CRITICAL - SYSTEMS FAILING');
      }, 8000);
    }
    // If phone reconnects, reset everything
    else if (connectionStatus === 'connected' && usingRealData) {
      if (disconnectPhase !== 'idle') {
        setDisconnectPhase('idle');
        setFailedSensors([]);
        setPanelStatus({ left: 'active', center: 'active', right: 'active' });
        addEvent('✅ UPLINK RESTORED - SYSTEM STABILIZED');
      }
    }
  }, [connectionStatus, usingRealData, disconnectPhase, isSystemBooted, addEvent]);

  // Cascading Failure Effect (Sensors & Panels)
  useEffect(() => {
    if (disconnectPhase === 'failing') {
      // 1. Fail Sensors
      const sensors = ['temperature', 'humidity', 'light', 'vibration'];
      let delay = 0;

      sensors.forEach((sensor, index) => {
        delay += 1000;
        setTimeout(() => {
          setFailedSensors(prev => [...prev, sensor]);
          addEvent(`❌ ERROR: ${sensor.toUpperCase()} MODULE OFFLINE`);
        }, delay);
      });

      // 2. Fail Panels Sequentially
      // Left Panel Glitch -> Offline
      setTimeout(() => setPanelStatus(prev => ({ ...prev, left: 'glitching' })), 2000);
      setTimeout(() => setPanelStatus(prev => ({ ...prev, left: 'offline' })), 4000);

      // Right Terminal Glitch -> Offline
      setTimeout(() => setPanelStatus(prev => ({ ...prev, right: 'glitching' })), 4500);
      setTimeout(() => setPanelStatus(prev => ({ ...prev, right: 'offline' })), 6000);

      // Center Map Glitch -> Offline (Last)
      setTimeout(() => setPanelStatus(prev => ({ ...prev, center: 'glitching' })), 6500);
      setTimeout(() => setPanelStatus(prev => ({ ...prev, center: 'offline' })), 8000);

      // 3. Final Shutdown
      setTimeout(() => {
        setShutdownPhase('offline');
        addEvent('⚫ CRITICAL FAILURE: ALL SYSTEMS DOWN');
      }, 9500);
    }
  }, [disconnectPhase, addEvent]);

  // ---------------------------------------------------------------------------
  // ACTIONS
  // ---------------------------------------------------------------------------
  const beginShutdownCountdown = () => {
    if (shutdownPhase !== 'idle') return;
    setShutdownPhase('countdown');
    addEvent('🔴 SHUTDOWN SEQUENCE INITIATED - 10 SECOND COUNTDOWN');
  };

  const completeShutdown = () => {
    setShutdownPhase('offline');
    addEvent('⚫ SYSTEM OFFLINE - CORE POWERED DOWN');
  };

  const abortShutdown = () => {
    if (shutdownPhase !== 'countdown') return;
    setShutdownPhase('idle');
    addEvent('⚠ Shutdown aborted - Returning to operational mode');
  };

  const handleCommandSubmit = (cmd: string) => {
    if (cmd.toLowerCase() === 'shutdown core' || cmd.toLowerCase() === 'shutdown') {
      setShowShutdownAuth(true);
      return;
    }
    addEvent(`${cmd}`);
    handleCommand(cmd);
  };

  const handleDiagnostics = () => {
    addEvent('► Running full system diagnostics...');
    setTimeout(() => addEvent('✓ Diagnostics complete - All systems nominal'), 1000);
  };

  const handleRestart = () => {
    setRestartPhase('restarting');
    addEvent('► SYSTEM RESTART INITIATED...');

    setTimeout(() => {
      // Reset ALL states
      setRestartPhase('idle');
      setShutdownPhase('idle');
      setSystemState('operational');
      setDisconnectPhase('idle');
      setFailedSensors([]);
      setPanelStatus({ left: 'active', center: 'active', right: 'active' });
      setIsSystemBooted(false); // Trigger boot sequence
    }, 3000);
  };

  // ---------------------------------------------------------------------------
  // TEST SIMULATIONS
  // ---------------------------------------------------------------------------
  const handleSimulateTemperatureSpike = () => {
    setTestData(prev => ({ ...prev, tempSpike: true }));
    addEvent('⚠ [TEST] Temperature spike simulation activated');
    setTimeout(() => setTestData(prev => ({ ...prev, tempSpike: false })), 3000);
  };

  const handleSimulatePressureSurge = () => {
    setTestData(prev => ({ ...prev, pressureSurge: true }));
    addEvent('⚠ [TEST] Pressure surge simulation activated');
    setTimeout(() => setTestData(prev => ({ ...prev, pressureSurge: false })), 3000);
  };

  const handleSimulatePowerDrop = () => {
    setTestData(prev => ({ ...prev, powerDrop: true }));
    addEvent('🔴 [TEST] Power drop simulation activated');
    setTimeout(() => setTestData(prev => ({ ...prev, powerDrop: false })), 3000);
  };

  const handleResetSystems = () => {
    setTestData({ tempSpike: false, pressureSurge: false, powerDrop: false });
    addEvent('✓ [TEST] All test simulations reset');
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  // 1. Shutdown Screen (Highest Priority)
  if (shutdownPhase === 'offline') {
    return <ShutdownOverlay onRestart={handleRestart} />;
  }

  // 2. Restarting Overlay
  if (restartPhase === 'restarting') {
    return <RestartingOverlay />;
  }

  // 3. Boot Sequence
  if (!isSystemBooted) {
    return <SystemBootOverlay onBootComplete={() => setIsSystemBooted(true)} />;
  }

  // 4. Disconnect Warning (Only if in warning phase)
  const showDisconnectWarning = disconnectPhase === 'warning';

  // Apply failing sensors effect to data
  const displaySensorData = { ...sensorData };
  if (disconnectPhase === 'failing') {
    if (failedSensors.includes('temperature')) displaySensorData.temperature = 0;
    if (failedSensors.includes('humidity')) displaySensorData.humidity = 0;
    if (failedSensors.includes('light')) displaySensorData.light = 0;
    if (failedSensors.includes('vibration')) displaySensorData.vibration = 0;
  }

  return (
    <div className="w-full h-screen bg-scada-dark text-scada-text overflow-hidden relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 136, 0.1) 25%, rgba(0, 255, 136, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 136, 0.1) 75%, rgba(0, 255, 136, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 136, 0.1) 25%, rgba(0, 255, 136, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 136, 0.1) 75%, rgba(0, 255, 136, 0.1) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px',
          animation: 'scanlines 8s linear infinite'
        }}
      />

      {/* Alarm indicator bar */}
      {alarmActive && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-scada-red animate-pulse z-50" />
      )}

      <TopControlBar
        onShutdown={() => setShowShutdownAuth(true)}
        onDiagnostics={handleDiagnostics}
        onRestart={handleRestart}
        onShowTestPanel={() => setShowTestPanel(true)}
        phoneConnected={usingRealData}
        connectionStatus={connectionStatus}
      />

      {/* Main content layout */}
      <div className="relative w-full h-full flex gap-2 p-2 pt-14">
        {/* Left Panel */}
        <div className="w-1/5 h-full">
          <CinematicWrapper status={panelStatus.left} label="SENSORS">
            <LeftPanel sensorData={displaySensorData} isAlarming={alarmActive} />
          </CinematicWrapper>
        </div>

        {/* Center Map */}
        <div className="flex-1 h-full">
          <CinematicWrapper status={panelStatus.center} label="MAIN VIEW">
            <CenterMap sensorData={displaySensorData} isAlarming={alarmActive} />
          </CinematicWrapper>
        </div>

        {/* Right Terminal */}
        <div className="w-1/4 h-full">
          <CinematicWrapper status={panelStatus.right} label="TERMINAL">
            <RightTerminal events={events} isAlarming={alarmActive} />
          </CinematicWrapper>
        </div>
      </div>

      {shutdownPhase === 'countdown' && (
        <CountdownShutdown onAbort={abortShutdown} onComplete={completeShutdown} />
      )}

      {/* Disconnect Warning Overlay */}
      {showDisconnectWarning && (
        <PhoneDisconnectedOverlay
          onRetry={() => {
            // Force re-check connection
            window.location.reload();
          }}
        />
      )}

      {/* Secure Shutdown Modal */}
      {showShutdownAuth && (
        <PasswordModal
          title="AUTHORIZE SHUTDOWN"
          onSuccess={() => {
            setShowShutdownAuth(false);
            completeShutdown();
          }}
          onCancel={() => setShowShutdownAuth(false)}
        />
      )}

      {/* Alarm System Panel */}
      {alarmActive && <AlarmSystem sensorData={displaySensorData} />}

      {showTestPanel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-96 border-2 border-scada-cyan bg-scada-dark/95 p-6 shadow-glow-cyan"
            style={{
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 10px rgba(0, 255, 255, 0.1)'
            }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-scada-cyan">
                TEST CONTROL PANEL
              </h2>
              <button
                onClick={() => setShowTestPanel(false)}
                className="text-scada-cyan hover:text-scada-red transition-colors"
              >
                ✕
              </button>
            </div>
            <TestControlPanel
              onSimulateTemperatureSpike={handleSimulateTemperatureSpike}
              onSimulatePressureSurge={handleSimulatePressureSurge}
              onSimulatePowerDrop={handleSimulatePowerDrop}
              onResetSystems={handleResetSystems}
            />
          </div>
        </div>
      )}

      {/* Bottom Command Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent">
        <BottomCommandBar
          command={command}
          setCommand={setCommand}
          onSubmit={handleCommandSubmit}
        />
      </div>
    </div>
  );
}
