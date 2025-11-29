'use client';

import { motion } from 'framer-motion';
import type { SensorData } from '@/types/sensor';

interface CenterMapProps {
  sensorData: SensorData;
  isAlarming?: boolean;
}

export function CenterMap({ sensorData, isAlarming = false }: CenterMapProps) {
  // Normalize values for visualization
  const nodes = [
    { id: 'temp', label: 'THERMAL', value: sensorData.cpuTemp || sensorData.temperature, max: 80, angle: 0, color: '#ff4444', dist: 140, unit: '°C' },
    { id: 'pwr', label: 'POWER', value: sensorData.batteryLevel || 0, max: 100, angle: 60, color: '#44aaff', dist: 140, unit: '%' },
    { id: 'cpu', label: 'CPU LOAD', value: sensorData.cpuUsage || 0, max: 100, angle: 120, color: '#ff00ff', dist: 140, unit: '%' },
    { id: 'ram', label: 'RAM', value: sensorData.ramUsage ? (sensorData.ramUsage / 4096) * 100 : 0, max: 100, angle: 180, color: '#00ff00', dist: 120, unit: '%' },
    { id: 'light', label: 'OPTIC', value: Math.min(sensorData.light / 100, 100), max: 100, angle: 240, color: '#ffff44', dist: 120, unit: 'Lx' },
    { id: 'vib', label: 'KINETIC', value: sensorData.vibration, max: 10, angle: 300, color: '#ff8844', dist: 120, unit: 'Hz' },
  ];

  return (
    <div
      className={`h-full flex flex-col gap-2 pb-20 transition-all duration-300 ${isAlarming ? 'border-l-2 border-scada-red' : 'border-l-2 border-scada-cyan'
        }`}
    >
      <div className="px-3 py-2 border-l-4 border-scada-cyan flex justify-between items-center">
        <h2 className="text-xs font-mono uppercase tracking-widest text-scada-cyan">
          ▸ TACTICAL MAP
        </h2>
        <div className="flex gap-2">
          <span className="w-2 h-2 rounded-full bg-scada-cyan animate-pulse" />
          <span className="text-[10px] text-scada-cyan/70 font-mono">LIVE FEED</span>
        </div>
      </div>

      <div
        className={`flex-1 border border-scada-cyan/30 bg-black/90 backdrop-blur-sm overflow-hidden relative perspective-1000 ${isAlarming ? 'shadow-glow-red' : 'shadow-glow-green'
          }`}
      >
        {/* Hexagonal Grid Floor */}
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 15V45L30 60L0 45V15L30 0Z' fill='none' stroke='${isAlarming ? '%23ff0000' : '%2300ffff'}' stroke-width='1' opacity='0.4'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
            transform: 'perspective(600px) rotateX(60deg) translateY(100px) scale(2)',
            transformOrigin: 'center bottom',
            maskImage: 'radial-gradient(circle at 50% 0%, black 40%, transparent 80%)'
          }}
        />

        {/* Radar Sweep Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-scada-cyan/20" />
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-scada-cyan/20" />
          <motion.div
            className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, transparent 300deg, ${isAlarming ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 255, 0.2)'} 360deg)`
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <svg width="100%" height="100%" viewBox="-300 -200 600 400" className="overflow-visible">
            <defs>
              <filter id="glow-intense" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Gyroscope Core */}
            <g className="core" filter="url(#glow-intense)">
              {/* Outer Ring */}
              <motion.ellipse
                rx="40" ry="40"
                fill="none"
                stroke={isAlarming ? "#ff0000" : "#00ffff"}
                strokeWidth="2"
                strokeDasharray="20 10"
                animate={{ rotateX: [60, 70, 60], rotateZ: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              {/* Inner Ring 1 */}
              <motion.ellipse
                rx="30" ry="30"
                fill="none"
                stroke={isAlarming ? "#ff4444" : "#44ffff"}
                strokeWidth="2"
                animate={{ rotateY: 360, rotateZ: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              {/* Inner Ring 2 */}
              <motion.ellipse
                rx="20" ry="20"
                fill="none"
                stroke={isAlarming ? "#ff8888" : "#88ffff"}
                strokeWidth="2"
                animate={{ rotateX: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
              {/* Central Nucleus */}
              <motion.circle
                r="8"
                fill={isAlarming ? "#ff0000" : "#00ffff"}
                animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </g>

            {/* Orbital Nodes with HUD Lines */}
            {nodes.map((node, i) => {
              const rad = (node.angle * Math.PI) / 180;
              const x = Math.cos(rad) * node.dist;
              const y = Math.sin(rad) * node.dist * 0.6; // Flatten y for 3D effect

              // HUD Line Points
              const elbowX = x + (x > 0 ? 40 : -40);
              const elbowY = y - 20;
              const endX = elbowX + (x > 0 ? 60 : -60);

              return (
                <g key={node.id}>
                  {/* Connection to Core */}
                  <motion.line
                    x1="0"
                    y1="0"
                    x2={x}
                    y2={y}
                    stroke={node.color}
                    strokeWidth="1"
                    strokeOpacity="0.1"
                  />

                  {/* Data Particle */}
                  <motion.circle
                    r="2"
                    fill={node.color}
                    animate={{
                      cx: [x, 0],
                      cy: [y, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "linear"
                    }}
                  />

                  {/* Node Marker */}
                  <motion.g
                    initial={{ x, y }}
                    animate={{ y: y + Math.sin(Date.now() / 1000 + i) * 5 }}
                  >
                    <circle r="3" fill="#000" stroke={node.color} strokeWidth="2" />
                    <circle r="6" fill="none" stroke={node.color} strokeWidth="1" opacity="0.5" />

                    {/* HUD Connecting Line */}
                    <polyline
                      points={`0,0 ${elbowX - x},${elbowY - y} ${endX - x},${elbowY - y}`}
                      fill="none"
                      stroke={node.color}
                      strokeWidth="1"
                      opacity="0.6"
                    />

                    {/* HUD Data Box */}
                    <g transform={`translate(${endX - x + (x > 0 ? 0 : -80)}, ${elbowY - y - 10})`}>
                      <rect x="0" y="0" width="80" height="24" fill="rgba(0,0,0,0.8)" stroke={node.color} strokeWidth="1" rx="2" />
                      <text x="4" y="10" fill={node.color} fontSize="8" fontFamily="monospace" fontWeight="bold">{node.label}</text>
                      <text x="76" y="18" fill="#fff" fontSize="10" fontFamily="monospace" textAnchor="end">
                        {Math.round(node.value)}<tspan fontSize="8" fillOpacity="0.7">{node.unit}</tspan>
                      </text>

                      {/* Mini Bar Graph */}
                      <rect x="4" y="14" width="40" height="2" fill="#333" />
                      <rect x="4" y="14" width={Math.min(node.value / node.max, 1) * 40} height="2" fill={node.color} />
                    </g>
                  </motion.g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
