import { useEffect, useState } from 'react';

interface AnimatedGaugeProps {
  value: number;
  min: number;
  max: number;
  status: 'normal' | 'warning' | 'critical';
}

export function AnimatedGauge({ value, min, max, status }: AnimatedGaugeProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  const statusColors = {
    normal: '#00ff88',
    warning: '#ffcc00',
    critical: '#ff0000',
  };

  return (
    <svg width="100%" height="60" viewBox="0 0 100 60" className="mb-2">
      {/* Gauge arc background */}
      <path
        d="M 10 50 A 40 40 0 0 1 90 50"
        fill="none"
        stroke="rgba(0, 255, 136, 0.2)"
        strokeWidth="2"
      />
      
      {/* Gauge arc fill */}
      <path
        d="M 10 50 A 40 40 0 0 1 90 50"
        fill="none"
        stroke={statusColors[status]}
        strokeWidth="2"
        strokeDasharray={`${(percentage / 100) * 251} 251`}
        style={{ transition: 'stroke-dasharray 0.3s ease' }}
        opacity="0.8"
      />
      
      {/* Needle */}
      <line
        x1="50"
        y1="50"
        x2={50 + 30 * Math.cos((percentage / 100) * Math.PI - Math.PI)}
        y2={50 - 30 * Math.sin((percentage / 100) * Math.PI - Math.PI)}
        stroke={statusColors[status]}
        strokeWidth="1.5"
        opacity="0.9"
      />
      
      {/* Center dot */}
      <circle cx="50" cy="50" r="2" fill={statusColors[status]} />
    </svg>
  );
}
