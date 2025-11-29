import { motion } from 'framer-motion';
import type { SensorData } from '@/types/sensor';

interface AlarmSystemProps {
  sensorData: SensorData;
}

export function AlarmSystem({ sensorData }: AlarmSystemProps) {
  const criticalAlerts = [];
  
  if (sensorData.temperature > 50) {
    criticalAlerts.push(`TEMPERATURE: ${sensorData.temperature.toFixed(1)}°C - CRITICAL`);
  }
  if (sensorData.vibration > 5) {
    criticalAlerts.push(`VIBRATION: ${sensorData.vibration.toFixed(1)}Hz - CRITICAL`);
  }

  return (
    <motion.div 
      className="fixed top-8 right-8 max-w-sm z-40"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
    >
      <motion.div 
        className="border-2 border-scada-red bg-black/80 backdrop-blur-sm p-4"
        animate={{ boxShadow: ['0 0 20px rgba(255, 0, 0, 0.3)', '0 0 40px rgba(255, 0, 0, 0.6)', '0 0 20px rgba(255, 0, 0, 0.3)'] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <motion.h3 
          className="text-sm font-mono font-bold text-scada-red mb-3 uppercase"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          ⚠ ALERT SYSTEM
        </motion.h3>
        
        <div className="space-y-2">
          {criticalAlerts.map((alert, i) => (
            <motion.div 
              key={i}
              className="text-xs font-mono text-scada-red border-l-2 border-scada-red pl-2"
              animate={{ x: [-2, 2, -2] }}
              transition={{ duration: 0.4, repeat: Infinity }}
            >
              {alert}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
